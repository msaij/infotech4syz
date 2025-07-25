from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGODB_URL, DATABASE_NAME

# Async client for FastAPI
async def get_async_database():
    """Get async MongoDB database connection"""
    client = AsyncIOMotorClient(MONGODB_URL)
    return client[DATABASE_NAME] 