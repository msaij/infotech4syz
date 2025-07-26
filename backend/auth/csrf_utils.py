import secrets
import hashlib
import time
from typing import Optional
from fastapi import HTTPException, status
from config import SECRET_KEY

class CSRFManager:
    def __init__(self):
        self._tokens = {}  # In production, use Redis or database
    
    def generate_token(self, user_id: str) -> str:
        """Generate a CSRF token for a user"""
        # Create a unique token
        token = secrets.token_urlsafe(32)
        
        # Store token with user ID and timestamp
        self._tokens[token] = {
            'user_id': user_id,
            'created_at': time.time()
        }
        
        return token
    
    def validate_token(self, token: str, user_id: str) -> bool:
        """Validate a CSRF token"""
        if token not in self._tokens:
            return False
        
        token_data = self._tokens[token]
        
        # Check if token belongs to user
        if token_data['user_id'] != user_id:
            return False
        
        # Check if token is expired (24 hours)
        if time.time() - token_data['created_at'] > 86400:  # 24 hours
            del self._tokens[token]
            return False
        
        # Don't mark as used - allow reuse within session
        return True
    
    def revoke_token(self, token: str) -> bool:
        """Revoke a CSRF token"""
        if token in self._tokens:
            del self._tokens[token]
            return True
        return False
    
    def cleanup_expired_tokens(self):
        """Clean up expired tokens"""
        current_time = time.time()
        expired_tokens = [
            token for token, data in self._tokens.items()
            if current_time - data['created_at'] > 86400
        ]
        
        for token in expired_tokens:
            del self._tokens[token]

# Global CSRF manager instance
csrf_manager = CSRFManager()

def generate_csrf_token(user_id: str) -> str:
    """Generate a CSRF token for a user"""
    return csrf_manager.generate_token(user_id)

def validate_csrf_token(token: str, user_id: str) -> bool:
    """Validate a CSRF token"""
    return csrf_manager.validate_token(token, user_id)

def require_csrf_token(token: str, user_id: str):
    """Require a valid CSRF token or raise HTTPException"""
    if not validate_csrf_token(token, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or expired CSRF token"
        ) 