import os
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from contextlib import asynccontextmanager

from delivery_challan_sse import router as sse_router
from config import SERVICE_CONFIG, CORS_CONFIG, SECURITY_CONFIG, validate_config, FEATURE_FLAGS
from auth import get_current_user, get_company_user, get_client_user, get_admin_user

# Configure logging
logging.basicConfig(
    level=getattr(logging, SERVICE_CONFIG.get('log_level', 'INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    try:
        validate_config()
        logger.info("✅ FastAPI Service starting up...")
        logger.info(f"Service: {SERVICE_CONFIG['title']} v{SERVICE_CONFIG['version']}")
        logger.info(f"Features enabled: {list(k for k, v in FEATURE_FLAGS.items() if v)}")
        yield
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise
    finally:
        # Shutdown
        logger.info("🛑 FastAPI Service shutting down...")

app = FastAPI(
    title=SERVICE_CONFIG['title'],
    description=SERVICE_CONFIG['description'],
    version=SERVICE_CONFIG['version'],
    lifespan=lifespan
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
async def security_middleware(request: Request, call_next):
    """Security middleware for request validation."""
    # Only allow requests from localhost/127.0.0.1 if restriction is enabled
    if SECURITY_CONFIG['restrict_to_localhost']:
        client_host = request.client.host
        if client_host not in SECURITY_CONFIG['allowed_hosts']:
            return JSONResponse(
                {"detail": "Forbidden - localhost access only"}, 
                status_code=403
            )
    
    # Log requests if enabled
    if FEATURE_FLAGS.get('enable_request_logging', False):
        logger.info(f"{request.method} {request.url.path} from {request.client.host}")
    
    response = await call_next(request)
    return response

@app.middleware("http")
async def performance_middleware(request: Request, call_next):
    """Performance monitoring middleware."""
    import time
    start_time = time.time()
    
    response = await call_next(request)
    
    if FEATURE_FLAGS.get('enable_performance_monitoring', False):
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        logger.info(f"Request processed in {process_time:.4f}s")
    
    return response

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error", 
            "detail": str(exc) if SERVICE_CONFIG['debug'] else "An unexpected error occurred"
        }
    )

# Include SSE router with authentication
if FEATURE_FLAGS.get('enable_sse', True):
    app.include_router(
        sse_router, 
        prefix="/api/v1",
        tags=["SSE", "Real-time"]
    )

@app.get("/")
async def root():
    """Root endpoint with service information."""
    return {
        "service": SERVICE_CONFIG['title'],
        "version": SERVICE_CONFIG['version'],
        "status": "running",
        "features": {
            "sse": FEATURE_FLAGS.get('enable_sse', False),
            "real_time_updates": FEATURE_FLAGS.get('enable_real_time_updates', False),
            "audit_logging": FEATURE_FLAGS.get('enable_audit_logging', False),
            "performance_monitoring": FEATURE_FLAGS.get('enable_performance_monitoring', False)
        },
        "endpoints": {
            "health": "/api/v1/health",
            "metrics": "/api/v1/metrics", 
            "sse": "/api/v1/sse/delivery-challan",
            "docs": "/docs"
        }
    }

@app.get("/api/v1/health")
async def health():
    """Health check endpoint (public)."""
    return {
        "status": "healthy",
        "service": SERVICE_CONFIG['title'],
        "version": SERVICE_CONFIG['version'],
        "timestamp": "2024-01-01T00:00:00Z"  # TODO: Add actual timestamp
    }

@app.get("/api/v1/metrics")
async def metrics(user: dict = Depends(get_current_user)):
    """Metrics endpoint (requires authentication)."""
    return {
        "service": SERVICE_CONFIG['title'],
        "user": {
            "id": user.get('id'),
            "username": user.get('username'),
            "user_type": user.get('user_type'),
            "role": user.get('role')
        },
        "metrics": {
            "active_connections": 0,  # TODO: Implement connection tracking
            "requests_per_minute": 0,  # TODO: Implement request counting
            "cache_hit_rate": 0.95,  # TODO: Implement cache metrics
        }
    }



@app.get("/api/v1")
async def api_info(user: dict = Depends(get_current_user)):
    """API information endpoint (requires authentication)."""
    return {
        "name": SERVICE_CONFIG['title'],
        "version": SERVICE_CONFIG['version'],
        "user": {
            "id": user.get('id'),
            "username": user.get('username'),
            "user_type": user.get('user_type'),
            "role": user.get('role')
        },
        "features": [
            "Real-time SSE updates",
            "JWT authentication",
            "Django integration",
            "Connection pooling",
            "Health monitoring",
            "Performance metrics"
        ],
        "endpoints": {
            "sse": "/api/v1/sse/delivery-challan",
            "health": "/api/v1/health",
            "metrics": "/api/v1/metrics"
        }
    }