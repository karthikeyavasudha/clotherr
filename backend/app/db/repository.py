"""Repository layer that abstracts database operations.

This module provides a unified interface for database operations,
switching between SQLAlchemy (local PostgreSQL) and Supabase based on USE_SUPABASE env var.
"""
from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session

from app.core.config import settings


class BaseRepository:
    """Base repository with common operations."""
    
    def __init__(self, db: Optional[Session] = None):
        self.db = db
        self.use_supabase = settings.USE_SUPABASE
        
        if self.use_supabase:
            from app.services.supabase import supabase
            self.supabase = supabase


class ProductRepository(BaseRepository):
    """Repository for product operations."""
    
    def get_all(self, skip: int = 0, limit: int = 100, category: Optional[str] = None) -> List[Dict]:
        """Get all products with optional category filter."""
        if self.use_supabase:
            query = self.supabase.table("products").select("*")
            if category:
                query = query.eq("category", category)
            response = query.range(skip, skip + limit - 1).execute()
            return response.data
        else:
            from app.db.models import Product
            query = self.db.query(Product)
            if category:
                query = query.filter(Product.category == category)
            products = query.offset(skip).limit(limit).all()
            return [self._to_dict(p) for p in products]
    
    def get_by_id(self, product_id: str) -> Optional[Dict]:
        """Get product by ID."""
        if self.use_supabase:
            response = self.supabase.table("products").select("*").eq("id", product_id).execute()
            return response.data[0] if response.data else None
        else:
            from app.db.models import Product
            product = self.db.query(Product).filter(Product.id == product_id).first()
            return self._to_dict(product) if product else None
    
    def create(self, data: Dict) -> Dict:
        """Create a new product."""
        import json
        # Serialize images list to JSON string for storage
        if 'images' in data and data['images'] is not None:
            data = data.copy()
            data['images'] = json.dumps(data['images'])
        
        if self.use_supabase:
            response = self.supabase.table("products").insert(data).execute()
            return response.data[0] if response.data else None
        else:
            from app.db.models import Product
            product = Product(**data)
            self.db.add(product)
            self.db.commit()
            self.db.refresh(product)
            return self._to_dict(product)
    
    def update(self, product_id: str, data: Dict) -> Optional[Dict]:
        """Update a product."""
        import json
        # Serialize images list to JSON string for storage
        if 'images' in data and data['images'] is not None:
            data = data.copy()
            data['images'] = json.dumps(data['images'])
        
        if self.use_supabase:
            self.supabase.table("products").update(data).eq("id", product_id).execute()
            return self.get_by_id(product_id)
        else:
            from app.db.models import Product
            product = self.db.query(Product).filter(Product.id == product_id).first()
            if product:
                for key, value in data.items():
                    setattr(product, key, value)
                self.db.commit()
                self.db.refresh(product)
                return self._to_dict(product)
            return None
    
    def delete(self, product_id: str) -> bool:
        """Delete a product."""
        if self.use_supabase:
            self.supabase.table("products").delete().eq("id", product_id).execute()
            return True
        else:
            from app.db.models import Product
            product = self.db.query(Product).filter(Product.id == product_id).first()
            if product:
                self.db.delete(product)
                self.db.commit()
                return True
            return False
    
    def _to_dict(self, product) -> Dict:
        """Convert SQLAlchemy model to dict."""
        import json
        if not product:
            return None
        
        # Parse images JSON string to list
        images = None
        if product.images:
            try:
                images = json.loads(product.images)
            except (json.JSONDecodeError, TypeError):
                images = None
        
        return {
            "id": str(product.id),
            "name": product.name,
            "description": product.description,
            "price": float(product.price) if product.price else 0,
            "compare_at_price": float(product.compare_at_price) if product.compare_at_price else None,
            "image_url": product.image_url,
            "images": images,
            "category": product.category,
            "stock": product.stock,
            "created_at": product.created_at.isoformat() if product.created_at else None
        }


