from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from app.core.config import settings

# Token expiry settings
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES  # Short-lived (default 30 min)
REFRESH_TOKEN_EXPIRE_DAYS = 7  # Long-lived (7 days)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a short-lived JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a long-lived JWT refresh token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """Verify and decode a JWT token (access or refresh)."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

def verify_access_token(token: str):
    """Verify an access token specifically."""
    payload = verify_token(token)
    if payload and payload.get("type") == "access":
        return payload
    return None

def verify_refresh_token(token: str):
    """Verify a refresh token specifically."""
    payload = verify_token(token)
    if payload and payload.get("type") == "refresh":
        return payload
    return None
