import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Clotherr API"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: list = []
    
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    # JWT Settings
    JWT_SECRET_KEY: str = "your-secret-key-change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Email Settings
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.zoho.com"

    class Config:
        env_file = ".env"

settings = Settings()
