'use client'

import { useState, useEffect } from 'react'
import { ResourcePermission } from '@/utils/resourcePermissionService'

interface ResourcePermissionListProps {
  permissions: ResourcePermission[]
  onAssignPermission: (permissionId: string) => void
  showAssignButton?: boolean
}

export default function ResourcePermissionList({
  permissions,
  onAssignPermission,
  showAssignButton = true
}: ResourcePermissionListProps) {
  const [categorizedPermissions, setCategorizedPermissions] = useState<Record<string, ResourcePermission[]>>({})
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Group permissions by category
    const categorized = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = []
      }
      acc[permission.category].push(permission)
      return acc
    }, {} as Record<string, ResourcePermission[]>)

    setCategorizedPermissions(categorized)
    
    // Expand all categories by default
    setExpandedCategories(new Set(Object.keys(categorized)))
  }, [permissions])

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Authentication':
        return '🔐'
      case 'User Management':
        return '👥'
      case 'Client Management':
        return '🏢'
      case 'Delivery Challan':
        return '📦'
      case 'Permission Management':
        return '⚙️'
      default:
        return '📋'
    }
  }

  const getActionBadgeColor = (action: string) => {
    if (action.includes('create')) return 'bg-green-100 text-green-800'
    if (action.includes('read')) return 'bg-blue-100 text-blue-800'
    if (action.includes('update')) return 'bg-yellow-100 text-yellow-800'
    if (action.includes('delete')) return 'bg-red-100 text-red-800'
    if (action.includes('list')) return 'bg-purple-100 text-purple-800'
    if (action.includes('upload')) return 'bg-indigo-100 text-indigo-800'
    if (action.includes('assign')) return 'bg-pink-100 text-pink-800'
    if (action.includes('evaluate')) return 'bg-gray-100 text-gray-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (permissions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 text-lg">No resource permissions available</div>
        <div className="text-gray-400 text-sm mt-2">Resource permissions will appear here once initialized</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {Object.entries(categorizedPermissions).map(([category, categoryPermissions]) => (
        <div key={category} className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <button
            onClick={() => toggleCategory(category)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{getCategoryIcon(category)}</span>
              <div>
                <h3 className="font-semibold text-gray-900">{category}</h3>
                <p className="text-sm text-gray-500">
                  {categoryPermissions.length} permission{categoryPermissions.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {expandedCategories.has(category) ? 'Collapse' : 'Expand'}
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedCategories.has(category) ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {expandedCategories.has(category) && (
            <div className="border-t border-gray-200">
              <div className="p-4 space-y-3">
                {categoryPermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{permission.id}</h4>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {permission.resource}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{permission.description}</p>
                        
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                            Allowed Actions:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {permission.actions.map((action) => (
                              <span
                                key={action}
                                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getActionBadgeColor(action)}`}
                              >
                                {action}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {showAssignButton && (
                        <div className="ml-4">
                          <button
                            onClick={() => onAssignPermission(permission.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Assign
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 