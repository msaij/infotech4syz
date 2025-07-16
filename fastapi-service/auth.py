import os
import jwt
import requests
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import DJANGO_CONFIG, SECURITY_CONFIG
import logging

logger = logging.getLogger(__name__)

# JWT token security
security = HTTPBearer()

class DjangoJWTValidator:
    """Validates JWT tokens issued by Django backend."""
    
    def __init__(self):
        self.secret_key = SECURITY_CONFIG['jwt_secret_key']
        self.algorithm = SECURITY_CONFIG['jwt_algorithm']
        self.django_api_url = DJANGO_CONFIG['api_url']
    
    def validate_token(self, token: str) -> dict:
        """Validate JWT token and return payload."""
        try:
            payload = jwt.decode(
                token, 
                self.secret_key, 
                algorithms=[self.algorithm]
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Token has expired"
            )
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid JWT token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid token"
            )
    
    def get_user_from_django(self, user_id: int) -> dict:
        """Fetch user details from Django backend."""
        try:
            response = requests.get(
                f"{self.django_api_url}/api/v1/company/details/",
                headers={"Authorization": f"Bearer {self.get_current_token()}"},
                timeout=5
            )
            
            if response.status_code == 200:
                return response.json()
            
            # Try client endpoint if company fails
            response = requests.get(
                f"{self.django_api_url}/api/v1/client/details/",
                headers={"Authorization": f"Bearer {self.get_current_token()}"},
                timeout=5
            )
            
            if response.status_code == 200:
                return response.json()
            
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        except requests.RequestException as e:
            logger.error(f"Error fetching user from Django: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Django service unavailable"
            )

# Global validator instance
jwt_validator = DjangoJWTValidator()

def get_current_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Extract JWT token from Authorization header."""
    return credentials.credentials

def get_current_user(token: str = Depends(get_current_token)) -> dict:
    """Validate JWT token and return user information."""
    try:
        # Validate token
        payload = jwt_validator.validate_token(token)
        user_id = payload.get('user_id')
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        # Get user details from Django
        user = jwt_validator.get_user_from_django(user_id)
        
        # Check user permissions
        user_type = user.get('user_type')
        if user_type not in ['company', 'client']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid user type"
            )
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

def get_company_user(user: dict = Depends(get_current_user)) -> dict:
    """Ensure user is a company user."""
    if user.get('user_type') != 'company':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Company access required"
        )
    return user

def get_client_user(user: dict = Depends(get_current_user)) -> dict:
    """Ensure user is a client user."""
    if user.get('user_type') != 'client':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Client access required"
        )
    return user

def get_admin_user(user: dict = Depends(get_current_user)) -> dict:
    """Ensure user has admin role."""
    if user.get('role') not in ['admin', 'manager']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user

# Legacy session-based authentication (for backward compatibility)
def get_django_sessionid(request: Request):
    """Extract Django session ID from cookies (legacy)."""
    return request.cookies.get("sessionid")

def validate_django_session_and_group(request: Request):
    """Validate Django session and check user group (legacy)."""
    sessionid = get_django_sessionid(request)
    if not sessionid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated (no sessionid)"
        )

    try:
        resp = requests.get(
            f"{DJANGO_CONFIG['api_url']}/api/users/me/",
            cookies={"sessionid": sessionid},
            timeout=3
        )
        
        if resp.status_code == 200:
            user = resp.json()
            groups = user.get("groups", [])
            if "4syz" not in groups:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN, 
                    detail="User not in required group: 4syz"
                )
            return user
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid session"
            )
    except Exception as e:
        logger.error(f"Session validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail=f"Auth service error: {e}"
        )

def get_current_4syz_user(request: Request):
    """Legacy function for backward compatibility."""
    return validate_django_session_and_group(request) 