import os
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from delivery_challan_sse import router as sse_router
from config import SERVICE_CONFIG, CORS_CONFIG, SECURITY_CONFIG, validate_config
from auth import get_current_4syz_user

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Validate configuration on startup
try:
    validate_config()
    logger.info("✅ Configuration validation passed")
except ValueError as e:
    logger.error(f"❌ Configuration error: {e}")
    raise

app = FastAPI(
    title=SERVICE_CONFIG['title'],
    description=SERVICE_CONFIG['description'],
    version=SERVICE_CONFIG['version']
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_CONFIG['allow_origins'],
    allow_credentials=CORS_CONFIG['allow_credentials'],
    allow_methods=CORS_CONFIG['allow_methods'],
    allow_headers=CORS_CONFIG['allow_headers'],
)

@app.middleware("http")
async def restrict_to_local(request: Request, call_next):
    # Only allow requests from localhost/127.0.0.1 if restriction is enabled
    if SECURITY_CONFIG['restrict_to_localhost']:
        client_host = request.client.host
        if client_host not in SECURITY_CONFIG['allowed_hosts']:
            return JSONResponse({"detail": "Forbidden"}, status_code=403)
    return await call_next(request)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "details": str(exc)}
    )

app.include_router(sse_router, prefix="/api/v1")

@app.get("/")
async def root():
    """Root endpoint with service information."""
    return {
        "service": "Delivery Challan SSE Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/v1/health",
            "metrics": "/api/v1/metrics", 
            "sse": "/api/v1/sse/delivery-challan"
        }
    }

@app.get("/api/v1/health")
async def health():
    """Health check endpoint (public)."""
    return {"status": "ok"}

@app.get("/api/v1/metrics")
async def metrics(user=Depends(get_current_4syz_user)):
    """Metrics endpoint (requires 4syz authentication)."""
    # ... actual metrics logic ...
    return {"metrics": "..."}

@app.get("/api/v1")
async def api_info(user=Depends(get_current_4syz_user)):
    """API information endpoint (requires 4syz authentication)."""
    return {
        "name": "Delivery Challan API",
        "version": "1.0.0",
        "features": [
            "Real-time SSE updates",
            "Connection pooling",
            "Health monitoring",
            "Performance metrics"
        ]
    }

# Protect all /api/v1/* endpoints (except health) with the dependency
dependencies = [Depends(get_current_4syz_user)]
app.include_router(sse_router, prefix="/api/v1", dependencies=dependencies)