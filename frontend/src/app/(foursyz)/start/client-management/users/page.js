'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { PermissionGate } from '@/components/auth/PermissionGate'
import { UsersClientsService, ClientsService } from '@/lib/api-service'
import { Notification } from '@/components/ui/Notification'

export default function ClientUsersPage() {
  const { user, isOwner, isAdmin, hasPermission } = useAuth()
  const [clientUsers, setClientUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterClient, setFilterClient] = useState('all')
  const [filterRole, setFilterRole] = useState('all')
  const [lastLoginFilter, setLastLoginFilter] = useState('all')
  
  // Bulk operations
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  
  // View states
  const [viewMode, setViewMode] = useState('table') // 'table' or 'cards'
  const [sortBy, setSortBy] = useState('name') // 'name', 'email', 'client', 'role', 'status', 'last_login'
  const [sortOrder, setSortOrder] = useState('asc') // 'asc' or 'desc'

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterAndSortUsers()
  }, [clientUsers, searchTerm, filterStatus, filterClient, filterRole, lastLoginFilter, sortBy, sortOrder])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [usersResponse, clientsResponse] = await Promise.all([
        UsersClientsService.getAll(),
        ClientsService.getAll()
      ])
      
      const users = usersResponse.results || []
      const clientsList = clientsResponse.results || []
      
      // Enhance users with client information
      const enhancedUsers = users.map(userClient => {
        const user = userClient.user || {}
        const client = userClient.client || null
        
        return {
          ...userClient,
          user: user,
          client: client,
          clientName: client?.name || 'Unknown Client'
        }
      })
      
      setClientUsers(enhancedUsers)
      setClients(clientsList)
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('Failed to load client users data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortUsers = () => {
    let filtered = [...clientUsers]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(userClient => {
        const user = userClient.user || {}
        return user.first_name?.toLowerCase().includes(term) ||
               user.last_name?.toLowerCase().includes(term) ||
               user.email?.toLowerCase().includes(term) ||
               userClient.clientName?.toLowerCase().includes(term) ||
               userClient.role?.toLowerCase().includes(term)
      })
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(userClient => {
        if (filterStatus === 'active') return userClient.is_active
        if (filterStatus === 'inactive') return !userClient.is_active
        return true
      })
    }

    // Client filter
    if (filterClient !== 'all') {
      filtered = filtered.filter(userClient => {
        return userClient.clientName === filterClient
      })
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(userClient => {
        return userClient.role === filterRole
      })
    }

    // Last login filter
    if (lastLoginFilter !== 'all') {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      
      filtered = filtered.filter(userClient => {
        const lastLogin = userClient.user?.last_login ? new Date(userClient.user.last_login) : null
        
        switch (lastLoginFilter) {
          case 'never':
            return !lastLogin
          case '30days':
            return lastLogin && lastLogin >= thirtyDaysAgo
          case '90days':
            return lastLogin && lastLogin >= ninetyDaysAgo
          case 'inactive':
            return !lastLogin || lastLogin < ninetyDaysAgo
          default:
            return true
        }
      })
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'name':
          aValue = `${a.user?.first_name || ''} ${a.user?.last_name || ''}`.toLowerCase()
          bValue = `${b.user?.first_name || ''} ${b.user?.last_name || ''}`.toLowerCase()
          break
        case 'email':
          aValue = a.user?.email?.toLowerCase() || ''
          bValue = b.user?.email?.toLowerCase() || ''
          break
        case 'client':
          aValue = a.clientName?.toLowerCase() || ''
          bValue = b.clientName?.toLowerCase() || ''
          break
        case 'role':
          aValue = a.role?.toLowerCase() || ''
          bValue = b.role?.toLowerCase() || ''
          break
        case 'status':
          aValue = a.is_active ? 'active' : 'inactive'
          bValue = b.is_active ? 'active' : 'inactive'
          break
        case 'last_login':
          aValue = new Date(a.user?.last_login || 0)
          bValue = new Date(b.user?.last_login || 0)
          break
        default:
          aValue = a.user?.first_name?.toLowerCase() || ''
          bValue = b.user?.first_name?.toLowerCase() || ''
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredUsers(filtered)
  }

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await UsersClientsService.update(userId, { is_active: !currentStatus })
      await loadData()
      setNotification({
        message: `User ${currentStatus ? 'deactivated' : 'activated'} successfully`,
        type: 'success'
      })
    } catch (err) {
      console.error('Failed to update user status:', err)
      setNotification({
        message: 'Failed to update user status. Please try again.',
        type: 'error'
      })
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return

    try {
      const promises = selectedUsers.map(userId => {
        switch (action) {
          case 'activate':
            return UsersClientsService.update(userId, { is_active: true })
          case 'deactivate':
            return UsersClientsService.update(userId, { is_active: false })
          case 'decommission':
            return UsersClientsService.update(userId, { is_active: false })
          default:
            return Promise.resolve()
        }
      })

      await Promise.all(promises)
      await loadData()
      setSelectedUsers([])
      setSelectAll(false)
      
      setNotification({
        message: `Bulk ${action} completed successfully`,
        type: 'success'
      })
    } catch (err) {
      console.error(`Failed to perform bulk ${action}:`, err)
      setNotification({
        message: `Failed to perform bulk ${action}. Please try again.`,
        type: 'error'
      })
    }
  }

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([])
      setSelectAll(false)
    } else {
      setSelectedUsers(filteredUsers.map(userClient => userClient.id))
      setSelectAll(true)
    }
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const getUniqueClients = () => {
    const clientNames = [...new Set(clientUsers.map(userClient => userClient.clientName).filter(Boolean))]
    return clientNames.sort()
  }

  const getUniqueRoles = () => {
    const roles = [...new Set(clientUsers.map(userClient => userClient.role).filter(Boolean))]
    return roles.sort()
  }

  const getStatusCounts = () => {
    const active = clientUsers.filter(userClient => userClient.is_active).length
    const inactive = clientUsers.filter(userClient => !userClient.is_active).length
    const neverLoggedIn = clientUsers.filter(userClient => !userClient.user?.last_login).length
    const inactive90Days = clientUsers.filter(userClient => {
      if (!userClient.user?.last_login) return false
      const lastLogin = new Date(userClient.user.last_login)
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      return lastLogin < ninetyDaysAgo
    }).length
    
    return { active, inactive, neverLoggedIn, inactive90Days, total: clientUsers.length }
  }

  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return 'Never'
    const date = new Date(lastLogin)
    const now = new Date()
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  const getLastLoginColor = (lastLogin) => {
    if (!lastLogin) return 'text-red-600'
    const date = new Date(lastLogin)
    const now = new Date()
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    
    if (diffInDays <= 7) return 'text-green-600'
    if (diffInDays <= 30) return 'text-yellow-600'
    return 'text-red-600'
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

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Users Management</h1>
            <p className="text-gray-600 mt-1">
              Manage all client users across different companies
            </p>
          </div>
          <button
            onClick={loadData}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.total}</div>
            <div className="text-sm text-blue-600">Total Users</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{statusCounts.active}</div>
            <div className="text-sm text-green-600">Active</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{statusCounts.inactive}</div>
            <div className="text-sm text-red-600">Inactive</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.neverLoggedIn}</div>
            <div className="text-sm text-yellow-600">Never Logged In</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">{statusCounts.inactive90Days}</div>
            <div className="text-sm text-orange-600">Inactive 90+ Days</div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Clients</option>
              {getUniqueClients().map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              {getUniqueRoles().map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={lastLoginFilter}
              onChange={(e) => setLastLoginFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Login Activity</option>
              <option value="never">Never Logged In</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="inactive">Inactive 90+ Days</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              {selectedUsers.length} user(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
              >
                Activate All
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
              >
                Deactivate All
              </button>
              <button
                onClick={() => handleBulkAction('decommission')}
                className="px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-md hover:bg-orange-200"
              >
                Decommission Inactive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Client Users ({filteredUsers.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>User</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('email')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Email</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('client')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Client</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('role')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Role</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('last_login')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Last Login</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Status</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No users found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((userClient) => (
                  <tr key={userClient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(userClient.id)}
                        onChange={() => handleSelectUser(userClient.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {userClient.user?.first_name?.[0]}{userClient.user?.last_name?.[0]}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {userClient.user?.first_name} {userClient.user?.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userClient.user?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {userClient.clientName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {userClient.role || 'No Role'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={getLastLoginColor(userClient.user?.last_login)}>
                        {formatLastLogin(userClient.user?.last_login)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        userClient.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {userClient.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleStatusToggle(userClient.id, userClient.is_active)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          userClient.is_active
                            ? 'text-red-700 bg-red-100 hover:bg-red-200'
                            : 'text-green-700 bg-green-100 hover:bg-green-200'
                        }`}
                      >
                        {userClient.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 