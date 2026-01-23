from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.admin import get_admin_user
from app.core.config import settings
from app.db.database import get_db
from app.db.repository import get_product_repo, get_user_repo, get_order_repo

router = APIRouter()

def get_repos(db: Session = Depends(get_db)):
    """Get all required repositories."""
    if settings.USE_SUPABASE:
        return {
            "product": get_product_repo(),
            "user": get_user_repo(),
            "order": get_order_repo()
        }
    return {
        "product": get_product_repo(db),
        "user": get_user_repo(db),
        "order": get_order_repo(db)
    }

@router.get("/stats")
def get_dashboard_stats(admin = Depends(get_admin_user), repos = Depends(get_repos)):
    """Get dashboard statistics."""
    try:
        product_repo = repos["product"]
        user_repo = repos["user"]
        order_repo = repos["order"]
        
        # Total products
        products = product_repo.get_all(limit=1000)
        total_products = len(products)
        
        # Total customers
        total_customers = user_repo.count()
        
        # Total orders and revenue
        total_orders = order_repo.count()
        total_revenue = order_repo.sum_revenue()
        
        # Orders by status
        status_counts = order_repo.count_by_status()
        
        # Recent orders (last 5)
        recent_orders = order_repo.get_recent(limit=5)
        
        # Low stock products (stock < 10)
        all_products = product_repo.get_all(limit=1000)
        low_stock = [p for p in all_products if p.get("stock", 0) < 10]
        low_stock = sorted(low_stock, key=lambda x: x.get("stock", 0))[:5]
        
        return {
            "total_products": total_products,
            "total_customers": total_customers,
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "orders_by_status": status_counts,
            "recent_orders": recent_orders,
            "low_stock_products": low_stock
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
