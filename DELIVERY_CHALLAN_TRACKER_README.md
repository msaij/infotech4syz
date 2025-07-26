# Delivery Challan Tracker System

A comprehensive MongoDB-based system for managing delivery challans with role-based access control, built with FastAPI backend and Next.js frontend.

## 🚀 Features

### Core Functionality
- **Auto-generated Delivery Challan Numbers**: Format MMYY000001 (e.g., 0725000001 for July 2025)
- **IST Timezone Support**: All dates and times use Indian Standard Time
- **Role-based Access Control**: Different permissions for different user roles
- **File Upload Support**: Signed acknowledgement copy storage
- **Invoice Linking**: Link multiple delivery challans to a single invoice
- **Advanced Filtering**: Filter by date range, client, and invoice status
- **CSRF Protection**: Secure state-changing operations

### User Roles & Permissions
- **Admin, CEO, DC_tracker_manager**: Full read/write access
- **Other Users**: Read-only access to delivery challans

## 📋 MongoDB Collections

### 1. `deliveryChallan_tracker`
```javascript
{
  _id: ObjectId,
  delivery_challan_number: String,        // Auto-generated (MMYY000001)
  delivery_challan_date: Date,            // IST date
  client_name: String,                    // From predefined list
  summary_of_delivery_challan: String,    // Description
  tool_used: String,                      // "Zoho" or "Excel"
  signed_acknowledgement_copy: String,    // File path/reference
  invoice_number: String,                 // Optional
  invoice_date: Date,                     // Optional
  invoice_submission_status: String,      // "Submitted" or "Not Submitted"
  created_at: Date,                       // IST timestamp
  updated_at: Date                        // IST timestamp
}
```

### 2. `users_4syz` (Existing)
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,                          // Must end with @4syz.com
  password: String,                       // Bcrypt hashed
  designation: String,                    // Role-based access
  date_of_joining: Date,
  date_of_relieving: Date,                // Optional
  active: Boolean,
  notes: String                           // Optional
}
```

## 🏗️ Architecture

### Backend (FastAPI)
```
backend/
├── auth/
│   ├── delivery_challan_auth.py         # Role-based authorization
│   ├── delivery_challan_routes.py       # API endpoints
│   └── csrf_utils.py                    # CSRF protection
├── models/foursyz/
│   └── delivery_challan_tracker.py      # Pydantic models
├── utils/
│   └── delivery_challan_utils.py        # Utility functions
└── main.py                              # FastAPI app
```

### Frontend (Next.js)
```
frontend/src/
├── app/foursyz/
│   └── delivery_challan_tracker/
│       └── page.tsx                     # Main page
├── utils/
│   └── deliveryChallanService.ts        # API service
└── config/
    └── env.ts                           # Environment config
```

## 🔧 API Endpoints

### Authentication & Authorization
- `GET /delivery-challan/csrf-token` - Get CSRF token for operations
- `GET /delivery-challan/clients` - Get available client list

### CRUD Operations
- `GET /delivery-challan/` - List delivery challans with filters
- `GET /delivery-challan/{id}` - Get specific delivery challan
- `POST /delivery-challan/` - Create new delivery challan
- `PUT /delivery-challan/{id}` - Update delivery challan
- `DELETE /delivery-challan/{id}` - Delete delivery challan

### File Operations
- `POST /delivery-challan/upload-file` - Upload signed acknowledgement copy

### Invoice Management
- `POST /delivery-challan/link-invoice` - Link multiple challans to invoice

## 🛡️ Security Features

### Authentication
- JWT tokens with access/refresh pattern
- Token blacklisting on logout
- Automatic token refresh

### Authorization
- Role-based access control
- CSRF protection for state-changing operations
- Input validation with Pydantic models

### Data Protection
- Password hashing with bcrypt
- File upload validation
- SQL injection prevention (MongoDB)

## 📅 Date & Time Handling

### IST Timezone
- All dates use Indian Standard Time (Asia/Kolkata)
- Delivery challan numbers reset monthly based on IST
- Date validation prevents future dates

### Auto-generated Numbers
- Format: `MMYY000001`
- Example: `0725000001` for July 2025, first challan
- Resets to `000001` at the start of each month

## 🎯 Business Logic

### Client Management
- Predefined client list (configurable)
- Dropdown selection for consistency
- Client validation on creation/update

### Tool Selection
- Limited to "Zoho" or "Excel"
- Dropdown selection for consistency
- Validation on creation/update

### Invoice Linking
- Multiple challans can link to single invoice
- Invoice number and date required for linking
- Bulk update functionality

### File Upload
- Supported formats: PDF, JPG, JPEG, PNG, DOC, DOCX
- Unique filename generation
- File path storage in database

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB
- FastAPI
- Next.js

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
```env
# Backend
MONGODB_URL=mongodb://localhost:27017/infotech4syz
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=15

