from fastapi import APIRouter, HTTPException, Header, Depends
from typing import List
from app.schemas.order import Order, OrderCreate
from app.services.supabase import supabase
from app.core.jwt import verify_token

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
def create_order(order: OrderCreate, user = Depends(get_current_user)):
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
            
        return new_order
    except Exception as e:
        print(f"Error creating order: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[Order])
def read_orders(user = Depends(get_current_user)):
    try:
        response = supabase.table("orders").select("*, order_items(*)").eq("user_id", user["id"]).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
