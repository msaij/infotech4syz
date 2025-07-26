from fastapi import Depends, HTTPException, status
from .dependencies import get_current_user
from typing import Dict, Any

def get_delivery_challan_user(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Dependency to ensure user has access to delivery challan tracker"""
    # All users in 4syz table have read access
    return current_user

def get_delivery_challan_manager(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Dependency to ensure user has write access to delivery challan tracker"""
    allowed_roles = ['admin', 'ceo', 'DC_tracker_manager']
    
    if current_user.get('designation', '').lower() not in [role.lower() for role in allowed_roles]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only admin, CEO, or DC_tracker_manager can modify delivery challan records."
        )
    
    return current_user

def is_delivery_challan_manager(user: Dict[str, Any]) -> bool:
    """Helper function to check if user has write access"""
    allowed_roles = ['admin', 'ceo', 'DC_tracker_manager']
    return user.get('designation', '').lower() in [role.lower() for role in allowed_roles] 