#!/usr/bin/env python3
"""
Test script to verify CEO permissions for client access
"""

import asyncio
import sys
import os

# Add the current directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_async_database
from services.resource_permission_service import ResourcePermissionService
from models.foursyz.permissions import Action, Resource

async def test_ceo_permissions():
    """Test CEO permissions for client access"""
    print("🔍 Testing CEO permissions for client access...")
    
    db = await get_async_database()
    service = ResourcePermissionService(db)
    
    try:
        # Get CEO user
        users_collection = db.users_4syz
        ceo_user = await users_collection.find_one({"designation": {"$regex": "ceo", "$options": "i"}})
        
        if not ceo_user:
            print("❌ No CEO user found")
            return
        
        user_id = str(ceo_user['_id'])
        username = ceo_user.get('username', 'Unknown')
        
        print(f"👑 Testing permissions for CEO: {username} (ID: {user_id})")
        
        # Test client permissions
        client_permissions = [
            (Action.CLIENT_CREATE, Resource.CLIENT_ALL, "Client Create"),
            (Action.CLIENT_READ, Resource.CLIENT_ALL, "Client Read"),
            (Action.CLIENT_UPDATE, Resource.CLIENT_ALL, "Client Update"),
            (Action.CLIENT_DELETE, Resource.CLIENT_ALL, "Client Delete"),
            (Action.CLIENT_LIST, Resource.CLIENT_ALL, "Client List"),
        ]
        
        print("\n📋 Testing client permissions:")
        for action, resource, description in client_permissions:
            try:
                evaluation = await service.evaluate_user_permission(
                    user_id=user_id,
                    action=action,
                    resource=resource
                )
                status = "✅ ALLOWED" if evaluation.allowed else "❌ DENIED"
                print(f"  {description}: {status}")
                if not evaluation.allowed:
                    print(f"    Reason: {evaluation.reason}")
            except Exception as e:
                print(f"  {description}: ❌ ERROR - {str(e)}")
        
        # Test user's assigned permissions
        print("\n📋 User's assigned resource permissions:")
        user_assignments = await service.get_user_resource_assignments(user_id)
        for assignment in user_assignments:
            if assignment.active:
                print(f"  ✅ {assignment.resource_permission_id} (Active)")
            else:
                print(f"  ⚠️  {assignment.resource_permission_id} (Inactive)")
        
        # Test getting user's resource permissions
        print("\n📋 User's resource permissions:")
        user_permissions = await service.get_user_resource_permissions(user_id)
        for permission in user_permissions:
            print(f"  📄 {permission.id}: {permission.description}")
            print(f"     Resource: {permission.resource}")
            print(f"     Actions: {[action.value for action in permission.actions]}")
            print(f"     Category: {permission.category}")
            print()
        
        # Test client collection access
        print("\n📋 Testing client collection access:")
        client_collection = db.client_details
        client_count = await client_collection.count_documents({})
        print(f"  Total clients in database: {client_count}")
        
        if client_count > 0:
            sample_client = await client_collection.find_one({})
            if sample_client:
                print(f"  Sample client: {sample_client.get('client_full_name', 'Unknown')}")
        
        print("\n✅ CEO permission test completed!")
        
    except Exception as e:
        print(f"❌ Error testing CEO permissions: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_ceo_permissions()) 