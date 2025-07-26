from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime

class ClientDetailsBase(BaseModel):
    client_full_name: str
    client_tag_name: str
    address: str
    city: str
    zip: str
    state: str
    country: str = "India"
    onboarding_date: datetime
    offboarding_date: Optional[datetime] = None

    @validator('client_full_name')
    def validate_client_full_name(cls, v):
        if not v.strip():
            raise ValueError('Client full name cannot be empty')
        if len(v.strip()) < 2:
            raise ValueError('Client full name must be at least 2 characters long')
        return v.strip()

    @validator('client_tag_name')
    def validate_client_tag_name(cls, v):
        if not v.strip():
            raise ValueError('Client tag name cannot be empty')
        if len(v.strip()) < 2:
            raise ValueError('Client tag name must be at least 2 characters long')
        return v.strip()

    @validator('address')
    def validate_address(cls, v):
        if not v.strip():
            raise ValueError('Address cannot be empty')
        return v.strip()

    @validator('city')
    def validate_city(cls, v):
        if not v.strip():
            raise ValueError('City cannot be empty')
        return v.strip()

    @validator('zip')
    def validate_zip(cls, v):
        if not v.strip():
            raise ValueError('ZIP code cannot be empty')
        return v.strip()

    @validator('state')
    def validate_state(cls, v):
        if not v.strip():
            raise ValueError('State cannot be empty')
        return v.strip()

    @validator('country')
    def validate_country(cls, v):
        if not v.strip():
            raise ValueError('Country cannot be empty')
        return v.strip()

class ClientDetailsCreate(ClientDetailsBase):
    pass

class ClientDetailsUpdate(BaseModel):
    client_full_name: Optional[str] = None
    client_tag_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    zip: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    onboarding_date: Optional[datetime] = None
    offboarding_date: Optional[datetime] = None

    @validator('client_full_name')
    def validate_client_full_name(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError('Client full name cannot be empty')
            if len(v.strip()) < 2:
                raise ValueError('Client full name must be at least 2 characters long')
            return v.strip()
        return v

    @validator('client_tag_name')
    def validate_client_tag_name(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError('Client tag name cannot be empty')
            if len(v.strip()) < 2:
                raise ValueError('Client tag name must be at least 2 characters long')
            return v.strip()
        return v

    @validator('address')
    def validate_address(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Address cannot be empty')
        return v.strip() if v is not None else v

    @validator('city')
    def validate_city(cls, v):
        if v is not None and not v.strip():
            raise ValueError('City cannot be empty')
        return v.strip() if v is not None else v

    @validator('zip')
    def validate_zip(cls, v):
        if v is not None and not v.strip():
            raise ValueError('ZIP code cannot be empty')
        return v.strip() if v is not None else v

    @validator('state')
    def validate_state(cls, v):
        if v is not None and not v.strip():
            raise ValueError('State cannot be empty')
        return v.strip() if v is not None else v

    @validator('country')
    def validate_country(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Country cannot be empty')
        return v.strip() if v is not None else v

class ClientDetailsResponse(ClientDetailsBase):
    id: str

    class Config:
        from_attributes = True

class ClientDetailsListResponse(BaseModel):
    status: str
    message: str
    clients: list[ClientDetailsResponse]
    total: int

class ClientDetailsCreateResponse(BaseModel):
    status: str
    message: str
    client: ClientDetailsResponse

class ClientDetailsUpdateResponse(BaseModel):
    status: str
    message: str
    client: ClientDetailsResponse

class ClientDetailsDeleteResponse(BaseModel):
    status: str
    message: str

class CSRFResponse(BaseModel):
    status: str
    message: str
    csrf_token: str 