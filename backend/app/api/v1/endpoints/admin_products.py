from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from app.schemas.product import Product, ProductCreate
from app.services.supabase import supabase_admin
from app.core.admin import get_admin_user

router = APIRouter()

@router.get("/products", response_model=List[Product])
def list_all_products(
    skip: int = 0, 
    limit: int = 50,
    search: Optional[str] = None,
    category: Optional[str] = None,
    admin = Depends(get_admin_user)
):
    """List all products with optional search and category filter."""
    try:
        query = supabase_admin.table("products").select("*")
        
        if search:
            query = query.ilike("name", f"%{search}%")
        if category:
            query = query.eq("category", category)
            
        response = query.order("created_at", desc=True).range(skip, skip + limit - 1).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/products", response_model=Product)
def create_product(product: ProductCreate, admin = Depends(get_admin_user)):
    """Create a new product."""
    try:
        product_data = product.model_dump()
        response = supabase_admin.table("products").insert(product_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create product")
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/products/{product_id}", response_model=Product)
def get_product(product_id: str, admin = Depends(get_admin_user)):
    """Get a single product by ID."""
    try:
        response = supabase_admin.table("products").select("*").eq("id", product_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/products/{product_id}", response_model=Product)
def update_product(product_id: str, product: ProductCreate, admin = Depends(get_admin_user)):
    """Update an existing product."""
    try:
        # Check if product exists
        existing = supabase_admin.table("products").select("id").eq("id", product_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Product not found")
        
        product_data = product.model_dump()
        response = supabase_admin.table("products").update(product_data).eq("id", product_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update product")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/products/{product_id}")
def delete_product(product_id: str, admin = Depends(get_admin_user)):
    """Delete a product."""
    try:
        # Check if product exists
        existing = supabase_admin.table("products").select("id").eq("id", product_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Product not found")
        
        supabase_admin.table("products").delete().eq("id", product_id).execute()
        
        return {"message": "Product deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/categories")
def get_categories(admin = Depends(get_admin_user)):
    """Get all unique product categories."""
    try:
        response = supabase_admin.table("products").select("category").execute()
        categories = list(set(p["category"] for p in response.data if p.get("category")))
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
