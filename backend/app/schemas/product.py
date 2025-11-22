from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    category: Optional[str] = None
    stock: int = 0

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
