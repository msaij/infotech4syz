'use client'

import { useState, useEffect } from 'react'
import { useNotification } from '@/lib/notification-context'
import { RbacService, UsersFoursyzService } from '@/lib/api-service'

export function UserRoleManager() {
  const { success, error: showError, warning } = useNotification()
  const [userRoles, setUserRoles] = useState([])
  const [roles, setRoles] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignForm, setAssignForm] = useState({
    user_id: '',
    role_id: ''
  })
  const [assignLoading, setAssignLoading] = useState(false)

  useEffect(() => {
    fetchUserRoles()
    fetchRoles()
    fetchUsers()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserRoles = async () => {
    try {
      const data = await RbacService.getUserRoles()
      setUserRoles(data.results || data)
    } catch (error) {
      console.error('Error fetching user roles:', error)
      showError('Failed to load user role assignments')
    }
  }

  const fetchRoles = async () => {
    try {
      const data = await RbacService.getRoles()
      setRoles(data.results || data)
    } catch (error) {
      console.error('Error fetching roles:', error)
      showError('Failed to load roles')
    }
  }

  const fetchUsers = async () => {
    try {
      const data = await UsersFoursyzService.getAll()
      setUsers(data.results || data)
    } catch (error) {
      console.error('Error fetching users:', error)
      showError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRole = async (e) => {
    e.preventDefault()
    
    if (!assignForm.user_id || !assignForm.role_id) {
      showError('Please select both user and role')
      return
    }

    setAssignLoading(true)
    try {
      await RbacService.assignRole(assignForm)
      success('Role assigned successfully')
      setAssignForm({ user_id: '', role_id: '' })
      setShowAssignModal(false)
      fetchUserRoles() // Refresh the list
    } catch (error) {
      console.error('Error assigning role:', error)
      showError(error.message || 'Failed to assign role')
    } finally {
      setAssignLoading(false)
    }
  }

  const handleRemoveRole = async (userRoleId) => {
    if (!confirm('Are you sure you want to remove this role assignment?')) {
      return
    }

    try {
      await RbacService.removeUserRole(userRoleId)
      success('Role assignment removed successfully')
      fetchUserRoles() // Refresh the list
    } catch (error) {
      console.error('Error removing role assignment:', error)
      showError('Failed to remove role assignment')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setAssignForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return (
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
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">User Role Assignments</h2>
          <button
            onClick={() => setShowAssignModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Assign Role
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userRoles.map((userRole) => (
                <tr key={userRole.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {userRole.user?.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {userRole.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      userRole.role?.role_type === 'foursyz' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {userRole.role?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(userRole.assigned_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      userRole.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {userRole.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleRemoveRole(userRole.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {userRoles.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No user role assignments found.</p>
          </div>
        )}
      </div>

      {/* Assign Role Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Role to User</h3>
              <form onSubmit={handleAssignRole} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User
                  </label>
                  <select
                    name="user_id"
                    value={assignForm.user_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.user?.first_name} {user.user?.last_name} ({user.user?.email})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    name="role_id"
                    value={assignForm.role_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name} ({role.role_type})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    disabled={assignLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={assignLoading}
                  >
                    {assignLoading ? 'Assigning...' : 'Assign Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 