from typing import Callable, Dict, Any
from fastapi import Depends, HTTPException, status
from .dependencies import get_current_user
from services.permission_service import permission_service
from models.foursyz.permissions import Action, Resource

# ============================================================================
# CORE PERMISSION DEPENDENCY
# ============================================================================

def require_permission(action: Action, resource: str) -> Callable:
    """
    Create a dependency that requires a specific permission
    
    Args:
        action: The action being performed
        resource: The resource being accessed
        
    Returns:
        FastAPI dependency function
    """
    async def permission_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        """
        Check if the current user has the required permission
        
        Args:
            current_user: The authenticated user from JWT token
            
        Returns:
            The current user if permission is granted
            
        Raises:
            HTTPException: If permission is denied
        """
        user_id = current_user.get('id')
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token"
            )
        
        # Evaluate permission
        evaluation = await permission_service.evaluate_permission(
            user_id=user_id,
            action=action,
            resource=resource,
            context={"user": current_user}
        )
        
        if not evaluation.allowed:
            # Get user's current permissions for better error message
            user_policies = await permission_service.get_user_policies(user_id)
            user_permissions = []
            
            for policy in user_policies:
                for statement in policy.statements:
                    user_permissions.extend([action.value for action in statement.actions])
            
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "message": "Access denied",
                    "detail": "Insufficient permissions for this action",
                    "required_action": action.value,
                    "required_resource": resource,
                    "user_permissions": list(set(user_permissions)),  # Remove duplicates
                    "reason": evaluation.reason
                }
            )
        
        return current_user
    
    return permission_checker

# ============================================================================
# USER MANAGEMENT PERMISSIONS
# ============================================================================

def require_user_create() -> Callable:
    """Require permission to create users"""
    return require_permission(Action.USER_CREATE, Resource.USER_ALL.value)

def require_user_read() -> Callable:
    """Require permission to read user information"""
    return require_permission(Action.USER_READ, Resource.USER_ALL.value)

def require_user_update() -> Callable:
    """Require permission to update users"""
    return require_permission(Action.USER_UPDATE, Resource.USER_ALL.value)

def require_user_delete() -> Callable:
    """Require permission to delete users"""
    return require_permission(Action.USER_DELETE, Resource.USER_ALL.value)

def require_user_list() -> Callable:
    """Require permission to list users"""
    return require_permission(Action.USER_LIST, Resource.USER_ALL.value)

# ============================================================================
# CLIENT MANAGEMENT PERMISSIONS
# ============================================================================

def require_client_create() -> Callable:
    """Require permission to create clients"""
    return require_permission(Action.CLIENT_CREATE, Resource.CLIENT_ALL.value)

def require_client_read() -> Callable:
    """Require permission to read client information"""
    return require_permission(Action.CLIENT_READ, Resource.CLIENT_ALL.value)

def require_client_update() -> Callable:
    """Require permission to update clients"""
    return require_permission(Action.CLIENT_UPDATE, Resource.CLIENT_ALL.value)

def require_client_delete() -> Callable:
    """Require permission to delete clients"""
    return require_permission(Action.CLIENT_DELETE, Resource.CLIENT_ALL.value)

def require_client_list() -> Callable:
    """Require permission to list clients"""
    return require_permission(Action.CLIENT_LIST, Resource.CLIENT_ALL.value)

# ============================================================================
# DELIVERY CHALLAN PERMISSIONS
# ============================================================================

def require_delivery_challan_create() -> Callable:
    """Require permission to create delivery challans"""
    return require_permission(Action.DELIVERY_CHALLAN_CREATE, Resource.DELIVERY_CHALLAN_ALL.value)

def require_delivery_challan_read() -> Callable:
    """Require permission to read delivery challan information"""
    return require_permission(Action.DELIVERY_CHALLAN_READ, Resource.DELIVERY_CHALLAN_ALL.value)

def require_delivery_challan_update() -> Callable:
    """Require permission to update delivery challans"""
    return require_permission(Action.DELIVERY_CHALLAN_UPDATE, Resource.DELIVERY_CHALLAN_ALL.value)

