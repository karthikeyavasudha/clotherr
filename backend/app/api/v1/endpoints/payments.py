from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.services.supabase import supabase
from app.core.jwt import verify_token
from app.core.config import settings
import razorpay
import hmac
import hashlib

router = APIRouter()

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class OrderItemPayload(BaseModel):
    product_id: str
    quantity: int
    price_at_purchase: float

class CreateRazorpayOrderRequest(BaseModel):
    amount: float
    shipping_address: str
    items: List[OrderItemPayload]

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: str

@router.get("/settings")
def get_payment_settings():
    """Get public payment settings (COD enabled, Razorpay enabled, extra charges, etc.)"""
    try:
        # First get all settings
        response = supabase.table("settings").select("key, enabled, number_value, is_custom, description").execute()
        
        # Convert to dict for easier frontend access
        settings_dict = {}
        extra_charges = []  # List to hold all custom extra charges
        
        for setting in response.data:
            key = setting["key"]
            
            # Handle custom extra charges separately
            if setting.get("is_custom"):
                if setting.get("enabled") and setting.get("number_value") is not None:
                    extra_charges.append({
                        "key": key,
                        "name": key.replace('_', ' ').title(),
                        "description": setting.get("description", ""),
                        "amount": float(setting["number_value"])
                    })
            else:
                # System settings
                if setting.get("number_value") is not None:
                    settings_dict[key] = float(setting["number_value"]) if setting.get("enabled") else 0
                    settings_dict[f"{key}_enabled"] = setting.get("enabled", False)
                else:
                    # Boolean-only settings use enabled directly
                    settings_dict[key] = setting.get("enabled", False)
        
        # Add extra charges array to response
        settings_dict["extra_charges"] = extra_charges
        
        # Return Razorpay key ID for frontend (public key is safe to expose)
        settings_dict["razorpay_key_id"] = settings.RAZORPAY_KEY_ID
        
        return settings_dict
    except Exception as e:
        # Return defaults if settings table doesn't exist yet
        return {
            "payment_cod_enabled": True,
            "payment_razorpay_enabled": True,
            "min_order_amount": 0,
            "min_order_amount_enabled": False,
            "cod_extra_charge": 0,
            "cod_extra_charge_enabled": False,
            "extra_charges": [],
            "razorpay_key_id": settings.RAZORPAY_KEY_ID
        }

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    
    try:
        token = authorization.split(" ")[1]
        payload = verify_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        result = supabase.table("users").select("*").eq("id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return result.data[0]
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/create-order")
def create_razorpay_order(request: CreateRazorpayOrderRequest, user = Depends(get_current_user)):
    """
    Create a Razorpay order and a pending order in our database.
    Amount should be in INR (e.g., 599.00 for ₹599)
    """
    try:
        # Amount in paise (Razorpay expects amount in smallest currency unit)
        amount_in_paise = int(request.amount * 100)
        
        # Create Razorpay order
        razorpay_order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": 1,  # Auto capture payment
            "notes": {
                "user_id": user["id"],
                "user_email": user["email"]
            }
        })
        
        # Create pending order in our database
        order_data = {
            "user_id": user["id"],
            "total_amount": request.amount,
            "shipping_address": request.shipping_address,
            "status": "payment_pending",
            "razorpay_order_id": razorpay_order["id"]
        }
        
        order_response = supabase.table("orders").insert(order_data).execute()
        
        if not order_response.data:
            raise HTTPException(status_code=500, detail="Failed to create order")
        
        new_order = order_response.data[0]
        
        # Create order items
        items_data = []
        for item in request.items:
            items_data.append({
                "order_id": new_order["id"],
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price_at_purchase": item.price_at_purchase
            })
        
        if items_data:
            supabase.table("order_items").insert(items_data).execute()
        
        return {
            "razorpay_order_id": razorpay_order["id"],
            "razorpay_key_id": settings.RAZORPAY_KEY_ID,
            "amount": amount_in_paise,
            "currency": "INR",
            "order_id": new_order["id"],
            "user_name": user.get("full_name", ""),
            "user_email": user.get("email", ""),
            "user_phone": user.get("phone", "")
        }
        
    except razorpay.errors.BadRequestError as e:
        raise HTTPException(status_code=400, detail=f"Razorpay error: {str(e)}")
    except Exception as e:
        print(f"Create order error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify")
def verify_payment(request: VerifyPaymentRequest, user = Depends(get_current_user)):
    """
    Verify Razorpay payment signature and update order status.
    """
    try:
        # Verify signature
        message = f"{request.razorpay_order_id}|{request.razorpay_payment_id}"
        generated_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature != request.razorpay_signature:
            # Update order status to payment_failed
            supabase.table("orders").update({
                "status": "payment_failed"
            }).eq("id", request.order_id).execute()
            
            raise HTTPException(status_code=400, detail="Payment verification failed")
        
        # Payment verified, update order status
        update_response = supabase.table("orders").update({
            "status": "paid",
            "razorpay_payment_id": request.razorpay_payment_id,
            "razorpay_signature": request.razorpay_signature
        }).eq("id", request.order_id).execute()
        
        if not update_response.data:
            raise HTTPException(status_code=500, detail="Failed to update order")
        
        return {
            "success": True,
            "message": "Payment verified successfully",
            "order_id": request.order_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Verify payment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/order/{order_id}")
def get_payment_status(order_id: str, user = Depends(get_current_user)):
    """
    Get payment status for an order.
    """
    try:
        result = supabase.table("orders").select("*").eq("id", order_id).eq("user_id", user["id"]).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Order not found")
        
        order = result.data[0]
        
        return {
            "order_id": order["id"],
            "status": order["status"],
            "razorpay_order_id": order.get("razorpay_order_id"),
            "razorpay_payment_id": order.get("razorpay_payment_id")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
