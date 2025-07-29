from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional, List
from datetime import datetime

from .permission_dependencies import (
    require_permissions_create, require_permissions_read, require_permissions_update,
    require_permissions_delete, require_permissions_list, require_permissions_assign,
    require_permissions_unassign, require_permissions_evaluate
)
from .dependencies import get_current_user
from services.permission_service import permission_service
from models.foursyz.permissions import (
    Policy, PolicyCreate, PolicyUpdate, PolicyResponse, PolicyListResponse,
    PolicyAssignment, PolicyAssignmentRequest, PolicyAssignmentResponse,
    UserPoliciesResponse, PermissionEvaluationRequest, PermissionEvaluationResponse,
    Action, Resource
)

permission_router = APIRouter(tags=["Permission Management"])

# ============================================================================
# POLICY MANAGEMENT ENDPOINTS
# ============================================================================

@permission_router.post("/policies", response_model=PolicyResponse)
async def create_policy(
    policy_data: PolicyCreate,
    current_user: dict = Depends(require_permissions_create())
):
    """Create a new policy"""
    try:
        # Convert PolicyCreate to Policy
        policy = Policy(
            id=policy_data.id,
            name=policy_data.name,
            description=policy_data.description,
            version=policy_data.version,
            statements=policy_data.statements,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        created_policy = await permission_service.create_policy(policy)
        
        return PolicyResponse(
            status="success",
            message=f"Policy '{policy_data.id}' created successfully",
            policy=created_policy
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create policy: {str(e)}"
        )

@permission_router.get("/policies", response_model=PolicyListResponse)
async def list_policies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(require_permissions_list())
):
    """List all policies"""
    try:
        policies = await permission_service.list_policies()
        
        # Apply pagination
        total = len(policies)
        paginated_policies = policies[skip:skip + limit]
        
        return PolicyListResponse(
            status="success",
            message=f"Retrieved {len(paginated_policies)} policies",
            policies=paginated_policies,
            total=total
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list policies: {str(e)}"
        )

@permission_router.get("/policies/{policy_id}", response_model=PolicyResponse)
async def get_policy(
    policy_id: str,
    current_user: dict = Depends(require_permissions_read())
):
    """Get a specific policy by ID"""
    try:
        policy = await permission_service.get_policy(policy_id)
        
        if not policy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Policy with ID '{policy_id}' not found"
            )
        
        return PolicyResponse(
            status="success",
            message=f"Policy '{policy_id}' retrieved successfully",
            policy=policy
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get policy: {str(e)}"
        )

@permission_router.put("/policies/{policy_id}", response_model=PolicyResponse)
async def update_policy(
    policy_id: str,
    policy_data: PolicyUpdate,
    current_user: dict = Depends(require_permissions_update())
):
    """Update an existing policy"""
    try:
        # Convert PolicyUpdate to dict, removing None values
        update_data = policy_data.model_dump(exclude_unset=True)
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update"
            )
        
        updated_policy = await permission_service.update_policy(policy_id, update_data)
        
        if not updated_policy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Policy with ID '{policy_id}' not found"
            )
        
        return PolicyResponse(
            status="success",
            message=f"Policy '{policy_id}' updated successfully",
            policy=updated_policy
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update policy: {str(e)}"
        )

@permission_router.delete("/policies/{policy_id}")
async def delete_policy(
    policy_id: str,
    current_user: dict = Depends(require_permissions_delete())
):
    """Delete a policy"""
    try:
        deleted = await permission_service.delete_policy(policy_id)
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Policy with ID '{policy_id}' not found"
            )
        
        return {
            "status": "success",
            "message": f"Policy '{policy_id}' deleted successfully"
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete policy: {str(e)}"
        )

# ============================================================================
# POLICY ASSIGNMENT ENDPOINTS
# ============================================================================

@permission_router.post("/users/{user_id}/policies/{policy_id}", response_model=PolicyAssignmentResponse)
async def assign_policy_to_user(
    user_id: str,
    policy_id: str,
    assignment_data: PolicyAssignmentRequest,
    current_user: dict = Depends(require_permissions_assign())
):
    """Assign a policy to a user"""
    try:
        assignment = await permission_service.assign_policy_to_user(
            user_id=user_id,
            policy_id=policy_id,
            assigned_by=assignment_data.assigned_by,
            expires_at=assignment_data.expires_at,
            notes=assignment_data.notes
        )
        
        return PolicyAssignmentResponse(
            status="success",
            message=f"Policy '{policy_id}' assigned to user '{user_id}' successfully",
            assignment=assignment
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign policy: {str(e)}"
        )

@permission_router.delete("/users/{user_id}/policies/{policy_id}")
async def unassign_policy_from_user(
    user_id: str,
    policy_id: str,
    current_user: dict = Depends(require_permissions_unassign())
):
    """Remove a policy assignment from a user"""
    try:
        unassigned = await permission_service.unassign_policy_from_user(user_id, policy_id)
        
        if not unassigned:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Policy '{policy_id}' is not assigned to user '{user_id}'"
            )
        
        return {
            "status": "success",
            "message": f"Policy '{policy_id}' unassigned from user '{user_id}' successfully"
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unassign policy: {str(e)}"
        )

