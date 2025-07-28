'use client'

import { useState } from 'react'
import { Policy } from '@/utils/policyService'

interface PolicyListProps {
  policies: Policy[]
  onEdit: (policy: Policy) => void
  onDelete: (policyId: string) => void
  onView: (policy: Policy) => void
  loading: boolean
}

export default function PolicyList({ policies, onEdit, onDelete, onView, loading }: PolicyListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([])

  const filteredPolicies = policies.filter(policy =>
    policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPolicies(filteredPolicies.map(p => p.id))
    } else {
      setSelectedPolicies([])
    }
  }

  const handleSelectPolicy = (policyId: string, checked: boolean) => {
    if (checked) {
      setSelectedPolicies(prev => [...prev, policyId])
    } else {
      setSelectedPolicies(prev => prev.filter(id => id !== policyId))
    }
  }

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedPolicies.length} policies?`)) {
      selectedPolicies.forEach(policyId => onDelete(policyId))
      setSelectedPolicies([])
    }
  }

  const handleExportPolicies = () => {
    const dataStr = JSON.stringify(filteredPolicies, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `policies-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading policies...</span>
      </div>
    )
  }

  return (
    <div>
      {/* Search and Actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExportPolicies}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Export JSON
          </button>
          {selectedPolicies.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Delete Selected ({selectedPolicies.length})
            </button>
          )}
        </div>
      </div>

      {/* Policies Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedPolicies.length === filteredPolicies.length && filteredPolicies.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Version
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statements
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPolicies.map(policy => (
              <tr key={policy.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedPolicies.includes(policy.id)}
                    onChange={(e) => handleSelectPolicy(policy.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{policy.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 truncate max-w-xs">{policy.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{policy.version}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{policy.statements.length}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(policy.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onView(policy)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEdit(policy)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(policy.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPolicies.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No policies found matching your search.' : 'No policies found.'}
        </div>
      )}

      {/* Summary */}
      {filteredPolicies.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredPolicies.length} of {policies.length} policies
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      )}
    </div>
  )
} 