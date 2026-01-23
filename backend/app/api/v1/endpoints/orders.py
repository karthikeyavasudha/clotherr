from fastapi import APIRouter, HTTPException, Header, Depends, BackgroundTasks
from typing import List
from sqlalchemy.orm import Session
from app.schemas.order import Order, OrderCreate
from app.core.jwt import verify_token
from app.core.notifications import send_order_confirmation_email
from app.core.config import settings
from app.db.database import get_db
from app.db.repository import get_user_repo, get_order_repo, get_order_item_repo, get_product_repo

router = APIRouter()

def get_repos(db: Session = Depends(get_db)):
    """Get all required repositories."""
    if settings.USE_SUPABASE:
        return {
            "user": get_user_repo(),
            "order": get_order_repo(),
            "order_item": get_order_item_repo(),
            "product": get_product_repo()
        }
    return {
        "user": get_user_repo(db),
        "order": get_order_repo(db),
        "order_item": get_order_item_repo(db),
        "product": get_product_repo(db)
    }

def get_current_user(authorization: str = Header(None), repos = Depends(get_repos)):
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
        user = repos["user"].get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/", response_model=Order)
def create_order(order: OrderCreate, background_tasks: BackgroundTasks, 
                 user = Depends(get_current_user), repos = Depends(get_repos)):
    try:
        product_repo = repos["product"]
        order_repo = repos["order"]
        order_item_repo = repos["order_item"]
        
        # 1. Check stock availability for all items
        for item in order.items:
            product = product_repo.get_by_id(str(item.product_id))
            if not product:
                raise HTTPException(status_code=404, detail=f"Product not found: {item.product_id}")
            
            if product["stock"] < item.quantity:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Insufficient stock for '{product['name']}'. Available: {product['stock']}, Requested: {item.quantity}"
                )
        
        # 2. Create Order
        order_data = {
            "user_id": user["id"],
            "total_amount": order.total_amount,
            "shipping_address": order.shipping_address,
            "status": order.status
        }
        new_order = order_repo.create(order_data)
        
        if not new_order:
            raise HTTPException(status_code=500, detail="Failed to create order")
        
        # 3. Create Order Items and Deduct Stock
        items_data = []
        for item in order.items:
            items_data.append({
                "order_id": new_order['id'],
                "product_id": str(item.product_id),
                "quantity": item.quantity,
                "price_at_purchase": item.price_at_purchase
            })
            
            # Deduct stock
            product = product_repo.get_by_id(str(item.product_id))
            if product:
                new_stock = max(0, product["stock"] - item.quantity)
                product_repo.update(str(item.product_id), {"stock": new_stock})
        
        if items_data:
            order_item_repo.create_many(items_data)
            
        # 4. Send confirmation email in background
        try:
            email_items = []
            for item in order.items:
                product = product_repo.get_by_id(str(item.product_id))
                prod_name = product["name"] if product else "Unknown Product"
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[Order])
def read_orders(user = Depends(get_current_user), repos = Depends(get_repos)):
    try:
        orders = repos["order"].get_by_user(user["id"])
        return orders
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
