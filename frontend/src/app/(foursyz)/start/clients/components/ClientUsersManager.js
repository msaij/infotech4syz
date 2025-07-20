'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { UsersClientsService } from '@/lib/api-service'
import { Notification } from '@/components/ui/Notification'

export function ClientUsersManager({ client, onClose, onUserUpdate }) {
  const { hasPermission, isOwner, isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  
  // Bulk operations
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  
  // View states
  const [viewMode, setViewMode] = useState('table') // 'table' or 'cards'
  const [sortBy, setSortBy] = useState('name') // 'name', 'email', 'role', 'status', 'last_login'
  const [sortOrder, setSortOrder] = useState('asc') // 'asc' or 'desc'

  useEffect(() => {
    if (client) {
      loadClientUsers()
    }
  }, [client])

  useEffect(() => {
    filterAndSortUsers()
  }, [users, searchTerm, statusFilter, roleFilter, sortBy, sortOrder])

  const loadClientUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get all client users
      const response = await UsersClientsService.getAll()
      const allUserClients = response.results || []
      
      // Filter users that belong to this specific client
      const clientUsers = allUserClients.filter(userClient => {
        return userClient.client && userClient.client.id === client.id
      })
      
      setUsers(clientUsers)
    } catch (error) {
      console.error('Failed to load client users:', error)
      setError('Failed to load client users: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortUsers = () => {
    let filtered = [...users]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(userClient => {
        const user = userClient.user || {}
        return user.first_name?.toLowerCase().includes(term) ||
               user.last_name?.toLowerCase().includes(term) ||
               user.email?.toLowerCase().includes(term) ||
               userClient.role?.toLowerCase().includes(term)
      })
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(userClient => {
        if (statusFilter === 'active') return userClient.is_active
        if (statusFilter === 'inactive') return !userClient.is_active
        return true
      })
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(userClient => {
        return userClient.role === roleFilter
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

  const handleStatusToggle = async (userClientId, currentStatus) => {
    try {
      await UsersClientsService.update(userClientId, { is_active: !currentStatus })
      await loadClientUsers()
      setNotification({
        message: `User ${currentStatus ? 'deactivated' : 'activated'} successfully`,
        type: 'success'
      })
      if (onUserUpdate) onUserUpdate()
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
      const promises = selectedUsers.map(userClientId => {
        switch (action) {
          case 'activate':
            return UsersClientsService.update(userClientId, { is_active: true })
          case 'deactivate':
            return UsersClientsService.update(userClientId, { is_active: false })
          default:
            return Promise.resolve()
        }
      })

      await Promise.all(promises)
      await loadClientUsers()
      setSelectedUsers([])
      setSelectAll(false)
      
      setNotification({
        message: `Bulk ${action} completed successfully`,
        type: 'success'
      })
      if (onUserUpdate) onUserUpdate()
    } catch (err) {
      console.error(`Failed to perform bulk ${action}:`, err)
      setNotification({
        message: `Failed to perform bulk ${action}. Please try again.`,
        type: 'error'
      })
    }
  }

  const handleSelectUser = (userClientId) => {
    setSelectedUsers(prev => 
      prev.includes(userClientId) 
        ? prev.filter(id => id !== userClientId)
        : [...prev, userClientId]
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

  const getUniqueRoles = () => {
    const roles = [...new Set(users.map(userClient => userClient.role).filter(Boolean))]
    return roles.sort()
  }

  const getStatusCounts = () => {
    const active = users.filter(userClient => userClient.is_active).length
    const inactive = users.filter(userClient => !userClient.is_active).length
    return { active, inactive, total: users.length }
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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
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
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Client Users - {client.name}
          </h3>
          <p className="text-sm text-gray-500">
            {statusCounts.total} total users • {statusCounts.active} active • {statusCounts.inactive} inactive
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            {getUniqueRoles().map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
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
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No users found for this client.
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {userClient.role || 'No Role'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatLastLogin(userClient.user?.last_login)}
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

      {/* Close Button */}
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Close
        </button>
      </div>
    </div>
  )
} 