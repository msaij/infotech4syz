from fastapi import APIRouter, HTTPException, status, Depends, Header, UploadFile, File, Query
from typing import Optional, List
from bson import ObjectId
from datetime import datetime, date
import os
import uuid
from database import get_async_database
from .permission_dependencies import (
    require_delivery_challan_create,
    require_delivery_challan_read,
    require_delivery_challan_update,
    require_delivery_challan_delete,
    require_delivery_challan_list,
    require_delivery_challan_upload,
    require_delivery_challan_link_invoice,
    require_client_read
)
from .csrf_utils import generate_csrf_token, require_csrf_token
from utils.delivery_challan_utils import (
    generate_delivery_challan_number, 
    get_ist_now, 
    validate_ist_date,
    format_date_for_display,
    generate_delivery_challan_number_for_date
)
from models.foursyz.delivery_challan_tracker import (
    DeliveryChallanTrackerCreate,
    DeliveryChallanTrackerUpdate,
    DeliveryChallanTrackerResponse,
    DeliveryChallanTrackerListResponse,
    DeliveryChallanTrackerCreateResponse,
    DeliveryChallanTrackerUpdateResponse,
    DeliveryChallanTrackerDeleteResponse,
    FileUploadResponse,
    ClientListResponse,
    InvoiceLinkResponse,
    InvoiceLinkRequest
)

delivery_challan_router = APIRouter(tags=["Delivery Challan Tracker"])

# File upload directory
UPLOAD_DIR = "uploads/delivery_challan"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@delivery_challan_router.get("/csrf-token")
async def get_csrf_token(current_user: dict = Depends(require_delivery_challan_read())):
    """Get CSRF token for delivery challan operations"""
    csrf_token = generate_csrf_token(current_user['id'])
    
    return {
        "status": "success",
        "message": "CSRF token generated successfully",
        "csrf_token": csrf_token
    }

@delivery_challan_router.get("/clients", response_model=ClientListResponse)
async def get_clients(current_user: dict = Depends(require_client_read())):
    """Get list of available clients from client_details collection"""
    try:
        db = await get_async_database()
        collection = db.client_details
        
        # Get all client tag names from the client_details collection
        cursor = collection.find({}, {"client_tag_name": 1})
        clients = []
        
        async for client in cursor:
            if client.get('client_tag_name'):
                clients.append(client['client_tag_name'])
        
        # Sort clients alphabetically
        clients.sort()
        
        return {
            "status": "success",
            "message": f"Retrieved {len(clients)} clients",
            "clients": clients
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve clients: {str(e)}"
        )

@delivery_challan_router.get("/", response_model=DeliveryChallanTrackerListResponse)
async def get_delivery_challans(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    start_date: Optional[str] = Query(None, description="Start date in DD/MM/YYYY format"),
    end_date: Optional[str] = Query(None, description="End date in DD/MM/YYYY format"),
    client_name: Optional[str] = Query(None, description="Filter by client name"),
    invoice_submission_status: Optional[str] = Query(None, description="Filter by invoice submission status"),
    current_user: dict = Depends(require_delivery_challan_list())
):
    """Get all delivery challans with optional filters"""
    try:
        db = await get_async_database()
        collection = db.deliveryChallan_tracker
        
        # Build filter query
        filter_query = {}
        
        if start_date or end_date:
            date_filter = {}
            if start_date:
                try:
                    start_dt = datetime.strptime(start_date, '%d/%m/%Y').date()
                    date_filter['$gte'] = start_dt
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid start date format. Use DD/MM/YYYY"
                    )
            if end_date:
                try:
                    end_dt = datetime.strptime(end_date, '%d/%m/%Y').date()
                    date_filter['$lte'] = end_dt
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid end date format. Use DD/MM/YYYY"
                    )
            filter_query['delivery_challan_date'] = date_filter
        
        if client_name:
            filter_query['client_name'] = client_name
        
        if invoice_submission_status:
            filter_query['invoice_submission_status'] = invoice_submission_status
        
        # Get total count
        total = await collection.count_documents(filter_query)
        
        # Get delivery challans with pagination
        cursor = collection.find(filter_query).sort("created_at", -1).skip(skip).limit(limit)
        delivery_challans = []
        
        async for challan in cursor:
            challan['id'] = str(challan['_id'])
            del challan['_id']
            delivery_challans.append(challan)
        
        return {
            "status": "success",
            "message": f"Retrieved {len(delivery_challans)} delivery challans",
            "delivery_challans": delivery_challans,
            "total": total
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve delivery challans: {str(e)}"
        )

