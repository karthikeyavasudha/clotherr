from fastapi import APIRouter
from app.api.v1.endpoints import products, orders, auth, payments
from app.api.v1.endpoints import admin_products, admin_orders, admin_users, admin_stats, admin_settings

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])

# Admin routes
api_router.include_router(admin_products.router, prefix="/admin", tags=["admin"])
api_router.include_router(admin_orders.router, prefix="/admin", tags=["admin"])
api_router.include_router(admin_users.router, prefix="/admin", tags=["admin"])
api_router.include_router(admin_stats.router, prefix="/admin", tags=["admin"])
api_router.include_router(admin_settings.router, prefix="/admin", tags=["admin"])

