import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database Configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "infotech4syz")

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))  # 30 minutes
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))  # 7 days

# Password Security
BCRYPT_ROUNDS = int(os.getenv("BCRYPT_ROUNDS", "12"))  # bcrypt rounds
PEPPER = os.getenv("PEPPER", "your-pepper-key-change-in-production")  # Additional secret

# API Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# CORS Configuration
ALLOWED_ORIGINS = [
    FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

# Add any additional origins from environment variable
ADDITIONAL_ORIGINS = os.getenv("ADDITIONAL_ORIGINS", "")
if ADDITIONAL_ORIGINS:
    ALLOWED_ORIGINS.extend(ADDITIONAL_ORIGINS.split(","))

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "False").lower() == "true" 