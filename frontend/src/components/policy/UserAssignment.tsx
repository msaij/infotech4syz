'use client'

import { useState, useEffect } from 'react'
import { Policy, PolicyAssignment, AssignmentData } from '@/utils/policyService'
import { UserData } from '@/utils/auth'

interface UserAssignmentProps {
  users: UserData[]
  policies: Policy[]
  assignments: PolicyAssignment[]
  onAssign: (userId: string, policyId: string, assignmentData: AssignmentData) => void
  onUnassign: (userId: string, policyId: string) => void
  loading: boolean
}

export default function UserAssignment({ 
  users, 
  policies, 
  assignments, 
  onAssign, 
  onUnassign, 
  loading 
}: UserAssignmentProps) {
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [selectedPolicy, setSelectedPolicy] = useState<string>('')
  const [assignmentData, setAssignmentData] = useState<AssignmentData>({
    expires_at: '',
    notes: '',
    active: true
  })
  const [showAssignmentForm, setShowAssignmentForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAssignments = assignments.filter(assignment => {
    const user = users.find(u => u.id === assignment.user_id)
    const policy = policies.find(p => p.id === assignment.policy_id)
    const searchLower = searchTerm.toLowerCase()
    
    return (
      user?.full_name?.toLowerCase().includes(searchLower) ||
      user?.email?.toLowerCase().includes(searchLower) ||
      policy?.name?.toLowerCase().includes(searchLower)
    )
  })

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedUser || !selectedPolicy) {
      return
    }

    onAssign(selectedUser, selectedPolicy, assignmentData)
    
    // Reset form
    setSelectedUser('')
    setSelectedPolicy('')
    setAssignmentData({
      expires_at: '',
      notes: '',
      active: true
    })
    setShowAssignmentForm(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setAssignmentData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const isAssignmentActive = (assignment: PolicyAssignment): boolean => {
    if (!assignment.active) return false
    if (assignment.expires_at) {
      return new Date(assignment.expires_at) > new Date()
    }
    return true
  }

  const getAssignmentStatus = (assignment: PolicyAssignment): { text: string; color: string } => {
    if (!assignment.active) {
      return { text: 'Inactive', color: 'text-gray-500' }
    }
    if (assignment.expires_at && new Date(assignment.expires_at) <= new Date()) {
      return { text: 'Expired', color: 'text-red-600' }
    }
    return { text: 'Active', color: 'text-green-600' }
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div>
      {/* Search and Actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowAssignmentForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Assign Policy
        </button>
      </div>

      {/* Assignment Form */}
      {showAssignmentForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Assign Policy to User</h3>
            <button
              onClick={() => setShowAssignmentForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleAssignSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
                  User *
                </label>
                <select
                  id="user"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="policy" className="block text-sm font-medium text-gray-700 mb-1">
                  Policy *
                </label>
                <select
                  id="policy"
                  value={selectedPolicy}
                  onChange={(e) => setSelectedPolicy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a policy</option>
                  {policies.map(policy => (
                    <option key={policy.id} value={policy.id}>
                      {policy.name} (v{policy.version})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700 mb-1">
                  Expires At (Optional)
                </label>
                <input
                  type="datetime-local"
                  id="expires_at"
                  name="expires_at"
                  value={assignmentData.expires_at}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={assignmentData.active}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={assignmentData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add notes about this assignment"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAssignmentForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedUser || !selectedPolicy}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Assigning...' : 'Assign Policy'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Policy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAssignments.map(assignment => {
              const user = users.find(u => u.id === assignment.user_id)
              const policy = policies.find(p => p.id === assignment.policy_id)
              const status = getAssignmentStatus(assignment)

              return (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user?.full_name}</div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{policy?.name}</div>
                    <div className="text-sm text-gray-500">v{policy?.version}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(assignment.assigned_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assignment.expires_at ? formatDate(assignment.expires_at) : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-xs">
                      {assignment.notes || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onUnassign(assignment.user_id, assignment.policy_id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Unassign
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No assignments found matching your search.' : 'No assignments found.'}
        </div>
      )}

      {/* Summary */}
      {filteredAssignments.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredAssignments.length} of {assignments.length} assignments
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      )}
    </div>
  )
} 