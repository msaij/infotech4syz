from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# ============================================================================
# ENUMS
# ============================================================================

class Action(str, Enum):
    """All possible actions in the system"""
    # Authentication actions
    AUTH_LOGIN = "auth:login"
    AUTH_LOGOUT = "auth:logout"
    AUTH_REFRESH = "auth:refresh"
    AUTH_ME = "auth:me"
    
    # User management actions
    USER_CREATE = "user:create"
    USER_READ = "user:read"
    USER_UPDATE = "user:update"
    USER_DELETE = "user:delete"
    USER_LIST = "user:list"
    
    # Client management actions
    CLIENT_CREATE = "client:create"
    CLIENT_READ = "client:read"
    CLIENT_UPDATE = "client:update"
    CLIENT_DELETE = "client:delete"
    CLIENT_LIST = "client:list"
    
    # Delivery challan actions
    DELIVERY_CHALLAN_CREATE = "delivery_challan:create"
    DELIVERY_CHALLAN_READ = "delivery_challan:read"
    DELIVERY_CHALLAN_UPDATE = "delivery_challan:update"
    DELIVERY_CHALLAN_LIST = "delivery_challan:list"
    DELIVERY_CHALLAN_UPLOAD = "delivery_challan:upload"
    DELIVERY_CHALLAN_LINK_INVOICE = "delivery_challan:link_invoice"
    
    # Permission management actions
    PERMISSIONS_CREATE = "permissions:create"
    PERMISSIONS_READ = "permissions:read"
    PERMISSIONS_UPDATE = "permissions:update"
    PERMISSIONS_DELETE = "permissions:delete"
    PERMISSIONS_LIST = "permissions:list"
    PERMISSIONS_ASSIGN = "permissions:assign"
    PERMISSIONS_UNASSIGN = "permissions:unassign"
    PERMISSIONS_EVALUATE = "permissions:evaluate"

class Resource(str, Enum):
    """All possible resources in the system"""
    AUTH_ALL = "auth:*"
    USER_ALL = "user:*"
    CLIENT_ALL = "client:*"
    DELIVERY_CHALLAN_ALL = "delivery_challan:*"
    DELIVERY_CHALLAN_FILE = "delivery_challan:file"
    PERMISSIONS_ALL = "permissions:*"

class Effect(str, Enum):
    """Permission effect - Allow or Deny"""
    ALLOW = "Allow"
    DENY = "Deny"

# ============================================================================
# CORE MODELS
# ============================================================================

class PermissionEvaluation(BaseModel):
    """Result of a permission evaluation"""
    allowed: bool = Field(..., description="Whether the action is allowed")
    reason: str = Field(..., description="Reason for the decision")
    required_action: Optional[Action] = Field(None, description="Action that was requested")
    required_resource: Optional[str] = Field(None, description="Resource that was requested")
    evaluated_policies: List[str] = Field(default_factory=list, description="Policies that were evaluated")

# ============================================================================
# RESOURCE-BASED PERMISSION MODELS
# ============================================================================

class ResourcePermission(BaseModel):
    """Individual resource permission that can be assigned to users"""
    id: str = Field(..., description="Unique permission identifier")
    resource: str = Field(..., description="Resource this permission applies to")
    actions: List[Action] = Field(..., description="List of actions allowed on this resource")
    description: str = Field(..., description="Human-readable description of this permission")
    category: str = Field(..., description="Category/group this permission belongs to")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

    @validator('id')
    def validate_id(cls, v):
        if not v.strip():
            raise ValueError('Permission ID cannot be empty')
        return v.strip()

    @validator('resource')
    def validate_resource(cls, v):
        if not v.strip():
            raise ValueError('Resource cannot be empty')
        return v.strip()

    @validator('actions')
    def validate_actions(cls, v):
        if not v:
            raise ValueError('At least one action must be specified')
        return v

    @validator('category')
    def validate_category(cls, v):
        if not v.strip():
            raise ValueError('Category cannot be empty')
        return v.strip()

