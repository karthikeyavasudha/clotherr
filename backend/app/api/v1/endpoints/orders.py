from fastapi import APIRouter, HTTPException, Header, Depends, BackgroundTasks
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.order import Order, OrderCreate
from app.services.supabase import supabase, supabase_admin
from app.core.jwt import verify_token
from app.core.notifications import send_order_confirmation_email
from app.core.admin import require_admin
from datetime import datetime

router = APIRouter()

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    
    try:
        # Extract token from "Bearer <token>"
        token = authorization.split(" ")[1]
        
        # Verify JWT token
        payload = verify_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        # Get user_id from token payload
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        # Fetch user from database
        result = supabase.table("users").select("*").eq("id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return result.data[0]
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/", response_model=Order)
def create_order(order: OrderCreate, background_tasks: BackgroundTasks, user = Depends(get_current_user)):
    try:
        print(f"Creating order for user: {user['id']}")
        print(f"Order data: {order}")
        
        # 1. Create Order
        order_data = {
            "user_id": user["id"],
            "total_amount": order.total_amount,
            "shipping_address": order.shipping_address,
            "status": order.status
        }
        print(f"Inserting order: {order_data}")
        response = supabase.table("orders").insert(order_data).execute()
        print(f"Order insert response: {response}")
        
        if not response.data:
             raise HTTPException(status_code=500, detail="Failed to create order")
        
        new_order = response.data[0]
        
        # 2. Create Order Items
        items_data = []
        for item in order.items:
            items_data.append({
                "order_id": new_order['id'],
                "product_id": str(item.product_id),
                "quantity": item.quantity,
                "price_at_purchase": item.price_at_purchase
            })
        
        if items_data:
            print(f"Inserting order items: {items_data}")
            supabase.table("order_items").insert(items_data).execute()
            
        # Send confirmation email in background
        # Send confirmation email in background
        try:
            # Fetch product details for email
            email_items = []
            for item in order.items:
                prod_res = supabase.table("products").select("name").eq("id", str(item.product_id)).execute()
                prod_name = prod_res.data[0]["name"] if prod_res.data else "Unknown Product"
                email_items.append({
                    "name": prod_name,
                    "quantity": item.quantity,
                    "price": item.price_at_purchase
                })

            background_tasks.add_task(
                send_order_confirmation_email,
                email_to=user["email"],
                order_id=new_order["id"],
                total_amount=new_order["total_amount"],
                items=email_items
            )
        except Exception as e:
            print(f"Failed to queue email task: {e}")

        return new_order
    except Exception as e:
        print(f"Error creating order: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[Order])
def read_orders(user = Depends(get_current_user)):
    try:
        response = supabase.table("orders").select("*, order_items(*, products(name, image_url))").eq("user_id", user["id"]).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Public: Get all order statuses (MUST be before /{order_id} route)
@router.get("/statuses")
def get_order_statuses():
    """Get all valid order statuses from database (public)."""
    try:
        response = supabase.table("order_statuses").select("*").eq("is_active", True).order("sort_order").execute()
        if response.data:
            return response.data
        # Fallback to default statuses if table doesn't exist or is empty
        return [
            {"status_code": "pending", "display_name": "Pending", "sort_order": 1, "icon": "📦", "color": "#f59e0b"},
            {"status_code": "paid", "display_name": "Paid", "sort_order": 2, "icon": "💳", "color": "#10b981"},
            {"status_code": "shipped", "display_name": "Shipped", "sort_order": 3, "icon": "🚚", "color": "#3b82f6"},
            {"status_code": "in_transit", "display_name": "In Transit", "sort_order": 4, "icon": "✈️", "color": "#8b5cf6"},
            {"status_code": "out_for_delivery", "display_name": "Out for Delivery", "sort_order": 5, "icon": "🛵", "color": "#ec4899"},
            {"status_code": "delivered", "display_name": "Delivered", "sort_order": 6, "icon": "✅", "color": "#22c55e"},
            {"status_code": "cancelled", "display_name": "Cancelled", "sort_order": 7, "icon": "❌", "color": "#ef4444"}
        ]
    except Exception as e:
        # Return fallback on any error (e.g., table doesn't exist)
        return [
            {"status_code": "pending", "display_name": "Pending", "sort_order": 1, "icon": "📦", "color": "#f59e0b"},
            {"status_code": "paid", "display_name": "Paid", "sort_order": 2, "icon": "💳", "color": "#10b981"},
            {"status_code": "shipped", "display_name": "Shipped", "sort_order": 3, "icon": "🚚", "color": "#3b82f6"},
            {"status_code": "in_transit", "display_name": "In Transit", "sort_order": 4, "icon": "✈️", "color": "#8b5cf6"},
            {"status_code": "out_for_delivery", "display_name": "Out for Delivery", "sort_order": 5, "icon": "🛵", "color": "#ec4899"},
            {"status_code": "delivered", "display_name": "Delivered", "sort_order": 6, "icon": "✅", "color": "#22c55e"},
            {"status_code": "cancelled", "display_name": "Cancelled", "sort_order": 7, "icon": "❌", "color": "#ef4444"}
        ]

# Shipping tracking models
class ShippingUpdate(BaseModel):
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None
    tracking_url: Optional[str] = None
    shipping_status: Optional[str] = None
    estimated_delivery: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: str

# Get single order with tracking info (for user)
@router.get("/{order_id}")
def get_order(order_id: str, user = Depends(get_current_user)):
    """Get a specific order with tracking information."""
    try:
        response = supabase.table("orders").select("*, order_items(*, products(name, image_url))").eq("id", order_id).eq("user_id", user["id"]).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Order not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Admin: Get all orders
@router.get("/admin/all")
def get_all_orders(admin = Depends(require_admin)):
    """Get all orders (admin only)."""
    try:
        response = supabase_admin.table("orders").select("*, users(email, full_name), order_items(*, products(name, image_url))").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Admin: Update order status
@router.put("/admin/{order_id}/status")
def update_order_status(order_id: str, status_update: OrderStatusUpdate, admin = Depends(require_admin)):
    """Update order status (admin only)."""
    try:
        valid_statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
        if status_update.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        update_data = {"status": status_update.status}
        
        response = supabase_admin.table("orders").update(update_data).eq("id", order_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Order not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Admin: Update shipping tracking
@router.put("/admin/{order_id}/shipping")
def update_shipping(order_id: str, shipping: ShippingUpdate, admin = Depends(require_admin)):
    """Update shipping tracking information (admin only)."""
    try:
        update_data = {}
        
        if shipping.tracking_number is not None:
            update_data["tracking_number"] = shipping.tracking_number
        if shipping.carrier is not None:
            update_data["carrier"] = shipping.carrier
        if shipping.tracking_url is not None:
            update_data["tracking_url"] = shipping.tracking_url
        if shipping.shipping_status is not None:
            valid_statuses = ["pending", "processing", "shipped", "in_transit", "out_for_delivery", "delivered", "failed", "returned"]
            if shipping.shipping_status not in valid_statuses:
                raise HTTPException(status_code=400, detail=f"Invalid shipping status. Must be one of: {valid_statuses}")
            update_data["shipping_status"] = shipping.shipping_status
            
            # Auto-set timestamps
            if shipping.shipping_status == "shipped":
                update_data["shipped_at"] = datetime.utcnow().isoformat()
            elif shipping.shipping_status == "delivered":
                update_data["delivered_at"] = datetime.utcnow().isoformat()
                
        if shipping.estimated_delivery is not None:
            update_data["estimated_delivery"] = shipping.estimated_delivery
        
        response = supabase_admin.table("orders").update(update_data).eq("id", order_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Order not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Public: Track order by tracking number
@router.get("/track/{tracking_number}")
def track_order(tracking_number: str):
    """Track order by tracking number (public)."""
    try:
        response = supabase.table("orders").select("id, tracking_number, carrier, tracking_url, shipping_status, estimated_delivery, shipped_at, delivered_at, created_at").eq("tracking_number", tracking_number).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Order not found with this tracking number")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