class UserRepository(BaseRepository):
    """Repository for user operations."""
    
    def get_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by ID."""
        if self.use_supabase:
            response = self.supabase.table("users").select("*").eq("id", user_id).execute()
            return response.data[0] if response.data else None
        else:
            from app.db.models import User
            user = self.db.query(User).filter(User.id == user_id).first()
            return self._to_dict(user) if user else None
    
    def get_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email."""
        if self.use_supabase:
            response = self.supabase.table("users").select("*").eq("email", email).execute()
            return response.data[0] if response.data else None
        else:
            from app.db.models import User
            user = self.db.query(User).filter(User.email == email).first()
            return self._to_dict(user) if user else None
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Dict]:
        """Get all users."""
        if self.use_supabase:
            response = self.supabase.table("users").select("*").range(skip, skip + limit - 1).order("created_at", desc=True).execute()
            return response.data
        else:
            from app.db.models import User
            users = self.db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()
            return [self._to_dict(u) for u in users]
    
    def create(self, data: Dict) -> Dict:
        """Create a new user."""
        if self.use_supabase:
            response = self.supabase.table("users").insert(data).execute()
            return response.data[0] if response.data else None
        else:
            from app.db.models import User
            user = User(**data)
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
            return self._to_dict(user)
    
    def update(self, user_id: str, data: Dict) -> Optional[Dict]:
        """Update a user."""
        if self.use_supabase:
            self.supabase.table("users").update(data).eq("id", user_id).execute()
            return self.get_by_id(user_id)
        else:
            from app.db.models import User
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                for key, value in data.items():
                    setattr(user, key, value)
                self.db.commit()
                self.db.refresh(user)
                return self._to_dict(user)
            return None
    
    def count(self) -> int:
        """Count total users."""
        if self.use_supabase:
            response = self.supabase.table("users").select("id", count="exact").execute()
            return response.count or 0
        else:
            from app.db.models import User
            return self.db.query(User).count()
    
    def _to_dict(self, user) -> Dict:
        """Convert SQLAlchemy model to dict."""
        if not user:
            return None
        return {
            "id": str(user.id),
            "email": user.email,
            "password_hash": user.password_hash,
            "full_name": user.full_name,
            "phone": user.phone,
            "address": user.address,
            "address_line1": user.address_line1,
            "address_line2": user.address_line2,
            "city": user.city,
            "state": user.state,
            "postal_code": user.postal_code,
            "pincode": user.pincode,
            "country": user.country,
            "is_admin": user.is_admin,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None
        }


