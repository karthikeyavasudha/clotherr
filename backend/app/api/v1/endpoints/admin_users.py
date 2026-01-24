from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from app.services.supabase import supabase_admin
from app.core.admin import get_admin_user

router = APIRouter()

@router.get("/users")
def list_all_users(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    admin = Depends(get_admin_user)
):
    """List all users with basic information."""
    try:
        query = supabase_admin.table("users").select(
            "id, email, full_name, phone, city, state, country, is_admin, created_at"
        )
        
        if search:
            query = query.or_(f"email.ilike.%{search}%,full_name.ilike.%{search}%")
        
        response = query.order("created_at", desc=True).range(skip, skip + limit - 1).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}")
def get_user(user_id: str, admin = Depends(get_admin_user)):
    """Get user details with order history."""
    try:
        # Get user details
        user_response = supabase_admin.table("users").select(
            "id, email, full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_admin, created_at"
        ).eq("id", user_id).execute()
        
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = user_response.data[0]
        
        # Get user's orders
        orders_response = supabase_admin.table("orders").select(
            "id, status, total_amount, created_at"
        ).eq("user_id", user_id).order("created_at", desc=True).limit(10).execute()
        
        user["recent_orders"] = orders_response.data
        
        # Get order count and total spent
        all_orders = supabase_admin.table("orders").select("total_amount").eq("user_id", user_id).execute()
        user["total_orders"] = len(all_orders.data)
        user["total_spent"] = sum(o.get("total_amount", 0) for o in all_orders.data)
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
