from fastapi import HTTPException, status, Depends
from typing import Dict, Any
from .dependencies import get_current_user

async def get_ceo_user(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Dependency to ensure only CEO users can access the endpoint"""
    if current_user.get('designation', '').lower() != 'ceo':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only CEO users can perform this action."
        )
    return current_user

def is_ceo_user(user_data: Dict[str, Any]) -> bool:
    """Check if user is CEO"""
    return user_data.get('designation', '').lower() == 'ceo' 