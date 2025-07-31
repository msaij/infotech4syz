from typing import List, Dict, Any, Optional
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.foursyz.permissions import (
    ResourcePermission, UserResourceAssignment, PermissionEvaluation,
    PREDEFINED_RESOURCE_PERMISSIONS, RESOURCE_PERMISSION_CATEGORIES,
    Action, Resource, Effect
)

class ResourcePermissionService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.resource_permissions_collection = db.resource_permissions
        self.user_resource_assignments_collection = db.user_resource_assignments

    async def initialize_resource_permissions(self) -> Dict[str, Any]:
        """Initialize predefined resource permissions in the database"""
        try:
            # Check if permissions already exist
            existing_count = await self.resource_permissions_collection.count_documents({})
            if existing_count > 0:
                return {
                    "status": "info",
                    "message": f"Resource permissions already initialized ({existing_count} permissions exist)",
                    "permissions_created": 0
                }

            # Insert predefined permissions
            permissions_to_insert = []
            for permission_id, permission in PREDEFINED_RESOURCE_PERMISSIONS.items():
                permission_dict = permission.dict()
                permission_dict["created_at"] = datetime.utcnow()
                permission_dict["updated_at"] = datetime.utcnow()
                permissions_to_insert.append(permission_dict)

            if permissions_to_insert:
                result = await self.resource_permissions_collection.insert_many(permissions_to_insert)
                return {
                    "status": "success",
                    "message": f"Successfully initialized {len(result.inserted_ids)} resource permissions",
                    "permissions_created": len(result.inserted_ids)
                }
            else:
                return {
                    "status": "warning",
                    "message": "No predefined permissions to initialize",
                    "permissions_created": 0
                }

        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to initialize resource permissions: {str(e)}",
                "permissions_created": 0
            }

    async def get_all_resource_permissions(self) -> List[ResourcePermission]:
        """Get all resource permissions"""
        try:
            cursor = self.resource_permissions_collection.find({})
            permissions = []
            async for doc in cursor:
                permissions.append(ResourcePermission(**doc))
            return permissions
        except Exception as e:
            raise Exception(f"Failed to get resource permissions: {str(e)}")

    async def get_resource_permissions_by_category(self) -> Dict[str, List[ResourcePermission]]:
        """Get resource permissions grouped by category"""
        try:
            permissions = await self.get_all_resource_permissions()
            categorized = {}
            
            for permission in permissions:
                if permission.category not in categorized:
                    categorized[permission.category] = []
                categorized[permission.category].append(permission)
            
            return categorized
        except Exception as e:
            raise Exception(f"Failed to get categorized permissions: {str(e)}")

    async def get_resource_permission_by_id(self, permission_id: str) -> Optional[ResourcePermission]:
        """Get a specific resource permission by ID"""
        try:
            doc = await self.resource_permissions_collection.find_one({"id": permission_id})
            if doc:
                return ResourcePermission(**doc)
            return None
        except Exception as e:
            raise Exception(f"Failed to get resource permission: {str(e)}")

    async def assign_resource_permission_to_user(
        self, 
        user_id: str, 
        permission_id: str, 
        assigned_by: str,
        expires_at: Optional[datetime] = None,
        notes: Optional[str] = None
    ) -> UserResourceAssignment:
        """Assign a resource permission to a user"""
        try:
            # Check if permission exists
            permission = await self.get_resource_permission_by_id(permission_id)
            if not permission:
                raise Exception(f"Resource permission '{permission_id}' not found")

            # Check if assignment already exists and is active
            existing_assignment = await self.user_resource_assignments_collection.find_one({
                "user_id": user_id,
                "resource_permission_id": permission_id,
                "active": True
            })

            if existing_assignment:
                raise Exception(f"User already has active assignment for permission '{permission_id}'")

            # Create new assignment
            assignment = UserResourceAssignment(
                user_id=user_id,
                resource_permission_id=permission_id,
                assigned_at=datetime.utcnow(),
                assigned_by=assigned_by,
                expires_at=expires_at,
                notes=notes,
                active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )

            assignment_dict = assignment.dict()
            result = await self.user_resource_assignments_collection.insert_one(assignment_dict)
            assignment.id = str(result.inserted_id)

            return assignment

        except Exception as e:
            raise Exception(f"Failed to assign resource permission: {str(e)}")

    async def unassign_resource_permission_from_user(
        self, 
        user_id: str, 
        permission_id: str
    ) -> bool:
        """Unassign a resource permission from a user"""
        try:
            result = await self.user_resource_assignments_collection.update_many(
                {
                    "user_id": user_id,
                    "resource_permission_id": permission_id,
                    "active": True
                },
                {
                    "$set": {
                        "active": False,
                        "updated_at": datetime.utcnow()
                    }
                }
            )

            if result.modified_count > 0:
                return True
            else:
                raise Exception(f"No active assignment found for user '{user_id}' and permission '{permission_id}'")

        except Exception as e:
            raise Exception(f"Failed to unassign resource permission: {str(e)}")

    async def get_user_resource_assignments(self, user_id: str) -> List[UserResourceAssignment]:
        """Get all resource permission assignments for a user"""
        try:
            cursor = self.user_resource_assignments_collection.find({
                "user_id": user_id,
                "active": True
            })
            
            assignments = []
            async for doc in cursor:
                assignments.append(UserResourceAssignment(**doc))
            
            return assignments
        except Exception as e:
            raise Exception(f"Failed to get user resource assignments: {str(e)}")

    async def get_user_resource_permissions(self, user_id: str) -> List[ResourcePermission]:
        """Get all resource permissions assigned to a user"""
        try:
            assignments = await self.get_user_resource_assignments(user_id)
            permissions = []
            
            for assignment in assignments:
                permission = await self.get_resource_permission_by_id(assignment.resource_permission_id)
                if permission:
                    permissions.append(permission)
            
            return permissions
        except Exception as e:
            raise Exception(f"Failed to get user resource permissions: {str(e)}")

    async def evaluate_user_permission(
        self, 
        user_id: str, 
        action: Action, 
        resource: str,
        context: Optional[Dict[str, Any]] = None
    ) -> PermissionEvaluation:
        """Evaluate if a user has permission to perform an action on a resource"""
        try:
            # Get user's resource permissions
            user_permissions = await self.get_user_resource_permissions(user_id)
            
            if not user_permissions:
                return PermissionEvaluation(
                    allowed=False,
                    reason="User has no resource permissions assigned",
                    required_action=action,
                    required_resource=resource,
                    evaluated_policies=[]
                )

            # Check each permission for matching action and resource
            for permission in user_permissions:
                # Check if action is allowed
                if action in permission.actions:
                    # Check if resource matches (support wildcards)
                    if self._resource_matches(permission.resource, resource):
                        return PermissionEvaluation(
                            allowed=True,
                            reason=f"Permission granted by '{permission.id}'",
                            matched_statement=None,  # Not applicable for resource permissions
                            evaluated_policies=[permission.id],
                            required_action=action,
                            required_resource=resource
                        )

            return PermissionEvaluation(
                allowed=False,
                reason=f"Action '{action}' not allowed on resource '{resource}'",
                required_action=action,
                required_resource=resource,
                evaluated_policies=[p.id for p in user_permissions]
            )

        except Exception as e:
            return PermissionEvaluation(
                allowed=False,
                reason=f"Error evaluating permission: {str(e)}",
                required_action=action,
                required_resource=resource,
                evaluated_policies=[]
            )

    def _resource_matches(self, permission_resource: str, requested_resource: str) -> bool:
        """Check if a requested resource matches a permission resource pattern"""
        # Exact match
        if permission_resource == requested_resource:
            return True
        
        # Wildcard match (e.g., "user:*" matches "user:123")
        if permission_resource.endswith(":*"):
            base_resource = permission_resource[:-2]  # Remove ":*"
            if requested_resource.startswith(base_resource + ":"):
                return True
        
        return False

    async def get_all_user_assignments(self) -> List[UserResourceAssignment]:
        """Get all active user resource assignments"""
        try:
            cursor = self.user_resource_assignments_collection.find({"active": True})
            assignments = []
            async for doc in cursor:
                assignments.append(UserResourceAssignment(**doc))
            return assignments
        except Exception as e:
            raise Exception(f"Failed to get all user assignments: {str(e)}")

    async def migrate_from_policy_system(self) -> Dict[str, Any]:
        """Migrate existing policy assignments to resource-based permissions"""
        try:
            # This would be implemented to migrate existing policy assignments
            # For now, return a placeholder
            return {
                "status": "info",
                "message": "Migration from policy system not yet implemented",
                "migrated_count": 0
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Migration failed: {str(e)}",
                "migrated_count": 0
            } 