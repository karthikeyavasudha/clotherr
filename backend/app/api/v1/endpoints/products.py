from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from sqlalchemy.orm import Session
from app.schemas.product import Product
from app.db.database import get_db
from app.db.repository import get_product_repo
from app.core.config import settings

router = APIRouter()

def get_repo(db: Session = Depends(get_db)):
    """Get product repository with optional db session."""
    if settings.USE_SUPABASE:
        return get_product_repo()
    return get_product_repo(db)

@router.get("/", response_model=List[Product])
def read_products(skip: int = 0, limit: int = 100, category: Optional[str] = None, repo = Depends(get_repo)):
    try:
        return repo.get_all(skip=skip, limit=limit, category=category)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{product_id}", response_model=Product)
def read_product(product_id: str, repo = Depends(get_repo)):
    try:
        product = repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