class UserResourceAssignment(BaseModel):
    """User-to-resource permission assignment"""
    id: Optional[str] = Field(None, description="Assignment ID (auto-generated)")
    user_id: str = Field(..., description="User ID from users_4syz collection")
    resource_permission_id: str = Field(..., description="Resource permission ID")
    assigned_at: datetime = Field(..., description="When the permission was assigned")
    assigned_by: str = Field(..., description="User ID who assigned the permission")
    expires_at: Optional[datetime] = Field(None, description="When the assignment expires")
    notes: Optional[str] = Field(None, description="Assignment notes")
    active: bool = Field(True, description="Whether the assignment is active")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

    @validator('user_id')
    def validate_user_id(cls, v):
        if not v.strip():
            raise ValueError('User ID cannot be empty')
        return v.strip()

    @validator('resource_permission_id')
    def validate_resource_permission_id(cls, v):
        if not v.strip():
            raise ValueError('Resource permission ID cannot be empty')
        return v.strip()

# Request/Response models for resource permissions
class ResourcePermissionResponse(BaseModel):
    """Response model for resource permission operations"""
    status: str
    message: str
    permission: Optional[ResourcePermission] = None

class ResourcePermissionListResponse(BaseModel):
    """Response model for listing resource permissions"""
    status: str
    message: str
    permissions: List[ResourcePermission]
    total: int

class UserResourceAssignmentRequest(BaseModel):
    """Request model for assigning resource permission to user"""
    assigned_by: str
    expires_at: Optional[datetime] = None
    notes: Optional[str] = None

class UserResourceAssignmentResponse(BaseModel):
    """Response model for resource permission assignment operations"""
    status: str
    message: str
    assignment: Optional[UserResourceAssignment] = None

class UserResourceAssignmentListResponse(BaseModel):
    """Response model for listing user resource assignments"""
    status: str
    message: str
    assignments: List[UserResourceAssignment]
    total: int

class UserResourcePermissionsResponse(BaseModel):
    """Response model for getting user's resource permissions"""
    status: str
    message: str
    user_id: str
    permissions: List[ResourcePermission]
    assignments: List[UserResourceAssignment]

class PermissionEvaluationRequest(BaseModel):
    """Request model for evaluating permissions"""
    user_id: str
    action: Action
    resource: str
    context: Optional[Dict[str, Any]] = None

class PermissionEvaluationResponse(BaseModel):
    """Response model for permission evaluation"""
    status: str
    message: str
    evaluation: PermissionEvaluation

# ============================================================================
# PREDEFINED RESOURCE PERMISSIONS
# ============================================================================

