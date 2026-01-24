from fastapi import APIRouter, HTTPException, Depends
from app.services.supabase import supabase_admin
from app.core.admin import get_admin_user

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(admin = Depends(get_admin_user)):
    """Get dashboard statistics."""
    try:
        # Total products
        products = supabase_admin.table("products").select("id", count="exact").execute()
        total_products = products.count if products.count else len(products.data)
        
        # Total customers (non-admin users)
        users = supabase_admin.table("users").select("id", count="exact").eq("is_admin", False).execute()
        total_customers = users.count if users.count else len(users.data)
        
        # Total orders and revenue
        orders = supabase_admin.table("orders").select("id, total_amount, status, created_at").execute()
        total_orders = len(orders.data)
        total_revenue = sum(o.get("total_amount", 0) for o in orders.data)
        
        # Orders by status
        status_counts = {}
        for order in orders.data:
            status = order.get("status", "unknown")
            status_counts[status] = status_counts.get(status, 0) + 1
        
        # Recent orders (last 5)
        recent_orders = supabase_admin.table("orders").select(
            "id, total_amount, status, created_at, users(full_name, email)"
        ).order("created_at", desc=True).limit(5).execute()
        
        # Low stock products (stock < 10)
        low_stock = supabase_admin.table("products").select(
            "id, name, stock"
        ).lt("stock", 10).order("stock").limit(5).execute()
        
        return {
            "total_products": total_products,
            "total_customers": total_customers,
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "orders_by_status": status_counts,
            "recent_orders": recent_orders.data,
            "low_stock_products": low_stock.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
