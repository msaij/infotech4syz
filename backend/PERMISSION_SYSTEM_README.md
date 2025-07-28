# 🔐 AWS/Azure-Style Permission System

This document describes the implementation of a granular, action-based permission system similar to AWS IAM and Azure RBAC for the Infotech4Syz application.

## 📋 Overview

The permission system replaces the previous role-based access control with a flexible policy-based system that allows fine-grained control over user permissions. Users are assigned policies that contain permission statements defining what actions they can perform on which resources.

## 🏗️ Architecture

### Core Components

1. **Permission Models** (`backend/models/foursyz/permissions.py`)
   - Defines all actions, resources, and policy structures
   - Contains predefined policies and role mappings

2. **Permission Service** (`backend/services/permission_service.py`)
   - Core business logic for permission management
   - Handles policy CRUD operations and permission evaluation

3. **Permission Dependencies** (`backend/auth/permission_dependencies.py`)
   - FastAPI dependencies for enforcing permissions in routes
   - Provides granular permission checking functions

4. **Permission Routes** (`backend/auth/permission_routes.py`)
   - API endpoints for managing policies and assignments
   - Includes migration and utility endpoints

## 🗄️ Database Collections

### New Collections

1. **`policies`** - Store policy definitions
2. **`policy_assignments`** - Store user-policy relationships

### Existing Collections (Updated)

1. **`users_4syz`** - User accounts (no changes)
2. **`client_details`** - Client information (no changes)
3. **`deliveryChallan_tracker`** - Delivery challans (no changes)

## 🚀 Quick Start

### 1. Initialize the Permission System

```bash
# Run the migration script to set up the system
python backend/scripts/migrate_to_permissions.py
```

### 2. Test the System

```bash
# Run tests to verify everything is working
python backend/test_permission_system.py
```

### 3. Start the Application

```bash
# Start the FastAPI server
python backend/main.py
```

## 📊 Predefined Policies

### Authentication Policies
- **`AuthBasicAccess`**: Basic auth operations (login, logout, refresh, me)
- **`UserManager`**: Full user management (create, read, update, delete, list)
- **`UserReadOnly`**: Read-only user access

### Client Management Policies
- **`ClientManager`**: Full client management (CEO level)
- **`ClientReadOnly`**: Read-only client access

### Delivery Challan Policies
- **`DeliveryChallanManager`**: Full delivery challan management
- **`DeliveryChallanCreator`**: Create and read, no delete
- **`DeliveryChallanViewer`**: Read-only access

### Permission Management Policies
- **`PermissionAdministrator`**: Full permission system control
- **`PermissionManager`**: Can assign policies but not create them

### Role-Based Policy Sets
- **`CEO`**: All policies (full access)
- **`Admin`**: User management + delivery challan management + permission management
- **`DC_Tracker_Manager`**: Delivery challan management only
- **`Regular_User`**: Read-only access to all resources

## 🔧 API Endpoints

### Policy Management

```http
# Create a new policy
POST /permissions/policies
{
  "id": "CustomPolicy",
  "name": "Custom Policy",
  "description": "A custom policy",
  "version": "2024-01-01",
  "statements": [
    {
      "sid": "CustomStatement",
      "effect": "Allow",
      "actions": ["user:read", "user:list"],
      "resources": ["user:*"]
    }
  ]
}

# List all policies
GET /permissions/policies

# Get a specific policy
GET /permissions/policies/{policy_id}

# Update a policy
PUT /permissions/policies/{policy_id}

# Delete a policy
DELETE /permissions/policies/{policy_id}
```

### Policy Assignment

```http
# Assign policy to user
POST /permissions/users/{user_id}/policies/{policy_id}
{
  "assigned_by": "admin_user_id",
  "expires_at": "2024-12-31T23:59:59Z",
  "notes": "Temporary assignment"
}

# Remove policy from user
DELETE /permissions/users/{user_id}/policies/{policy_id}

# Get user's policies
GET /permissions/users/{user_id}/policies
```

### Permission Evaluation

```http
# Evaluate permission
POST /permissions/evaluate
{
  "user_id": "user_id",
  "action": "delivery_challan:create",
  "resource": "delivery_challan:*",
  "context": {"project": "project_123"}
}
```