PREDEFINED_RESOURCE_PERMISSIONS = {
    # Authentication Resource Permissions
    "auth_basic_access": ResourcePermission(
        id="auth_basic_access",
        resource=Resource.AUTH_ALL,
        actions=[Action.AUTH_LOGIN, Action.AUTH_LOGOUT, Action.AUTH_REFRESH, Action.AUTH_ME],
        description="Basic authentication operations for all users",
        category="Authentication"
    ),
    
    # User Management Resource Permissions
    "user_full_access": ResourcePermission(
        id="user_full_access",
        resource=Resource.USER_ALL,
        actions=[Action.USER_CREATE, Action.USER_READ, Action.USER_UPDATE, Action.USER_DELETE, Action.USER_LIST],
        description="Full user management capabilities",
        category="User Management"
    ),
    
    "user_read_only": ResourcePermission(
        id="user_read_only",
        resource=Resource.USER_ALL,
        actions=[Action.USER_READ, Action.USER_LIST],
        description="Can only read user information",
        category="User Management"
    ),
    
    # Client Management Resource Permissions
    "client_full_access": ResourcePermission(
        id="client_full_access",
        resource=Resource.CLIENT_ALL,
        actions=[Action.CLIENT_CREATE, Action.CLIENT_READ, Action.CLIENT_UPDATE, Action.CLIENT_DELETE, Action.CLIENT_LIST],
        description="Full client management capabilities",
        category="Client Management"
    ),
    
    "client_read_only": ResourcePermission(
        id="client_read_only",
        resource=Resource.CLIENT_ALL,
        actions=[Action.CLIENT_READ, Action.CLIENT_LIST],
        description="Can only view client information",
        category="Client Management"
    ),
    
    # Delivery Challan Resource Permissions
    "delivery_challan_full_access": ResourcePermission(
        id="delivery_challan_full_access",
        resource=Resource.DELIVERY_CHALLAN_ALL,
        actions=[
            Action.DELIVERY_CHALLAN_CREATE,
            Action.DELIVERY_CHALLAN_READ,
            Action.DELIVERY_CHALLAN_UPDATE,
            Action.DELIVERY_CHALLAN_LIST,
            Action.DELIVERY_CHALLAN_UPLOAD,
            Action.DELIVERY_CHALLAN_LINK_INVOICE
        ],
        description="Full delivery challan management capabilities (excluding delete)",
        category="Delivery Challan"
    ),
    
    "delivery_challan_read_only": ResourcePermission(
        id="delivery_challan_read_only",
        resource=Resource.DELIVERY_CHALLAN_ALL,
        actions=[Action.DELIVERY_CHALLAN_READ, Action.DELIVERY_CHALLAN_LIST],
        description="Can only view delivery challan information",
        category="Delivery Challan"
    ),
    
    "delivery_challan_file_access": ResourcePermission(
        id="delivery_challan_file_access",
        resource=Resource.DELIVERY_CHALLAN_FILE,
        actions=[Action.DELIVERY_CHALLAN_UPLOAD],
        description="Can upload delivery challan files",
        category="Delivery Challan"
    ),
    
    # Permission Management Resource Permissions
    "permissions_full_access": ResourcePermission(
        id="permissions_full_access",
        resource=Resource.PERMISSIONS_ALL,
        actions=[
            Action.PERMISSIONS_CREATE,
            Action.PERMISSIONS_READ,
            Action.PERMISSIONS_UPDATE,
            Action.PERMISSIONS_DELETE,
            Action.PERMISSIONS_LIST,
            Action.PERMISSIONS_ASSIGN,
            Action.PERMISSIONS_UNASSIGN,
            Action.PERMISSIONS_EVALUATE
        ],
        description="Full permission management capabilities",
        category="Permission Management"
    ),
    
    "permissions_read_only": ResourcePermission(
        id="permissions_read_only",
        resource=Resource.PERMISSIONS_ALL,
        actions=[Action.PERMISSIONS_READ, Action.PERMISSIONS_LIST, Action.PERMISSIONS_EVALUATE],
        description="Can only view and evaluate permissions",
        category="Permission Management"
    ),
    
    "permissions_assign_only": ResourcePermission(
        id="permissions_assign_only",
        resource=Resource.PERMISSIONS_ALL,
        actions=[
            Action.PERMISSIONS_READ,
            Action.PERMISSIONS_LIST,
            Action.PERMISSIONS_ASSIGN,
            Action.PERMISSIONS_UNASSIGN,
            Action.PERMISSIONS_EVALUATE
        ],
        description="Can assign/unassign permissions and evaluate them",
        category="Permission Management"
    )
}

# ============================================================================
# RESOURCE PERMISSION CATEGORIES
# ============================================================================

RESOURCE_PERMISSION_CATEGORIES = {
    "Authentication": {
        "description": "Authentication and session management",
        "permissions": ["auth_basic_access"]
    },
    "User Management": {
        "description": "User account management and administration",
        "permissions": ["user_full_access", "user_read_only"]
    },
    "Client Management": {
        "description": "Client information and relationship management",
        "permissions": ["client_full_access", "client_read_only"]
    },
    "Delivery Challan": {
        "description": "Delivery challan tracking and management",
        "permissions": ["delivery_challan_full_access", "delivery_challan_read_only", "delivery_challan_file_access"]
    },
    "Permission Management": {
        "description": "System permissions and access control",
        "permissions": ["permissions_full_access", "permissions_read_only", "permissions_assign_only"]
    }
} 