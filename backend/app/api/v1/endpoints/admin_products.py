from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from sqlalchemy.orm import Session
from app.schemas.product import Product, ProductCreate, PRODUCT_TYPES
from app.db.database import get_db
from app.db.repository import get_product_repo
from app.core.admin import get_admin_user
from app.core.config import settings

router = APIRouter()

def get_repo(db: Session = Depends(get_db)):
    """Get product repository with optional db session."""
    if settings.USE_SUPABASE:
        return get_product_repo()
    return get_product_repo(db)

@router.get("/products", response_model=List[Product])
def list_all_products(
    skip: int = 0, 
    limit: int = 50,
    search: Optional[str] = None,
    category: Optional[str] = None,
    admin = Depends(get_admin_user),
    repo = Depends(get_repo)
):
    """List all products with optional search and category filter."""
    try:
        products = repo.get_all(skip=skip, limit=limit, category=category)
        # Filter by search if provided (client-side for now)
        if search:
            products = [p for p in products if search.lower() in p.get("name", "").lower()]
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/products", response_model=Product)
def create_product(product: ProductCreate, admin = Depends(get_admin_user), repo = Depends(get_repo)):
    """Create a new product."""
    try:
        product_data = product.model_dump(mode='json')
        result = repo.create(product_data)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to create product")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/products/{product_id}", response_model=Product)
def get_product(product_id: str, admin = Depends(get_admin_user), repo = Depends(get_repo)):
    """Get a single product by ID."""
    try:
        product = repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/products/{product_id}")
def update_product(product_id: str, product: ProductCreate, admin = Depends(get_admin_user), repo = Depends(get_repo)):
    """Update an existing product."""
    try:
        existing = repo.get_by_id(product_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Product not found")
        
        product_data = product.model_dump(mode='json')
        result = repo.update(product_id, product_data)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to update product")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/products/{product_id}")
def delete_product(product_id: str, admin = Depends(get_admin_user), repo = Depends(get_repo)):
    """Delete a product."""
    try:
        existing = repo.get_by_id(product_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Product not found")
        
        repo.delete(product_id)
        return {"message": "Product deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/categories")
def get_categories(admin = Depends(get_admin_user)):
    """Get all valid product categories."""
    return PRODUCT_TYPES
