'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useNotification } from '@/lib/notification-context'
import { RbacService } from '@/lib/api-service'

export default function PermissionsPage() {
  const { hasPermission, isOwner, isAdmin } = useAuth()
  const { success, error: showError } = useNotification()
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [appFilter, setAppFilter] = useState('all')
  const [filteredPermissions, setFilteredPermissions] = useState([])

  useEffect(() => {
    loadPermissions()
  }, [])

  useEffect(() => {
    filterPermissions()
  }, [permissions, searchTerm, appFilter])

  const loadPermissions = async () => {
    try {
      setLoading(true)
      const data = await RbacService.getPermissions()
      setPermissions(data.results || data)
    } catch (error) {
      console.error('Failed to load permissions:', error)
      showError('Failed to load permissions')
    } finally {
      setLoading(false)
    }
  }

  const filterPermissions = () => {
    let filtered = [...permissions]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(permission => {
        return permission.name?.toLowerCase().includes(term) ||
               permission.codename?.toLowerCase().includes(term) ||
               permission.app_label?.toLowerCase().includes(term) ||
               permission.description?.toLowerCase().includes(term)
      })
    }

    // App filter
    if (appFilter !== 'all') {
      filtered = filtered.filter(permission => permission.app_label === appFilter)
    }

    setFilteredPermissions(filtered)
  }

  const getUniqueApps = () => {
    const apps = new Set()
    permissions.forEach(permission => {
      if (permission.app_label) {
        apps.add(permission.app_label)
      }
    })
    return Array.from(apps).sort()
  }

  const getPermissionGroups = () => {
    const groups = {}
    filteredPermissions.forEach(permission => {
      if (!groups[permission.app_label]) {
        groups[permission.app_label] = []
      }
      groups[permission.app_label].push(permission)
    })
    return groups
  }

  if (!hasPermission('rbac.view_permissions') && !isOwner() && !isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">You don&apos;t have permission to view permissions.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">System Permissions</h1>
                <p className="text-gray-600 mt-1">
                  View and manage system permissions for role-based access control
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {permissions.length} total permissions
              </div>
            </div>
          </div>

          {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Permissions
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, codename, or description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by App
                </label>
                <select
                  value={appFilter}
                  onChange={(e) => setAppFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Apps</option>
                  {getUniqueApps().map(app => (
                    <option key={app} value={app}>{app}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Permissions List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Permissions ({filteredPermissions.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {Object.entries(getPermissionGroups()).map(([appLabel, appPermissions]) => (
                <div key={appLabel} className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                    {appLabel}
                    <span className="ml-2 text-sm text-gray-500">
                      ({appPermissions.length} permissions)
                    </span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {appPermissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {permission.name}
                          </h4>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {permission.codename}
                          </span>
                        </div>
                        
                        {permission.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {permission.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>App: {permission.app_label}</span>
                          <span>
                            Created: {new Date(permission.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {filteredPermissions.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500">No permissions found matching your criteria.</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Permissions</p>
                  <p className="text-2xl font-semibold text-gray-900">{permissions.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Applications</p>
                  <p className="text-2xl font-semibold text-gray-900">{getUniqueApps().length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Filtered Results</p>
                  <p className="text-2xl font-semibold text-gray-900">{filteredPermissions.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 