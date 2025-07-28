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
    DELIVERY_CHALLAN_DELETE = "delivery_challan:delete"
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

class PermissionStatement(BaseModel):
    """Individual permission statement within a policy"""
    sid: str = Field(..., description="Statement ID (unique within policy)")
    effect: Effect = Field(..., description="Allow or Deny")
    actions: List[Action] = Field(..., description="List of actions this statement applies to")
    resources: List[str] = Field(..., description="List of resource patterns this statement applies to")
    conditions: Optional[Dict[str, Any]] = Field(None, description="Optional conditions for the statement")

    @validator('sid')
    def validate_sid(cls, v):
        if not v.strip():
            raise ValueError('Statement ID cannot be empty')
        return v.strip()

    @validator('actions')
    def validate_actions(cls, v):
        if not v:
            raise ValueError('At least one action must be specified')
        return v

    @validator('resources')
    def validate_resources(cls, v):
        if not v:
            raise ValueError('At least one resource must be specified')
        return v

class Policy(BaseModel):
    """Policy containing multiple permission statements"""
    id: str = Field(..., description="Unique policy identifier")
    name: str = Field(..., description="Human-readable policy name")
    description: str = Field(..., description="Policy description")
    version: str = Field(..., description="Policy version")
    statements: List[PermissionStatement] = Field(..., description="List of permission statements")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

    @validator('id')
    def validate_id(cls, v):
        if not v.strip():
            raise ValueError('Policy ID cannot be empty')
        return v.strip()

    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Policy name cannot be empty')
        return v.strip()

    @validator('statements')
    def validate_statements(cls, v):
        if not v:
            raise ValueError('At least one statement must be specified')
        return v

class PolicyAssignment(BaseModel):
    """User-to-policy assignment"""
    user_id: str = Field(..., description="User ID from users_4syz collection")
    policy_id: str = Field(..., description="Policy ID from policies collection")
    assigned_at: datetime = Field(..., description="When the policy was assigned")
    assigned_by: str = Field(..., description="User ID who assigned the policy")
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

    @validator('policy_id')
    def validate_policy_id(cls, v):
        if not v.strip():
            raise ValueError('Policy ID cannot be empty')
        return v.strip()

class PermissionEvaluation(BaseModel):
    """Result of a permission evaluation"""
    allowed: bool = Field(..., description="Whether the action is allowed")
    reason: str = Field(..., description="Reason for the decision")
    matched_statement: Optional[PermissionStatement] = Field(None, description="Statement that matched")
    evaluated_policies: List[str] = Field(default_factory=list, description="Policies that were evaluated")
    required_action: Optional[Action] = Field(None, description="Action that was requested")
    required_resource: Optional[str] = Field(None, description="Resource that was requested")

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class PolicyCreate(BaseModel):
    """Model for creating a new policy"""
    id: str
    name: str
    description: str
    version: str = "2024-01-01"
    statements: List[PermissionStatement]

class PolicyUpdate(BaseModel):
    """Model for updating an existing policy"""
    name: Optional[str] = None
    description: Optional[str] = None
    version: Optional[str] = None
    statements: Optional[List[PermissionStatement]] = None

class PolicyResponse(BaseModel):
    """Response model for policy operations"""
    status: str
    message: str
    policy: Optional[Policy] = None

class PolicyListResponse(BaseModel):
    """Response model for listing policies"""
    status: str
    message: str
    policies: List[Policy]
    total: int

class PolicyAssignmentRequest(BaseModel):
    """Request model for assigning policy to user"""
    assigned_by: str
    expires_at: Optional[datetime] = None
    notes: Optional[str] = None

class PolicyAssignmentResponse(BaseModel):
    """Response model for policy assignment operations"""
    status: str
    message: str
    assignment: Optional[PolicyAssignment] = None

class UserPoliciesResponse(BaseModel):
    """Response model for getting user's policies"""
    status: str
    message: str
    user_id: str
    policies: List[Policy]
    assignments: List[PolicyAssignment]

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
# PREDEFINED POLICIES
# ============================================================================

