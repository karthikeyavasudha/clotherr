from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class OrderItemBase(BaseModel):
    product_id: UUID
    quantity: int
    price_at_purchase: float

class OrderItemCreate(OrderItemBase):
    pass

class ProductInfo(BaseModel):
    name: str
    image_url: Optional[str] = None

class OrderItem(OrderItemBase):
    id: UUID
    order_id: UUID
    products: Optional[ProductInfo] = None

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    total_amount: float
    shipping_address: str
    status: str = "pending"

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class Order(OrderBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    order_items: Optional[List[OrderItem]] = []

    class Config:
        from_attributes = True