@delivery_challan_router.get("/{challan_id}", response_model=DeliveryChallanTrackerResponse)
async def get_delivery_challan(
    challan_id: str,
    current_user: dict = Depends(require_delivery_challan_read())
):
    """Get a specific delivery challan by ID"""
    if not ObjectId.is_valid(challan_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid delivery challan ID format"
        )
    
    db = await get_async_database()
    collection = db.deliveryChallan_tracker
    
    challan = await collection.find_one({"_id": ObjectId(challan_id)})
    if not challan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery challan not found"
        )
    
    challan['id'] = str(challan['_id'])
    del challan['_id']
    
    return challan

@delivery_challan_router.post("/", response_model=DeliveryChallanTrackerCreateResponse)
async def create_delivery_challan(
    challan_data: DeliveryChallanTrackerCreate,
    current_user: dict = Depends(require_delivery_challan_create()),
    x_csrf_token: str = Header(..., alias="X-CSRF-Token")
):
    """Create a new delivery challan (Manager only with CSRF protection)"""
    try:
        # Validate CSRF token
        require_csrf_token(x_csrf_token, current_user['id'])
        
        # Validate date is not in future
        if not validate_ist_date(challan_data.delivery_challan_date):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Delivery challan date cannot be in the future"
            )
        
        # Validate client name exists in database
        db = await get_async_database()
        client_collection = db.client_details
        existing_client = await client_collection.find_one({"client_tag_name": challan_data.client_name})
        if not existing_client:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Client '{challan_data.client_name}' not found in database"
            )
        
        collection = db.deliveryChallan_tracker
        
        # Generate delivery challan number based on delivery challan date
        challan_number = await generate_delivery_challan_number_for_date(challan_data.delivery_challan_date)
        
        # Create challan document
        challan_doc = challan_data.model_dump()
        challan_doc['delivery_challan_number'] = challan_number
        challan_doc['created_at'] = get_ist_now()
        challan_doc['updated_at'] = get_ist_now()
        
        # Convert date objects to datetime for MongoDB compatibility
        if isinstance(challan_doc.get('delivery_challan_date'), date):
            challan_doc['delivery_challan_date'] = datetime.combine(
                challan_doc['delivery_challan_date'], 
                datetime.min.time()
            )
        if isinstance(challan_doc.get('invoice_date'), date):
            challan_doc['invoice_date'] = datetime.combine(
                challan_doc['invoice_date'], 
                datetime.min.time()
            )
        
        result = await collection.insert_one(challan_doc)
        
        # Get created challan
        created_challan = await collection.find_one({"_id": result.inserted_id})
        created_challan['id'] = str(created_challan['_id'])
        del created_challan['_id']
        
        return {
            "status": "success",
            "message": "Delivery challan created successfully",
            "delivery_challan": created_challan
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create delivery challan: {str(e)}"
        )

@delivery_challan_router.put("/{challan_id}", response_model=DeliveryChallanTrackerUpdateResponse)
async def update_delivery_challan(
    challan_id: str,
    challan_data: DeliveryChallanTrackerUpdate,
    current_user: dict = Depends(require_delivery_challan_update()),
    x_csrf_token: str = Header(..., alias="X-CSRF-Token")
):
    """Update a delivery challan (Manager only with CSRF protection)"""
    # Validate CSRF token
    require_csrf_token(x_csrf_token, current_user['id'])
    
    if not ObjectId.is_valid(challan_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid delivery challan ID format"
        )
    
    db = await get_async_database()
    collection = db.deliveryChallan_tracker
    
    # Check if challan exists
    existing_challan = await collection.find_one({"_id": ObjectId(challan_id)})
    if not existing_challan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery challan not found"
        )
    
    # Validate date if provided
    if challan_data.delivery_challan_date and not validate_ist_date(challan_data.delivery_challan_date):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Delivery challan date cannot be in the future"
        )
    
    # Prepare update data (only include non-None values)
    update_data = {}
    for field, value in challan_data.model_dump().items():
        if value is not None:
            update_data[field] = value
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields to update"
        )
    
    update_data['updated_at'] = get_ist_now()
    
    # Convert date objects to datetime for MongoDB compatibility
    if isinstance(update_data.get('delivery_challan_date'), date):
        update_data['delivery_challan_date'] = datetime.combine(
            update_data['delivery_challan_date'], 
            datetime.min.time()
        )
    if isinstance(update_data.get('invoice_date'), date):
        update_data['invoice_date'] = datetime.combine(
            update_data['invoice_date'], 
            datetime.min.time()
        )
    
    # Update challan
    await collection.update_one(
        {"_id": ObjectId(challan_id)},
        {"$set": update_data}
    )
    
    # Get updated challan
    updated_challan = await collection.find_one({"_id": ObjectId(challan_id)})
    updated_challan['id'] = str(updated_challan['_id'])
    del updated_challan['_id']
    
    return {
        "status": "success",
        "message": "Delivery challan updated successfully",
        "delivery_challan": updated_challan
    }