PREDEFINED_POLICIES = {
    # Authentication Policies
    "AuthBasicAccess": Policy(
        id="AuthBasicAccess",
        name="Basic Authentication Access",
        description="Basic authentication operations for all users",
        version="2024-01-01",
        statements=[
            PermissionStatement(
                sid="BasicAuth",
                effect=Effect.ALLOW,
                actions=[Action.AUTH_LOGIN, Action.AUTH_LOGOUT, Action.AUTH_REFRESH, Action.AUTH_ME],
                resources=[Resource.AUTH_ALL]
            )
        ]
    ),
    
    "UserManager": Policy(
        id="UserManager",
        name="User Management",
        description="Full user management capabilities",
        version="2024-01-01",
        statements=[
            PermissionStatement(
                sid="UserManagement",
                effect=Effect.ALLOW,
                actions=[Action.USER_CREATE, Action.USER_READ, Action.USER_UPDATE, Action.USER_DELETE, Action.USER_LIST],
                resources=[Resource.USER_ALL]
            )
        ]
    ),
    
    "UserReadOnly": Policy(
        id="UserReadOnly",
        name="User Read Only Access",
        description="Can only read user information",
        version="2024-01-01",
        statements=[
            PermissionStatement(
                sid="UserRead",
                effect=Effect.ALLOW,
                actions=[Action.USER_READ, Action.USER_LIST],
                resources=[Resource.USER_ALL]
            )
        ]
    ),
    
    # Client Management Policies
    "ClientManager": Policy(
        id="ClientManager",
        name="Client Management",
        description="Full client management capabilities (CEO level)",
        version="2024-01-01",
        statements=[
            PermissionStatement(
                sid="ClientFullAccess",
                effect=Effect.ALLOW,
                actions=[Action.CLIENT_CREATE, Action.CLIENT_READ, Action.CLIENT_UPDATE, Action.CLIENT_DELETE, Action.CLIENT_LIST],
                resources=[Resource.CLIENT_ALL]
            )
        ]
    ),
    
    "ClientReadOnly": Policy(
        id="ClientReadOnly",
        name="Client Read Only Access",
        description="Can only view client information",
        version="2024-01-01",
        statements=[
            PermissionStatement(
                sid="ClientRead",
                effect=Effect.ALLOW,
                actions=[Action.CLIENT_READ, Action.CLIENT_LIST],
                resources=[Resource.CLIENT_ALL]
            )
        ]
    ),
    
    # Delivery Challan Policies
    "DeliveryChallanManager": Policy(
        id="DeliveryChallanManager",
        name="Delivery Challan Manager",
        description="Full delivery challan management capabilities",
        version="2024-01-01",
        statements=[
            PermissionStatement(
                sid="DeliveryChallanFullAccess",
                effect=Effect.ALLOW,
                actions=[
                    Action.DELIVERY_CHALLAN_CREATE,
                    Action.DELIVERY_CHALLAN_READ,
                    Action.DELIVERY_CHALLAN_UPDATE,
                    Action.DELIVERY_CHALLAN_DELETE,
                    Action.DELIVERY_CHALLAN_LIST,
                    Action.DELIVERY_CHALLAN_UPLOAD,
                    Action.DELIVERY_CHALLAN_LINK_INVOICE
                ],
                resources=[Resource.DELIVERY_CHALLAN_ALL, Resource.DELIVERY_CHALLAN_FILE]
            )
        ]
    ),
    
    "DeliveryChallanCreator": Policy(
        id="DeliveryChallanCreator",
        name="Delivery Challan Creator",
        description="Can create and read delivery challans, but cannot delete",
        version="2024-01-01",
        statements=[
            PermissionStatement(
                sid="DeliveryChallanCreateRead",
                effect=Effect.ALLOW,
                actions=[
                    Action.DELIVERY_CHALLAN_CREATE,
                    Action.DELIVERY_CHALLAN_READ,
                    Action.DELIVERY_CHALLAN_UPDATE,
                    Action.DELIVERY_CHALLAN_LIST,
                    Action.DELIVERY_CHALLAN_UPLOAD,
                    Action.DELIVERY_CHALLAN_LINK_INVOICE
                ],
                resources=[Resource.DELIVERY_CHALLAN_ALL, Resource.DELIVERY_CHALLAN_FILE]
            )
        ]
    ),
    
    "DeliveryChallanViewer": Policy(
        id="DeliveryChallanViewer",
        name="Delivery Challan Viewer",
        description="Read-only access to delivery challans",
        version="2024-01-01",
        statements=[
            PermissionStatement(
                sid="DeliveryChallanRead",
                effect=Effect.ALLOW,
                actions=[Action.DELIVERY_CHALLAN_READ, Action.DELIVERY_CHALLAN_LIST],
                resources=[Resource.DELIVERY_CHALLAN_ALL]
            )
        ]
    ),
    
    # Permission Management Policies
    "PermissionAdministrator": Policy(
        id="PermissionAdministrator",
        name="Permission System Administrator",
        description="Full control over the permission system",
        version="2024-01-01",
        statements=[
            PermissionStatement(
                sid="PermissionFullAccess",
                effect=Effect.ALLOW,
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
                resources=[Resource.PERMISSIONS_ALL]
            )
        ]
    ),
    
    "PermissionManager": Policy(
        id="PermissionManager",
        name="Permission Manager",
        description="Can manage policy assignments but not create policies",
        version="2024-01-01",
        statements=[
            PermissionStatement(
                sid="PermissionManage",
                effect=Effect.ALLOW,
                actions=[
                    Action.PERMISSIONS_READ,
                    Action.PERMISSIONS_LIST,
                    Action.PERMISSIONS_ASSIGN,
                    Action.PERMISSIONS_UNASSIGN,
                    Action.PERMISSIONS_EVALUATE
                ],
                resources=[Resource.PERMISSIONS_ALL]
            )
        ]
    )
}

# Role-based policy sets
ROLE_POLICY_SETS = {
    "CEO": [
        "AuthBasicAccess",
        "UserManager",
        "ClientManager",
        "DeliveryChallanManager",
        "PermissionAdministrator"
    ],
    "Admin": [
        "AuthBasicAccess",
        "UserManager",
        "ClientReadOnly",
        "DeliveryChallanManager",
        "PermissionManager"
    ],
    "DC_Tracker_Manager": [
        "AuthBasicAccess",
        "UserReadOnly",
        "ClientReadOnly",
        "DeliveryChallanManager"
    ],
    "Regular_User": [
        "AuthBasicAccess",
        "UserReadOnly",
        "ClientReadOnly",
        "DeliveryChallanViewer"
    ]
} 