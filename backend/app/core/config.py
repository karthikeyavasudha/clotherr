import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Clotherr API"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: list = []
    
    # Database Settings
    USE_SUPABASE: bool = False  # Set to True for Supabase, False for local PostgreSQL
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/clotherr"
    
    # Supabase Settings (optional when USE_SUPABASE=False)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    
    # JWT Settings
    JWT_SECRET_KEY: str = "your-secret-key-change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Email Settings (for order emails)
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = ""
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.zoho.com"
    
    # Noreply Email Settings (for password reset, notifications)
    NOREPLY_USERNAME: str = ""
    NOREPLY_PASSWORD: str = ""
    NOREPLY_FROM: str = ""

    class Config:
        env_file = ".env"

settings = Settings()

