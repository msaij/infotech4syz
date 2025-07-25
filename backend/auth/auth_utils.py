from datetime import datetime, timedelta
from typing import Optional, Tuple
from jose import JWTError, jwt
from fastapi import HTTPException, status
from passlib.context import CryptContext
import hashlib
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS, PEPPER
from .token_blacklist import token_blacklist

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def is_sha256_hash(password_hash: str) -> bool:
    """Check if the password hash is SHA-256 (old format)"""
    return len(password_hash) == 64 and all(c in '0123456789abcdef' for c in password_hash.lower())

def verify_password_sha256(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against SHA-256 hash (legacy)"""
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash (supports both SHA-256 and bcrypt)"""
    # Check if it's an old SHA-256 hash
    if is_sha256_hash(hashed_password):
        return verify_password_sha256(plain_password, hashed_password)
    
    # Try bcrypt verification
    try:
        return pwd_context.verify(plain_password + PEPPER, hashed_password)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password + PEPPER)

def migrate_password_hash(plain_password: str, old_hash: str) -> str:
    """Migrate from SHA-256 to bcrypt hash"""
    return get_password_hash(plain_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "type": "access",
        "iat": datetime.utcnow()
    })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({
        "exp": expire,
        "type": "refresh",
        "iat": datetime.utcnow()
    })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_token_pair(data: dict) -> Tuple[str, str]:
    """Create both access and refresh tokens"""
    access_token = create_access_token(data)
    refresh_token = create_refresh_token(data)
    return access_token, refresh_token

def verify_token(token: str, token_type: str = "access"):
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        token_type_check: str = payload.get("type")
        
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if token_type_check != token_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token type. Expected {token_type}",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_user_email_from_token(token: str) -> str:
    """Extract user email from JWT token"""
    payload = verify_token(token)
    return payload.get("sub")

def is_token_expired(token: str) -> bool:
    """Check if token is expired"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp = payload.get("exp")
        if exp is None:
            return True
        return datetime.utcnow() > datetime.fromtimestamp(exp)
    except JWTError:
        return True

def is_token_blacklisted(token: str) -> bool:
    """Check if token is blacklisted"""
    return token_blacklist.is_blacklisted(token)

def blacklist_token(token: str):
    """Add token to blacklist"""
    token_blacklist.add_token(token)

def refresh_access_token(refresh_token: str) -> str:
    """Create new access token from refresh token"""
    try:
        # Verify refresh token
        payload = verify_token(refresh_token, "refresh")
        email = payload.get("sub")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create new access token
        new_access_token = create_access_token(data={"sub": email})
        return new_access_token
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        ) 