from fastapi import HTTPException, Header
from app.core.jwt import verify_token
from app.services.supabase import supabase

def get_admin_user(authorization: str = Header(None)):
    """
    Dependency that verifies the user is authenticated AND is an admin.
    Raises 401 if not authenticated, 403 if not an admin.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    
    try:
        # Extract token from "Bearer <token>"
        token = authorization.split(" ")[1]
        
        # Verify JWT token
        payload = verify_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        # Get user_id from token payload
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        # Fetch user from database
        result = supabase.table("users").select("*").eq("id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = result.data[0]
        
        # Check if user is admin
        if not user.get("is_admin", False):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        return user
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

# Alias for consistency
require_admin = get_admin_user
