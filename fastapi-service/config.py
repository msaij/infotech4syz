import os
from pathlib import Path
from dotenv import load_dotenv

# Get the directory where this config file is located
FASTAPI_DIR = Path(__file__).parent

# Try multiple possible locations for the config file
possible_config_paths = [
    FASTAPI_DIR.parent / "shared-config" / ".env",  # Shared config
    FASTAPI_DIR.parent / "django-rest" / "backend" / "config.env",  # Django config
    FASTAPI_DIR / ".env",  # Local FastAPI .env file
    FASTAPI_DIR.parent / ".env",  # Root project config
]

# Load the first config file that exists
config_loaded = False
for config_path in possible_config_paths:
    if config_path.exists():
        load_dotenv(config_path)
        config_loaded = True
        print(f"Loaded config from: {config_path}")
        break

if not config_loaded:
    print("Warning: No config file found. Using environment variables or defaults.")

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'db': os.getenv('DB_NAME'),
    'port': int(os.getenv('DB_PORT', '3306')),
    'autocommit': True,
    'maxsize': int(os.getenv('DB_POOL_MAXSIZE', '10')),
    'minsize': int(os.getenv('DB_POOL_MINSIZE', '1'))
}

# Django integration configuration
DJANGO_CONFIG = {
    'api_url': os.getenv('DJANGO_API_URL', 'http://localhost:8000'),
    'debug': os.getenv('DJANGO_DEBUG', 'True').lower() == 'true',
    'secret_key': os.getenv('SECRET_KEY'),  # Use SECRET_KEY from Django config
}

# CORS configuration
CORS_CONFIG = {
    'allow_origins': os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(','),
    'allow_credentials': os.getenv('CORS_ALLOW_CREDENTIALS', 'True').lower() == 'true',
    'allow_methods': ['*'],
    'allow_headers': ['*']
}

# Service configuration
SERVICE_CONFIG = {
    'title': '4syz Delivery Challan SSE Service',
    'description': 'Real-time delivery challan updates via Server-Sent Events',
    'version': '2.0.0',
    'debug': os.getenv('FASTAPI_DEBUG', 'False').lower() == 'true',
    'port': int(os.getenv('FASTAPI_PORT', '8001')),
    'host': '0.0.0.0'
}

# Security configuration
SECURITY_CONFIG = {
    'restrict_to_localhost': os.getenv('RESTRICT_TO_LOCALHOST', 'True').lower() == 'true',
    'allowed_hosts': ['127.0.0.1', '::1', 'localhost'],
    'jwt_algorithm': os.getenv('JWT_ALGORITHM', 'HS256'),
    'jwt_secret_key': os.getenv('SECRET_KEY'),  # Use SECRET_KEY from Django config
}

# SSE configuration
SSE_CONFIG = {
    'update_interval': int(os.getenv('SSE_UPDATE_INTERVAL', '5')),
    'max_retries': int(os.getenv('SSE_MAX_RETRIES', '5')),
    'connection_timeout': int(os.getenv('SSE_CONNECTION_TIMEOUT', '30')),
    'enable_real_time': os.getenv('ENABLE_REAL_TIME_UPDATES', 'True').lower() == 'true',
}

# Logging configuration
LOGGING_CONFIG = {
    'level': os.getenv('LOG_LEVEL', 'INFO'),
    'format': os.getenv('LOG_FORMAT', 'json'),
    'enable_request_logging': os.getenv('ENABLE_REQUEST_LOGGING', 'True').lower() == 'true',
}

# Feature flags
FEATURE_FLAGS = {
    'enable_sse': os.getenv('ENABLE_SSE', 'True').lower() == 'true',
    'enable_audit_logging': os.getenv('ENABLE_AUDIT_LOGGING', 'True').lower() == 'true',
    'enable_performance_monitoring': os.getenv('ENABLE_PERFORMANCE_MONITORING', 'True').lower() == 'true',
}

def validate_config():
    """Validate that all required configuration is present."""
    required_vars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    return True

def show_config():
    """Display current configuration (without sensitive data)."""
    safe_db_config = {**DB_CONFIG}
    safe_db_config['password'] = '***' if safe_db_config['password'] else None
    
    safe_django_config = {**DJANGO_CONFIG}
    safe_django_config['secret_key'] = '***' if safe_django_config['secret_key'] else None
    
    return {
        'database': safe_db_config,
        'django_integration': safe_django_config,
        'cors': CORS_CONFIG,
        'service': SERVICE_CONFIG,
        'security': SECURITY_CONFIG,
        'sse': SSE_CONFIG,
        'logging': LOGGING_CONFIG,
        'features': FEATURE_FLAGS,
        'config_source': 'Loaded from environment variables' if config_loaded else 'Using defaults'
    }

if __name__ == "__main__":
    # When run directly, validate and show current configuration
    import json
    try:
        validate_config()
        print("✅ Configuration validation passed!")
        print("Current FastAPI Service Configuration:")
        print(json.dumps(show_config(), indent=2))
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        print("\nPlease set the required environment variables or create a .env file.")
        print("See shared-config/env.example for a template.") 