@delivery_challan_router.delete("/{challan_id}", response_model=DeliveryChallanTrackerDeleteResponse)
async def delete_delivery_challan(
    challan_id: str,
    current_user: dict = Depends(require_delivery_challan_delete()),
    x_csrf_token: str = Header(..., alias="X-CSRF-Token")
):
    """Delete a delivery challan (Manager only with CSRF protection)"""
    try:
        # Validate CSRF token
        require_csrf_token(x_csrf_token, current_user['id'])
        
        if not ObjectId.is_valid(challan_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid delivery challan ID format"
            )
        
        db = await get_async_database()
        collection = db.deliveryChallan_tracker
        
        # Check if challan exists
        existing_challan = await collection.find_one({"_id": ObjectId(challan_id)})
        if not existing_challan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Delivery challan not found"
            )
        
        # Delete challan
        await collection.delete_one({"_id": ObjectId(challan_id)})
        
        return {
            "status": "success",
            "message": "Delivery challan deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete delivery challan: {str(e)}"
        )

@delivery_challan_router.post("/upload-file", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_delivery_challan_upload()),
    x_csrf_token: str = Header(..., alias="X-CSRF-Token")
):
    """Upload signed acknowledgement copy file (Manager only with CSRF protection)"""
    try:
        # Validate CSRF token
        require_csrf_token(x_csrf_token, current_user['id'])
        
        # Validate file type
        allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save file
        try:
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save file: {str(e)}"
            )
        
        return {
            "status": "success",
            "message": "File uploaded successfully",
            "file_path": file_path,
            "file_name": file.filename
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )

@delivery_challan_router.post("/link-invoice", response_model=InvoiceLinkResponse)
async def link_invoice(
    link_data: InvoiceLinkRequest,
    current_user: dict = Depends(require_delivery_challan_link_invoice()),
    x_csrf_token: str = Header(..., alias="X-CSRF-Token")
):
    """Link multiple delivery challans to a single invoice (Manager only with CSRF protection)"""
    try:
        # Validate CSRF token
        require_csrf_token(x_csrf_token, current_user['id'])
        
        # Validate date is not in future
        if not validate_ist_date(link_data.invoice_date):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invoice date cannot be in the future"
            )
        
        db = await get_async_database()
        collection = db.deliveryChallan_tracker
        
        # Validate all challan IDs
        valid_challan_ids = []
        for challan_id in link_data.challan_ids:
            if not ObjectId.is_valid(challan_id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid delivery challan ID format: {challan_id}"
                )
            valid_challan_ids.append(ObjectId(challan_id))
        
        # Check if all challans exist
        existing_challans = await collection.find({"_id": {"$in": valid_challan_ids}}).to_list(None)
        if len(existing_challans) != len(valid_challan_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more delivery challans not found"
            )
        
        # Convert invoice_date to datetime for MongoDB compatibility
        invoice_datetime = link_data.invoice_date
        if isinstance(link_data.invoice_date, date):
            invoice_datetime = datetime.combine(link_data.invoice_date, datetime.min.time())
        
        # Update all challans with invoice information
        update_result = await collection.update_many(
            {"_id": {"$in": valid_challan_ids}},
            {
                "$set": {
                    "invoice_number": link_data.invoice_number,
                    "invoice_date": invoice_datetime,
                    "updated_at": get_ist_now()
                }
            }
        )
        
        return {
            "status": "success",
            "message": f"Linked {update_result.modified_count} delivery challans to invoice {link_data.invoice_number}",
            "linked_challans": link_data.challan_ids,
            "invoice_number": link_data.invoice_number
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to link invoice: {str(e)}"
        ) 