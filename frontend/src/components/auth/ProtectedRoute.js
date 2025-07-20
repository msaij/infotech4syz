'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedRoute({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [],
  userType = null, // 'foursyz' or 'client'
  fallback = null 
}) {
  const { 
    isAuthenticated, 
    loading, 
    hasAnyPermission, 
    hasAnyRole, 
    isFoursyzUser, 
    isClientUser 
  } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Check authentication
  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    )
  }

  // Check user type
  if (userType === 'foursyz' && !isFoursyzUser()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to 4syz users.</p>
        </div>
      </div>
    )
  }

  if (userType === 'client' && !isClientUser()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to client users.</p>
        </div>
      </div>
    )
  }

  // Check permissions
  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Insufficient Permissions</h2>
                      <p className="text-gray-600">You don&apos;t have the required permissions to access this page.</p>
        </div>
      </div>
    )
  }

  // Check roles
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Insufficient Role</h2>
                      <p className="text-gray-600">You don&apos;t have the required role to access this page.</p>
        </div>
      </div>
    )
  }

  // All checks passed
  return children
} 