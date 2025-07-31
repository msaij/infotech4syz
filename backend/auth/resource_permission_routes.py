from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from datetime import datetime

from database import get_async_database
from services.resource_permission_service import ResourcePermissionService
from models.foursyz.permissions import (
    ResourcePermission, UserResourceAssignment, PermissionEvaluation,
    ResourcePermissionListResponse, UserResourceAssignmentListResponse,
    UserResourcePermissionsResponse, UserResourceAssignmentRequest,
    PermissionEvaluationRequest, PermissionEvaluationResponse
)

from auth.dependencies import get_current_user

router = APIRouter(prefix="/resource-permissions", tags=["Resource Permissions"])

async def get_resource_permission_service():
    """Dependency to get resource permission service"""
    db = await get_async_database()
    return ResourcePermissionService(db)

@router.post("/initialize", response_model=Dict[str, Any])
async def initialize_resource_permissions(
    current_user: dict = Depends(get_current_user),
    service: ResourcePermissionService = Depends(get_resource_permission_service)
):
    """Initialize predefined resource permissions in the database"""
    try:
        # Check if user has permission to initialize
        evaluation = await service.evaluate_user_permission(
            user_id=current_user['id'],
            action="permissions:create",
            resource="permissions:*"
        )
        
        if not evaluation.allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to initialize resource permissions"
            )

        result = await service.initialize_resource_permissions()
        return result

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize resource permissions: {str(e)}"
        )

@router.get("/", response_model=ResourcePermissionListResponse)
async def get_resource_permissions(
    current_user: dict = Depends(get_current_user),
    service: ResourcePermissionService = Depends(get_resource_permission_service)
):
    """Get all resource permissions"""
    try:
        # Check if user has permission to read permissions
        evaluation = await service.evaluate_user_permission(
            user_id=current_user["id"],
            action="permissions:read",
            resource="permissions:*"
        )
        
        if not evaluation.allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view resource permissions"
            )

        permissions = await service.get_all_resource_permissions()
        return ResourcePermissionListResponse(
            status="success",
            message=f"Retrieved {len(permissions)} resource permissions",
            permissions=permissions,
            total=len(permissions)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get resource permissions: {str(e)}"
        )

@router.get("/categorized", response_model=Dict[str, List[ResourcePermission]])
async def get_resource_permissions_by_category(
    current_user: dict = Depends(get_current_user),
    service: ResourcePermissionService = Depends(get_resource_permission_service)
):
    """Get resource permissions grouped by category"""
    try:
        # Check if user has permission to read permissions
        evaluation = await service.evaluate_user_permission(
            user_id=current_user["id"],
            action="permissions:read",
            resource="permissions:*"
        )
        
        if not evaluation.allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view resource permissions"
            )

        categorized_permissions = await service.get_resource_permissions_by_category()
        return categorized_permissions

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get categorized permissions: {str(e)}"
        )

@router.get("/{permission_id}", response_model=ResourcePermission)
async def get_resource_permission(
    permission_id: str,
    current_user: dict = Depends(get_current_user),
    service: ResourcePermissionService = Depends(get_resource_permission_service)
):
    """Get a specific resource permission by ID"""
    try:
        # Check if user has permission to read permissions
        evaluation = await service.evaluate_user_permission(
            user_id=current_user["id"],
            action="permissions:read",
            resource="permissions:*"
        )
        
        if not evaluation.allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view resource permissions"
            )

        permission = await service.get_resource_permission_by_id(permission_id)
        if not permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Resource permission '{permission_id}' not found"
            )

        return permission

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get resource permission: {str(e)}"
        )

@router.post("/assign/{user_id}/{permission_id}")
async def assign_resource_permission_to_user(
    user_id: str,
    permission_id: str,
    assignment_data: UserResourceAssignmentRequest,
    current_user: dict = Depends(get_current_user),
    service: ResourcePermissionService = Depends(get_resource_permission_service)
):
    """Assign a resource permission to a user"""
    try:
        # Check if current user has permission to assign permissions
        evaluation = await service.evaluate_user_permission(
            user_id=current_user["id"],
            action="permissions:assign",
            resource="permissions:*"
        )
        
        if not evaluation.allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to assign resource permissions"
            )

        assignment = await service.assign_resource_permission_to_user(
            user_id=user_id,
            permission_id=permission_id,
            assigned_by=current_user["id"],
            expires_at=assignment_data.expires_at,
            notes=assignment_data.notes
        )

        return {
            "status": "success",
            "message": f"Successfully assigned permission '{permission_id}' to user '{user_id}'",
            "assignment": assignment
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign resource permission: {str(e)}"
        )

