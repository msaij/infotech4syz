import os
from pathlib import Path
from dotenv import load_dotenv

# Get the directory where this config file is located
FASTAPI_DIR = Path(__file__).parent

# Try multiple possible locations for the config file
possible_config_paths = [
    FASTAPI_DIR.parent / "backend" / "config.env",  # Current project structure
    FASTAPI_DIR.parent / "django-rest" / "backend" / "config.env",  # Legacy path
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
# See .env.example for available environment variables
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

# CORS configuration
CORS_CONFIG = {
    'allow_origins': os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(','),
    'allow_credentials': True,
    'allow_methods': ['*'],
    'allow_headers': ['*']
}

# Service configuration
SERVICE_CONFIG = {
    'title': 'Delivery Challan SSE Service',
    'description': 'Real-time delivery challan updates via Server-Sent Events',
    'version': '1.0.0',
    'debug': os.getenv('FASTAPI_DEBUG', 'False').lower() == 'true'
}

# Security configuration
SECURITY_CONFIG = {
    'restrict_to_localhost': os.getenv('RESTRICT_TO_LOCALHOST', 'True').lower() == 'true',
    'allowed_hosts': ['127.0.0.1', '::1', 'localhost']
}

# Configuration documentation
CONFIG_DOCS = """
Available Environment Variables:
- DB_HOST: Database host (REQUIRED)
- DB_USER: Database user (REQUIRED)
- DB_PASSWORD: Database password (REQUIRED)
- DB_NAME: Database name (REQUIRED)
- DB_PORT: Database port (default: 3306)
- DB_POOL_MAXSIZE: Connection pool max size (default: 10)
- DB_POOL_MINSIZE: Connection pool min size (default: 1)
- CORS_ALLOWED_ORIGINS: Comma-separated origins (default: http://localhost:3000,http://127.0.0.1:3000)
- FASTAPI_DEBUG: Enable debug mode (default: False)
- RESTRICT_TO_LOCALHOST: Restrict to localhost (default: True)

See .env.example for a template file with all available variables.
"""

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
    
    return {
        'database': safe_db_config,
        'cors': CORS_CONFIG,
        'service': SERVICE_CONFIG,
        'security': SECURITY_CONFIG,
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
        print("See .env.example for a template.") 