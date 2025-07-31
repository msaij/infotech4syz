import { useState, useEffect, useCallback } from 'react'
import { resourcePermissionService, ResourcePermission } from '@/utils/resourcePermissionService'
import { env } from '@/config/env'

export interface NavigationPermission {
  path: string
  label: string
  icon?: string
  allowed: boolean
  children?: NavigationPermission[]
}

export function useNavigationPermissions(userId: string) {
  const [permissions, setPermissions] = useState<ResourcePermission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user permissions
  const loadUserPermissions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { permissions: userPermissions } = await resourcePermissionService.getUserResourcePermissions(userId)
      setPermissions(userPermissions)
    } catch (err) {
      console.error('Error loading user permissions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load permissions')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      loadUserPermissions()
    }
  }, [userId, loadUserPermissions])

  // Check if user has permission for a specific action and resource
  const hasPermission = useCallback(async (action: string, resource: string): Promise<boolean> => {
    try {
      const evaluation = await resourcePermissionService.evaluatePermission({
        user_id: userId,
        action,
        resource
      })
      return evaluation.allowed
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }, [userId])

  // Check if user has any permission for a resource category
  const hasAnyPermissionForCategory = useCallback((category: string): boolean => {
    return permissions.some(permission => permission.category === category)
  }, [permissions])

  // Check if user has specific action permission for a resource
  const hasActionPermission = useCallback((action: string, resource: string): boolean => {
    return permissions.some(permission => 
      permission.resource === resource && permission.actions.includes(action)
    )
  }, [permissions])

  // Get navigation items based on permissions
  const getNavigationItems = useCallback((): NavigationPermission[] => {
    const navigationItems: NavigationPermission[] = []

    // Dashboard - always available
    navigationItems.push({
      path: env.ROUTES.DASHBOARD,
      label: 'Dashboard',
      icon: '📊',
      allowed: true
    })

    // User Management
    if (hasAnyPermissionForCategory('User Management')) {
      navigationItems.push({
        path: '/foursyz/create_user4syz',
        label: 'Create User',
        icon: '👤',
        allowed: hasActionPermission('user:create', 'user:*')
      })
    }

    // Client Management
    if (hasAnyPermissionForCategory('Client Management')) {
      navigationItems.push({
        path: '/foursyz/client_details',
        label: 'Client Details',
        icon: '🏢',
        allowed: hasActionPermission('client:read', 'client:*') || hasActionPermission('client:list', 'client:*')
      })
    }

    // Delivery Challan
    if (hasAnyPermissionForCategory('Delivery Challan')) {
      navigationItems.push({
        path: '/foursyz/delivery_challan_tracker',
        label: 'Delivery Challan Tracker',
        icon: '📦',
        allowed: hasActionPermission('delivery_challan:read', 'delivery_challan:*') || 
                hasActionPermission('delivery_challan:list', 'delivery_challan:*')
      })
    }

    // Permission Management
    if (hasAnyPermissionForCategory('Permission Management')) {
      navigationItems.push({
        path: '/foursyz/policy_management',
        label: 'Permission Management',
        icon: '⚙️',
        allowed: hasActionPermission('permissions:read', 'permissions:*') || 
                hasActionPermission('permissions:list', 'permissions:*')
      })
    }

    return navigationItems.filter(item => item.allowed)
  }, [hasAnyPermissionForCategory, hasActionPermission])

  // Check if user can access a specific route
  const canAccessRoute = useCallback((route: string): boolean => {
    const navigationItems = getNavigationItems()
    
    // Direct path match
    if (navigationItems.some(item => item.path === route)) {
      return true
    }

    // Check based on route patterns
    if (route.includes('/foursyz/client_details') && hasAnyPermissionForCategory('Client Management')) {
      return hasActionPermission('client:read', 'client:*') || hasActionPermission('client:list', 'client:*')
    }

    if (route.includes('/foursyz/delivery_challan_tracker') && hasAnyPermissionForCategory('Delivery Challan')) {
      return hasActionPermission('delivery_challan:read', 'delivery_challan:*') || 
             hasActionPermission('delivery_challan:list', 'delivery_challan:*')
    }

    if (route.includes('/foursyz/create_user4syz') && hasAnyPermissionForCategory('User Management')) {
      return hasActionPermission('user:create', 'user:*')
    }

    if (route.includes('/foursyz/policy_management') && hasAnyPermissionForCategory('Permission Management')) {
      return hasActionPermission('permissions:read', 'permissions:*') || 
             hasActionPermission('permissions:list', 'permissions:*')
    }

    return false
  }, [getNavigationItems, hasAnyPermissionForCategory, hasActionPermission])

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermissionForCategory,
    hasActionPermission,
    getNavigationItems,
    canAccessRoute,
    refreshPermissions: loadUserPermissions
  }
} 