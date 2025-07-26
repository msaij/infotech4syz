from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
import hashlib

from models.foursyz.users_4syz import (
    Users4syzLogin, Users4syzResponse, Users4syzLoginResponse, 
    Users4syzCreate, Users4syzCreateResponse, Users4syzLogoutResponse,
    RefreshTokenRequest, RefreshTokenResponse
)
from .auth_utils import (
    create_token_pair, blacklist_token, verify_password, 
    get_password_hash, refresh_access_token, is_sha256_hash,
    migrate_password_hash
)
from .dependencies import get_db, get_current_user, security

# Create router
auth_router = APIRouter(tags=["Authentication"])

# User login endpoint
@auth_router.post("/login", response_model=Users4syzLoginResponse)
async def user_login(login_data: Users4syzLogin, db: AsyncIOMotorDatabase = Depends(get_db)):
    """User login with email and password validation"""
    try:
        # Find user by email in users_4syz collection
        user = await db.users_4syz.find_one({"email": login_data.email})
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Check if user is active
        if not user.get("active", False):
            raise HTTPException(status_code=401, detail="User account is inactive")
        
        # Verify password (supports both SHA-256 and bcrypt)
        if not verify_password(login_data.password, user.get("password")):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Auto-migrate password from SHA-256 to bcrypt if needed
        if is_sha256_hash(user.get("password")):
            new_hash = migrate_password_hash(login_data.password, user.get("password"))
            await db.users_4syz.update_one(
                {"email": user["email"]},
                {"$set": {"password": new_hash}}
            )
        
        # Convert MongoDB document to response model
        user_response = Users4syzResponse(
            id=str(user["_id"]),
            username=user["username"],
            email=user["email"],
            designation=user["designation"],
            date_of_joining=user["date_of_joining"],
            date_of_relieving=user.get("date_of_relieving"),
            active=user["active"],
            notes=user.get("notes")
        )
        
        # Create JWT token pair
        access_token, refresh_token = create_token_pair(
            data={"sub": user["email"]}
        )
        
        return Users4syzLoginResponse(
            status="success",
            message="Login successful",
            user=user_response,
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=30 * 60  # 30 minutes in seconds
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

# Logout endpoint
@auth_router.post("/logout", response_model=Users4syzLogoutResponse)
async def logout(current_user = Depends(get_current_user), credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Logout user by blacklisting their token"""
    try:
        token = credentials.credentials
        blacklist_token(token)
        
        return Users4syzLogoutResponse(
            status="success",
            message="Successfully logged out"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logout failed: {str(e)}")

# Get current user info endpoint
@auth_router.get("/me", response_model=Users4syzResponse)
async def get_current_user_info(current_user = Depends(get_current_user)):
    """Get current authenticated user information"""
    try:
        user_response = Users4syzResponse(
            id=current_user["id"],
            username=current_user["username"],
            email=current_user["email"],
            designation=current_user["designation"],
            date_of_joining=current_user["date_of_joining"],
            date_of_relieving=current_user.get("date_of_relieving"),
            active=current_user["active"],
            notes=current_user.get("notes")
        )
        return user_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user info: {str(e)}")

# Create user endpoint
@auth_router.post("/users", response_model=Users4syzCreateResponse)
async def create_user(user_data: Users4syzCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Create a new user in users_4syz collection"""
    try:
        # Check if user with email already exists
        existing_user = await db.users_4syz.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
        # Check if username already exists
        existing_username = await db.users_4syz.find_one({"username": user_data.username})
        if existing_username:
            raise HTTPException(status_code=400, detail="Username already exists")
        
        # Hash the password using bcrypt
        hashed_password = get_password_hash(user_data.password)
        
        # Prepare user document
        user_doc = {
            "username": user_data.username,
            "email": user_data.email,
            "password": hashed_password,
            "designation": user_data.designation,
            "date_of_joining": user_data.date_of_joining,
            "date_of_relieving": user_data.date_of_relieving,
            "active": user_data.active,
            "notes": user_data.notes
        }
        
        # Insert user into database
        result = await db.users_4syz.insert_one(user_doc)
        
        # Get the created user
        created_user = await db.users_4syz.find_one({"_id": result.inserted_id})
        
        # Convert to response model
        user_response = Users4syzResponse(
            id=str(created_user["_id"]),
            username=created_user["username"],
            email=created_user["email"],
            designation=created_user["designation"],
            date_of_joining=created_user["date_of_joining"],
            date_of_relieving=created_user.get("date_of_relieving"),
            active=created_user["active"],
            notes=created_user.get("notes")
        )
        
        return Users4syzCreateResponse(
            status="success",
            message="User created successfully",
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"User creation failed: {str(e)}")

# Refresh token endpoint
@auth_router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(refresh_data: RefreshTokenRequest):
    """Refresh access token using refresh token"""
    try:
        # Refresh the access token
        new_access_token = refresh_access_token(refresh_data.refresh_token)
        
        return RefreshTokenResponse(
            status="success",
            message="Token refreshed successfully",
            access_token=new_access_token,
            expires_in=30 * 60  # 30 minutes in seconds
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token refresh failed: {str(e)}") 