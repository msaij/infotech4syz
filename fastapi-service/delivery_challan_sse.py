import os
import json
import asyncio
import logging
import hashlib
from datetime import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import aiomysql
from contextlib import asynccontextmanager
from aiomysql.cursors import DictCursor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global connection pool
pool = None

from config import DB_CONFIG

def get_db_creds():
    """Get database credentials from configuration."""
    return DB_CONFIG

async def get_pool():
    """Get or create the database connection pool."""
    global pool
    if pool is None:
        try:
            creds = get_db_creds()
            pool = await aiomysql.create_pool(**creds)
            logger.info("Database connection pool created successfully")
        except Exception as e:
            logger.error(f"Failed to create database pool: {e}")
            raise
    return pool

@asynccontextmanager
async def get_db_connection():
    """Context manager for database connections."""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            yield conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise

class ChallanCache:
    """Cache for delivery challan data with change detection."""
    
    def __init__(self):
        self.last_data = None
        self.last_hash = None
        self.last_check = None
        self.hits = 0
        self.misses = 0
    
    def has_changed(self, new_data):
        """Check if data has changed since last check."""
        if new_data is None:
            return False
            
        try:
            new_hash = hashlib.md5(
                json.dumps(new_data, sort_keys=True, default=str).encode()
            ).hexdigest()
            
            if new_hash != self.last_hash:
                self.last_hash = new_hash
                self.last_data = new_data
                self.last_check = datetime.now()
                self.misses += 1
                return True
            else:
                self.hits += 1
                return False
        except Exception as e:
            logger.error(f"Error in change detection: {e}")
            return True
    
    def get_stats(self):
        """Get cache statistics."""
        return {
            "hits": self.hits,
            "misses": self.misses,
            "last_check": self.last_check.isoformat() if self.last_check else None,
            "cache_size": len(json.dumps(self.last_data, default=str)) if self.last_data else 0
        }

# Global cache instance
cache = ChallanCache()

async def get_challan_data():
    """Fetch delivery challan data from database with error handling."""
    try:
        async with get_db_connection() as conn:
            async with conn.cursor(DictCursor) as cursor:
                # Query with proper error handling - fixed column names to match Django model
                await cursor.execute("""
                    SELECT id, challan_number, delivery_date, client_id, product_name, 
                           product_sku, quantity, unit_price, total_price, delivery_address,
                           status, created_by_id, created_at, updated_at
                    FROM delivery_challan 
                    ORDER BY challan_number DESC
                """)
                
                rows = await cursor.fetchall()
                
                # Convert datetime objects to strings for JSON serialization
                processed_rows = []
                for row in rows:
                    processed_row = {}
                    for key, value in row.items():
                        if isinstance(value, datetime):
                            processed_row[key] = value.isoformat()
                        else:
                            processed_row[key] = value
                    processed_rows.append(processed_row)
                
                columns = [desc[0] for desc in cursor.description]
                return {"columns": columns, "data": processed_rows, "timestamp": datetime.now().isoformat()}
                
    except aiomysql.Error as e:
        logger.error(f"Database error: {e}")
        return {"error": "Database connection failed", "details": str(e)}
    except Exception as e:
        logger.error(f"Unexpected error in get_challan_data: {e}")
        return {"error": "Internal server error", "details": str(e)}

router = APIRouter()

@router.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    try:
        # Test database connection
        async with get_db_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT 1")
                result = await cursor.fetchone()
                
        # Get cache statistics
        cache_stats = cache.get_stats()
        
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.now().isoformat(),
            "cache": cache_stats,
            "pool_size": pool.size if pool else 0
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.get("/metrics")
async def get_metrics():
    """Get performance metrics."""
    try:
        pool_stats = {
            "size": pool.size if pool else 0,
            "free_size": pool.freesize if pool else 0
        }
        
        cache_stats = cache.get_stats()
        
        return {
            "database": pool_stats,
            "cache": cache_stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Metrics error: {e}")
        return {"error": str(e)}

@router.get("/sse/delivery-challan")
async def sse_endpoint():
    """Server-Sent Events endpoint for real-time delivery challan updates."""
    async def event_generator():
        consecutive_errors = 0
        max_errors = 5
        
        while True:
            try:
                payload = await get_challan_data()
                
                # Check for errors in payload
                if "error" in payload:
                    consecutive_errors += 1
                    logger.error(f"Error in payload: {payload['error']}")
                    
                    if consecutive_errors >= max_errors:
                        logger.error("Too many consecutive errors, stopping SSE")
                        break
                    
                    yield f"data: {json.dumps(payload, default=str)}\n\n"
                    await asyncio.sleep(10)  # Longer delay on errors
                    continue
                
                # Reset error counter on success
                consecutive_errors = 0
                
                # Only send data if it has changed
                if cache.has_changed(payload):
                    yield f"data: {json.dumps(payload, default=str)}\n\n"
                    logger.info("Sent updated challan data via SSE")
                else:
                    logger.debug("No changes detected, skipping SSE update")
                
                await asyncio.sleep(5)  # Increased interval for better performance
                
            except asyncio.CancelledError:
                logger.info("SSE connection cancelled by client")
                break
            except Exception as e:
                consecutive_errors += 1
                logger.error(f"SSE error: {e}")
                
                if consecutive_errors >= max_errors:
                    logger.error("Too many consecutive errors, stopping SSE")
                    break
                
                error_payload = {"error": "SSE connection error", "details": str(e)}
                yield f"data: {json.dumps(error_payload)}\n\n"
                await asyncio.sleep(10)
    
    return StreamingResponse(
        event_generator(), 
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control"
        }
    )