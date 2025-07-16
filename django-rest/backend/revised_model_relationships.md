# Revised Model Relationships Diagram

## Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      User       │    │   UserProfile   │    │     Company     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id              │    │ id              │    │ id              │
│ username        │    │ user (1:1)      │    │ name            │
│ email           │    │ user_type       │    │ email_domain    │
│ first_name      │    │ role            │    │ short_name      │
│ last_name       │    │ company (FK)    │    │ address         │
│ is_active       │    │ client (FK)     │    │ phone           │
│ created_at      │    │ phone           │    │ website         │
│ updated_at      │    │ department      │    │ position        │
└─────────────────┘    │ is_active       │    │ is_active       │
         │              │ created_at      │    │ created_at      │
         │              │ updated_at      │    │ updated_at      │
         │              └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │     Client      │              │
         │              ├─────────────────┤              │
         │              │ id              │              │
         │              │ name            │              │
         │              │ email_domain    │              │
         │              │ short_name      │              │
         │              │ company (FK)    │              │
         │              │ address         │              │
         │              │ phone           │              │
         │              │ website         │              │
         │              │ contact_person  │              │
         │              │ is_active       │              │
         │              │ created_at      │              │
         │              │ updated_at      │              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       │                       │
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │     Product     │    │ DeliveryChallan │
         │              ├─────────────────┤    ├─────────────────┤
         │              │ id              │    │ id              │
         │              │ name            │    │ challan_number  │
         │              │ description     │    │ company (FK)    │
         │              │ sku             │    │ client (FK)     │
         │              │ price           │    │ product_name    │
         │              │ company (FK)    │    │ product_sku     │
         │              │ is_active       │    │ quantity        │
         │              │ created_at      │    │ unit_price      │
         │              │ updated_at      │    │ total_price     │
         │              └─────────────────┘    │ delivery_address│
         │                       │             │ delivery_date   │
         │                       │             │ status          │
         │                       │             │ created_by (FK) │
         │                       │             │ created_at      │
         │                       │             │ updated_at      │
         │                       │             └─────────────────┘
         │                       │                       │
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │ClientProductAssignment│         │
         │              ├─────────────────┤              │
         │              │ id              │              │
         │              │ client (FK)     │              │
         │              │ product (FK)    │              │
         │              │ is_active       │              │
         │              │ assigned_at     │              │
         │              │ assigned_by (FK)│              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │      Query      │              │
         │              ├─────────────────┤              │
         │              │ id              │              │
         │              │ title           │              │
         │              │ description     │              │
         │              │ query_type      │              │
         │              │ status          │              │
         │              │ priority        │              │
         │              │ company (FK)    │              │
         │              │ client (FK)     │              │
         │              │ created_by (FK) │              │
         │              │ assigned_to (FK)│              │
         │              │ created_at      │              │
         │              │ updated_at      │              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │    ContactUs    │              │
         │              ├─────────────────┤              │
         │              │ id              │              │
         │              │ name            │              │
         │              │ email           │              │
         │              │ subject         │              │
         │              │ message         │              │
         │              │ phone           │              │
         │              │ company_name    │              │
         │              │ is_read         │              │
         │              │ created_at      │              │
         │              └─────────────────┘              │
         │                                               │
         └───────────────────────────────────────────────┘
```

## User Roles and Permissions

### Role Hierarchy
```
Admin (admin)
├── Full CRUD access to all resources
├── Can manage users and roles
├── Can assign products to clients
└── Can view all data

Manager (manager)
├── CRUD access to assigned resources
├── Can manage regular users
├── Can view team data
└── Limited admin functions

Regular User (user)
├── Read/Write access to assigned resources
├── Can create and update own records
└── Limited view access

