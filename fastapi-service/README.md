# FastAPI Service - Delivery Challan SSE

Real-time delivery challan updates via Server-Sent Events (SSE).

## Configuration

The service uses a flexible configuration system that automatically detects and loads environment variables from multiple possible locations:

### Configuration Priority Order:
1. `../backend/config.env` (Django backend config)
2. `../django-rest/backend/config.env` (Legacy path)
3. `./.env` (Local FastAPI config)
4. `../.env` (Root project config)

### Environment Variables

#### Database Configuration
- `DB_HOST` - Database host (default: localhost)
- `DB_USER` - Database user (default: root)
- `DB_PASSWORD` - Database password (default: 123456)
- `DB_NAME` - Database name (default: 4syz)
- `DB_PORT` - Database port (default: 3306)
- `DB_POOL_MAXSIZE` - Connection pool max size (default: 10)
- `DB_POOL_MINSIZE` - Connection pool min size (default: 1)

#### CORS Configuration
- `CORS_ALLOWED_ORIGINS` - Comma-separated list of allowed origins (default: http://localhost:3000,http://127.0.0.1:3000)

#### Service Configuration
- `FASTAPI_DEBUG` - Enable debug mode (default: False)

#### Security Configuration
- `RESTRICT_TO_LOCALHOST` - Restrict access to localhost only (default: True)

## Running the Service

### Using VS Code Tasks
1. Open Command Palette (`Ctrl+Shift+P`)
2. Select "Tasks: Run Task"
3. Choose "Run FastAPI Service" or "Run FastAPI Service (Custom Config)"

### Using Terminal
```bash
cd fastapi-service
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

## API Endpoints

- `GET /` - Service information
- `GET /api/v1` - API information
- `GET /api/v1/health` - Health check
- `GET /api/v1/metrics` - Performance metrics
- `GET /api/v1/sse/delivery-challan` - Real-time SSE updates

## Benefits of This Configuration Approach

1. **Flexibility**: Automatically finds config files in multiple locations
2. **Environment Independence**: Works in different deployment scenarios
3. **Centralized Configuration**: All settings in one place
4. **Type Safety**: Configuration is structured and validated
5. **Easy Override**: Can use local .env files for specific environments
6. **No Hardcoded Paths**: Dynamic path resolution
7. **Fallback Values**: Sensible defaults for all settings 