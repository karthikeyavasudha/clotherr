"""SQLAlchemy ORM models."""
from sqlalchemy import Column, String, Text, Numeric, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.database import Base


class User(Base):
    """User model - matches users table."""
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    phone = Column(String(20))
    address = Column(Text)  # Legacy field
    address_line1 = Column(String(255))
    address_line2 = Column(String(255))
    city = Column(String(100))
    state = Column(String(100))
    postal_code = Column(String(20))
    pincode = Column(String(10))  # Legacy field
    country = Column(String(100))
    is_admin = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    orders = relationship("Order", back_populates="user")


class Product(Base):
    """Product model."""
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)  # Current/sale price
    compare_at_price = Column(Numeric(10, 2))  # Original price (for showing discounts)
    image_url = Column(Text)  # Primary image (backwards compatible)
    images = Column(Text)  # JSON array of additional image URLs
    category = Column(String(50))
    stock = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Order(Base):
    """Order model."""
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="pending")
    total_amount = Column(Numeric(10, 2), nullable=False)
    shipping_address = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    """Order item model."""
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_at_purchase = Column(Numeric(10, 2), nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product")
