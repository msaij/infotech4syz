from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime

class Users4syzLogin(BaseModel):
    """Login model for users_4syz collection"""
    email: str
    password: str
    
    @validator('email')
    def validate_email_domain(cls, v):
        if not v.endswith('@4syz.com'):
            raise ValueError('Email must be from @4syz.com domain')
        return v

class Users4syzResponse(BaseModel):
    """Response model for users_4syz collection"""
    id: str
    username: str
    email: str
    designation: str
    date_of_joining: datetime
    date_of_relieving: Optional[datetime] = None
    active: bool
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class Users4syzCreate(BaseModel):
    """Create user model for users_4syz collection"""
    username: str
    email: str
    password: str
    designation: str
    date_of_joining: datetime
    date_of_relieving: Optional[datetime] = None
    active: bool = True
    notes: Optional[str] = None

    @validator('email')
    def validate_email_domain(cls, v):
        if not v.endswith('@4syz.com'):
            raise ValueError('Email must be from @4syz.com domain')
        return v

    @validator('username')
    def validate_username(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Username must be at least 2 characters long')
        return v.strip()

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v

    @validator('designation')
    def validate_designation(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Designation must be at least 2 characters long')
        return v.strip()

class Users4syz(BaseModel):
    """Complete model for users_4syz collection"""
    username: str
    email: str
    password: str
    designation: str
    date_of_joining: datetime
    date_of_relieving: Optional[datetime] = None
    active: bool = True
    notes: Optional[str] = None

    @validator('email')
    def validate_email_domain(cls, v):
        if not v.endswith('@4syz.com'):
            raise ValueError('Email must be from @4syz.com domain')
        return v

class Users4syzLoginResponse(BaseModel):
    """Login response model for users_4syz collection"""
    status: str
    message: str
    user: Optional[Users4syzResponse] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_in: Optional[int] = None

class Users4syzCreateResponse(BaseModel):
    """Create user response model for users_4syz collection"""
    status: str
    message: str
    user: Optional[Users4syzResponse] = None

class Users4syzLogoutResponse(BaseModel):
    """Logout response model"""
    status: str
    message: str

class TokenData(BaseModel):
    """Token data model"""
    email: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    """Refresh token request model"""
    refresh_token: str

class RefreshTokenResponse(BaseModel):
    """Refresh token response model"""
    status: str
    message: str
    access_token: str
    expires_in: int 