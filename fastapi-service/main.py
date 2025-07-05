import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import logging

from delivery_challan_sse import router as sse_router

# Load Django settings environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../backend/config.env'))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Delivery Challan SSE Service",
    description="Real-time delivery challan updates via Server-Sent Events",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def restrict_to_local(request: Request, call_next):
    # Only allow requests from localhost/127.0.0.1
    client_host = request.client.host
    if client_host not in ("127.0.0.1", "::1", "localhost"):
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

@app.get("/api/v1")
async def api_info():
    """API information endpoint."""
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