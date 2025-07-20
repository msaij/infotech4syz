'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { PermissionGate } from '@/components/auth/PermissionGate'
import { ClientsService, UsersClientsService, QueriesService } from '@/lib/api-service'

export default function ClientAnalyticsPage() {
  const { user, isOwner, isAdmin, hasPermission } = useAuth()
  const [analytics, setAnalytics] = useState({
    clientMetrics: {},
    userMetrics: {},
    queryMetrics: {},
    topClients: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    loadClientAnalytics()
  }, [timeRange])

  const loadClientAnalytics = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const promises = []
      
      // Load client metrics
      promises.push(
        ClientsService.getAll().then(response => {
          const clients = response.results || []
          return {
            totalClients: clients.length,
            activeClients: clients.filter(c => c.is_active).length,
            inactiveClients: clients.filter(c => !c.is_active).length,
            clientGrowth: generateClientGrowthData(clients),
            topClients: clients.slice(0, 5).map(client => ({
              name: client.company_name,
              status: client.is_active ? 'Active' : 'Inactive',
              users: Math.floor(Math.random() * 20) + 1, // Mock data
              queries: Math.floor(Math.random() * 50) + 5 // Mock data
            }))
          }
        }).catch(() => ({ 
          totalClients: 0, 
          activeClients: 0, 
          inactiveClients: 0, 
          clientGrowth: [],
          topClients: []
        }))
      )
      
      // Load client user metrics
      promises.push(
        UsersClientsService.getAll().then(response => {
          const users = response.results || []
          return {
            totalClientUsers: users.length,
            activeClientUsers: users.filter(u => u.is_active).length,
            inactiveClientUsers: users.filter(u => !u.is_active).length,
            userActivity: generateUserActivityData(users)
          }
        }).catch(() => ({ 
          totalClientUsers: 0, 
          activeClientUsers: 0, 
          inactiveClientUsers: 0, 
          userActivity: []
        }))
      )
      
      // Load query metrics
      promises.push(
        QueriesService.getAll().then(response => {
          const queries = response.results || []
          return {
            totalQueries: queries.length,
            openQueries: queries.filter(q => q.status === 'open').length,
            resolvedQueries: queries.filter(q => q.status === 'resolved').length,
            queryMetrics: generateQueryMetrics(queries)
          }
        }).catch(() => ({ 
          totalQueries: 0, 
          openQueries: 0, 
          resolvedQueries: 0, 
          queryMetrics: {}
        }))
      )
      
      const results = await Promise.all(promises)
      
      // Combine results
      const newAnalytics = { ...analytics }
      results.forEach(result => {
        Object.assign(newAnalytics, result)
      })
      
      setAnalytics(newAnalytics)
      
    } catch (err) {
      console.error('Failed to load client analytics:', err)
      setError('Failed to load client analytics data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateClientGrowthData = (clients) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map((month, index) => ({
      month,
      clients: Math.floor(Math.random() * 10) + index * 2
    }))
  }

  const generateUserActivityData = (users) => {
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
            <h1 className="text-2xl font-bold text-gray-900">Client Analytics</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive insights and metrics for client management
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
              onClick={loadClientAnalytics}
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
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Client Users</h3>
              <p className="text-3xl font-bold text-green-600">{analytics.totalClientUsers || 0}</p>
              <p className="text-sm text-gray-500 mt-1">
                {analytics.activeClientUsers || 0} active • {analytics.inactiveClientUsers || 0} inactive
              </p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>
        
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
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Satisfaction Rate</h3>
              <p className="text-3xl font-bold text-purple-600">
                {analytics.queryMetrics?.satisfactionRate || 'N/A'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Avg resolution: {analytics.queryMetrics?.averageResolutionTime || 'N/A'}
              </p>
            </div>
            <div className="text-3xl">⭐</div>
          </div>
        </div>
      </div>

      {/* Top Clients */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top Clients</h2>
        </div>
        <div className="p-6">
          {analytics.topClients.length === 0 ? (
            <p className="text-gray-500 text-center">No client data available.</p>
          ) : (
            <div className="space-y-4">
              {analytics.topClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-500">
                        {client.users} users • {client.queries} queries
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    client.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {client.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Growth</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder - Client growth over time</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder - User activity by day</p>
          </div>
        </div>
      </div>
    </div>
  )
} 