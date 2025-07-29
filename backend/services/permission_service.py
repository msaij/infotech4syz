from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from database import get_async_database

from models.foursyz.permissions import (
    Policy, PolicyAssignment, PermissionEvaluation, PermissionStatement,
    Action, Effect, PREDEFINED_POLICIES, ROLE_POLICY_SETS
)

class PermissionService:
    """Service for managing permissions, policies, and policy assignments"""
    
    def __init__(self):
        self.db: Optional[AsyncIOMotorDatabase] = None
    
    async def _get_db(self) -> AsyncIOMotorDatabase:
        """Get database connection"""
        if self.db is None:
            self.db = await get_async_database()
        return self.db
    
    # ============================================================================
    # POLICY MANAGEMENT
    # ============================================================================
    
    async def create_policy(self, policy_data: Policy) -> Policy:
        """Create a new policy"""
        db = await self._get_db()
        
        # Check if policy already exists
        existing_policy = await db.policies.find_one({"id": policy_data.id})
        if existing_policy:
            raise ValueError(f"Policy with ID '{policy_data.id}' already exists")
        
        # Prepare policy document
        policy_doc = policy_data.model_dump()
        policy_doc["created_at"] = datetime.now(timezone.utc)
        policy_doc["updated_at"] = datetime.now(timezone.utc)
        
        # Insert policy
        result = await db.policies.insert_one(policy_doc)
        
        # Return created policy
        created_policy = await db.policies.find_one({"_id": result.inserted_id})
        return Policy(**created_policy)
    
    async def get_policy(self, policy_id: str) -> Optional[Policy]:
        """Get a policy by ID"""
        db = await self._get_db()
        
        policy_doc = await db.policies.find_one({"id": policy_id})
        if not policy_doc:
            return None
        
        return Policy(**policy_doc)
    
    async def update_policy(self, policy_id: str, policy_data: Dict[str, Any]) -> Optional[Policy]:
        """Update an existing policy"""
        db = await self._get_db()
        
        # Check if policy exists
        existing_policy = await db.policies.find_one({"id": policy_id})
        if not existing_policy:
            raise ValueError(f"Policy with ID '{policy_id}' not found")
        
        # Prepare update data
        update_data = {k: v for k, v in policy_data.items() if v is not None}
        update_data["updated_at"] = datetime.now(timezone.utc)
        
        # Update policy
        await db.policies.update_one(
            {"id": policy_id},
            {"$set": update_data}
        )
        
        # Return updated policy
        updated_policy = await db.policies.find_one({"id": policy_id})
        return Policy(**updated_policy)
    
    async def delete_policy(self, policy_id: str) -> bool:
        """Delete a policy"""
        db = await self._get_db()
        
        # Check if policy exists
        existing_policy = await db.policies.find_one({"id": policy_id})
        if not existing_policy:
            raise ValueError(f"Policy with ID '{policy_id}' not found")
        
        # Check if policy is assigned to any users
        assignments = await db.policy_assignments.find_one({"policy_id": policy_id})
        if assignments:
            raise ValueError(f"Cannot delete policy '{policy_id}' - it is assigned to users")
        
        # Delete policy
        result = await db.policies.delete_one({"id": policy_id})
        return result.deleted_count > 0
    
    async def list_policies(self) -> List[Policy]:
        """List all policies"""
        db = await self._get_db()
        
        policies = []
        cursor = db.policies.find({})
        
        async for policy_doc in cursor:
            policies.append(Policy(**policy_doc))
        
        return policies
    
    # ============================================================================
    # POLICY ASSIGNMENT MANAGEMENT
    # ============================================================================
    
    async def assign_policy_to_user(
        self, 
        user_id: str, 
        policy_id: str, 
        assigned_by: str,
        expires_at: Optional[datetime] = None,
        notes: Optional[str] = None
    ) -> PolicyAssignment:
        """Assign a policy to a user"""
        db = await self._get_db()
        
        # Check if policy exists
        policy = await db.policies.find_one({"id": policy_id})
        if not policy:
            raise ValueError(f"Policy with ID '{policy_id}' not found")
        
        # Check if assignment already exists
        existing_assignment = await db.policy_assignments.find_one({
            "user_id": user_id,
            "policy_id": policy_id
        })
        
        if existing_assignment:
            raise ValueError(f"Policy '{policy_id}' is already assigned to user '{user_id}'")
        
        # Create assignment
        assignment = PolicyAssignment(
            user_id=user_id,
            policy_id=policy_id,
            assigned_at=datetime.now(timezone.utc),
            assigned_by=assigned_by,
            expires_at=expires_at,
            notes=notes,
            active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        assignment_doc = assignment.model_dump()
        result = await db.policy_assignments.insert_one(assignment_doc)
        
        # Return created assignment
        created_assignment = await db.policy_assignments.find_one({"_id": result.inserted_id})
        return PolicyAssignment(**created_assignment)
    
    async def unassign_policy_from_user(self, user_id: str, policy_id: str) -> bool:
        """Unassign a policy from a user"""
        db = await self._get_db()
        
        result = await db.policy_assignments.delete_one({
            "user_id": user_id,
            "policy_id": policy_id
        })
        
        return result.deleted_count > 0
    
    async def get_user_policies(self, user_id: str) -> List[Policy]:
        """Get all policies assigned to a user"""
        db = await self._get_db()
        
        policies = []
        cursor = db.policy_assignments.find({
            "user_id": user_id,
            "active": True
        })
        
        async for assignment_doc in cursor:
            # Check if assignment has expired
            if assignment_doc.get("expires_at") and assignment_doc["expires_at"] < datetime.now(timezone.utc):
                continue
            
            # Get the policy
            policy_doc = await db.policies.find_one({"id": assignment_doc["policy_id"]})
            if policy_doc:
                policies.append(Policy(**policy_doc))
        
        return policies
    
    async def get_user_assignments(self, user_id: str) -> List[PolicyAssignment]:
        """Get all policy assignments for a specific user"""
        db = await self._get_db()
        
        # Find all assignments for the user
        assignment_docs = await db.policy_assignments.find({"user_id": user_id}).to_list(None)
        
        # Convert to PolicyAssignment objects
        assignments = []
        for doc in assignment_docs:
            # Convert ObjectId to string for JSON serialization
            doc["id"] = str(doc["_id"])
            assignments.append(PolicyAssignment(**doc))
        
        return assignments

    async def get_all_assignments(self) -> List[PolicyAssignment]:
        """Get all policy assignments"""
        db = await self._get_db()
        
        # Find all assignments
        assignment_docs = await db.policy_assignments.find({}).to_list(None)
        
        # Convert to PolicyAssignment objects
        assignments = []
        for doc in assignment_docs:
            # Convert ObjectId to string for JSON serialization
            doc["id"] = str(doc["_id"])
            assignments.append(PolicyAssignment(**doc))
        
        return assignments
    
    # ============================================================================
    # PERMISSION EVALUATION
    # ============================================================================
    
    async def evaluate_permission(
        self, 
        user_id: str, 
        action: Action, 
        resource: str, 
        context: Optional[Dict[str, Any]] = None
    ) -> PermissionEvaluation:
        """Evaluate if a user has permission for a specific action and resource"""
        db = await self._get_db()
        
        # Get user's policies
        user_policies = await self.get_user_policies(user_id)
        
        # Track matched policies and reasons
        matched_policies = []
        matched_statement = None
        evaluated_policies = [policy.name for policy in user_policies]
        
        # Check each policy's statements
        for policy in user_policies:
            for statement in policy.statements:
                # Check if action is allowed/denied
                action_allowed = action.value in [a.value for a in statement.actions]
                
                if action_allowed:
                    # Check if resource matches
                    resource_matches = self._resource_matches(
                        statement.resources,  # These are already strings
                        resource
                    )
                    
                    if resource_matches:
                        # Check conditions if any
                        conditions_met = self._evaluate_conditions(
                            statement.conditions or {}, 
                            context
                        )
                        
                        if conditions_met:
                            matched_policies.append(policy.id)
                            matched_statement = statement
                            
                            # If this is a deny statement, permission is denied
                            if statement.effect == Effect.DENY:
                                return PermissionEvaluation(
                                    allowed=False,
                                    reason=f"Explicitly denied by policy '{policy.id}'",
                                    matched_statement=matched_statement,
                                    evaluated_policies=evaluated_policies,
                                    required_action=action,
                                    required_resource=resource
                                )
        
        # If we have matched policies and no explicit denies, permission is allowed
        if matched_policies:
            return PermissionEvaluation(
                allowed=True,
                reason=f"Allowed by policies: {', '.join(matched_policies)}",
                matched_statement=matched_statement,
                evaluated_policies=evaluated_policies,
                required_action=action,
                required_resource=resource
            )
        else:
            return PermissionEvaluation(
                allowed=False,
                reason="No matching policies found",
                matched_statement=None,
                evaluated_policies=evaluated_policies,
                required_action=action,
                required_resource=resource
            )
    
    def _resource_matches(self, allowed_resources: List[str], requested_resource: str) -> bool:
        """Check if a requested resource matches any of the allowed resources"""
        for allowed_resource in allowed_resources:
            # Exact match
            if allowed_resource == requested_resource:
                return True
            
            # Wildcard match (e.g., "user:*" matches "user:123")
            if allowed_resource.endswith("*"):
                prefix = allowed_resource[:-1]
                if requested_resource.startswith(prefix):
                    return True
        
        return False
    
    def _evaluate_conditions(self, conditions: Dict[str, Any], context: Optional[Dict[str, Any]]) -> bool:
        """Evaluate conditions for a permission statement"""
        # For now, return True (no conditions)
        # This can be extended to support complex condition evaluation
        return True
    
    # ============================================================================
    # SYSTEM INITIALIZATION AND MIGRATION
    # ============================================================================
    
    async def initialize_predefined_policies(self) -> List[str]:
        """Initialize predefined policies in the database"""
        db = await self._get_db()
        
        created_policies = []
        
        for policy_id, policy_data in PREDEFINED_POLICIES.items():
            # Check if policy already exists
            existing_policy = await db.policies.find_one({"id": policy_id})
            
            if not existing_policy:
                # Prepare policy document
                policy_doc = policy_data.model_dump()
                policy_doc["created_at"] = datetime.now(timezone.utc)
                policy_doc["updated_at"] = datetime.now(timezone.utc)
                
                # Insert policy
                await db.policies.insert_one(policy_doc)
                created_policies.append(policy_id)
        
        return created_policies
    
    async def migrate_user_roles_to_policies(self) -> Dict[str, List[str]]:
        """Migrate existing user roles to policy assignments"""
        db = await self._get_db()
        
        migration_results = {}
        
        # Get all users
        cursor = db.users_4syz.find({})
        
        async for user_doc in cursor:
            user_id = str(user_doc["_id"])
            designation = user_doc.get("designation", "user").lower()
            
            # Map designation to policy set
            if designation == "ceo":
                policy_set = ROLE_POLICY_SETS["CEO"]
            elif designation == "admin":
                policy_set = ROLE_POLICY_SETS["Admin"]
            elif designation == "dc_tracker_manager":
                policy_set = ROLE_POLICY_SETS["DC_Tracker_Manager"]
            else:
                policy_set = ROLE_POLICY_SETS["Regular_User"]
            
            # Assign policies to user
            assigned_policies = []
            for policy_id in policy_set:
                try:
                    # Check if assignment already exists
                    existing_assignment = await db.policy_assignments.find_one({
                        "user_id": user_id,
                        "policy_id": policy_id
                    })
                    
                    if not existing_assignment:
                        assignment = PolicyAssignment(
                            user_id=user_id,
                            policy_id=policy_id,
                            assigned_at=datetime.now(timezone.utc),
                            assigned_by="system",  # System migration
                            active=True,
                            created_at=datetime.now(timezone.utc),
                            updated_at=datetime.now(timezone.utc)
                        )
                        
                        assignment_doc = assignment.model_dump()
                        await db.policy_assignments.insert_one(assignment_doc)
                        assigned_policies.append(policy_id)
                except Exception as e:
                    print(f"Failed to assign policy {policy_id} to user {user_id}: {e}")
            
            migration_results[user_id] = assigned_policies
        
        return migration_results
    
    # ============================================================================
    # UTILITY METHODS
    # ============================================================================
    
    async def get_policy_by_name(self, name: str) -> Optional[Policy]:
        """Get a policy by name"""
        db = await self._get_db()
        
        policy_doc = await db.policies.find_one({"name": name})
        if not policy_doc:
            return None
        
        return Policy(**policy_doc)
    
    async def get_users_with_policy(self, policy_id: str) -> List[str]:
        """Get all users assigned to a specific policy"""
        db = await self._get_db()
        
        user_ids = []
        cursor = db.policy_assignments.find({
            "policy_id": policy_id,
            "active": True
        })
        
        async for assignment_doc in cursor:
            # Check if assignment has expired
            if assignment_doc.get("expires_at") and assignment_doc["expires_at"] < datetime.now(timezone.utc):
                continue
            user_ids.append(assignment_doc["user_id"])
        
        return user_ids
    
    async def deactivate_expired_assignments(self) -> int:
        """Deactivate expired policy assignments"""
        db = await self._get_db()
        
        result = await db.policy_assignments.update_many(
            {
                "expires_at": {"$lt": datetime.now(timezone.utc)},
                "active": True
            },
            {
                "$set": {
                    "active": False,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        return result.modified_count

# Global permission service instance
permission_service = PermissionService() 