### Utility Endpoints

```http
# Initialize predefined policies
POST /permissions/initialize

# Migrate user roles to policies
POST /permissions/migrate

# Clean up expired assignments
POST /permissions/cleanup/expired

# Get system health
GET /permissions/health

# Get user permissions summary
GET /permissions/users/{user_id}/permissions

# Get users with specific policy
GET /permissions/policies/{policy_id}/users
```

## 🔒 Using Permissions in Routes

### Basic Permission Check

```python
from auth.permission_dependencies import require_delivery_challan_create

@router.post("/delivery-challan/")
async def create_delivery_challan(
    data: DeliveryChallanCreate,
    current_user: dict = Depends(require_delivery_challan_create())
):
    # User has permission to create delivery challans
    pass
```

### Multiple Permission Check

```python
from auth.permission_dependencies import require_any_permission
from models.foursyz.permissions import Action, Resource

@router.get("/reports/")
async def get_reports(
    current_user: dict = Depends(require_any_permission(
        actions=[Action.USER_READ, Action.CLIENT_READ],
        resource=Resource.USER_ALL.value
    ))
):
    # User has either user:read or client:read permission
    pass
```

### Custom Permission Check

```python
from auth.permission_dependencies import require_permission
from models.foursyz.permissions import Action, Resource

@router.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_permission(
        Action.USER_DELETE, 
        Resource.USER_ALL.value
    ))
):
    # User has user:delete permission
    pass
```

## 🎯 Available Actions

### Authentication Actions
- `auth:login` - User login
- `auth:logout` - User logout
- `auth:refresh` - Refresh access token
- `auth:me` - Get current user info

### User Management Actions
- `user:create` - Create new users
- `user:read` - Read user information
- `user:update` - Update user details
- `user:delete` - Delete users
- `user:list` - List all users

### Client Management Actions
- `client:create` - Create new clients
- `client:read` - Read client information
- `client:update` - Update client details
- `client:delete` - Delete clients
- `client:list` - List all clients

### Delivery Challan Actions
- `delivery_challan:create` - Create new delivery challans
- `delivery_challan:read` - Read delivery challan information
- `delivery_challan:update` - Update delivery challan details
- `delivery_challan:delete` - Delete delivery challans
- `delivery_challan:list` - List all delivery challans
- `delivery_challan:upload` - Upload files for delivery challans
- `delivery_challan:link_invoice` - Link challans to invoices

### Permission Management Actions
- `permissions:create` - Create new policies
- `permissions:read` - Read policy information
- `permissions:update` - Update policies
- `permissions:delete` - Delete policies
- `permissions:list` - List all policies
- `permissions:assign` - Assign policies to users
- `permissions:unassign` - Remove policy assignments
- `permissions:evaluate` - Evaluate user permissions

## 🗂️ Available Resources

- `auth:*` - Authentication resources
- `user:*` - User management resources
- `client:*` - Client management resources
- `delivery_challan:*` - Delivery challan resources
- `delivery_challan:file` - Delivery challan file resources
- `permissions:*` - Permission management resources

## 🔄 Migration from Role-Based System

### Automatic Migration

The migration script automatically maps existing user roles to appropriate policies:

- **CEO** users → `CEO` policy set
- **Admin** users → `Admin` policy set
- **DC_Tracker_Manager** users → `DC_Tracker_Manager` policy set
- **Other** users → `Regular_User` policy set

### Manual Migration

If you need to manually assign policies:

```python
from services.permission_service import permission_service

# Assign a policy to a user
await permission_service.assign_policy_to_user(
    user_id="user_id",
    policy_id="DeliveryChallanManager",
    assigned_by="admin_user_id"
)

# Remove a policy from a user
await permission_service.unassign_policy_from_user(
    user_id="user_id",
    policy_id="DeliveryChallanManager"
)
```

## 🧪 Testing

### Run Tests

```bash
# Test the permission system
python backend/test_permission_system.py

# Test specific functionality
python -c "
import asyncio
from services.permission_service import permission_service
from models.foursyz.permissions import Action, Resource

async def test():
    evaluation = await permission_service.evaluate_permission(
        user_id='test_user',
        action=Action.USER_READ,
        resource=Resource.USER_ALL.value
    )
    print(f'Permission allowed: {evaluation.allowed}')

asyncio.run(test())
"
```

