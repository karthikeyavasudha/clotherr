from fastapi import APIRouter, HTTPException
from app.schemas.auth import UserLogin, UserSignup, Token
from app.services.supabase import supabase
from app.core.security import verify_password, get_password_hash
from app.core.jwt import create_access_token
from app.core.config import settings
from pydantic import BaseModel, EmailStr
import uuid
import secrets
from datetime import datetime, timedelta

router = APIRouter()

# In-memory store for reset tokens (in production, use Redis or database)
reset_tokens = {}

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

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
            "phone": user.phone
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

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest):
    """
    Send password reset email with a token.
    """
    try:
        # Check if user exists
        result = supabase.table("users").select("id, email, full_name").eq("email", request.email).execute()
        
        # Always return success to prevent email enumeration
        if not result.data:
            return {"message": "If this email exists, a reset link has been sent."}
        
        user = result.data[0]
        
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        
        # Store token with expiry (1 hour)
        reset_tokens[reset_token] = {
            "user_id": user["id"],
            "email": user["email"],
            "expires_at": datetime.utcnow() + timedelta(hours=1)
        }
        
        # In production, send this via email
        # For now, we'll just return success and log the token
        print(f"Password reset token for {user['email']}: {reset_token}")
        
        # Try to send email if mail service is configured
        try:
            from app.services.email import send_password_reset_email
            reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
            send_password_reset_email(user["email"], user.get("full_name", "User"), reset_link)
        except Exception as email_error:
            print(f"Could not send email: {email_error}")
            # Still return the token for development
            return {
                "message": "Password reset token generated.",
                "token": reset_token,  # Remove in production!
                "note": "Email sending failed, use this token directly"
            }
        
        return {"message": "If this email exists, a reset link has been sent."}
    except Exception as e:
        print(f"Forgot password error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process request")

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest):
    """
    Reset password using the token from forgot-password email.
    """
    try:
        # Verify token exists and is valid
        if request.token not in reset_tokens:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        token_data = reset_tokens[request.token]
        
        # Check if token is expired
        if datetime.utcnow() > token_data["expires_at"]:
            del reset_tokens[request.token]
            raise HTTPException(status_code=400, detail="Reset token has expired")
        
        # Validate new password
        if len(request.new_password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
        # Hash new password
        password_hash = get_password_hash(request.new_password)
        
        # Update user's password
        result = supabase.table("users").update({
            "password_hash": password_hash
        }).eq("id", token_data["user_id"]).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to reset password")
        
        # Remove used token
        del reset_tokens[request.token]
        
        return {"message": "Password has been reset successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Reset password error: {e}")
        raise HTTPException(status_code=500, detail="Failed to reset password")

@router.get("/verify-reset-token/{token}")
def verify_reset_token(token: str):
    """
    Verify if a reset token is valid.
    """
    if token not in reset_tokens:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    token_data = reset_tokens[token]
    
    if datetime.utcnow() > token_data["expires_at"]:
        del reset_tokens[token]
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    return {"valid": True, "email": token_data["email"]}

