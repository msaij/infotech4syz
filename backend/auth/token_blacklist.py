from datetime import datetime, timedelta
from typing import Set
import threading

class TokenBlacklist:
    def __init__(self):
        self._blacklisted_tokens: Set[str] = set()
        self._lock = threading.Lock()
    
    def add_token(self, token: str):
        """Add token to blacklist"""
        with self._lock:
            self._blacklisted_tokens.add(token)
    
    def is_blacklisted(self, token: str) -> bool:
        """Check if token is blacklisted"""
        with self._lock:
            return token in self._blacklisted_tokens
    
    def cleanup_expired_tokens(self):
        """Clean up expired tokens from blacklist (optional)"""
        # This could be implemented to remove old tokens periodically
        # For now, we'll keep all blacklisted tokens
        pass

# Global blacklist instance
token_blacklist = TokenBlacklist() 