### Test API Endpoints

```bash
# Test policy creation
curl -X POST "http://localhost:8000/permissions/policies" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "TestPolicy",
    "name": "Test Policy",
    "description": "Test",
    "version": "2024-01-01",
    "statements": [{
      "sid": "Test",
      "effect": "Allow",
      "actions": ["user:read"],
      "resources": ["user:*"]
    }]
  }'

# Test permission evaluation
curl -X POST "http://localhost:8000/permissions/evaluate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_id",
    "action": "user:read",
    "resource": "user:*"
  }'
```

## 🔧 Configuration

### Environment Variables

No additional environment variables are required. The permission system uses the existing database configuration.

### Database Indexes

Recommended indexes for performance:

```javascript
// policies collection
db.policies.createIndex({"id": 1}, {unique: true})
db.policies.createIndex({"name": 1})

// policy_assignments collection
db.policy_assignments.createIndex({"user_id": 1, "policy_id": 1}, {unique: true})
db.policy_assignments.createIndex({"user_id": 1})
db.policy_assignments.createIndex({"policy_id": 1})
db.policy_assignments.createIndex({"expires_at": 1})
```

## 🚨 Error Handling

### Permission Denied Response

When a user lacks permission, the system returns a detailed error:

```json
{
  "detail": {
    "message": "Access denied",
    "detail": "Insufficient permissions for this action",
    "required_action": "delivery_challan:create",
    "required_resource": "delivery_challan:*",
    "user_permissions": ["delivery_challan:read", "delivery_challan:list"],
    "reason": "Policy DeliveryChallanViewer - DeliveryChallanRead"
  }
}
```

### Common Error Codes

- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User lacks required permission
- `404 Not Found`: Policy or user not found
- `400 Bad Request`: Invalid policy data
- `500 Internal Server Error`: System error

## 🔍 Monitoring and Debugging

### Health Check

```bash
curl "http://localhost:8000/permissions/health"
```

### User Permissions Summary

```bash
curl "http://localhost:8000/permissions/users/{user_id}/permissions"
```

### System Status

```bash
# Check database collections
mongo your_database --eval "
db.policies.countDocuments()
db.policy_assignments.countDocuments()
db.users_4syz.countDocuments()
"
```

## 📈 Performance Considerations

### Caching

The permission system is designed for performance:

- User policies are cached during evaluation
- Database queries are optimized with indexes
- Permission results can be cached for frequently accessed resources

### Optimization Tips

1. **Use specific resources** instead of wildcards when possible
2. **Group related permissions** in single policies
3. **Regularly clean up** expired assignments
4. **Monitor permission evaluation** performance

## 🔐 Security Best Practices

1. **Principle of Least Privilege**: Only grant necessary permissions
2. **Regular Audits**: Review user permissions periodically
3. **Temporary Access**: Use expiration dates for temporary assignments
4. **Policy Validation**: Validate policy statements before creation
5. **Logging**: Monitor permission evaluations for security events

## 🤝 Contributing

When adding new features:

1. **Add new actions** to the `Action` enum
2. **Add new resources** to the `Resource` enum
3. **Create permission dependencies** for new actions
4. **Update route dependencies** to use new permissions
5. **Add tests** for new functionality

## 📚 Additional Resources

- [AWS IAM Documentation](https://docs.aws.amazon.com/iam/)
- [Azure RBAC Documentation](https://docs.microsoft.com/en-us/azure/role-based-access-control/)
- [FastAPI Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/)

## 🆘 Troubleshooting

### Common Issues

1. **Permission denied errors**: Check user's assigned policies
2. **Policy not found**: Verify policy exists in database
3. **Migration failures**: Check database connectivity and user permissions
4. **Performance issues**: Review database indexes and caching

### Debug Commands

```bash
# Check user's policies
curl "http://localhost:8000/permissions/users/{user_id}/policies"

# Evaluate specific permission
curl -X POST "http://localhost:8000/permissions/evaluate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_id", "action": "action:name", "resource": "resource:*"}'

# Check system health
curl "http://localhost:8000/permissions/health"
```

---

For additional support, please refer to the main project documentation or contact the development team. 