from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.admin import get_admin_user
from app.core.config import settings
from app.db.database import get_db
from app.db.repository import get_user_repo, get_order_repo

router = APIRouter()

def get_repos(db: Session = Depends(get_db)):
    """Get all required repositories."""
    if settings.USE_SUPABASE:
        return {
            "user": get_user_repo(),
            "order": get_order_repo()
        }
    return {
        "user": get_user_repo(db),
        "order": get_order_repo(db)
    }

@router.get("/users")
def list_all_users(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    admin = Depends(get_admin_user),
    repos = Depends(get_repos)
):
    """List all users with basic information."""
    try:
        users = repos["user"].get_all(skip=skip, limit=limit)
        
        # Filter by search if provided
        if search:
            search_lower = search.lower()
            users = [u for u in users if 
                     search_lower in (u.get("email") or "").lower() or 
                     search_lower in (u.get("full_name") or "").lower()]
        
        # Remove password_hash from response
        for user in users:
            user.pop("password_hash", None)
        
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}")
def get_user(user_id: str, admin = Depends(get_admin_user), repos = Depends(get_repos)):
    """Get user details with order history."""
    try:
        user_repo = repos["user"]
        order_repo = repos["order"]
        
        # Get user details
        user = user_repo.get_by_id(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Remove password_hash from response
        user.pop("password_hash", None)
        
        # Get user's orders
        user_orders = order_repo.get_by_user(user_id)
        user["recent_orders"] = user_orders[:10]  # Last 10 orders
        
        # Get order count and total spent
        user["total_orders"] = len(user_orders)
        user["total_spent"] = sum(o.get("total_amount", 0) for o in user_orders)
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
