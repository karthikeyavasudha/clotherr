from pydantic import BaseModel, field_validator
from typing import Optional, Literal, List, Any, Union
from uuid import UUID
from datetime import datetime
import json

# Valid product categories
PRODUCT_TYPES = ["Men", "Women", "Kids", "Unisex"]
ProductTypeValue = Literal["Men", "Women", "Kids", "Unisex"]

class ProductCreate(BaseModel):
    """Schema for creating/updating products"""
    name: str
    description: Optional[str] = None
    price: float
    compare_at_price: Optional[float] = None  # Original price for discounts
    image_url: Optional[str] = None
    images: Optional[List[str]] = None  # Array of additional image URLs
    category: Optional[ProductTypeValue] = None
    stock: int = 0

class Product(BaseModel):
    """Schema for product response"""
    id: UUID
    name: str
    description: Optional[str] = None
    price: float
    compare_at_price: Optional[float] = None  # Original price for discounts
    image_url: Optional[str] = None
    images: Optional[List[str]] = None  # Array of additional image URLs
    category: Optional[str] = None
    stock: int = 0
    created_at: datetime

    @field_validator('images', mode='before')
    @classmethod
    def parse_images(cls, v: Any) -> Optional[List[str]]:
        """Parse images from JSON string if needed (Supabase returns text)."""
        if v is None:
            return None
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except (json.JSONDecodeError, TypeError):
                return None
        return None

    class Config:
        from_attributes = True
