import os
from fastapi import FastAPI, Request
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from dotenv import load_dotenv

from delivery_challan_sse import router as sse_router

# Load Django settings environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../backend/config.env'))

ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Next.js default
    "http://127.0.0.1:3000",
    "http://localhost:8000",  # Django default
    "http://127.0.0.1:8000",
    # Add more if you run Django/Next.js on other ports
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
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

app.include_router(sse_router)