Viewer (viewer)
├── Read-only access to assigned resources
├── Cannot modify data
└── Limited view access
```

## API Access Control Matrix

### Company Users
| Resource | Admin | Manager | User | Viewer |
|----------|-------|---------|------|--------|
| Company Details | Full | Read | Read | Read |
| Client Management | Full | Full | Read | Read |
| User Management | Full | Full | Read | Read |
| Products | Full | Full | Read | Read |
| Delivery Challan | Full | Full | Full | Read |
| Queries | Full | Full | Full | Read |

### Client Users
| Resource | Admin | Manager | User | Viewer |
|----------|-------|---------|------|--------|
| Client Details | Full | Read | Read | Read |
| User Management | Full | Full | Read | Read |
| Assigned Products | Read | Read | Read | Read |
| Own Delivery Challan | Read | Read | Read | Read |
| Own Queries | Full | Full | Full | Read |

## API Routing Examples

### Company API Routes
```
/api/v1/company/
├── details/                    # Company management
│   ├── GET /                  # List companies (admin only)
│   ├── POST /                 # Create company (admin only)
│   └── {id}/
│       ├── GET /              # Get company details
│       ├── PUT /              # Update company (admin only)
│       └── DELETE /           # Delete company (admin only)
├── clients/                    # Client management
│   ├── GET /                  # List clients
│   ├── POST /                 # Create client
│   └── {id}/
│       ├── GET /              # Get client details
│       ├── PUT /              # Update client
│       └── DELETE /           # Delete client
├── users/                      # User management
│   ├── GET /                  # List company users
│   ├── POST /                 # Create company user
│   └── {id}/
│       ├── GET /              # Get user details
│       ├── PUT /              # Update user
│       └── DELETE /           # Delete user
├── products/                   # Product management
│   ├── GET /                  # List all products
│   ├── POST /                 # Create product
│   ├── {id}/
│   │   ├── GET /              # Get product details
│   │   ├── PUT /              # Update product
│   │   ├── DELETE /           # Delete product
│   │   └── assign/{client_id}/ # Assign product to client
│   └── assignments/           # Product assignments
├── delivery-challan/           # Delivery challan management
│   ├── GET /                  # List all delivery challans
│   ├── POST /                 # Create delivery challan
│   └── {id}/
│       ├── GET /              # Get delivery challan details
│       ├── PUT /              # Update delivery challan
│       ├── DELETE /           # Delete delivery challan
│       └── status/            # Update status
└── queries/                    # Query management
    ├── GET /                  # List company queries
    ├── POST /                 # Create company query
    └── {id}/
        ├── GET /              # Get query details
        ├── PUT /              # Update query
        └── DELETE /           # Delete query
```

### Client API Routes
```
/api/v1/client/
├── details/                    # Client details (read-only)
│   └── GET /                  # Get own client details
├── users/                      # User management
│   ├── GET /                  # List client users
│   ├── POST /                 # Create client user
│   └── {id}/
│       ├── GET /              # Get user details
│       ├── PUT /              # Update user
│       └── DELETE /           # Delete user
├── products/                   # Assigned products (read-only)
│   ├── GET /                  # List assigned products
│   └── {id}/
│       └── GET /              # Get product details
├── delivery-challan/           # Own delivery challans
│   ├── GET /                  # List own delivery challans
│   └── {id}/
│       ├── GET /              # Get delivery challan details
│       └── status/            # Update status (limited)
└── queries/                    # Query management
    ├── GET /                  # List own queries
    ├── POST /                 # Create query
    └── {id}/
        ├── GET /              # Get query details
        ├── PUT /              # Update query
        └── DELETE /           # Delete query
```

### Public API Routes
```
/api/v1/public/
└── contact/                    # Contact form
    └── POST /                 # Submit contact form
```

## Data Flow Examples

### Product Assignment Flow
```
1. Company Admin creates product
2. Company Admin assigns product to client
3. Client users can see assigned products
4. Delivery challan can reference product details
```

### Delivery Challan Access Flow
```
Company Users:
- Can see all delivery challans
- Can create, update, delete delivery challans
- Can update status

Client Users:
- Can only see their own delivery challans
- Can only update status (limited)
- Cannot create or delete delivery challans
```

### User Creation Flow
```
1. Admin provides email and user_type
2. System validates email domain:
   - Company users: email domain must match Company.email_domain
   - Client users: email domain must match Client.email_domain
3. UserProfile created with appropriate role and ownership
4. User can access resources based on role and ownership
```

## Key Improvements in This Structure

1. **Simplified Data Model**: Removed DeliveryChallanItem table, product details stored directly in DeliveryChallan
2. **Product Visibility Control**: ClientProductAssignment table controls which products clients can see
3. **Clear API Structure**: Separate routes for company, client, and public APIs
4. **Role-Based Access**: Admin, Manager, User, Viewer roles with proper permissions
5. **Same Table, Different Access**: Delivery challan table accessible by both user types with proper filtering
6. **Email Domain Security**: Users can only be added with matching email domains
7. **Scalable Architecture**: Easy to extend with new features and roles

## Benefits

1. **Security**: Email domain validation and role-based access control
2. **Scalability**: Modular structure with clear separation of concerns
3. **Maintainability**: Clear relationships and constraints
4. **Flexibility**: Easy to add new features and modify permissions
5. **User Experience**: Different API endpoints for different user types
6. **Data Integrity**: Foreign key constraints and validation rules 