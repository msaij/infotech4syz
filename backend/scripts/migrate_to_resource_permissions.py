#!/usr/bin/env python3
"""
Migration script to transition from policy-based permissions to resource-based permissions.
This script will:
1. Initialize resource permissions in the database
2. Create CEO role with all permissions
3. Migrate existing users to the new system
4. Clean up old policy-based data
"""

import asyncio
import sys
import os
from datetime import datetime
from bson import ObjectId

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_async_database
from services.resource_permission_service import ResourcePermissionService
from models.foursyz.permissions import PREDEFINED_RESOURCE_PERMISSIONS

async def migrate_to_resource_permissions():
    """Main migration function"""
    print("🚀 Starting migration to resource-based permissions...")
    
    db = await get_async_database()
    service = ResourcePermissionService(db)
    
    try:
        # Step 1: Initialize resource permissions
        print("📋 Step 1: Initializing resource permissions...")
        init_result = await service.initialize_resource_permissions()
        print(f"✅ Resource permissions initialized: {init_result}")
        
        # Step 2: Get all users
        print("👥 Step 2: Getting all users...")
        users_collection = db.users_4syz
        users = await users_collection.find({}).to_list(None)
        print(f"✅ Found {len(users)} users")
        
        # Step 3: Create CEO role with all permissions
        print("👑 Step 3: Creating CEO role with all permissions...")
        ceo_users = [user for user in users if user.get('designation', '').lower() == 'ceo']
        
        if ceo_users:
            print(f"✅ Found {len(ceo_users)} CEO users")
            
            # Get all resource permission IDs
            all_permissions = await service.get_all_resource_permissions()
            permission_ids = [perm.id for perm in all_permissions]
            
            # Assign all permissions to each CEO user
            for ceo_user in ceo_users:
                user_id = str(ceo_user['_id'])
                print(f"👑 Assigning all permissions to CEO: {ceo_user.get('username', 'Unknown')}")
                
                for permission_id in permission_ids:
                    try:
                        assignment = await service.assign_resource_permission_to_user(
                            user_id=user_id,
                            permission_id=permission_id,
                            assigned_by=user_id,  # Self-assigned for CEO
                            expires_at=None,  # No expiration for CEO
                            notes="CEO role - full system access"
                        )
                        print(f"  ✅ Assigned {permission_id}")
                    except Exception as e:
                        print(f"  ⚠️  Failed to assign {permission_id}: {str(e)}")
        else:
            print("⚠️  No CEO users found")
        
        # Step 4: Create role-based assignments for other users
        print("👥 Step 4: Creating role-based assignments for other users...")
        
        # Define role mappings to resource permissions
        role_permission_mappings = {
            "Admin": [
                "auth_basic_access",
                "user_full_access", 
                "client_read_only",
                "delivery_challan_full_access",
                "permissions_assign_only"
            ],
            "DC_Tracker_Manager": [
                "auth_basic_access",
                "user_read_only",
                "client_read_only", 
                "delivery_challan_full_access"
            ],
            "Regular_User": [
                "auth_basic_access",
                "user_read_only",
                "client_read_only",
                "delivery_challan_read_only"
            ]
        }
        
        # Assign permissions based on designation
        for user in users:
            if user.get('designation', '').lower() == 'ceo':
                continue  # Already handled above
                
            designation = user.get('designation', 'Regular_User')
            user_id = str(user['_id'])
            
            # Find matching role
            matching_role = None
            for role, perms in role_permission_mappings.items():
                if role.lower() in designation.lower():
                    matching_role = role
                    break
            
            if not matching_role:
                matching_role = "Regular_User"  # Default
                
            print(f"👤 Assigning {matching_role} permissions to {user.get('username', 'Unknown')} ({designation})")
            
            for permission_id in role_permission_mappings[matching_role]:
                try:
                    assignment = await service.assign_resource_permission_to_user(
                        user_id=user_id,
                        permission_id=permission_id,
                        assigned_by=user_id,  # Self-assigned for migration
                        expires_at=None,
                        notes=f"Migration: {matching_role} role assignment"
                    )
                    print(f"  ✅ Assigned {permission_id}")
                except Exception as e:
                    print(f"  ⚠️  Failed to assign {permission_id}: {str(e)}")
        
        # Step 5: Clean up old policy-based data
        print("🧹 Step 5: Cleaning up old policy-based data...")
        
        # Drop old collections
        old_collections = ['policies', 'policy_assignments']
        for collection_name in old_collections:
            try:
                await db.drop_collection(collection_name)
                print(f"✅ Dropped collection: {collection_name}")
            except Exception as e:
                print(f"⚠️  Failed to drop {collection_name}: {str(e)}")
        
        # Step 6: Verify migration
        print("🔍 Step 6: Verifying migration...")
        
        # Count resource permissions
        resource_permissions = await service.get_all_resource_permissions()
        print(f"✅ Resource permissions: {len(resource_permissions)}")
        
        # Count user assignments
        assignments_collection = db.user_resource_assignments
        total_assignments = await assignments_collection.count_documents({})
        print(f"✅ Total user assignments: {total_assignments}")
        
        # Count active assignments
        active_assignments = await assignments_collection.count_documents({"active": True})
        print(f"✅ Active assignments: {active_assignments}")
        
        print("🎉 Migration completed successfully!")
        
        # Print summary
        print("\n📊 Migration Summary:")
        print(f"  • Resource permissions created: {len(resource_permissions)}")
        print(f"  • Users processed: {len(users)}")
        print(f"  • CEO users: {len(ceo_users)}")
        print(f"  • Total assignments: {total_assignments}")
        print(f"  • Active assignments: {active_assignments}")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        return False

