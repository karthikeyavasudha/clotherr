from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from pydantic import BaseModel
from app.services.supabase import supabase, supabase_admin
from app.core.admin import get_admin_user
import re

router = APIRouter()

class EnabledUpdate(BaseModel):
    enabled: bool

class NumberValueUpdate(BaseModel):
    number_value: float

class FullSettingUpdate(BaseModel):
    enabled: bool
    number_value: Optional[float] = None

class CreateChargeSetting(BaseModel):
    name: str
    description: Optional[str] = None
    number_value: float = 0
    enabled: bool = True

@router.get("/settings")
def get_all_settings(admin = Depends(get_admin_user)):
    """Get all settings (admin only)."""
    try:
        response = supabase_admin.table("settings").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/settings/{key}")
def get_setting(key: str, admin = Depends(get_admin_user)):
    """Get a specific setting by key."""
    try:
        response = supabase_admin.table("settings").select("*").eq("key", key).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Setting not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/settings/{key}/enabled")
def update_enabled(key: str, setting: EnabledUpdate, admin = Depends(get_admin_user)):
    """Update a setting's enabled status."""
    try:
        existing = supabase_admin.table("settings").select("id").eq("key", key).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Setting not found")
        
        response = supabase_admin.table("settings").update({
            "enabled": setting.enabled,
            "updated_at": "now()"
        }).eq("key", key).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update setting")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/settings/{key}/number")
def update_number_setting(key: str, setting: NumberValueUpdate, admin = Depends(get_admin_user)):
    """Update a numeric setting value."""
    try:
        existing = supabase_admin.table("settings").select("id").eq("key", key).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Setting not found")
        
        response = supabase_admin.table("settings").update({
            "number_value": setting.number_value,
            "updated_at": "now()"
        }).eq("key", key).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update setting")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/settings/charge")
def create_charge_setting(setting: CreateChargeSetting, admin = Depends(get_admin_user)):
    """Create a new extra charge setting."""
    try:
        # Generate key from name (lowercase, replace spaces with underscores)
        key = re.sub(r'[^a-z0-9_]', '', setting.name.lower().replace(' ', '_'))
        
        # Check if key already exists
        existing = supabase_admin.table("settings").select("id").eq("key", key).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="A setting with this name already exists")
        
        response = supabase_admin.table("settings").insert({
            "key": key,
            "enabled": setting.enabled,
            "number_value": setting.number_value,
            "description": setting.description or f"Extra charge: {setting.name}",
            "is_custom": True
        }).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create setting")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/settings/{key}")
def delete_setting(key: str, admin = Depends(get_admin_user)):
    """Delete a custom charge setting."""
    try:
        # Check if setting exists and is custom
        existing = supabase_admin.table("settings").select("*").eq("key", key).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Setting not found")
        
        if not existing.data[0].get("is_custom", False):
            raise HTTPException(status_code=400, detail="Cannot delete system settings")
        
        response = supabase_admin.table("settings").delete().eq("key", key).execute()
        
        return {"message": "Setting deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