class OrderRepository(BaseRepository):
    """Repository for order operations."""
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Dict]:
        """Get all orders with user and items."""
        if self.use_supabase:
            response = self.supabase.table("orders").select(
                "*, users(id, email, full_name), order_items(*, products(name, image_url))"
            ).order("created_at", desc=True).range(skip, skip + limit - 1).execute()
            return response.data
        else:
            from app.db.models import Order
            orders = self.db.query(Order).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
            return [self._to_dict_full(o) for o in orders]
    
    def get_by_user(self, user_id: str) -> List[Dict]:
        """Get orders for a specific user."""
        if self.use_supabase:
            response = self.supabase.table("orders").select(
                "*, order_items(*, products(name, image_url))"
            ).eq("user_id", user_id).order("created_at", desc=True).execute()
            return response.data
        else:
            from app.db.models import Order
            orders = self.db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
            return [self._to_dict_full(o) for o in orders]
    
    def get_by_id(self, order_id: str) -> Optional[Dict]:
        """Get order by ID with full details."""
        if self.use_supabase:
            response = self.supabase.table("orders").select(
                "*, users(id, email, full_name), order_items(*, products(name, image_url, price))"
            ).eq("id", order_id).execute()
            return response.data[0] if response.data else None
        else:
            from app.db.models import Order
            order = self.db.query(Order).filter(Order.id == order_id).first()
            return self._to_dict_full(order) if order else None
    
    def create(self, data: Dict) -> Dict:
        """Create a new order."""
        if self.use_supabase:
            response = self.supabase.table("orders").insert(data).execute()
            return response.data[0] if response.data else None
        else:
            from app.db.models import Order
            order = Order(**data)
            self.db.add(order)
            self.db.commit()
            self.db.refresh(order)
            return self._to_dict(order)
    
    def update_status(self, order_id: str, status: str) -> Optional[Dict]:
        """Update order status."""
        if self.use_supabase:
            self.supabase.table("orders").update({"status": status}).eq("id", order_id).execute()
            return self.get_by_id(order_id)
        else:
            from app.db.models import Order
            order = self.db.query(Order).filter(Order.id == order_id).first()
            if order:
                order.status = status
                self.db.commit()
                self.db.refresh(order)
                return self._to_dict(order)
            return None
    
    def count(self) -> int:
        """Count total orders."""
        if self.use_supabase:
            response = self.supabase.table("orders").select("id", count="exact").execute()
            return response.count or 0
        else:
            from app.db.models import Order
            return self.db.query(Order).count()
    
    def sum_revenue(self) -> float:
        """Sum total revenue."""
        if self.use_supabase:
            response = self.supabase.table("orders").select("total_amount").execute()
            return sum(o["total_amount"] for o in response.data) if response.data else 0
        else:
            from app.db.models import Order
            from sqlalchemy import func
            result = self.db.query(func.sum(Order.total_amount)).scalar()
            return float(result) if result else 0
    
    def count_by_status(self) -> Dict[str, int]:
        """Count orders by status."""
        if self.use_supabase:
            response = self.supabase.table("orders").select("status").execute()
            counts = {}
            for order in response.data:
                status = order["status"]
                counts[status] = counts.get(status, 0) + 1
            return counts
        else:
            from app.db.models import Order
            from sqlalchemy import func
            results = self.db.query(Order.status, func.count(Order.id)).group_by(Order.status).all()
            return {status: count for status, count in results}
    
    def get_recent(self, limit: int = 5) -> List[Dict]:
        """Get recent orders."""
        if self.use_supabase:
            response = self.supabase.table("orders").select(
                "*, users(id, email, full_name)"
            ).order("created_at", desc=True).limit(limit).execute()
            return response.data
        else:
            from app.db.models import Order
            orders = self.db.query(Order).order_by(Order.created_at.desc()).limit(limit).all()
            return [self._to_dict_with_user(o) for o in orders]
    
    def _to_dict(self, order) -> Dict:
        """Convert SQLAlchemy model to dict."""
        if not order:
            return None
        return {
            "id": str(order.id),
            "user_id": str(order.user_id),
            "status": order.status,
            "total_amount": float(order.total_amount) if order.total_amount else 0,
            "shipping_address": order.shipping_address,
            "created_at": order.created_at.isoformat() if order.created_at else None
        }
    
    def _to_dict_with_user(self, order) -> Dict:
        """Convert with user info."""
        d = self._to_dict(order)
        if d and order.user:
            d["users"] = {
                "id": str(order.user.id),
                "email": order.user.email,
                "full_name": order.user.full_name
            }
        return d
    
    def _to_dict_full(self, order) -> Dict:
        """Convert with user and items."""
        d = self._to_dict_with_user(order)
        if d and order.items:
            d["order_items"] = [
                {
                    "id": str(item.id),
                    "product_id": str(item.product_id),
                    "quantity": item.quantity,
                    "price_at_purchase": float(item.price_at_purchase),
                    "products": {
                        "name": item.product.name if item.product else None,
                        "image_url": item.product.image_url if item.product else None
                    }
                }
                for item in order.items
            ]
        return d


class OrderItemRepository(BaseRepository):
    """Repository for order item operations."""
    
    def create_many(self, items: List[Dict]) -> bool:
        """Create multiple order items."""
        if self.use_supabase:
            self.supabase.table("order_items").insert(items).execute()
            return True
        else:
            from app.db.models import OrderItem
            for item_data in items:
                item = OrderItem(**item_data)
                self.db.add(item)
            self.db.commit()
            return True


# Factory function to get repositories
def get_product_repo(db: Optional[Session] = None) -> ProductRepository:
    return ProductRepository(db)

def get_user_repo(db: Optional[Session] = None) -> UserRepository:
    return UserRepository(db)

def get_order_repo(db: Optional[Session] = None) -> OrderRepository:
    return OrderRepository(db)

def get_order_item_repo(db: Optional[Session] = None) -> OrderItemRepository:
    return OrderItemRepository(db)
