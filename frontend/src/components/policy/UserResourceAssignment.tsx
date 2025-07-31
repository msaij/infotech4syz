'use client'

import { useState, useEffect } from 'react'
import { UserResourceAssignment as UserResourceAssignmentType, ResourcePermission, AssignmentData } from '@/utils/resourcePermissionService'
import { UserData } from '@/utils/auth'

interface UserResourceAssignmentProps {
  users: UserData[]
  permissions: ResourcePermission[]
  assignments: UserResourceAssignmentType[]
  onAssignPermission: (userId: string, permissionId: string, assignmentData: AssignmentData) => Promise<void>
  onUnassignPermission: (userId: string, permissionId: string) => Promise<void>
}

export default function UserResourceAssignment({
  users,
  permissions,
  assignments,
  onAssignPermission,
  onUnassignPermission
}: UserResourceAssignmentProps) {
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [selectedPermission, setSelectedPermission] = useState<string>('')
  const [assignmentNotes, setAssignmentNotes] = useState<string>('')
  const [expiryDate, setExpiryDate] = useState<string>('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [isUnassigning, setIsUnassigning] = useState(false)

  const handleAssignPermission = async () => {
    if (!selectedUser || !selectedPermission) {
      alert('Please select both a user and a permission')
      return
    }

    setIsAssigning(true)
    try {
      const assignmentData: AssignmentData = {
        assigned_by: 'current_user_id', // This should come from context
        notes: assignmentNotes || undefined,
        expires_at: expiryDate || undefined
      }

      await onAssignPermission(selectedUser, selectedPermission, assignmentData)
      
      // Reset form
      setSelectedPermission('')
      setAssignmentNotes('')
      setExpiryDate('')
    } catch (error) {
      console.error('Error assigning permission:', error)
    } finally {
      setIsAssigning(false)
    }
  }

  const handleUnassignPermission = async (userId: string, permissionId: string) => {
    if (!confirm('Are you sure you want to unassign this permission?')) {
      return
    }

    setIsUnassigning(true)
    try {
      await onUnassignPermission(userId, permissionId)
    } catch (error) {
      console.error('Error unassigning permission:', error)
    } finally {
      setIsUnassigning(false)
    }
  }

  const getUserAssignments = (userId: string) => {
    return assignments.filter(assignment => assignment.user_id === userId)
  }

  const getPermissionById = (permissionId: string) => {
    return permissions.find(permission => permission.id === permissionId)
  }

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId)
  }

  const isPermissionAssigned = (userId: string, permissionId: string) => {
    return assignments.some(
      assignment => 
        assignment.user_id === userId && 
        assignment.resource_permission_id === permissionId && 
        assignment.active
    )
  }

  return (
    <div className="space-y-6">
      {/* Assignment Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Resource Permission</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select User
            </label>
            <select
              id="user-select"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Choose a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="permission-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select Permission
            </label>
            <select
              id="permission-select"
              value={selectedPermission}
              onChange={(e) => setSelectedPermission(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Choose a permission...</option>
              {permissions.map((permission) => (
                <option key={permission.id} value={permission.id}>
                  {permission.id} - {permission.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Add any notes about this assignment..."
            />
          </div>

          <div>
            <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date (Optional)
            </label>
            <input
              type="datetime-local"
              id="expiry-date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          onClick={handleAssignPermission}
          disabled={!selectedUser || !selectedPermission || isAssigning}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAssigning ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Assigning...
            </>
          ) : (
            'Assign Permission'
          )}
        </button>
      </div>

      {/* User Assignments List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Current Assignments</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {users.map((user) => {
            const userAssignments = getUserAssignments(user.id)
            const activeAssignments = userAssignments.filter(assignment => assignment.active)
            
            return (
              <div key={user.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{user.username}</h4>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {activeAssignments.length} permission{activeAssignments.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {activeAssignments.length > 0 ? (
                  <div className="space-y-3">
                    {activeAssignments.map((assignment) => {
                      const permission = getPermissionById(assignment.resource_permission_id)
                      return (
                        <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{permission?.id}</span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {permission?.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{permission?.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}</span>
                              {assignment.expires_at && (
                                <span>Expires: {new Date(assignment.expires_at).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnassignPermission(user.id, assignment.resource_permission_id)}
                            disabled={isUnassigning}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isUnassigning ? 'Unassigning...' : 'Unassign'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No permissions assigned to this user</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 