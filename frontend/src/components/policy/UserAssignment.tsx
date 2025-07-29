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

interface GroupedAssignments {
  [userId: string]: {
    user: UserData
    assignments: PolicyAssignment[]
  }
}

interface GroupedPolicies {
  [resourceType: string]: Policy[]
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
  const [collapsedUsers, setCollapsedUsers] = useState<Set<string>>(new Set())

  // Group policies by resource type
  const groupPoliciesByResource = (policies: Policy[]): GroupedPolicies => {
    const grouped: GroupedPolicies = {}
    
    policies.forEach(policy => {
      // Extract the primary resource from the first statement
      let resourceType = 'Other'
      
      if (policy.statements && policy.statements.length > 0) {
        const firstStatement = policy.statements[0]
        if (firstStatement.resources && firstStatement.resources.length > 0) {
          const primaryResource = firstStatement.resources[0]
          
          // Map resource patterns to readable names
          if (primaryResource.includes('auth:')) {
            resourceType = 'Authentication'
          } else if (primaryResource.includes('user:')) {
            resourceType = 'User Management'
          } else if (primaryResource.includes('client:')) {
            resourceType = 'Client Management'
          } else if (primaryResource.includes('delivery_challan:')) {
            resourceType = 'Delivery Challan'
          } else if (primaryResource.includes('permissions:')) {
            resourceType = 'Permission Management'
          } else {
            resourceType = 'Other'
          }
        }
      }
      
      if (!grouped[resourceType]) {
        grouped[resourceType] = []
      }
      grouped[resourceType].push(policy)
    })
    
    return grouped
  }

  const groupedPolicies = groupPoliciesByResource(policies)

  // Group assignments by user
  const groupedAssignments: GroupedAssignments = assignments.reduce((acc, assignment) => {
    const user = users.find(u => u.id === assignment.user_id)
    if (!user) return acc
    
    if (!acc[user.id]) {
      acc[user.id] = {
        user,
        assignments: []
      }
    }
    acc[user.id].assignments.push(assignment)
    return acc
  }, {} as GroupedAssignments)

  // Filter grouped assignments based on search term
  const filteredGroupedAssignments = Object.entries(groupedAssignments).filter(([userId, group]) => {
    const searchLower = searchTerm.toLowerCase()
    const userMatches = group.user.username?.toLowerCase().includes(searchLower) ||
                       group.user.email?.toLowerCase().includes(searchLower)
    
    const policyMatches = group.assignments.some(assignment => {
      const policy = policies.find(p => p.id === assignment.policy_id)
      return policy?.name?.toLowerCase().includes(searchLower)
    })
    
    return userMatches || policyMatches
  })

  // Auto-expand users when searching
  useEffect(() => {
    if (searchTerm) {
      setCollapsedUsers(new Set())
    }
  }, [searchTerm])

  const toggleUserCollapse = (userId: string) => {
    setCollapsedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  const expandAll = () => {
    setCollapsedUsers(new Set())
  }

  const collapseAll = () => {
    setCollapsedUsers(new Set(filteredGroupedAssignments.map(([userId]) => userId)))
  }

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

  const getAssignmentStatus = (assignment: PolicyAssignment): { text: string; color: string; bgColor: string } => {
    if (!assignment.active) {
      return { text: 'Inactive', color: 'text-gray-600', bgColor: 'bg-gray-100' }
    }
    if (assignment.expires_at && new Date(assignment.expires_at) <= new Date()) {
      return { text: 'Expired', color: 'text-red-700', bgColor: 'bg-red-50' }
    }
    return { text: 'Active', color: 'text-green-700', bgColor: 'bg-green-50' }
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString()
  }

  const getTotalAssignments = () => {
    return Object.values(groupedAssignments).reduce((total, group) => total + group.assignments.length, 0)
  }

  const getFilteredAssignments = () => {
    return filteredGroupedAssignments.reduce((total, [_, group]) => total + group.assignments.length, 0)
  }

  return (
    <div>
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAssignmentForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Assign Policy
          </button>
        </div>
      </div>

      {/* Collapse Controls */}
      {filteredGroupedAssignments.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={expandAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Expand All
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={collapseAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Collapse All
          </button>
        </div>
      )}

      {/* Assignment Form */}
      {showAssignmentForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Assign Policy to User</h3>
            <button
              onClick={() => setShowAssignmentForm(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  required
                >
                  <option value="" className="text-gray-500">Select a user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id} className="text-gray-900">
                      {user.username} ({user.email})
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  required
                >
                  <option value="" className="text-gray-500">Select a policy</option>
                  {Object.entries(groupedPolicies).map(([resourceType, policies]) => (
                    <optgroup key={resourceType} label={resourceType}>
                      {policies.map(policy => (
                        <option key={policy.id} value={policy.id} className="text-gray-900">
                          {policy.name} (v{policy.version})
                        </option>
                      ))}
                    </optgroup>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={assignmentData.active}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add notes about this assignment"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAssignmentForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedUser || !selectedPolicy}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Assigning...' : 'Assign Policy'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments Table - Grouped by User */}
      <div className="space-y-4">
        {filteredGroupedAssignments.map(([userId, group]) => {
          const isCollapsed = collapsedUsers.has(userId)
          
          return (
            <div key={userId} className="bg-white border border-gray-200 rounded-lg shadow-sm">
              {/* User Header - Clickable for collapse/expand */}
              <div 
                className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleUserCollapse(userId)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <svg 
                      className={`h-5 w-5 text-gray-500 transition-transform ${isCollapsed ? 'rotate-90' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{group.user.username}</h3>
                      <p className="text-sm text-gray-500">{group.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-500">
                      {group.assignments.length} assignment{group.assignments.length !== 1 ? 's' : ''}
                    </div>
                    <svg 
                      className={`h-4 w-4 text-gray-400 transition-transform ${isCollapsed ? 'rotate-90' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* User's Assignments Table - Collapsible */}
              {!isCollapsed && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
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
                      {group.assignments.map(assignment => {
                        const policy = policies.find(p => p.id === assignment.policy_id)
                        const status = getAssignmentStatus(assignment)

                        return (
                          <tr key={assignment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{policy?.name}</div>
                              <div className="text-sm text-gray-500">v{policy?.version}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color} ${status.bgColor}`}>
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
                                className="text-red-600 hover:text-red-900 transition-colors"
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
              )}
            </div>
          )
        })}
      </div>

      {filteredGroupedAssignments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'No assignments found matching your search.' : 'Get started by assigning a policy to a user.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                onClick={() => setShowAssignmentForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Assign Policy
              </button>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {filteredGroupedAssignments.length > 0 && (
        <div className="mt-6 text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-md">
          Showing {getFilteredAssignments()} assignments from {filteredGroupedAssignments.length} users
          {searchTerm && ` matching "${searchTerm}"`}
          {getTotalAssignments() !== getFilteredAssignments() && ` (of ${getTotalAssignments()} total assignments)`}
        </div>
      )}
    </div>
  )
} 