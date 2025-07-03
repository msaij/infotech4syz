import os
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from delivery_challan_sse import router as sse_router

# Load Django settings environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../backend/config.env'))


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sse_router)