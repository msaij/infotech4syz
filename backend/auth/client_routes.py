from fastapi import APIRouter, HTTPException, status, Depends, Header
from typing import Optional
from bson import ObjectId
from database import get_async_database
from .permission_dependencies import (
    require_client_create,
    require_client_read,
    require_client_update,
    require_client_delete,
    require_client_list
)
from .csrf_utils import generate_csrf_token, require_csrf_token
from models.foursyz.client_details import (
    ClientDetailsCreate,
    ClientDetailsUpdate,
    ClientDetailsResponse,
    ClientDetailsListResponse,
    ClientDetailsCreateResponse,
    ClientDetailsUpdateResponse,
    ClientDetailsDeleteResponse,
    CSRFResponse
)

client_router = APIRouter(prefix="/clients", tags=["Client Management"])

def capitalize_words(text: str) -> str:
    """Capitalize the first letter of all words in a string"""
    if not text:
        return text
    return ' '.join(word.capitalize() for word in text.split())

@client_router.get("/csrf-token", response_model=CSRFResponse)
async def get_csrf_token(current_user: dict = Depends(require_client_read())):
    """Get CSRF token for client operations"""
    csrf_token = generate_csrf_token(current_user['id'])
    return {
        "status": "success",
        "message": "CSRF token generated successfully",
        "csrf_token": csrf_token
    }

@client_router.get("/", response_model=ClientDetailsListResponse)
async def get_clients(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(require_client_list())
):
    """Get all clients"""
    db = await get_async_database()
    collection = db.client_details
    
    # Get total count
    total = await collection.count_documents({})
    
    # Get clients with pagination
    cursor = collection.find({}).skip(skip).limit(limit)
    clients = []
    
    async for client in cursor:
        client['id'] = str(client['_id'])
        del client['_id']
        clients.append(client)
    
    return {
        "status": "success",
        "message": f"Retrieved {len(clients)} clients",
        "clients": clients,
        "total": total
    }

@client_router.get("/{client_id}", response_model=ClientDetailsResponse)
async def get_client(
    client_id: str,
    current_user: dict = Depends(require_client_read())
):
    """Get a specific client by ID"""
    if not ObjectId.is_valid(client_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid client ID format"
        )
    
    db = await get_async_database()
    collection = db.client_details
    
    client = await collection.find_one({"_id": ObjectId(client_id)})
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    client['id'] = str(client['_id'])
    del client['_id']
    
    return client

@client_router.post("/", response_model=ClientDetailsCreateResponse)
async def create_client(
    client_data: ClientDetailsCreate,
    current_user: dict = Depends(require_client_create()),
    x_csrf_token: str = Header(..., alias="X-CSRF-Token")
):
    """Create a new client with CSRF protection"""
    # Validate CSRF token
    require_csrf_token(x_csrf_token, current_user['id'])
    
    db = await get_async_database()
    collection = db.client_details
    
    # Capitalize client full name and tag name
    capitalized_full_name = capitalize_words(client_data.client_full_name)
    capitalized_tag_name = capitalize_words(client_data.client_tag_name)
    
    # Check if client with same tag name already exists
    existing_client = await collection.find_one({
        "client_tag_name": capitalized_tag_name
    })
    if existing_client:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Client with this tag name already exists"
        )
    
    # Create client document with capitalized names
    client_doc = client_data.dict()
    client_doc['client_full_name'] = capitalized_full_name
    client_doc['client_tag_name'] = capitalized_tag_name
    
    result = await collection.insert_one(client_doc)
    
    # Get created client
    created_client = await collection.find_one({"_id": result.inserted_id})
    created_client['id'] = str(created_client['_id'])
    del created_client['_id']
    
    return {
        "status": "success",
        "message": "Client created successfully",
        "client": created_client
    }

@client_router.put("/{client_id}", response_model=ClientDetailsUpdateResponse)
async def update_client(
    client_id: str,
    client_data: ClientDetailsUpdate,
    current_user: dict = Depends(require_client_update()),
    x_csrf_token: str = Header(..., alias="X-CSRF-Token")
):
    """Update a client with CSRF protection"""
    # Validate CSRF token
    require_csrf_token(x_csrf_token, current_user['id'])
    
    if not ObjectId.is_valid(client_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid client ID format"
        )
    
    db = await get_async_database()
    collection = db.client_details
    
    # Check if client exists
    existing_client = await collection.find_one({"_id": ObjectId(client_id)})
    if not existing_client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Prepare update data (only include non-None values)
    update_data = {}
    for field, value in client_data.dict().items():
        if value is not None:
            # Capitalize client full name and tag name if they are being updated
            if field == 'client_full_name':
                update_data[field] = capitalize_words(value)
            elif field == 'client_tag_name':
                update_data[field] = capitalize_words(value)
            else:
                update_data[field] = value
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields to update"
        )
    
    # Check if new tag name conflicts with existing client
    if 'client_tag_name' in update_data:
        conflicting_client = await collection.find_one({
            "client_tag_name": update_data['client_tag_name'],
            "_id": {"$ne": ObjectId(client_id)}
        })
        if conflicting_client:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Client with this tag name already exists"
            )
    
    # Update client
    await collection.update_one(
        {"_id": ObjectId(client_id)},
        {"$set": update_data}
    )
    
    # Get updated client
    updated_client = await collection.find_one({"_id": ObjectId(client_id)})
    updated_client['id'] = str(updated_client['_id'])
    del updated_client['_id']
    
    return {
        "status": "success",
        "message": "Client updated successfully",
        "client": updated_client
    }

@client_router.delete("/{client_id}", response_model=ClientDetailsDeleteResponse)
async def delete_client(
    client_id: str,
    current_user: dict = Depends(require_client_delete()),
    x_csrf_token: str = Header(..., alias="X-CSRF-Token")
):
    """Delete a client with CSRF protection"""
    # Validate CSRF token
    require_csrf_token(x_csrf_token, current_user['id'])
    
    if not ObjectId.is_valid(client_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid client ID format"
        )
    
    db = await get_async_database()
    collection = db.client_details
    
    # Check if client exists
    existing_client = await collection.find_one({"_id": ObjectId(client_id)})
    if not existing_client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Delete client
    await collection.delete_one({"_id": ObjectId(client_id)})
    
    return {
        "status": "success",
        "message": "Client deleted successfully"
    } 