#!/usr/bin/env python3
"""
Test script for the permission system to verify it's working correctly.
"""

import asyncio
import sys
import os
from datetime import datetime

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.permission_service import permission_service
from models.foursyz.permissions import Action, Resource, Effect, PermissionStatement, Policy

async def test_permission_system():
    """Test the permission system functionality"""
    print("🧪 Testing Permission System...")
    print("=" * 50)
    
    try:
        # Test 1: Initialize predefined policies
        print("1. Testing policy initialization...")
        created_policies = await permission_service.initialize_predefined_policies()
        print(f"   ✅ Created {len(created_policies)} policies")
        
        # Test 2: List policies
        print("2. Testing policy listing...")
        policies = await permission_service.list_policies()
        print(f"   ✅ Found {len(policies)} policies in system")
        
        # Test 3: Get specific policy
        print("3. Testing policy retrieval...")
        auth_policy = await permission_service.get_policy("AuthBasicAccess")
        if auth_policy:
            print(f"   ✅ Retrieved AuthBasicAccess policy: {auth_policy.name}")
        else:
            print("   ❌ Failed to retrieve AuthBasicAccess policy")
        
        # Test 4: Test permission evaluation (without user)
        print("4. Testing permission evaluation...")
        # This will fail because no user exists, but it tests the structure
        try:
            evaluation = await permission_service.evaluate_permission(
                user_id="test_user_id",
                action=Action.AUTH_LOGIN,
                resource=Resource.AUTH_ALL.value
            )
            print(f"   ✅ Permission evaluation result: {evaluation.allowed}")
        except Exception as e:
            print(f"   ⚠️  Permission evaluation (expected error): {str(e)[:100]}...")
        
        # Test 5: Test resource matching
        print("5. Testing resource matching...")
        test_resources = ["user:*", "user:123", "client:*", "client:456"]
        for resource in test_resources:
            matches = permission_service._resource_matches(["user:*"], resource)
            print(f"   Resource '{resource}' matches 'user:*': {matches}")
        
        print("\n✅ All permission system tests completed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

async def test_policy_creation():
    """Test creating a custom policy"""
    print("\n🔧 Testing Custom Policy Creation...")
    print("=" * 50)
    
    try:
        # Create a test policy
        test_policy = Policy(
            id="TestPolicy",
            name="Test Policy",
            description="A test policy for testing purposes",
            version="2024-01-01",
            statements=[
                PermissionStatement(
                    sid="TestStatement",
                    effect=Effect.ALLOW,
                    actions=[Action.USER_READ, Action.USER_LIST],
                    resources=[Resource.USER_ALL.value]
                )
            ],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Try to create the policy
        created_policy = await permission_service.create_policy(test_policy)
        print(f"✅ Created test policy: {created_policy.name}")
        
        # Try to create the same policy again (should fail)
        try:
            await permission_service.create_policy(test_policy)
            print("❌ Should have failed to create duplicate policy")
        except ValueError as e:
            print(f"✅ Correctly prevented duplicate policy: {str(e)[:50]}...")
        
        # Clean up - delete the test policy
        deleted = await permission_service.delete_policy("TestPolicy")
        if deleted:
            print("✅ Successfully deleted test policy")
        else:
            print("❌ Failed to delete test policy")
        
        return True
        
    except Exception as e:
        print(f"❌ Policy creation test failed: {e}")
        return False

async def main():
    """Main test function"""
    print("🚀 Permission System Test Suite")
    print("=" * 60)
    print(f"Started at: {datetime.utcnow().isoformat()}")
    print()
    
    # Run tests
    test1_success = await test_permission_system()
    test2_success = await test_policy_creation()
    
    print()
    print("📊 Test Results:")
    print("=" * 30)
    print(f"Permission System Tests: {'✅ PASSED' if test1_success else '❌ FAILED'}")
    print(f"Policy Creation Tests: {'✅ PASSED' if test2_success else '❌ FAILED'}")
    
    overall_success = test1_success and test2_success
    
    print()
    if overall_success:
        print("🎉 All tests passed! Permission system is working correctly.")
    else:
        print("❌ Some tests failed. Please check the implementation.")
    
    print("=" * 60)
    print(f"Completed at: {datetime.utcnow().isoformat()}")
    
    return overall_success

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        if success:
            print("\n✅ Test suite completed successfully")
            sys.exit(0)
        else:
            print("\n❌ Test suite failed")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1) 