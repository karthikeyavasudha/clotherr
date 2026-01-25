from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.services.supabase import supabase, supabase_admin
from app.core.admin import get_admin_user

router = APIRouter()

class CreateDiscount(BaseModel):
    code: str
    type: str  # 'percentage', 'fixed', or 'waive_charges'
    value: Optional[float] = 0
    min_order_amount: Optional[float] = 0
    max_discount: Optional[float] = None
    usage_limit: Optional[int] = None
    per_user_limit: Optional[int] = None
    expiry_date: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True
    waive_extra_charges: bool = False
    waive_charges_list: Optional[List[str]] = []

class UpdateDiscount(BaseModel):
    code: Optional[str] = None
    type: Optional[str] = None
    value: Optional[float] = None
    min_order_amount: Optional[float] = None
    max_discount: Optional[float] = None
    usage_limit: Optional[int] = None
    per_user_limit: Optional[int] = None
    expiry_date: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    waive_extra_charges: Optional[bool] = None
    waive_charges_list: Optional[List[str]] = None

class ValidateDiscount(BaseModel):
    code: str
    order_amount: float
    user_id: Optional[str] = None

# Public endpoint to get available discounts
@router.get("/discounts/available")
def get_available_discounts():
    """Get all active and valid discount codes for display."""
    try:
        response = supabase.table("discounts").select(
            "code, type, value, min_order_amount, max_discount, description, expiry_date"
        ).eq("is_active", True).execute()
        
        # Filter out expired and usage-exhausted discounts
        from datetime import datetime
        valid_discounts = []
        for discount in response.data:
            # Check expiry
            if discount.get("expiry_date"):
                expiry = datetime.fromisoformat(discount["expiry_date"].replace("Z", "+00:00"))
                if datetime.now(expiry.tzinfo) > expiry:
                    continue
            valid_discounts.append(discount)
        
        return valid_discounts
    except Exception as e:
        return []

# Admin endpoints
@router.get("/admin/discounts")
def get_all_discounts(admin = Depends(get_admin_user)):
    """Get all discounts (admin only)."""
    try:
        response = supabase_admin.table("discounts").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/discounts")
def create_discount(discount: CreateDiscount, admin = Depends(get_admin_user)):
    """Create a new discount code."""
    try:
        # Validate type
        if discount.type not in ['percentage', 'fixed', 'waive_charges']:
            raise HTTPException(status_code=400, detail="Type must be 'percentage', 'fixed', or 'waive_charges'")
        
        # Validate percentage value
        if discount.type == 'percentage' and (discount.value < 0 or discount.value > 100):
            raise HTTPException(status_code=400, detail="Percentage must be between 0 and 100")
        
        # For waive_charges type, value should be 0 and waive_extra_charges should be True
        if discount.type == 'waive_charges':
            discount.value = 0
            discount.waive_extra_charges = True
        
        # Check if code already exists
        existing = supabase_admin.table("discounts").select("id").eq("code", discount.code.upper()).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="Discount code already exists")
        
        data = {
            "code": discount.code.upper(),
            "type": discount.type,
            "value": discount.value or 0,
            "min_order_amount": discount.min_order_amount or 0,
            "max_discount": discount.max_discount,
            "usage_limit": discount.usage_limit,
            "per_user_limit": discount.per_user_limit,
            "expiry_date": discount.expiry_date,
            "description": discount.description,
            "is_active": discount.is_active,
            "waive_extra_charges": discount.waive_extra_charges,
            "waive_charges_list": discount.waive_charges_list or []
        }
        
        response = supabase_admin.table("discounts").insert(data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create discount")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/admin/discounts/{discount_id}")