# Frontend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## 📊 Usage Examples

### Creating a Delivery Challan
1. Login as admin/CEO/DC_tracker_manager
2. Navigate to Delivery Challan Tracker
3. Click "Create Challan"
4. Fill in required fields:
   - Delivery Challan Date (IST)
   - Client Name (from dropdown)
   - Summary
   - Tool Used (Zoho/Excel)
   - Upload signed copy (optional)
   - Invoice details (optional)
5. Submit form

### Linking to Invoice
1. Select multiple delivery challans
2. Click "Link to Invoice"
3. Enter invoice number and date
4. Submit to link all selected challans

### Filtering Records
- Date range filtering (DD/MM/YYYY format)
- Client name filtering
- Invoice submission status filtering
- Pagination support

## 🔍 Validation Rules

### Required Fields
- Delivery challan date
- Client name
- Summary
- Tool used
- Invoice submission status

### Validation Rules
- Dates cannot be in future
- Client must be from predefined list
- Tool must be "Zoho" or "Excel"
- Invoice status must be "Submitted" or "Not Submitted"
- Email domain must be @4syz.com

### File Upload Rules
- Maximum file size: 10MB
- Allowed extensions: .pdf, .jpg, .jpeg, .png, .doc, .docx
- Unique filename generation

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

### API Testing
```bash
# Test delivery challan creation
curl -X POST "http://localhost:8000/delivery-challan/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-CSRF-Token: YOUR_CSRF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "delivery_challan_date": "2025-01-15",
    "client_name": "Microsoft Corporation",
    "summary_of_delivery_challan": "Software delivery",
    "tool_used": "Zoho",
    "invoice_submission_status": "Not Submitted"
  }'
```

## 🔧 Configuration

### Client List
Edit `backend/auth/delivery_challan_routes.py` to modify the predefined client list:

```python
clients = [
    'Microsoft Corporation',
    'Apple Inc',
    'Google LLC',
    # Add more clients here
]
```

### File Upload Directory
Configure in `backend/auth/delivery_challan_routes.py`:

```python
UPLOAD_DIR = "uploads/delivery_challan"
```

### Date Format
All dates use DD/MM/YYYY format for display and YYYY-MM-DD for API calls.

## 🚨 Error Handling

### Common Errors
- **401 Unauthorized**: Invalid or expired token
- **403 Forbidden**: Insufficient permissions
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Resource not found
- **422 Validation Error**: Pydantic validation failed

### Error Response Format
```json
{
  "detail": "Error message description"
}
```

## 📈 Performance Considerations

### Database Optimization
- Indexed fields: delivery_challan_number, delivery_challan_date, client_name
- Pagination for large datasets
- Efficient date range queries

### Frontend Optimization
- Lazy loading for large tables
- Debounced search/filtering
- Optimistic updates for better UX

## 🔄 Future Enhancements

### Planned Features
- Email notifications for invoice submissions
- Export functionality (PDF/Excel)
- Advanced reporting and analytics
- Bulk operations for multiple challans
- Audit trail for all changes
- Mobile-responsive design improvements

### Scalability Improvements
- Redis caching for frequently accessed data
- CDN for file storage
- Database sharding for large datasets
- Microservices architecture

## 📞 Support

For technical support or questions about the delivery challan tracker system, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Technology Stack**: FastAPI, Next.js, MongoDB, TypeScript, Python 