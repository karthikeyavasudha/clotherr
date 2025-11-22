from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.product import Product
from app.services.supabase import supabase

router = APIRouter()

@router.get("/", response_model=List[Product])
def read_products(skip: int = 0, limit: int = 100):
    try:
        response = supabase.table("products").select("*").range(skip, skip + limit - 1).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{product_id}", response_model=Product)
def read_product(product_id: str):
    try:
        response = supabase.table("products").select("*").eq("id", product_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Product not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
