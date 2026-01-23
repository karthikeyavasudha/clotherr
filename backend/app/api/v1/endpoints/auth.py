from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.auth import UserLogin, UserSignup, Token
from app.core.security import verify_password, get_password_hash
from app.core.jwt import create_access_token, create_refresh_token, verify_refresh_token
from app.core.config import settings
from app.db.database import get_db
from app.db.repository import get_user_repo
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

class RefreshTokenRequest(BaseModel):
    refresh_token: str

def get_repo(db: Session = Depends(get_db)):
    """Get user repository with optional db session."""
    if settings.USE_SUPABASE:
        return get_user_repo()
    return get_user_repo(db)

@router.post("/signup", response_model=Token)
def signup(user: UserSignup, repo = Depends(get_repo)):
    """Create a new user account."""
    try:
        # Check if user already exists
        existing = repo.get_by_email(user.email)
        if existing:
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
        
        result = repo.create(user_data)
        
        if not result:
            raise HTTPException(status_code=500, detail="Failed to create user")
        
        # Generate JWT tokens
        token_data = {"sub": user_id, "email": user.email}
        access_token = create_access_token(data=token_data)
        refresh_token = create_refresh_token(data=token_data)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
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
                "created_at": result.get("created_at"),
                "updated_at": result.get("updated_at")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=Token)
def login(user: UserLogin, repo = Depends(get_repo)):
    """Authenticate user with email and password."""
    try:
        # Fetch user from database
        db_user = repo.get_by_email(user.email)
        
        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not verify_password(user.password, db_user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Generate JWT tokens
        token_data = {"sub": db_user["id"], "email": db_user["email"]}
        access_token = create_access_token(data=token_data)
        refresh_token = create_refresh_token(data=token_data)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
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
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/update/{user_id}")
def update_profile(user_id: str, update_data: dict, repo = Depends(get_repo)):
    """Update user profile information."""
    try:
        # Fetch current user data
        existing = repo.get_by_id(user_id)
        
        if not existing:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Filter out None values and password fields
        update_fields = {k: v for k, v in update_data.items() if v is not None and k != "password"}
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Update user in database
        updated_user = repo.update(user_id, update_fields)
        
        if not updated_user:
            raise HTTPException(status_code=500, detail="Failed to update profile")
        
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
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, repo = Depends(get_repo)):
    """Send password reset email with a token."""
    from app.core.email import send_password_reset_email
    
    try:
        # Check if user exists
        user = repo.get_by_email(request.email)
        
        # Always return success to prevent email enumeration
        if not user:
            return {"message": "If this email exists, a reset link has been sent."}
        
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        
        # Store token with expiry (30 minutes)
        reset_tokens[reset_token] = {
            "user_id": user["id"],
            "email": user["email"],
            "expires_at": datetime.utcnow() + timedelta(minutes=30)
        }
        
        # Send password reset email
        email_sent = send_password_reset_email(
            to_email=user["email"],
            reset_token=reset_token
        )
        
        if not email_sent:
            # Log failure but don't reveal to user
            import logging
            logging.error(f"Failed to send password reset email to {user['email']}")
        
        return {"message": "If this email exists, a reset link has been sent."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, repo = Depends(get_repo)):
    """Reset password using the token."""
    try:
        # Validate token
        if request.token not in reset_tokens:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        token_data = reset_tokens[request.token]
        
        # Check if token is expired
        if datetime.utcnow() > token_data["expires_at"]:
            del reset_tokens[request.token]
            raise HTTPException(status_code=400, detail="Reset token has expired")
        
        # Hash new password
        new_password_hash = get_password_hash(request.new_password)
        
        # Update password
        updated = repo.update(token_data["user_id"], {"password_hash": new_password_hash})
        
        if not updated:
            raise HTTPException(status_code=500, detail="Failed to reset password")
        
        # Remove used token
        del reset_tokens[request.token]
        
        return {"message": "Password reset successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/refresh")
def refresh_access_token(request: RefreshTokenRequest, repo = Depends(get_repo)):
    """
    Exchange a valid refresh token for a new access token and refresh token.
    """
    try:
        # Verify the refresh token
        payload = verify_refresh_token(request.refresh_token)
        
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
        
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if not user_id or not email:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        # Verify user still exists
        user = repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        # Generate new tokens
        token_data = {"sub": user_id, "email": email}
        new_access_token = create_access_token(data=token_data)
        new_refresh_token = create_refresh_token(data=token_data)
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

