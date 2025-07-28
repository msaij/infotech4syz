'use client'

import { useState } from 'react'
import { PermissionStatement } from '@/utils/policyService'
import { env } from '@/config/env'

interface StatementBuilderProps {
  statement: PermissionStatement
  onChange: (statement: PermissionStatement) => void
  onRemove: () => void
}

export default function StatementBuilder({ statement, onChange, onRemove }: StatementBuilderProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Get all available actions and resources from env
  const allActions = Object.values(env.PERMISSIONS.ACTIONS)
  const allResources = Object.values(env.PERMISSIONS.RESOURCES)

  const handleEffectChange = (effect: 'Allow' | 'Deny') => {
    onChange({ ...statement, effect })
  }

  const handleActionToggle = (action: string) => {
    const newActions = statement.actions.includes(action)
      ? statement.actions.filter(a => a !== action)
      : [...statement.actions, action]
    onChange({ ...statement, actions: newActions })
  }

  const handleResourceChange = (resources: string[]) => {
    onChange({ ...statement, resources })
  }

  const handleCustomResourceAdd = (resource: string) => {
    if (resource && !statement.resources.includes(resource)) {
      onChange({ ...statement, resources: [...statement.resources, resource] })
    }
  }

  const handleResourceRemove = (resource: string) => {
    onChange({ ...statement, resources: statement.resources.filter(r => r !== resource) })
  }

  const handleSelectAllActions = () => {
    onChange({ ...statement, actions: allActions })
  }

  const handleClearAllActions = () => {
    onChange({ ...statement, actions: [] })
  }

  const handleSelectAllResources = () => {
    onChange({ ...statement, resources: allResources })
  }

  const handleClearAllResources = () => {
    onChange({ ...statement, resources: [] })
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-medium text-gray-900">Permission Statement</h4>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-800"
        >
          Remove Statement
        </button>
      </div>

      {/* Effect Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Effect
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="effect"
              value="Allow"
              checked={statement.effect === 'Allow'}
              onChange={(e) => handleEffectChange(e.target.value as 'Allow' | 'Deny')}
              className="mr-2"
            />
            <span className="text-green-600 font-medium">Allow</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="effect"
              value="Deny"
              checked={statement.effect === 'Deny'}
              onChange={(e) => handleEffectChange(e.target.value as 'Allow' | 'Deny')}
              className="mr-2"
            />
            <span className="text-red-600 font-medium">Deny</span>
          </label>
        </div>
      </div>

      {/* Actions Selection */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Actions
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleSelectAllActions}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleClearAllActions}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
            >
              Clear All
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
          {allActions.map(action => (
            <label key={action} className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={statement.actions.includes(action)}
                onChange={() => handleActionToggle(action)}
                className="mr-2"
              />
              <span className="truncate" title={action}>
                {action.split(':')[1] || action}
              </span>
            </label>
          ))}
        </div>
        {statement.actions.length > 0 && (
          <div className="mt-2 text-xs text-gray-600">
            Selected: {statement.actions.length} action(s)
          </div>
        )}
      </div>

      {/* Resources Selection */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Resources
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleSelectAllResources}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleClearAllResources}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
            >
              Clear All
            </button>
          </div>
        </div>
        
        {/* Predefined Resources */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
          {allResources.map(resource => (
            <label key={resource} className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={statement.resources.includes(resource)}
                onChange={() => {
                  if (statement.resources.includes(resource)) {
                    handleResourceRemove(resource)
                  } else {
                    handleResourceChange([...statement.resources, resource])
                  }
                }}
                className="mr-2"
              />
              <span className="truncate" title={resource}>
                {resource}
              </span>
            </label>
          ))}
        </div>

        {/* Custom Resource Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Add custom resource (e.g., user:123, client:*)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const target = e.target as HTMLInputElement
                handleCustomResourceAdd(target.value)
                target.value = ''
              }
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement
              handleCustomResourceAdd(input.value)
              input.value = ''
            }}
            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        {/* Selected Resources Display */}
        {statement.resources.length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-gray-600 mb-1">Selected Resources:</div>
            <div className="flex flex-wrap gap-1">
              {statement.resources.map(resource => (
                <span
                  key={resource}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {resource}
                  <button
                    onClick={() => handleResourceRemove(resource)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Advanced Options */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>
        
        {showAdvanced && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              Conditions and advanced features will be implemented in future versions.
            </p>
          </div>
        )}
      </div>

      {/* Statement Preview */}
      <div className="bg-white border border-gray-200 rounded p-3">
        <div className="text-sm font-medium text-gray-700 mb-2">Statement Preview:</div>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
          {JSON.stringify(statement, null, 2)}
        </pre>
      </div>
    </div>
  )
} 