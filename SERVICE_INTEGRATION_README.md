# Service Integration Guide: Django + FastAPI + Next.js

This document explains the improved integration between Django REST API, FastAPI SSE Service, and Next.js Frontend for the 4syz delivery challan system.

## 🏗️ Architecture Overview

```
┌─────────────────┐    JWT Auth    ┌─────────────────┐
│   Next.js       │◄──────────────►│   Django REST   │
│   Frontend      │                │   API (8000)    │
│   (3000)        │                │                 │
└─────────────────┘                └─────────────────┘
         │                                   │
         │ SSE Connection                    │ Database
         │                                  │
         ▼                                  ▼
┌─────────────────┐                ┌─────────────────┐
│   FastAPI       │                │   MySQL         │
│   SSE Service   │                │   Database      │
│   (8001)        │                │                 │
└─────────────────┘                └─────────────────┘
```

## 🔧 Service Responsibilities

### Django REST API (Port 8000)
- **Primary API**: CRUD operations for all business entities
- **Authentication**: JWT token generation and validation
- **Authorization**: Role-based access control
- **Database**: Primary data storage and management
- **Business Logic**: Core application logic and validation

### FastAPI SSE Service (Port 8001)
- **Real-time Updates**: Server-Sent Events for live data
- **Performance**: High-throughput data streaming
- **Caching**: Intelligent caching with change detection
- **Monitoring**: Health checks and performance metrics
- **Integration**: JWT validation with Django backend

### Next.js Frontend (Port 3000)
- **User Interface**: React-based responsive UI
- **State Management**: Client-side state and caching
- **Service Integration**: Unified API client for both services
- **Real-time UI**: SSE connection for live updates
- **PWA**: Progressive Web App capabilities

## 🔐 Authentication Flow

### JWT Token Flow
1. **Login**: User authenticates with Django (`/api/token/`)
2. **Token Storage**: Access and refresh tokens stored in localStorage
3. **API Calls**: Frontend includes JWT in Authorization header
4. **Token Refresh**: Automatic refresh when access token expires
5. **Service Validation**: FastAPI validates JWT with Django secret key

```typescript
// Frontend authentication flow
const login = async (username: string, password: string) => {
  const response = await fetch(`${DJANGO_API_URL}/api/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  if (response.ok) {
    const { access, refresh } = await response.json();
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    return true;
  }
  return false;
};
```

### Service-to-Service Authentication
```python
# FastAPI validates JWT tokens from Django
class DjangoJWTValidator:
    def __init__(self):
        self.secret_key = SECURITY_CONFIG['jwt_secret_key']
        self.algorithm = SECURITY_CONFIG['jwt_algorithm']
    
    def validate_token(self, token: str) -> dict:
        return jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
```

## 📡 Real-time Communication

### Server-Sent Events (SSE)
```typescript
// Frontend SSE connection
const eventSource = new EventSource(`${FASTAPI_URL}/api/v1/sse/delivery-challan`);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Update UI with real-time data
  setDeliveryChallans(data);
};
```

### FastAPI SSE Implementation
```python
@router.get("/sse/delivery-challan")
async def sse_endpoint():
    async def event_generator():
        while True:
            payload = await get_challan_data()
            if cache.has_changed(payload):
                yield f"data: {json.dumps(payload)}\n\n"
            await asyncio.sleep(5)
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

## 🛠️ Service Integration Utilities

### Frontend Service Clients
```typescript
// Unified service client
export function useServiceClients() {
  const { authFetch, fastapiFetch } = useAuth();
  
  return {
    django: new DjangoAPIClient(authFetch),
    fastapi: new FastAPIClient(fastapiFetch),
  };
}

// Usage example
const { django, fastapi } = useServiceClients();

// Django API call
const challans = await django.getDeliveryChallans();

// FastAPI SSE connection
const sse = fastapi.createSSEConnection();
```

### Error Handling
```typescript
export class ServiceError extends Error {
  constructor(
    message: string,
    public status: number,
    public service: 'django' | 'fastapi',
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// Usage
try {
  const response = await django.getDeliveryChallans();
  return await handleResponse(response, 'django', '/delivery-challan/');
} catch (error) {
  handleServiceError(error, 'django', '/delivery-challan/');
}
```

## 🔧 Configuration Management

### Unified Environment Configuration
```bash
# shared-config/env.example
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=4syz

DJANGO_PORT=8000
FASTAPI_PORT=8001
NEXTJS_PORT=3000

JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_LIFETIME=5
JWT_REFRESH_TOKEN_LIFETIME=1

ENABLE_SSE=True
ENABLE_REAL_TIME_UPDATES=True
```