async def verify_ceo_permissions():
    """Verify that CEO users have all necessary permissions"""
    print("\n🔍 Verifying CEO permissions...")
    
    db = await get_async_database()
    service = ResourcePermissionService(db)
    
    # Get CEO users
    users_collection = db.users_4syz
    ceo_users = await users_collection.find({"designation": {"$regex": "ceo", "$options": "i"}}).to_list(None)
    
    if not ceo_users:
        print("⚠️  No CEO users found")
        return
    
    print(f"👑 Found {len(ceo_users)} CEO users")
    
    # Get all available permissions
    all_permissions = await service.get_all_resource_permissions()
    all_permission_ids = {perm.id for perm in all_permissions}
    
    for ceo_user in ceo_users:
        user_id = str(ceo_user['_id'])
        username = ceo_user.get('username', 'Unknown')
        
        print(f"\n👑 Checking permissions for CEO: {username}")
        
        # Get user's assigned permissions
        user_assignments = await service.get_user_resource_assignments(user_id)
        user_permission_ids = {assignment.resource_permission_id for assignment in user_assignments if assignment.active}
        
        # Check for missing permissions
        missing_permissions = all_permission_ids - user_permission_ids
        
        if missing_permissions:
            print(f"  ❌ Missing permissions: {missing_permissions}")
            
            # Assign missing permissions
            print(f"  🔧 Assigning missing permissions...")
            for permission_id in missing_permissions:
                try:
                    await service.assign_resource_permission_to_user(
                        user_id=user_id,
                        permission_id=permission_id,
                        assigned_by=user_id,
                        expires_at=None,
                        notes="CEO verification - missing permission"
                    )
                    print(f"    ✅ Assigned {permission_id}")
                except Exception as e:
                    print(f"    ❌ Failed to assign {permission_id}: {str(e)}")
        else:
            print(f"  ✅ All permissions assigned correctly")

if __name__ == "__main__":
    async def main():
        success = await migrate_to_resource_permissions()
        if success:
            await verify_ceo_permissions()
        
        # Close database connection
        db = await get_async_database()
        db.client.close()
    
    asyncio.run(main()) 