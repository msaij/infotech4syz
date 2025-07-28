from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth.routes import auth_router
from auth.client_routes import client_router
from auth.delivery_challan_routes import delivery_challan_router
from auth.permission_routes import permission_router
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="4Syz API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth")
app.include_router(client_router, prefix="/clients")
app.include_router(delivery_challan_router, prefix="/delivery-challan")
app.include_router(permission_router, prefix="/permissions", tags=["Permission Management"])

@app.get("/")
async def root():
    return {"message": "4Syz API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 