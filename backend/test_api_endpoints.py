#!/usr/bin/env python3
"""
Test script to check API endpoints functionality
"""

import asyncio
import sys
import os
import json
from datetime import datetime

# Add the current directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_async_database
from services.resource_permission_service import ResourcePermissionService
from models.foursyz.permissions import Action, Resource

async def test_api_endpoints():
    """Test API endpoints functionality"""
    print("🔍 Testing API endpoints...")
    
    db = await get_async_database()
    service = ResourcePermissionService(db)
    
    try:
        # Test 1: Check if resource permissions exist
        print("\n📋 Test 1: Checking resource permissions...")
        permissions = await service.get_all_resource_permissions()
        print(f"✅ Found {len(permissions)} resource permissions")
        
        # Test 2: Check if CEO user exists
        print("\n👑 Test 2: Checking CEO user...")
        users_collection = db.users_4syz
        ceo_user = await users_collection.find_one({"designation": {"$regex": "ceo", "$options": "i"}})
        
        if not ceo_user:
            print("❌ No CEO user found")
            return
        
        user_id = str(ceo_user['_id'])
        username = ceo_user.get('username', 'Unknown')
        print(f"✅ CEO user found: {username} (ID: {user_id})")
        
        # Test 3: Check CEO permissions
        print("\n🔐 Test 3: Checking CEO permissions...")
        client_read_evaluation = await service.evaluate_user_permission(
            user_id=user_id,
            action=Action.CLIENT_READ,
            resource=Resource.CLIENT_ALL
        )
        print(f"✅ Client READ permission: {'ALLOWED' if client_read_evaluation.allowed else 'DENIED'}")
        if not client_read_evaluation.allowed:
            print(f"   Reason: {client_read_evaluation.reason}")
        
        # Test 4: Check client collection
        print("\n📊 Test 4: Checking client collection...")
        client_collection = db.client_details
        client_count = await client_collection.count_documents({})
        print(f"✅ Client collection has {client_count} documents")
        
        if client_count > 0:
            sample_client = await client_collection.find_one({})
            if sample_client:
                print(f"   Sample client: {sample_client.get('client_full_name', 'Unknown')}")
        
        # Test 5: Check user assignments
        print("\n📋 Test 5: Checking user assignments...")
        user_assignments = await service.get_user_resource_assignments(user_id)
        print(f"✅ User has {len(user_assignments)} assignments")
        
        active_assignments = [a for a in user_assignments if a.active]
        print(f"   Active assignments: {len(active_assignments)}")
        
        for assignment in active_assignments:
            print(f"   - {assignment.resource_permission_id}")
        
        # Test 6: Check if client permissions are assigned
        print("\n🔍 Test 6: Checking client permissions...")
        client_permissions = [p for p in permissions if 'client' in p.id.lower()]
        print(f"✅ Found {len(client_permissions)} client-related permissions:")
        
        for perm in client_permissions:
            print(f"   - {perm.id}: {perm.description}")
        
        # Test 7: Check if CEO has client permissions assigned
        print("\n👑 Test 7: Checking CEO client permissions...")
        ceo_client_assignments = [a for a in active_assignments if 'client' in a.resource_permission_id.lower()]
        print(f"✅ CEO has {len(ceo_client_assignments)} client permissions assigned:")
        
        for assignment in ceo_client_assignments:
            print(f"   - {assignment.resource_permission_id}")
        
        # Test 8: Test all client actions
        print("\n🎯 Test 8: Testing all client actions...")
        client_actions = [
            (Action.CLIENT_CREATE, "CREATE"),
            (Action.CLIENT_READ, "READ"),
            (Action.CLIENT_UPDATE, "UPDATE"),
            (Action.CLIENT_DELETE, "DELETE"),
            (Action.CLIENT_LIST, "LIST"),
        ]
        
        for action, action_name in client_actions:
            try:
                evaluation = await service.evaluate_user_permission(
                    user_id=user_id,
                    action=action,
                    resource=Resource.CLIENT_ALL
                )
                status = "✅ ALLOWED" if evaluation.allowed else "❌ DENIED"
                print(f"   Client {action_name}: {status}")
                if not evaluation.allowed:
                    print(f"     Reason: {evaluation.reason}")
            except Exception as e:
                print(f"   Client {action_name}: ❌ ERROR - {str(e)}")
        
        print("\n✅ API endpoint tests completed!")
        
    except Exception as e:
        print(f"❌ Error testing API endpoints: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_api_endpoints()) 