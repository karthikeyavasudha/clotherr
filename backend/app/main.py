from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.v1.api import api_router
import logging

# Configure logging (WARNING level for cleaner output)
logging.basicConfig(
    level=logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json")

# Initialize database tables on startup (for local PostgreSQL)
@app.on_event("startup")
def startup_event():
    if not settings.USE_SUPABASE:
        from app.db.database import init_db
        logger.warning("Using local PostgreSQL database")
        init_db()
    else:
        logger.warning("Using Supabase database")

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Default for development
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "https://clotherr.vercel.app"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to Clotherr API", "database": "supabase" if settings.USE_SUPABASE else "postgresql"}