def update_discount(discount_id: str, discount: UpdateDiscount, admin = Depends(get_admin_user)):
    """Update a discount code."""
    try:
        # Check if discount exists
        existing = supabase_admin.table("discounts").select("*").eq("id", discount_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Discount not found")
        
        # Build update data
        update_data = {}
        if discount.code is not None:
            update_data["code"] = discount.code.upper()
        if discount.type is not None:
            if discount.type not in ['percentage', 'fixed']:
                raise HTTPException(status_code=400, detail="Type must be 'percentage', 'fixed', or 'waive_charges'")
            update_data["type"] = discount.type
            # If changing to waive_charges type, set appropriate defaults
            if discount.type == 'waive_charges':
                update_data["value"] = 0
                update_data["waive_extra_charges"] = True
        if discount.value is not None:
            update_data["value"] = discount.value
        if discount.min_order_amount is not None:
            update_data["min_order_amount"] = discount.min_order_amount
        if discount.max_discount is not None:
            update_data["max_discount"] = discount.max_discount
        if discount.usage_limit is not None:
            update_data["usage_limit"] = discount.usage_limit
        if discount.per_user_limit is not None:
            update_data["per_user_limit"] = discount.per_user_limit
        if discount.expiry_date is not None:
            update_data["expiry_date"] = discount.expiry_date
        if discount.description is not None:
            update_data["description"] = discount.description
        if discount.is_active is not None:
            update_data["is_active"] = discount.is_active
        if discount.waive_extra_charges is not None:
            update_data["waive_extra_charges"] = discount.waive_extra_charges
        if discount.waive_charges_list is not None:
            update_data["waive_charges_list"] = discount.waive_charges_list
        
        update_data["updated_at"] = "now()"
        
        response = supabase_admin.table("discounts").update(update_data).eq("id", discount_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update discount")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/admin/discounts/{discount_id}")
def delete_discount(discount_id: str, admin = Depends(get_admin_user)):
    """Delete a discount code."""
    try:
        existing = supabase_admin.table("discounts").select("id").eq("id", discount_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Discount not found")
        
        supabase_admin.table("discounts").delete().eq("id", discount_id).execute()
        
        return {"message": "Discount deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Public endpoint for validating discount codes
@router.post("/discounts/validate")
def validate_discount(data: ValidateDiscount):
    """Validate a discount code and calculate discount amount."""
    try:
        code = data.code.upper().strip()
        
        # Find discount
        response = supabase.table("discounts").select("*").eq("code", code).eq("is_active", True).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Invalid discount code")
        
        discount = response.data[0]
        
        # Check expiry
        if discount.get("expiry_date"):
            expiry = datetime.fromisoformat(discount["expiry_date"].replace("Z", "+00:00"))
            if datetime.now(expiry.tzinfo) > expiry:
                raise HTTPException(status_code=400, detail="Discount code has expired")
        
        # Check usage limit
        if discount.get("usage_limit") and discount.get("used_count", 0) >= discount["usage_limit"]:
            raise HTTPException(status_code=400, detail="Discount code usage limit reached")
        
        # Check per-user limit
        if data.user_id and discount.get("per_user_limit"):
            user_usage = supabase_admin.table("user_discount_usage").select("usage_count").eq("user_id", data.user_id).eq("discount_id", discount["id"]).execute()
            if user_usage.data:
                user_count = user_usage.data[0].get("usage_count", 0)
                if user_count >= discount["per_user_limit"]:
                    raise HTTPException(status_code=400, detail=f"You have already used this code {user_count} time(s). Limit: {discount['per_user_limit']} per user")
        
        # Check minimum order amount
        min_amount = discount.get("min_order_amount", 0) or 0
        if data.order_amount < min_amount:
            raise HTTPException(status_code=400, detail=f"Minimum order amount of ₹{min_amount} required")
        
        # Calculate discount based on type
        discount_amount = 0
        if discount["type"] == "percentage":
            discount_amount = (data.order_amount * discount["value"]) / 100
            # Apply max discount cap if set
            if discount.get("max_discount") and discount_amount > discount["max_discount"]:
                discount_amount = discount["max_discount"]
        elif discount["type"] == "fixed":
            discount_amount = discount["value"]
            # Don't exceed order amount
            if discount_amount > data.order_amount:
                discount_amount = data.order_amount
        elif discount["type"] == "waive_charges":
            # No discount amount for waive_charges type, just waives selected charges
            discount_amount = 0
        
        return {
            "valid": True,
            "code": discount["code"],
            "type": discount["type"],
            "value": discount["value"] or 0,
            "discount_amount": round(discount_amount, 2),
            "description": discount.get("description", ""),
            "waive_extra_charges": discount.get("waive_extra_charges", False),
            "waive_charges_list": discount.get("waive_charges_list", []) or []
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class UseDiscount(BaseModel):
    user_id: Optional[str] = None

# Increment usage count when order is placed
@router.post("/discounts/use/{code}")
def use_discount(code: str, data: UseDiscount = None):
    """Increment the usage count of a discount code and track per-user usage."""
    try:
        code = code.upper().strip()
        
        # Get discount info
        response = supabase_admin.table("discounts").select("id, used_count").eq("code", code).execute()
        if not response.data:
            return {"message": "Discount not found"}
        
        discount = response.data[0]
        current_count = discount.get("used_count", 0) or 0
        
        # Increment global usage count
        supabase_admin.table("discounts").update({
            "used_count": current_count + 1,
            "updated_at": "now()"
        }).eq("code", code).execute()
        
        # Track per-user usage if user_id provided
        if data and data.user_id:
            # Check if user has used this discount before
            existing = supabase_admin.table("user_discount_usage").select("id, usage_count").eq("user_id", data.user_id).eq("discount_id", discount["id"]).execute()
            
            if existing.data:
                # Increment existing usage count
                new_count = existing.data[0].get("usage_count", 0) + 1
                supabase_admin.table("user_discount_usage").update({
                    "usage_count": new_count,
                    "last_used_at": "now()"
                }).eq("id", existing.data[0]["id"]).execute()
            else:
                # Create new usage record
                supabase_admin.table("user_discount_usage").insert({
                    "user_id": data.user_id,
                    "discount_id": discount["id"],
                    "discount_code": code,
                    "usage_count": 1
                }).execute()
        
        return {"message": "Discount usage recorded"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
