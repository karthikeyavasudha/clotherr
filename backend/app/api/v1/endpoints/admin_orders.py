from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from app.services.supabase import supabase_admin
from app.core.admin import get_admin_user

router = APIRouter()

class OrderStatusUpdate(BaseModel):
    status: str

@router.get("/orders")
def list_all_orders(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    admin = Depends(get_admin_user)
):
    """List all orders with user information."""
    try:
        query = supabase_admin.table("orders").select("*, users(id, email, full_name), order_items(*, products(name, image_url))")
        
        if status:
            query = query.eq("status", status)
        
        response = query.order("created_at", desc=True).range(skip, skip + limit - 1).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orders/{order_id}")
def get_order(order_id: str, admin = Depends(get_admin_user)):
    """Get a single order with full details."""
    try:
        response = supabase_admin.table("orders").select(
            "*, users(id, email, full_name, phone, address_line1, address_line2, city, state, postal_code, country), order_items(*, products(name, image_url, price))"
        ).eq("id", order_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/orders/{order_id}/status")
def update_order_status(order_id: str, status_update: OrderStatusUpdate, admin = Depends(get_admin_user)):
    """Update order status."""
    valid_statuses = ["pending", "paid", "shipped", "delivered", "cancelled"]
    
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    try:
        # Check if order exists
        existing = supabase_admin.table("orders").select("id").eq("id", order_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Order not found")
        
        response = supabase_admin.table("orders").update({"status": status_update.status}).eq("id", order_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update order status")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/order-statuses")
def get_order_statuses(admin = Depends(get_admin_user)):
    """Get all valid order statuses."""
    return ["pending", "paid", "shipped", "delivered", "cancelled"]
