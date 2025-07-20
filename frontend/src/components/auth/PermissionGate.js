'use client'

import { useAuth } from '@/lib/auth-context'

export function PermissionGate({ 
  children, 
  permissions = [], 
  roles = [],
  userType = null,
  fallback = null 
}) {
  const { 
    hasAnyPermission, 
    hasAnyRole, 
    isFoursyzUser, 
    isClientUser 
  } = useAuth()

  // Check user type
  if (userType === 'foursyz' && !isFoursyzUser()) {
    return fallback
  }

  if (userType === 'client' && !isClientUser()) {
    return fallback
  }

  // Check permissions
  if (permissions.length > 0 && !hasAnyPermission(permissions)) {
    return fallback
  }

  // Check roles
  if (roles.length > 0 && !hasAnyRole(roles)) {
    return fallback
  }

  // All checks passed
  return children
} 