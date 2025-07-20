'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { PermissionGate } from '@/components/auth/PermissionGate'
import { ClientsService, UsersFoursyzService, QueriesService } from '@/lib/api-service'

export default function AnalyticsPage() {
  const { user, isOwner, isAdmin, hasPermission } = useAuth()
  const [analytics, setAnalytics] = useState({
    clientGrowth: [],
    userActivity: [],
    queryMetrics: {},
    systemHealth: {}
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Load analytics data based on permissions
      const promises = []
      
      if (isOwner() || isAdmin() || hasPermission('clients.view_clients')) {
        promises.push(
          ClientsService.getAll().then(response => {
            const clients = response.results || []
            return {
              totalClients: clients.length,
              activeClients: clients.filter(c => c.is_active).length,
              inactiveClients: clients.filter(c => !c.is_active).length,
              clientGrowth: generateClientGrowthData(clients)
            }
          }).catch(() => ({ totalClients: 0, activeClients: 0, inactiveClients: 0, clientGrowth: [] }))
        )
      }
      
      if (isOwner() || isAdmin() || hasPermission('users.view_users')) {
        promises.push(
          UsersFoursyzService.getAll().then(response => {
            const users = response.results || []
            return {
              totalUsers: users.length,
              activeUsers: users.filter(u => u.is_active).length,
              inactiveUsers: users.filter(u => !u.is_active).length,
              userActivity: generateUserActivityData(users)
            }
          }).catch(() => ({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0, userActivity: [] }))
        )
      }
      
      if (hasPermission('queries.view_queries')) {
        promises.push(
          QueriesService.getAll().then(response => {
            const queries = response.results || []
            return {
              totalQueries: queries.length,
              openQueries: queries.filter(q => q.status === 'open').length,
              resolvedQueries: queries.filter(q => q.status === 'resolved').length,
              queryMetrics: generateQueryMetrics(queries)
            }
          }).catch(() => ({ totalQueries: 0, openQueries: 0, resolvedQueries: 0, queryMetrics: {} }))
        )
      }
      
      const results = await Promise.all(promises)
      
      // Combine results
      const newAnalytics = { ...analytics }
      results.forEach(result => {
        Object.assign(newAnalytics, result)
      })
      
      // Add system health metrics
      newAnalytics.systemHealth = {
        uptime: '99.9%',
        lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        activeSessions: Math.floor(Math.random() * 50) + 10,
        systemLoad: Math.floor(Math.random() * 30) + 10
      }
      
      setAnalytics(newAnalytics)
      
    } catch (err) {
      console.error('Failed to load analytics:', err)
      setError('Failed to load analytics data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateClientGrowthData = (clients) => {
    // Simulate client growth over time
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map((month, index) => ({
      month,
      clients: Math.floor(Math.random() * 10) + index * 2
    }))
  }

  const generateUserActivityData = (users) => {
    // Simulate user activity over time
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map(day => ({
      day,
      logins: Math.floor(Math.random() * 20) + 5,
      activeUsers: Math.floor(Math.random() * 15) + 3
    }))
  }

  const generateQueryMetrics = (queries) => {
    const statusCounts = {}
    const priorityCounts = {}
    
    queries.forEach(query => {
      statusCounts[query.status] = (statusCounts[query.status] || 0) + 1
      priorityCounts[query.priority] = (priorityCounts[query.priority] || 0) + 1
    })
    
    return {
      byStatus: statusCounts,
      byPriority: priorityCounts,
      averageResolutionTime: '2.5 days',
      satisfactionRate: '94%'
    }
  }

  const getMetricColor = (metric, value) => {
    if (metric === 'uptime' || metric === 'satisfactionRate') {
      return value >= 95 ? 'text-green-600' : value >= 90 ? 'text-yellow-600' : 'text-red-600'
    }
    return 'text-blue-600'
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
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive insights and metrics for the 4syz system
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={loadAnalytics}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PermissionGate permissions={['clients.view_clients']}>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Clients</h3>
                <p className="text-3xl font-bold text-blue-600">{analytics.totalClients || 0}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics.activeClients || 0} active • {analytics.inactiveClients || 0} inactive
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
                <p className="text-3xl font-bold text-green-600">{analytics.totalUsers || 0}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics.activeUsers || 0} active • {analytics.inactiveUsers || 0} inactive
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
                <h3 className="text-lg font-semibold text-gray-900">Total Queries</h3>
                <p className="text-3xl font-bold text-yellow-600">{analytics.totalQueries || 0}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics.openQueries || 0} open • {analytics.resolvedQueries || 0} resolved
                </p>
              </div>
              <div className="text-3xl">❓</div>
            </div>
          </div>
        </PermissionGate>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">System Uptime</h3>
              <p className={`text-3xl font-bold ${getMetricColor('uptime', 99.9)}`}>
                {analytics.systemHealth?.uptime || '99.9%'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {analytics.systemHealth?.activeSessions || 0} active sessions
              </p>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Growth Chart */}
        <PermissionGate permissions={['clients.view_clients']}>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Growth</h2>
            <div className="space-y-3">
              {analytics.clientGrowth?.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{data.month}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((data.clients / 20) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{data.clients}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PermissionGate>

        {/* User Activity Chart */}
        <PermissionGate permissions={['users.view_users']}>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Activity</h2>
            <div className="space-y-3">
              {analytics.userActivity?.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{data.day}</span>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">{data.logins}</div>
                      <div className="text-xs text-gray-500">Logins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-green-600">{data.activeUsers}</div>
                      <div className="text-xs text-gray-500">Active</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PermissionGate>

        {/* Query Metrics */}
        <PermissionGate permissions={['queries.view_queries']}>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Query Analytics</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.queryMetrics?.averageResolutionTime || '2.5 days'}
                  </div>
                  <div className="text-sm text-gray-600">Avg Resolution Time</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getMetricColor('satisfactionRate', 94)}`}>
                    {analytics.queryMetrics?.satisfactionRate || '94%'}
                  </div>
                  <div className="text-sm text-gray-600">Satisfaction Rate</div>
                </div>
              </div>
              
              {analytics.queryMetrics?.byStatus && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">By Status</h3>
                  <div className="space-y-2">
                    {Object.entries(analytics.queryMetrics.byStatus).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">{status}</span>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </PermissionGate>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Last Backup</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics.systemHealth?.lastBackup ? 
                  new Date(analytics.systemHealth.lastBackup).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Active Sessions</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics.systemHealth?.activeSessions || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">System Load</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics.systemHealth?.systemLoad || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PermissionGate permissions={['clients.view_clients']}>
            <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200">
              <span>📊</span>
              <span className="font-medium text-gray-700">Export Client Report</span>
            </button>
          </PermissionGate>
          
          <PermissionGate permissions={['users.view_users']}>
            <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors duration-200">
              <span>👥</span>
              <span className="font-medium text-gray-700">Export User Report</span>
            </button>
          </PermissionGate>
          
          <PermissionGate permissions={['queries.view_queries']}>
            <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors duration-200">
              <span>❓</span>
              <span className="font-medium text-gray-700">Export Query Report</span>
            </button>
          </PermissionGate>
        </div>
      </div>
    </div>
  )
} 