def require_delivery_challan_delete() -> Callable:
    """Require permission to delete delivery challans"""
    return require_permission(Action.DELIVERY_CHALLAN_DELETE, Resource.DELIVERY_CHALLAN_ALL.value)

def require_delivery_challan_list() -> Callable:
    """Require permission to list delivery challans"""
    return require_permission(Action.DELIVERY_CHALLAN_LIST, Resource.DELIVERY_CHALLAN_ALL.value)

def require_delivery_challan_upload() -> Callable:
    """Require permission to upload files for delivery challans"""
    return require_permission(Action.DELIVERY_CHALLAN_UPLOAD, Resource.DELIVERY_CHALLAN_FILE.value)

def require_delivery_challan_link_invoice() -> Callable:
    """Require permission to link challans to invoices"""
    return require_permission(Action.DELIVERY_CHALLAN_LINK_INVOICE, Resource.DELIVERY_CHALLAN_ALL.value)

# ============================================================================
# AUTHENTICATION PERMISSIONS
# ============================================================================

def require_auth_logout() -> Callable:
    """Require permission to logout"""
    return require_permission(Action.AUTH_LOGOUT, Resource.AUTH_ALL.value)

def require_auth_refresh() -> Callable:
    """Require permission to refresh tokens"""
    return require_permission(Action.AUTH_REFRESH, Resource.AUTH_ALL.value)

def require_auth_me() -> Callable:
    """Require permission to get current user info"""
    return require_permission(Action.AUTH_ME, Resource.AUTH_ALL.value)

# ============================================================================
# PERMISSION MANAGEMENT PERMISSIONS
# ============================================================================

def require_permissions_create() -> Callable:
    """Require permission to create policies"""
    return require_permission(Action.PERMISSIONS_CREATE, Resource.PERMISSIONS_ALL.value)

def require_permissions_read() -> Callable:
    """Require permission to read policies"""
    return require_permission(Action.PERMISSIONS_READ, Resource.PERMISSIONS_ALL.value)

def require_permissions_update() -> Callable:
    """Require permission to update policies"""
    return require_permission(Action.PERMISSIONS_UPDATE, Resource.PERMISSIONS_ALL.value)

def require_permissions_delete() -> Callable:
    """Require permission to delete policies"""
    return require_permission(Action.PERMISSIONS_DELETE, Resource.PERMISSIONS_ALL.value)

def require_permissions_list() -> Callable:
    """Require permission to list policies"""
    return require_permission(Action.PERMISSIONS_LIST, Resource.PERMISSIONS_ALL.value)

def require_permissions_assign() -> Callable:
    """Require permission to assign policies to users"""
    return require_permission(Action.PERMISSIONS_ASSIGN, Resource.PERMISSIONS_ALL.value)

def require_permissions_unassign() -> Callable:
    """Require permission to unassign policies from users"""
    return require_permission(Action.PERMISSIONS_UNASSIGN, Resource.PERMISSIONS_ALL.value)

def require_permissions_evaluate() -> Callable:
    """Require permission to evaluate permissions"""
    return require_permission(Action.PERMISSIONS_EVALUATE, Resource.PERMISSIONS_ALL.value)

# ============================================================================
# COMPOSITE PERMISSIONS (MULTIPLE ACTIONS)
# ============================================================================

def require_user_management() -> Callable:
    """Require full user management permissions (create, read, update, delete, list)"""
    async def user_management_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_id = current_user.get('id')
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token"
            )
        
        # Check for all user management permissions
        required_actions = [
            Action.USER_CREATE,
            Action.USER_READ,
            Action.USER_UPDATE,
            Action.USER_DELETE,
            Action.USER_LIST
        ]
        
        for action in required_actions:
            evaluation = await permission_service.evaluate_permission(
                user_id=user_id,
                action=action,
                resource=Resource.USER_ALL.value,
                context={"user": current_user}
            )
            
            if not evaluation.allowed:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={
                        "message": "Access denied",
                        "detail": f"Insufficient permissions for user management - missing {action.value}",
                        "required_action": action.value,
                        "required_resource": Resource.USER_ALL.value,
                        "reason": evaluation.reason
                    }
                )
        
        return current_user
    
    return user_management_checker

