from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime, date
import pytz

class DeliveryChallanTrackerBase(BaseModel):
    delivery_challan_date: date = Field(..., description="Date of the delivery challan")
    client_name: str = Field(..., description="Client name from predefined list")
    summary_of_delivery_challan: str = Field(..., description="Details of the delivery challan")
    tool_used: str = Field(..., description="Tool used: Zoho or Excel")
    invoice_number: Optional[str] = Field(None, description="Invoice number linking multiple challans")
    invoice_date: Optional[date] = Field(None, description="Date of the invoice")
    invoice_submission_status: Optional[str] = Field(default="Not Submitted", description="Invoice submission status")

    @validator('tool_used')
    def validate_tool_used(cls, v):
        if v not in ['Zoho', 'Excel']:
            raise ValueError('Tool used must be either "Zoho" or "Excel"')
        return v

    @validator('invoice_submission_status')
    def validate_invoice_submission_status(cls, v):
        if v not in ['Submitted', 'Not Submitted']:
            raise ValueError('Invoice submission status must be either "Submitted" or "Not Submitted"')
        return v

    @validator('client_name')
    def validate_client_name(cls, v):
        # Client validation will be handled at the API level using actual database values
        # This is a basic validation to ensure it's not empty
        if not v or not v.strip():
            raise ValueError('Client name is required')
        return v.strip()

    @validator('delivery_challan_date', pre=True)
    def validate_delivery_challan_date(cls, v):
        if isinstance(v, str):
            try:
                return datetime.strptime(v, '%Y-%m-%d').date()
            except ValueError:
                raise ValueError('Invalid date format. Use YYYY-MM-DD')
        return v

    @validator('invoice_date', pre=True)
    def validate_invoice_date(cls, v):
        if v is not None and isinstance(v, str):
            if v.strip() == "":  # Handle empty strings
                return None
            try:
                return datetime.strptime(v, '%Y-%m-%d').date()
            except ValueError:
                raise ValueError('Invalid date format. Use YYYY-MM-DD')
        return v

class DeliveryChallanTrackerCreate(DeliveryChallanTrackerBase):
    signed_acknowledgement_copy: Optional[str] = Field(None, description="File path or reference for signed copy")

class DeliveryChallanTrackerUpdate(BaseModel):
    delivery_challan_date: Optional[date] = Field(None, description="Date of the delivery challan")
    client_name: Optional[str] = Field(None, description="Client name from predefined list")
    summary_of_delivery_challan: Optional[str] = Field(None, description="Details of the delivery challan")
    tool_used: Optional[str] = Field(None, description="Tool used: Zoho or Excel")
    signed_acknowledgement_copy: Optional[str] = Field(None, description="File path or reference for signed copy")
    invoice_number: Optional[str] = Field(None, description="Invoice number linking multiple challans")
    invoice_date: Optional[date] = Field(None, description="Date of the invoice")
    invoice_submission_status: Optional[str] = Field(None, description="Invoice submission status")

    @validator('tool_used')
    def validate_tool_used(cls, v):
        if v is not None and v not in ['Zoho', 'Excel']:
            raise ValueError('Tool used must be either "Zoho" or "Excel"')
        return v

    @validator('invoice_submission_status')
    def validate_invoice_submission_status(cls, v):
        if v is not None and v not in ['Submitted', 'Not Submitted']:
            raise ValueError('Invoice submission status must be either "Submitted" or "Not Submitted"')
        return v

    @validator('client_name')
    def validate_client_name(cls, v):
        if v is not None:
            # Client validation will be handled at the API level using actual database values
            if not v.strip():
                raise ValueError('Client name cannot be empty')
            return v.strip()
        return v

    @validator('delivery_challan_date', pre=True)
    def validate_delivery_challan_date(cls, v):
        if v is not None and isinstance(v, str):
            try:
                return datetime.strptime(v, '%Y-%m-%d').date()
            except ValueError:
                raise ValueError('Invalid date format. Use YYYY-MM-DD')
        return v

    @validator('invoice_date', pre=True)
    def validate_invoice_date(cls, v):
        if v is not None and isinstance(v, str):
            if v.strip() == "":  # Handle empty strings
                return None
            try:
                return datetime.strptime(v, '%Y-%m-%d').date()
            except ValueError:
                raise ValueError('Invalid date format. Use YYYY-MM-DD')
        return v

class DeliveryChallanTrackerResponse(DeliveryChallanTrackerBase):
    id: str = Field(..., description="Unique identifier")
    delivery_challan_number: str = Field(..., description="Auto-generated challan number")
    signed_acknowledgement_copy: Optional[str] = Field(None, description="File path or reference for signed copy")
    created_at: datetime = Field(..., description="Record creation timestamp")
    updated_at: datetime = Field(..., description="Record last update timestamp")

class DeliveryChallanTrackerListResponse(BaseModel):
    status: str
    message: str
    delivery_challans: List[DeliveryChallanTrackerResponse]
    total: int

class DeliveryChallanTrackerCreateResponse(BaseModel):
    status: str
    message: str
    delivery_challan: DeliveryChallanTrackerResponse

class DeliveryChallanTrackerUpdateResponse(BaseModel):
    status: str
    message: str
    delivery_challan: DeliveryChallanTrackerResponse

class DeliveryChallanTrackerDeleteResponse(BaseModel):
    status: str
    message: str

class FileUploadResponse(BaseModel):
    status: str
    message: str
    file_path: str
    file_name: str

class ClientListResponse(BaseModel):
    status: str
    message: str
    clients: List[str]

class InvoiceLinkResponse(BaseModel):
    status: str
    message: str
    linked_challans: List[str]
    invoice_number: str 