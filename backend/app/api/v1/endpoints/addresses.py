from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
from pydantic import BaseModel
from app.services.supabase import supabase_admin
from app.core.jwt import get_current_user

router = APIRouter()

class AddressCreate(BaseModel):
    label: str = "Home"
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = ""
    city: str
    state: str
    postal_code: str
    country: str = "India"
    is_default: bool = False

class AddressUpdate(BaseModel):
    label: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    is_default: Optional[bool] = None

@router.get("/addresses")
def get_user_addresses(user = Depends(get_current_user)):
    """Get all addresses for the current user."""
    try:
        response = supabase_admin.table("user_addresses").select("*").eq("user_id", user["id"]).order("is_default", desc=True).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/addresses/{address_id}")
def get_address(address_id: str, user = Depends(get_current_user)):
    """Get a specific address."""
    try:
        response = supabase_admin.table("user_addresses").select("*").eq("id", address_id).eq("user_id", user["id"]).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Address not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/addresses")
def create_address(address: AddressCreate, user = Depends(get_current_user)):
    """Create a new address for the current user."""
    try:
        # If this is the first address or marked as default, handle default logic
        if address.is_default:
            # Unset other default addresses
            supabase_admin.table("user_addresses").update({"is_default": False}).eq("user_id", user["id"]).execute()
        else:
            # Check if user has any addresses, if not, make this default
            existing = supabase_admin.table("user_addresses").select("id").eq("user_id", user["id"]).execute()
            if not existing.data:
                address.is_default = True
        
        data = {
            "user_id": user["id"],
            "label": address.label,
            "full_name": address.full_name,
            "phone": address.phone,
            "address_line1": address.address_line1,
            "address_line2": address.address_line2 or "",
            "city": address.city,
            "state": address.state,
            "postal_code": address.postal_code,
            "country": address.country,
            "is_default": address.is_default
        }
        
        response = supabase_admin.table("user_addresses").insert(data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create address")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/addresses/{address_id}")
def update_address(address_id: str, address: AddressUpdate, user = Depends(get_current_user)):
    """Update an existing address."""
    try:
        # Check if address belongs to user
        existing = supabase_admin.table("user_addresses").select("*").eq("id", address_id).eq("user_id", user["id"]).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Address not found")
        
        # If setting as default, unset other defaults
        if address.is_default:
            supabase_admin.table("user_addresses").update({"is_default": False}).eq("user_id", user["id"]).execute()
        
        # Build update data
        update_data = {}
        if address.label is not None:
            update_data["label"] = address.label
        if address.full_name is not None:
            update_data["full_name"] = address.full_name
        if address.phone is not None:
            update_data["phone"] = address.phone
        if address.address_line1 is not None:
            update_data["address_line1"] = address.address_line1
        if address.address_line2 is not None:
            update_data["address_line2"] = address.address_line2
        if address.city is not None:
            update_data["city"] = address.city
        if address.state is not None:
            update_data["state"] = address.state
        if address.postal_code is not None:
            update_data["postal_code"] = address.postal_code
        if address.country is not None:
            update_data["country"] = address.country
        if address.is_default is not None:
            update_data["is_default"] = address.is_default
        
        update_data["updated_at"] = "now()"
        
        response = supabase_admin.table("user_addresses").update(update_data).eq("id", address_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update address")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/addresses/{address_id}")
def delete_address(address_id: str, user = Depends(get_current_user)):
    """Delete an address."""
    try:
        # Check if address belongs to user
        existing = supabase_admin.table("user_addresses").select("*").eq("id", address_id).eq("user_id", user["id"]).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Address not found")
        
        was_default = existing.data[0].get("is_default", False)
        
        supabase_admin.table("user_addresses").delete().eq("id", address_id).execute()
        
        # If deleted address was default, set another as default
        if was_default:
            remaining = supabase_admin.table("user_addresses").select("id").eq("user_id", user["id"]).order("created_at", desc=True).limit(1).execute()
            if remaining.data:
                supabase_admin.table("user_addresses").update({"is_default": True}).eq("id", remaining.data[0]["id"]).execute()
        
        return {"message": "Address deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/addresses/{address_id}/set-default")
def set_default_address(address_id: str, user = Depends(get_current_user)):
    """Set an address as default."""
    try:
        # Check if address belongs to user
        existing = supabase_admin.table("user_addresses").select("*").eq("id", address_id).eq("user_id", user["id"]).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Address not found")
        
        # Unset all other defaults
        supabase_admin.table("user_addresses").update({"is_default": False}).eq("user_id", user["id"]).execute()
        
        # Set this as default
        supabase_admin.table("user_addresses").update({"is_default": True, "updated_at": "now()"}).eq("id", address_id).execute()
        
        return {"message": "Default address updated"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
