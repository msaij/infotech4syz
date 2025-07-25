from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth.routes import auth_router
from config import ALLOWED_ORIGINS, HOST, PORT, DEBUG

# FastAPI app instance
app = FastAPI(
    title="Infotech4Syz API",
    description="FastAPI backend for Infotech4Syz user login",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth router
app.include_router(auth_router)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Infotech4Syz API",
        "version": "1.0.0"
    }



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT, debug=DEBUG) 