def require_client_management() -> Callable:
    """Require full client management permissions (create, read, update, delete, list)"""
    async def client_management_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_id = current_user.get('id')
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token"
            )
        
        # Check for all client management permissions
        required_actions = [
            Action.CLIENT_CREATE,
            Action.CLIENT_READ,
            Action.CLIENT_UPDATE,
            Action.CLIENT_DELETE,
            Action.CLIENT_LIST
        ]
        
        for action in required_actions:
            evaluation = await permission_service.evaluate_permission(
                user_id=user_id,
                action=action,
                resource=Resource.CLIENT_ALL.value,
                context={"user": current_user}
            )
            
            if not evaluation.allowed:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={
                        "message": "Access denied",
                        "detail": f"Insufficient permissions for client management - missing {action.value}",
                        "required_action": action.value,
                        "required_resource": Resource.CLIENT_ALL.value,
                        "reason": evaluation.reason
                    }
                )
        
        return current_user
    
    return client_management_checker

def require_delivery_challan_management() -> Callable:
    """Require full delivery challan management permissions"""
    async def delivery_challan_management_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_id = current_user.get('id')
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token"
            )
        
        # Check for all delivery challan management permissions
        required_actions = [
            Action.DELIVERY_CHALLAN_CREATE,
            Action.DELIVERY_CHALLAN_READ,
            Action.DELIVERY_CHALLAN_UPDATE,
            Action.DELIVERY_CHALLAN_DELETE,
            Action.DELIVERY_CHALLAN_LIST,
            Action.DELIVERY_CHALLAN_UPLOAD,
            Action.DELIVERY_CHALLAN_LINK_INVOICE
        ]
        
        for action in required_actions:
            resource = Resource.DELIVERY_CHALLAN_FILE.value if action == Action.DELIVERY_CHALLAN_UPLOAD else Resource.DELIVERY_CHALLAN_ALL.value
            
            evaluation = await permission_service.evaluate_permission(
                user_id=user_id,
                action=action,
                resource=resource,
                context={"user": current_user}
            )
            
            if not evaluation.allowed:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={
                        "message": "Access denied",
                        "detail": f"Insufficient permissions for delivery challan management - missing {action.value}",
                        "required_action": action.value,
                        "required_resource": resource,
                        "reason": evaluation.reason
                    }
                )
        
        return current_user
    
    return delivery_challan_management_checker

# ============================================================================
# UTILITY DEPENDENCIES
# ============================================================================

def require_any_permission(actions: list[Action], resource: str) -> Callable:
    """
    Require any one of the specified permissions
    
    Args:
        actions: List of actions, any one of which grants access
        resource: The resource being accessed
        
    Returns:
        FastAPI dependency function
    """
    async def any_permission_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_id = current_user.get('id')
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token"
            )
        
        # Check if user has any of the required permissions
        for action in actions:
            evaluation = await permission_service.evaluate_permission(
                user_id=user_id,
                action=action,
                resource=resource,
                context={"user": current_user}
            )
            
            if evaluation.allowed:
                return current_user
        
        # If no permissions match, deny access
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": "Access denied",
                "detail": "Insufficient permissions for this action",
                "required_actions": [action.value for action in actions],
                "required_resource": resource
            }
        )
    
    return any_permission_checker

def require_all_permissions(actions: list[Action], resource: str) -> Callable:
    """
    Require all of the specified permissions
    
    Args:
        actions: List of actions, all of which must be granted
        resource: The resource being accessed
        
    Returns:
        FastAPI dependency function
    """
    async def all_permissions_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_id = current_user.get('id')
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token"
            )
        
        # Check if user has all of the required permissions
        missing_permissions = []
        
        for action in actions:
            evaluation = await permission_service.evaluate_permission(
                user_id=user_id,
                action=action,
                resource=resource,
                context={"user": current_user}
            )
            
            if not evaluation.allowed:
                missing_permissions.append(action.value)
        
        if missing_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "message": "Access denied",
                    "detail": "Missing required permissions",
                    "missing_permissions": missing_permissions,
                    "required_resource": resource
                }
            )
        
        return current_user
    
    return all_permissions_checker 