#!/usr/bin/env python3
"""
Migration script to initialize the permission system and migrate existing user roles
to the new AWS/Azure-style action-based permission system.

This script will:
1. Initialize predefined policies in the database
2. Migrate existing user roles to policy assignments
3. Verify the migration was successful

Usage:
    python backend/scripts/migrate_to_permissions.py
"""

import asyncio
import sys
import os
from datetime import datetime, timezone

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.permission_service import permission_service
from models.foursyz.permissions import PREDEFINED_POLICIES, ROLE_POLICY_SETS

async def initialize_permission_system():
    """Initialize the permission system with predefined policies"""
    print("🔐 Initializing Permission System...")
    print("=" * 50)
    
    try:
        # Initialize predefined policies
        created_policies = await permission_service.initialize_predefined_policies()
        
        if created_policies:
            print(f"✅ Created {len(created_policies)} predefined policies:")
            for policy_id in created_policies:
                print(f"   - {policy_id}")
        else:
            print("ℹ️  All predefined policies already exist")
        
        print()
        return True
        
    except Exception as e:
        print(f"❌ Failed to initialize permission system: {e}")
        return False

async def migrate_user_roles():
    """Migrate existing user roles to policy assignments"""
    print("🔄 Migrating User Roles to Policies...")
    print("=" * 50)
    
    try:
        # Migrate user roles to policy assignments
        migration_results = await permission_service.migrate_user_roles_to_policies()
        
        total_users = len(migration_results)
        total_assignments = sum(len(assignments) for assignments in migration_results.values())
        
        print(f"✅ Migration completed for {total_users} users with {total_assignments} total assignments")
        print()
        
        # Show migration details
        for user_id, assigned_policies in migration_results.items():
            if assigned_policies:
                print(f"👤 User {user_id}:")
                for policy_id in assigned_policies:
                    print(f"   - Assigned: {policy_id}")
                print()
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to migrate user roles: {e}")
        return False

async def verify_migration():
    """Verify that the migration was successful"""
    print("🔍 Verifying Migration...")
    print("=" * 50)
    
    try:
        # Get all policies
        policies = await permission_service.list_policies()
        print(f"📋 Total policies in system: {len(policies)}")
        
        # Get all policy assignments
        db = await permission_service._get_db()
        assignments = await db.policy_assignments.count_documents({})
        print(f"🔗 Total policy assignments: {assignments}")
        
        # Check if all predefined policies exist
        predefined_policy_ids = set(PREDEFINED_POLICIES.keys())
        existing_policy_ids = {policy.id for policy in policies}
        
        missing_policies = predefined_policy_ids - existing_policy_ids
        if missing_policies:
            print(f"⚠️  Missing predefined policies: {missing_policies}")
        else:
            print("✅ All predefined policies are present")
        
        print()
        return True
        
    except Exception as e:
        print(f"❌ Failed to verify migration: {e}")
        return False

async def cleanup_expired_assignments():
    """Clean up expired policy assignments"""
    print("🧹 Cleaning Up Expired Assignments...")
    print("=" * 50)
    
    try:
        cleaned_count = await permission_service.deactivate_expired_assignments()
        print(f"✅ Deactivated {cleaned_count} expired assignments")
        print()
        return True
        
    except Exception as e:
        print(f"❌ Failed to cleanup expired assignments: {e}")
        return False

async def show_system_status():
    """Show the current status of the permission system"""
    print("📊 System Status...")
    print("=" * 50)
    
    try:
        db = await permission_service._get_db()
        
        # Count policies
        policy_count = await db.policies.count_documents({})
        print(f"📋 Total policies: {policy_count}")
        
        # Count assignments
        assignment_count = await db.policy_assignments.count_documents({})
        print(f"🔗 Total assignments: {assignment_count}")
        
        # Count active assignments
        active_assignment_count = await db.policy_assignments.count_documents({"active": True})
        print(f"✅ Active assignments: {active_assignment_count}")
        
        # Count expired assignments
        expired_assignment_count = await db.policy_assignments.count_documents({
            "expires_at": {"$lt": datetime.now(timezone.utc)},
            "active": True
        })
        print(f"⏰ Expired assignments: {expired_assignment_count}")
        
        print()
        return True
        
    except Exception as e:
        print(f"❌ Failed to show system status: {e}")
        return False

async def main():
    """Main migration function"""
    print("🚀 Permission System Migration")
    print("=" * 60)
    print(f"Started at: {datetime.now(timezone.utc).isoformat()}")
    print()
    
    try:
        # Step 1: Initialize permission system
        if not await initialize_permission_system():
            print("❌ Migration failed at initialization step")
            return
        
        # Step 2: Migrate user roles
        if not await migrate_user_roles():
            print("❌ Migration failed at role migration step")
            return
        
        # Step 3: Verify migration
        if not await verify_migration():
            print("❌ Migration verification failed")
            return
        
        # Step 4: Cleanup expired assignments
        await cleanup_expired_assignments()
        
        # Step 5: Show system status
        await show_system_status()
        
        print("✅ Migration completed successfully!")
        print(f"Completed at: {datetime.now(timezone.utc).isoformat()}")
        
    except Exception as e:
        print(f"❌ Migration script failed: {e}")
        return

if __name__ == "__main__":
    asyncio.run(main()) 