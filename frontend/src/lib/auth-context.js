'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { AuthService, RbacService } from './api-service'

// Create auth context
const AuthContext = createContext()

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userStatus, setUserStatus] = useState(null) // 'active', 'inactive', 'suspended', 'pending'

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setLoading(false)
        return
      }

      // Get user details
      const userData = await AuthService.getMe()
      
      // Check if user is allowed in the system
      if (userData.error) {
        console.error('User not allowed:', userData.error)
        logout()
        // Redirect to unauthorized page
        if (typeof window !== 'undefined') {
          window.location.href = '/unauthorized'
        }
        return
      }
      
      // Validate user status
      if (!userData.is_active) {
        console.error('User account is inactive')
        logout()
        if (typeof window !== 'undefined') {
          window.location.href = '/account-inactive'
        }
        return
      }
      
      // Set user status
      setUserStatus(userData.is_active ? 'active' : 'inactive')
      
      setUser(userData)
      setIsAuthenticated(true)

      // Get user roles and permissions
      await loadUserRolesAndPermissions()
    } catch (error) {
      console.error('Auth check failed:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const loadUserRolesAndPermissions = async () => {
    try {
      const [rolesData, permissionsData] = await Promise.all([
        RbacService.getMyRoles(),
        RbacService.getMyPermissions()
      ])
      
      setRoles(rolesData.roles || [])
      setPermissions(permissionsData.permissions || [])
    } catch (error) {
      console.error('Failed to load roles/permissions:', error)
      // Don't logout here, just log the error
    }
  }

  const login = async (credentials) => {
    try {
      const response = await AuthService.login(credentials)
      
      // Store tokens
      localStorage.setItem('access_token', response.access)
      localStorage.setItem('refresh_token', response.refresh)
      
      // Get user details
      const userData = await AuthService.getMe()
      
      // Validate user status
      if (!userData.is_active) {
        logout()
        throw new Error('Your account has been deactivated. Please contact your administrator.')
      }
      
      // Check if user has required role
      if (!userData.role) {
        logout()
        throw new Error('Your account does not have the required permissions. Please contact your administrator.')
      }
      
      // Set user status
      setUserStatus(userData.is_active ? 'active' : 'inactive')
      
      setUser(userData)
      setIsAuthenticated(true)
      
      // Load roles and permissions
      await loadUserRolesAndPermissions()
      
      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      logout()
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    setRoles([])
    setPermissions([])
    setIsAuthenticated(false)
    setUserStatus(null)
  }

  const hasPermission = (permission) => {
    if (!isAuthenticated || !permissions.length || userStatus !== 'active') return false
    return permissions.includes(permission)
  }

  const hasRole = (role) => {
    if (!isAuthenticated || !roles.length || userStatus !== 'active') return false
    return roles.includes(role)
  }

  const hasAnyRole = (roleList) => {
    if (!isAuthenticated || !roles.length || userStatus !== 'active') return false
    return roleList.some(role => roles.includes(role))
  }

  const hasAnyPermission = (permissionList) => {
    if (!isAuthenticated || !permissions.length || userStatus !== 'active') return false
    return permissionList.some(permission => permissions.includes(permission))
  }

  const isFoursyzUser = () => {
    if (!isAuthenticated || userStatus !== 'active') return false
    return hasAnyRole(['4syz Owner', '4syz Admin', '4syz User']) || user?.user_type === 'foursyz'
  }

  const isClientUser = () => {
    if (!isAuthenticated || userStatus !== 'active') return false
    return hasAnyRole(['Client Admin', 'Client User']) || user?.user_type === 'client'
  }

  const isOwner = () => {
    if (!isAuthenticated || userStatus !== 'active') return false
    return hasRole('4syz Owner')
  }

  const isAdmin = () => {
    if (!isAuthenticated || userStatus !== 'active') return false
    return hasAnyRole(['4syz Owner', '4syz Admin'])
  }

  const isAccountActive = () => {
    return userStatus === 'active'
  }

  const getUserType = () => {
    if (!isAuthenticated) return null
    return user?.user_type || null
  }

  const getCompanyName = () => {
    if (!isAuthenticated) return null
    return user?.company_name || null
  }

  const getRole = () => {
    if (!isAuthenticated) return null
    return user?.role || null
  }

  const value = {
    user,
    roles,
    permissions,
    loading,
    isAuthenticated,
    userStatus,
    login,
    logout,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAnyPermission,
    isFoursyzUser,
    isClientUser,
    isOwner,
    isAdmin,
    isAccountActive,
    getUserType,
    getCompanyName,
    getRole,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 