import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
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
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