@router.delete("/unassign/{user_id}/{permission_id}")
async def unassign_resource_permission_from_user(
    user_id: str,
    permission_id: str,
    current_user: dict = Depends(get_current_user),
    service: ResourcePermissionService = Depends(get_resource_permission_service)
):
    """Unassign a resource permission from a user"""
    try:
        # Check if current user has permission to unassign permissions
        evaluation = await service.evaluate_user_permission(
            user_id=current_user["id"],
            action="permissions:unassign",
            resource="permissions:*"
        )
        
        if not evaluation.allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to unassign resource permissions"
            )

        success = await service.unassign_resource_permission_from_user(
            user_id=user_id,
            permission_id=permission_id
        )

        if success:
            return {
                "status": "success",
                "message": f"Successfully unassigned permission '{permission_id}' from user '{user_id}'"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No active assignment found for user '{user_id}' and permission '{permission_id}'"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unassign resource permission: {str(e)}"
        )

@router.get("/user/{user_id}/assignments", response_model=UserResourceAssignmentListResponse)
async def get_user_resource_assignments(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    service: ResourcePermissionService = Depends(get_resource_permission_service)
):
    """Get all resource permission assignments for a user"""
    try:
        # Check if current user has permission to read assignments
        evaluation = await service.evaluate_user_permission(
            user_id=current_user["id"],
            action="permissions:read",
            resource="permissions:*"
        )
        
        if not evaluation.allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view user assignments"
            )

        assignments = await service.get_user_resource_assignments(user_id)
        return UserResourceAssignmentListResponse(
            status="success",
            message=f"Retrieved {len(assignments)} assignments for user '{user_id}'",
            assignments=assignments,
            total=len(assignments)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user assignments: {str(e)}"
        )

@router.get("/user/{user_id}/permissions", response_model=UserResourcePermissionsResponse)
async def get_user_resource_permissions(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    service: ResourcePermissionService = Depends(get_resource_permission_service)
):
    """Get all resource permissions assigned to a user"""
    try:
        # Check if current user has permission to read permissions
        evaluation = await service.evaluate_user_permission(
            user_id=current_user["id"],
            action="permissions:read",
            resource="permissions:*"
        )
        
        if not evaluation.allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view user permissions"
            )

        permissions = await service.get_user_resource_permissions(user_id)
        assignments = await service.get_user_resource_assignments(user_id)
        
        return UserResourcePermissionsResponse(
            status="success",
            message=f"Retrieved {len(permissions)} permissions for user '{user_id}'",
            user_id=user_id,
            permissions=permissions,
            assignments=assignments
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user permissions: {str(e)}"
        )

@router.post("/evaluate", response_model=PermissionEvaluationResponse)
async def evaluate_permission(
    evaluation_request: PermissionEvaluationRequest,
    current_user: dict = Depends(get_current_user),
    service: ResourcePermissionService = Depends(get_resource_permission_service)
):
    """Evaluate if a user has permission to perform an action on a resource"""
    try:
        # Check if current user has permission to evaluate permissions
        evaluation = await service.evaluate_user_permission(
            user_id=current_user["id"],
            action="permissions:evaluate",
            resource="permissions:*"
        )
        
        if not evaluation.allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to evaluate permissions"
            )

        result = await service.evaluate_user_permission(
            user_id=evaluation_request.user_id,
            action=evaluation_request.action,
            resource=evaluation_request.resource,
            context=evaluation_request.context
        )

        return PermissionEvaluationResponse(
            status="success",
            message="Permission evaluation completed",
            evaluation=result
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate permission: {str(e)}"
        )

@router.get("/assignments/all", response_model=UserResourceAssignmentListResponse)
async def get_all_user_assignments(
    current_user: dict = Depends(get_current_user),
    service: ResourcePermissionService = Depends(get_resource_permission_service)
):
    """Get all active user resource assignments"""
    try:
        # Check if current user has permission to read assignments
        evaluation = await service.evaluate_user_permission(
            user_id=current_user["id"],
            action="permissions:read",
            resource="permissions:*"
        )
        
        if not evaluation.allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view all assignments"
            )

        assignments = await service.get_all_user_assignments()
        return UserResourceAssignmentListResponse(
            status="success",
            message=f"Retrieved {len(assignments)} total assignments",
            assignments=assignments,
            total=len(assignments)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get all assignments: {str(e)}"
        ) 