### Service-Specific Configuration
Each service loads configuration from multiple sources:
1. Shared configuration file
2. Service-specific environment variables
3. Default values

## 🚀 Development Workflow

### Quick Start
```bash
# 1. Setup environment
npm run "Setup Project Environment"

# 2. Setup database
npm run "Setup Database"

# 3. Load test data
npm run "Load Test Data"

# 4. Start all services
npm run "Start All Services"
```

### Service Health Monitoring
```bash
# Check all services
npm run "Check Service Health"

# Individual service checks
npm run "Test Django API"
npm run "Test FastAPI Service"
```

### Development Tasks
- **Full Development Setup**: Complete environment setup
- **Development Mode**: Start services in development mode
- **Reset Environment**: Clear data and reload test data
- **Service Status**: Check health of all services

## 📊 Monitoring and Observability

### Health Checks
```python
# Django health endpoint
@app.get("/api/v1/health/")
async def health():
    return {
        "status": "healthy",
        "service": "Django REST API",
        "version": "2.0.0",
        "database": "connected"
    }

# FastAPI health endpoint
@app.get("/api/v1/health")
async def health():
    return {
        "status": "healthy",
        "service": "FastAPI SSE Service",
        "version": "2.0.0",
        "cache": cache.get_stats()
    }
```

### Performance Monitoring
```python
@app.middleware("http")
async def performance_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

## 🔒 Security Considerations

### CORS Configuration
```python
# Django CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
CORS_ALLOW_CREDENTIALS = True

# FastAPI CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_CONFIG['allow_origins'],
    allow_credentials=CORS_CONFIG['allow_credentials'],
    allow_methods=CORS_CONFIG['allow_methods'],
    allow_headers=CORS_CONFIG['allow_headers'],
)
```

### JWT Security
- Tokens stored securely in localStorage
- Automatic token refresh
- Token validation on both services
- Proper error handling for expired tokens

## 🧪 Testing

### API Testing
```bash
# Test Django endpoints
curl -H "Authorization: Bearer <token>" \
     http://localhost:8000/api/v1/company/delivery-challan/

# Test FastAPI endpoints
curl -H "Authorization: Bearer <token>" \
     http://localhost:8001/api/v1/auth/test
```

### Integration Testing
```typescript
// Test service integration
const { django, fastapi } = useServiceClients();

// Test Django API
const challans = await django.getDeliveryChallans();
console.log('Django API working:', challans.length > 0);

// Test FastAPI SSE
const sse = fastapi.createSSEConnection();
sse.onmessage = (event) => {
  console.log('FastAPI SSE working:', event.data);
};
```

## 🔄 Deployment Considerations

### Environment Variables
- Use different configuration files for each environment
- Secure sensitive data (database passwords, JWT secrets)
- Configure CORS origins for production domains

### Service Dependencies
- Django must start before FastAPI (for JWT validation)
- Database must be available before starting services
- Frontend can start independently but requires backend services

### Scaling
- Django: Can be scaled horizontally with load balancer
- FastAPI: Stateless, can be scaled horizontally
- Database: Consider read replicas for high traffic
- SSE: Consider Redis for session management in production

## 🐛 Troubleshooting

### Common Issues

1. **JWT Token Issues**
   ```bash
   # Check token validity
   curl -H "Authorization: Bearer <token>" \
        http://localhost:8001/api/v1/auth/test
   ```

2. **SSE Connection Issues**
   ```bash
   # Test SSE endpoint
   curl -N http://localhost:8001/api/v1/sse/delivery-challan
   ```

3. **Database Connection Issues**
   ```bash
   # Check Django database connection
   cd django-rest && python manage.py dbshell
   ```

4. **Service Health Issues**
   ```bash
   # Check all services
   npm run "Show Service Status"
   ```

### Debug Mode
```bash
# Enable debug logging
export DJANGO_DEBUG=True
export FASTAPI_DEBUG=True
export NEXT_PUBLIC_DJANGO_DEBUG=true
export NEXT_PUBLIC_FASTAPI_DEBUG=true
```

## 📚 Additional Resources

- [Django REST Framework Documentation](https://www.django-rest-framework.org/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Server-Sent Events MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [JWT.io](https://jwt.io/) - JWT token debugging

## 🤝 Contributing

When making changes to service integration:

1. Update configuration files in `shared-config/`
2. Test all three services together
3. Update this documentation
4. Run health checks before committing
5. Consider backward compatibility

---

This integration provides a robust, scalable architecture for real-time delivery challan management with proper separation of concerns, security, and performance optimization. 