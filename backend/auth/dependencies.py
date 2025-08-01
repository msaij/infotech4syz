from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from database import get_async_database
from .auth_utils import (
    get_user_email_from_token, 
    is_token_expired, 
    is_token_blacklisted
)
from services.resource_permission_service import ResourcePermissionService
from models.foursyz.permissions import Action

# Security
security = HTTPBearer()

# Database dependency
async def get_db():
    return await get_async_database()

# Get current user dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get current authenticated user"""
    token = credentials.credentials
    
    # Check if token is blacklisted
    if is_token_blacklisted(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if token is expired
    if is_token_expired(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify token and get user email
    email = get_user_email_from_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user = await db.users_4syz.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.get("active", False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Convert MongoDB document to dictionary and add id field
    user_dict = dict(user)
    user_dict['id'] = str(user['_id'])
    del user_dict['_id']
    
    return user_dict

# Resource-based permission dependency functions
def require_permission(action: Action, resource: str):
    """Dependency factory for requiring specific resource permissions"""
    async def _require_permission(current_user: dict = Depends(get_current_user)):
        db = await get_async_database()
        service = ResourcePermissionService(db)
        
        evaluation = await service.evaluate_user_permission(
            user_id=current_user['id'],
            action=action,
            resource=resource
        )
        
        if not evaluation.allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {evaluation.reason}"
            )
        
        return current_user
    
    return _require_permission

# Client permission dependencies
def require_client_create():
    return require_permission(Action.CLIENT_CREATE, "client:*")

def require_client_read():
    return require_permission(Action.CLIENT_READ, "client:*")

def require_client_update():
    return require_permission(Action.CLIENT_UPDATE, "client:*")

def require_client_delete():
    return require_permission(Action.CLIENT_DELETE, "client:*")

def require_client_list():
    return require_permission(Action.CLIENT_READ, "client:*")

# Delivery challan permission dependencies
def require_delivery_challan_create():
    return require_permission(Action.DELIVERY_CHALLAN_CREATE, "delivery_challan:*")

def require_delivery_challan_read():
    return require_permission(Action.DELIVERY_CHALLAN_READ, "delivery_challan:*")

def require_delivery_challan_update():
    return require_permission(Action.DELIVERY_CHALLAN_UPDATE, "delivery_challan:*")



def require_delivery_challan_list():
    return require_permission(Action.DELIVERY_CHALLAN_READ, "delivery_challan:*")

def require_delivery_challan_upload():
    return require_permission(Action.DELIVERY_CHALLAN_UPLOAD, "delivery_challan:file")

def require_delivery_challan_link_invoice():
    return require_permission(Action.DELIVERY_CHALLAN_LINK_INVOICE, "delivery_challan:*")

# User permission dependencies
def require_user_create():
    return require_permission(Action.USER_CREATE, "user:*")

def require_user_read():
    return require_permission(Action.USER_READ, "user:*")

def require_user_update():
    return require_permission(Action.USER_UPDATE, "user:*")

def require_user_delete():
    return require_permission(Action.USER_DELETE, "user:*")

def require_user_list():
    return require_permission(Action.USER_READ, "user:*")

# Permission management dependencies
def require_permissions_assign():
    return require_permission(Action.PERMISSIONS_ASSIGN, "permissions:*")

def require_permissions_read():
    return require_permission(Action.PERMISSIONS_READ, "permissions:*")

def require_permissions_evaluate():
    return require_permission(Action.PERMISSIONS_EVALUATE, "permissions:*") 