@permission_router.get("/users/{user_id}/policies", response_model=UserPoliciesResponse)
async def get_user_policies(
    user_id: str,
    current_user: dict = Depends(require_permissions_read())
):
    """Get all policies assigned to a user"""
    try:
        policies = await permission_service.get_user_policies(user_id)
        assignments = await permission_service.get_user_assignments(user_id)
        
        return UserPoliciesResponse(
            status="success",
            message=f"Retrieved {len(policies)} policies for user '{user_id}'",
            user_id=user_id,
            policies=policies,
            assignments=assignments
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user policies: {str(e)}"
        )

# ============================================================================
# PERMISSION EVALUATION ENDPOINTS
# ============================================================================

@permission_router.post("/evaluate", response_model=PermissionEvaluationResponse)
async def evaluate_permission(
    evaluation_request: PermissionEvaluationRequest,
    current_user: dict = Depends(get_current_user)  # Changed from require_permissions_evaluate()
):
    """Evaluate if a user has permission for a specific action and resource"""
    try:
        # Security: Only allow users to evaluate their own permissions
        if evaluation_request.user_id != current_user['id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Users can only evaluate their own permissions"
            )
        
        evaluation = await permission_service.evaluate_permission(
            user_id=evaluation_request.user_id,
            action=evaluation_request.action,
            resource=evaluation_request.resource,
            context=evaluation_request.context
        )
        
        return PermissionEvaluationResponse(
            status="success",
            message="Permission evaluation completed",
            evaluation=evaluation
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate permission: {str(e)}"
        )

@permission_router.post("/evaluate/admin", response_model=PermissionEvaluationResponse)
async def evaluate_permission_admin(
    evaluation_request: PermissionEvaluationRequest,
    current_user: dict = Depends(require_permissions_evaluate())
):
    """Admin endpoint to evaluate any user's permissions"""
    try:
        evaluation = await permission_service.evaluate_permission(
            user_id=evaluation_request.user_id,
            action=evaluation_request.action,
            resource=evaluation_request.resource,
            context=evaluation_request.context
        )
        
        return PermissionEvaluationResponse(
            status="success",
            message="Admin permission evaluation completed",
            evaluation=evaluation
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate permission: {str(e)}"
        )

# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@permission_router.get("/users/{user_id}/permissions")
async def get_user_permissions_summary(
    user_id: str,
    current_user: dict = Depends(require_permissions_read())
):
    """Get a summary of user's permissions"""
    try:
        policies = await permission_service.get_user_policies(user_id)
        
        # Extract all permissions from user's policies
        all_permissions = set()
        for policy in policies:
            for statement in policy.statements:
                for action in statement.actions:
                    all_permissions.add(action.value)
        
        return {
            "status": "success",
            "message": f"Retrieved permissions for user '{user_id}'",
            "user_id": user_id,
            "policies": [policy.name for policy in policies],
            "permissions": list(all_permissions),
            "total_policies": len(policies),
            "total_permissions": len(all_permissions)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user permissions summary: {str(e)}"
        )

@permission_router.get("/policies/{policy_id}/users")
async def get_users_with_policy(
    policy_id: str,
    current_user: dict = Depends(require_permissions_read())
):
    """Get all users assigned to a specific policy"""
    try:
        user_ids = await permission_service.get_users_with_policy(policy_id)
        
        return {
            "status": "success",
            "message": f"Retrieved {len(user_ids)} users with policy '{policy_id}'",
            "policy_id": policy_id,
            "user_ids": user_ids,
            "total_users": len(user_ids)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get users with policy: {str(e)}"
        )

@permission_router.post("/initialize")
async def initialize_predefined_policies(
    current_user: dict = Depends(require_permissions_create())
):
    """Initialize predefined policies in the database"""
    try:
        created_policies = await permission_service.initialize_predefined_policies()
        
        return {
            "status": "success",
            "message": f"Initialized {len(created_policies)} predefined policies",
            "created_policies": created_policies,
            "total_created": len(created_policies)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize predefined policies: {str(e)}"
        )

@permission_router.post("/migrate")
async def migrate_user_roles_to_policies(
    current_user: dict = Depends(require_permissions_assign())
):
    """Migrate existing user roles to policy assignments"""
    try:
        migration_results = await permission_service.migrate_user_roles_to_policies()
        
        total_users = len(migration_results)
        total_assignments = sum(len(assignments) for assignments in migration_results.values())
        
        return {
            "status": "success",
            "message": f"Migration completed for {total_users} users with {total_assignments} total assignments",
            "migration_results": migration_results,
            "total_users": total_users,
            "total_assignments": total_assignments
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to migrate user roles: {str(e)}"
        )

@permission_router.post("/cleanup/expired")
async def cleanup_expired_assignments(
    current_user: dict = Depends(require_permissions_update())
):
    """Deactivate expired policy assignments"""
    try:
        deactivated_count = await permission_service.deactivate_expired_assignments()
        
        return {
            "status": "success",
            "message": f"Deactivated {deactivated_count} expired assignments",
            "deactivated_count": deactivated_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cleanup expired assignments: {str(e)}"
        )

# ============================================================================
# HEALTH CHECK ENDPOINTS
# ============================================================================

@permission_router.get("/health")
async def permission_system_health():
    """Check the health of the permission system"""
    try:
        # Test basic operations
        policies = await permission_service.list_policies()
        
        return {
            "status": "healthy",
            "message": "Permission system is operational",
            "total_policies": len(policies),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Permission system is unhealthy: {str(e)}"
        ) 