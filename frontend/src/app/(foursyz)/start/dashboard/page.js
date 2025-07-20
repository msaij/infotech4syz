'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { PermissionGate } from '@/components/auth/PermissionGate'
import { ClientsService, UsersFoursyzService, QueriesService } from '@/lib/api-service'

export default function FoursyzDashboard() {
  const { user, roles, permissions, isOwner, isAdmin } = useAuth()
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalUsers: 0,
    activeUsers: 0,
    openQueries: 0,
    resolvedQueries: 0,
    totalQueries: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const promises = []
      
      // Load client stats if user has permission
      if (isOwner() || isAdmin() || permissions.includes('clients.view_clients')) {
        promises.push(
          ClientsService.getAll().then(response => {
            const clients = response.results || []
            return {
              totalClients: clients.length,
              activeClients: clients.filter(c => c.is_active).length
            }
          }).catch(() => ({ totalClients: 0, activeClients: 0 }))
        )
      }
      
      // Load user stats if user has permission
      if (isOwner() || isAdmin() || permissions.includes('users.view_users')) {
        promises.push(
          UsersFoursyzService.getAll().then(response => {
            const users = response.results || []
            return {
              totalUsers: users.length,
              activeUsers: users.filter(u => u.is_active).length
            }
          }).catch(() => ({ totalUsers: 0, activeUsers: 0 }))
        )
      }
      
      // Load query stats if user has permission
      if (permissions.includes('queries.view_queries')) {
        promises.push(
          QueriesService.getAll().then(response => {
            const queries = response.results || []
            return {
              totalQueries: queries.length,
              openQueries: queries.filter(q => q.status === 'open').length,
              resolvedQueries: queries.filter(q => q.status === 'resolved').length
            }
          }).catch(() => ({ totalQueries: 0, openQueries: 0, resolvedQueries: 0 }))
        )
      }
      
      const results = await Promise.all(promises)
      
      // Combine results
      const newStats = { ...stats }
      results.forEach(result => {
        Object.assign(newStats, result)
      })
      
      setStats(newStats)
      
      // Load recent activity (simulated for now)
      setRecentActivity([
        {
          id: 1,
          type: 'client_created',
          message: 'New client "TechStart Inc" was added',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: 'admin@4syz.com'
        },
        {
          id: 2,
          type: 'user_login',
          message: 'User "manager@4syz.com" logged in',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          user: 'manager@4syz.com'
        },
        {
          id: 3,
          type: 'query_resolved',
          message: 'Query #1234 was resolved',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          user: 'admin@4syz.com'
        }
      ])
      
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getRoleDisplayName = (role) => {
    const roleMap = {
      '4syz Owner': 'Owner',
      '4syz Admin': 'Administrator',
      '4syz User': 'User',
      'Client Admin': 'Client Admin',
      'Client User': 'Client User'
    }
    return roleMap[role] || role
  }

  const getStatusColor = (status) => {
    const colorMap = {
      active: 'text-green-600 bg-green-50',
      inactive: 'text-red-600 bg-red-50',
      pending: 'text-yellow-600 bg-yellow-50'
    }
    return colorMap[status] || 'text-gray-600 bg-gray-50'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">4syz Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.first_name || user?.username}! Here&apos;s what&apos;s happening in your system.
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Last updated</div>
            <div className="text-sm font-medium text-gray-900">
              {new Date().toLocaleString()}
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* User Information Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
            <span className="mr-2">👤</span>
            User Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="text-sm text-gray-500">Username</div>
              <div className="font-medium text-gray-900">{user?.username}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="text-sm text-gray-500">Email</div>
              <div className="font-medium text-gray-900">{user?.email}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="text-sm text-gray-500">User Type</div>
              <div className="font-medium text-gray-900 capitalize">{user?.user_type || 'User'}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="text-sm text-gray-500">Status</div>
              <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user?.is_active ? 'active' : 'inactive')}`}>
                {user?.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
          
          {/* Roles and Permissions */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="text-sm text-gray-500 mb-2">Roles</div>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                  >
                    {getRoleDisplayName(role)}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="text-sm text-gray-500 mb-2">Permissions</div>
              <div className="text-xs text-gray-600">
                {permissions.length} permissions granted
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PermissionGate permissions={['clients.view_clients']}>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Clients</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalClients}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.activeClients} active
                </p>
              </div>
              <div className="text-3xl">🏢</div>
            </div>
          </div>
        </PermissionGate>
        
        <PermissionGate permissions={['users.view_users']}>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
                <p className="text-3xl font-bold text-green-600">{stats.totalUsers}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.activeUsers} active
                </p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>
        </PermissionGate>
        
        <PermissionGate permissions={['queries.view_queries']}>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Open Queries</h3>
                <p className="text-3xl font-bold text-yellow-600">{stats.openQueries}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.totalQueries} total
                </p>
              </div>
              <div className="text-3xl">❓</div>
            </div>
          </div>
        </PermissionGate>
        
        <PermissionGate permissions={['queries.view_queries']}>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Resolved</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.resolvedQueries}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.totalQueries > 0 ? Math.round((stats.resolvedQueries / stats.totalQueries) * 100) : 0}% rate
                </p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
        </PermissionGate>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Recent Activity
        </h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">
                    {activity.type === 'client_created' ? '🏢' : 
                     activity.type === 'user_login' ? '👤' : '❓'}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                <p className="text-sm text-gray-500">
                  by {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      {(isOwner() || isAdmin()) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">⚡</span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PermissionGate permissions={['clients.create_clients']}>
              <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200">
                <span>➕</span>
                <span className="font-medium text-gray-700">Add New Client</span>
              </button>
            </PermissionGate>
            
            <PermissionGate permissions={['users.create_users']}>
              <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors duration-200">
                <span>👤</span>
                <span className="font-medium text-gray-700">Add New User</span>
              </button>
            </PermissionGate>
            
            <PermissionGate permissions={['queries.create_queries']}>
              <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors duration-200">
                <span>❓</span>
                <span className="font-medium text-gray-700">Create Query</span>
              </button>
            </PermissionGate>
          </div>
        </div>
      )}
    </div>
  )
} 