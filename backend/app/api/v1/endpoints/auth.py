from fastapi import APIRouter, HTTPException
from app.schemas.auth import UserLogin, UserSignup, Token
from app.services.supabase import supabase
from app.core.security import verify_password, get_password_hash
from app.core.jwt import create_access_token
import uuid

router = APIRouter()

@router.post("/signup", response_model=Token)
def signup(user: UserSignup):
    """
    Create a new user account.
    Stores email and hashed password in the users table.
    """
    try:
        # Check if user already exists
        existing = supabase.table("users").select("id").eq("email", user.email).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash the password
        password_hash = get_password_hash(user.password)
        
        # Create user in database
        user_id = str(uuid.uuid4())
        user_data = {
            "id": user_id,
            "email": user.email,
            "password_hash": password_hash,
            "full_name": user.full_name,
            "phone": user.phone,
            "address_line1": user.address_line1,
            "address_line2": user.address_line2,
            "city": user.city,
            "state": user.state,
            "postal_code": user.postal_code,
            "country": user.country
        }
        
        result = supabase.table("users").insert(user_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create user")
        
        # Generate JWT token
        access_token = create_access_token(data={"sub": user_id, "email": user.email})
        
        # Return all user data (except password_hash)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": user.email,
                "full_name": user.full_name,
                "phone": user.phone,
                "address_line1": user.address_line1,
                "address_line2": user.address_line2,
                "city": user.city,
                "state": user.state,
                "postal_code": user.postal_code,
                "country": user.country,
                "created_at": result.data[0].get("created_at"),
                "updated_at": result.data[0].get("updated_at")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Signup error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=Token)
def login(user: UserLogin):
    """
    Authenticate user with email and password.
    Verifies credentials against the users table.
    """
    try:
        # Fetch user from database
        result = supabase.table("users").select("*").eq("email", user.email).execute()
        
        if not result.data:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        db_user = result.data[0]
        
        # Verify password
        if not verify_password(user.password, db_user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Generate JWT token
        access_token = create_access_token(
            data={"sub": db_user["id"], "email": db_user["email"]}
        )
        
        # Return all user data (except password_hash)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": db_user["id"],
                "email": db_user["email"],
                "full_name": db_user.get("full_name"),
                "phone": db_user.get("phone"),
                "address_line1": db_user.get("address_line1"),
                "address_line2": db_user.get("address_line2"),
                "city": db_user.get("city"),
                "state": db_user.get("state"),
                "postal_code": db_user.get("postal_code"),
                "country": db_user.get("country"),
                "created_at": db_user.get("created_at"),
                "updated_at": db_user.get("updated_at")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/update/{user_id}")
def update_profile(user_id: str, update_data: dict):
    """
    Update user profile information.
    """
    try:
        # Fetch current user data
        result = supabase.table("users").select("*").eq("id", user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Filter out None values and password fields
        update_fields = {k: v for k, v in update_data.items() if v is not None and k != "password"}
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Update user in database
        updated = supabase.table("users").update(update_fields).eq("id", user_id).execute()
        
        if not updated.data:
            raise HTTPException(status_code=500, detail="Failed to update profile")
        
        updated_user = updated.data[0]
        
        # Return updated user data (except password_hash)
        return {
            "id": updated_user["id"],
            "email": updated_user["email"],
            "full_name": updated_user.get("full_name"),
            "phone": updated_user.get("phone"),
            "address_line1": updated_user.get("address_line1"),
            "address_line2": updated_user.get("address_line2"),
            "city": updated_user.get("city"),
            "state": updated_user.get("state"),
            "postal_code": updated_user.get("postal_code"),
            "country": updated_user.get("country"),
            "created_at": updated_user.get("created_at"),
            "updated_at": updated_user.get("updated_at")
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Update error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

