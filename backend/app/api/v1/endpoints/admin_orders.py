from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.admin import get_admin_user
from app.core.config import settings
from app.db.database import get_db
from app.db.repository import get_order_repo

router = APIRouter()

class OrderStatusUpdate(BaseModel):
    status: str

def get_repo(db: Session = Depends(get_db)):
    """Get order repository."""
    if settings.USE_SUPABASE:
        return get_order_repo()
    return get_order_repo(db)

@router.get("/orders")
def list_all_orders(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    admin = Depends(get_admin_user),
    repo = Depends(get_repo)
):
    """List all orders with user information."""
    try:
        orders = repo.get_all(skip=skip, limit=limit)
        # Filter by status if provided
        if status:
            orders = [o for o in orders if o.get("status") == status]
        return orders
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orders/{order_id}")
def get_order(order_id: str, admin = Depends(get_admin_user), repo = Depends(get_repo)):
    """Get a single order with full details."""
    try:
        order = repo.get_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/orders/{order_id}/status")
def update_order_status(order_id: str, status_update: OrderStatusUpdate, 
                        admin = Depends(get_admin_user), repo = Depends(get_repo)):
    """Update order status."""
    valid_statuses = ["pending", "paid", "shipped", "delivered", "cancelled"]
    
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    try:
        # Check if order exists
        existing = repo.get_by_id(order_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Order not found")
        
        updated = repo.update_status(order_id, status_update.status)
        if not updated:
            raise HTTPException(status_code=500, detail="Failed to update order status")
        
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/order-statuses")
def get_order_statuses(admin = Depends(get_admin_user)):
    """Get all valid order statuses."""
    return ["pending", "paid", "shipped", "delivered", "cancelled"]
