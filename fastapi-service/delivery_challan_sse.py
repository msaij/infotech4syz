import os
import json
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import pymysql

def get_db_creds():
    return {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER'),
        'password': os.getenv('DB_PASSWORD'),
        'database': os.getenv('DB_NAME'),
        'port': int(os.getenv('DB_PORT', '3306')),
        'cursorclass': pymysql.cursors.DictCursor
    }

def get_challan_data():
    creds = get_db_creds()
    conn = pymysql.connect(**creds)
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM delivery_challan")
            rows = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]
        return {"columns": columns, "data": rows}
    finally:
        conn.close()

router = APIRouter()


@router.get("/sse/delivery-challan")
async def sse_endpoint():
    async def event_generator():
        while True:
            payload = get_challan_data()
            yield f"data: {json.dumps(payload, default=str)}\n\n"
            await asyncio.sleep(2)
    return StreamingResponse(event_generator(), media_type="text/event-stream")