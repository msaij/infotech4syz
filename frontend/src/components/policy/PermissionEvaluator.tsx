'use client'

import { useState } from 'react'
import { PermissionEvaluation, PermissionEvaluationData } from '@/utils/policyService'
import { UserData } from '@/utils/auth'
import { env } from '@/config/env'

interface PermissionEvaluatorProps {
  users: UserData[]
  onEvaluate: (evaluationData: PermissionEvaluationData) => void
  result?: PermissionEvaluation
  loading: boolean
}

export default function PermissionEvaluator({ 
  users, 
  onEvaluate, 
  result, 
  loading 
}: PermissionEvaluatorProps) {
  const [evaluationData, setEvaluationData] = useState<PermissionEvaluationData>({
    user_id: '',
    action: '',
    resource: '',
    context: {}
  })
  const [showContext, setShowContext] = useState(false)
  const [contextJson, setContextJson] = useState('{}')

  // Get all available actions and resources from env
  const allActions = Object.values(env.PERMISSIONS.ACTIONS)
  const allResources = Object.values(env.PERMISSIONS.RESOURCES)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!evaluationData.user_id || !evaluationData.action || !evaluationData.resource) {
      return
    }

    // Parse context JSON if provided
    let context = {}
    if (showContext && contextJson.trim()) {
      try {
        context = JSON.parse(contextJson)
      } catch (error) {
        alert('Invalid JSON in context field')
        return
      }
    }

    onEvaluate({
      ...evaluationData,
      context
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEvaluationData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleContextToggle = () => {
    setShowContext(!showContext)
    if (!showContext) {
      setContextJson('{}')
    }
  }

  const getResultIcon = () => {
    if (!result) return null
    
    if (result.allowed) {
      return (
        <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    } else {
      return (
        <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  }

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Evaluation Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Evaluate Permission</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-1">
                User *
              </label>
              <select
                id="user_id"
                name="user_id"
                value={evaluationData.user_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">
                Action *
              </label>
              <select
                id="action"
                name="action"
                value={evaluationData.action}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select an action</option>
                {allActions.map(action => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="resource" className="block text-sm font-medium text-gray-700 mb-1">
                Resource *
              </label>
              <select
                id="resource"
                name="resource"
                value={evaluationData.resource}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a resource</option>
                {allResources.map(resource => (
                  <option key={resource} value={resource}>
                    {resource}
                  </option>
                ))}
                <option value="custom">Custom Resource</option>
              </select>
            </div>
          </div>

          {/* Custom Resource Input */}
          {evaluationData.resource === 'custom' && (
            <div className="mb-4">
              <label htmlFor="custom_resource" className="block text-sm font-medium text-gray-700 mb-1">
                Custom Resource *
              </label>
              <input
                type="text"
                id="custom_resource"
                placeholder="e.g., user:123, client:*, delivery_challan:456"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setEvaluationData(prev => ({ ...prev, resource: e.target.value }))}
                required
              />
            </div>
          )}

          {/* Context Toggle */}
          <div className="mb-4">
            <button
              type="button"
              onClick={handleContextToggle}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showContext ? 'Hide' : 'Add'} Context (Optional)
            </button>
          </div>

          {/* Context JSON Input */}
          {showContext && (
            <div className="mb-4">
              <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-1">
                Context (JSON)
              </label>
              <textarea
                id="context"
                value={contextJson}
                onChange={(e) => setContextJson(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder='{"time": "2024-01-01T00:00:00Z", "ip": "192.168.1.1"}'
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter valid JSON for additional context (optional)
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !evaluationData.user_id || !evaluationData.action || !evaluationData.resource}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Evaluating...' : 'Evaluate Permission'}
            </button>
          </div>
        </form>
      </div>

      {/* Evaluation Result */}
      {result && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Evaluation Result</h3>
          
          <div className="flex items-center space-x-4 mb-4">
            {getResultIcon()}
            <div>
              <h4 className={`text-lg font-semibold ${result.allowed ? 'text-green-600' : 'text-red-600'}`}>
                {result.allowed ? 'Permission Granted' : 'Permission Denied'}
              </h4>
              <p className="text-sm text-gray-600">
                Evaluated at {formatDateTime(result.evaluation_time)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Request Details</h5>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm">
                  <div><strong>User ID:</strong> {result.user_id}</div>
                  <div><strong>Action:</strong> {result.action}</div>
                  <div><strong>Resource:</strong> {result.resource}</div>
                  {result.context && Object.keys(result.context).length > 0 && (
                    <div><strong>Context:</strong> {JSON.stringify(result.context)}</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Matched Policies</h5>
              <div className="bg-gray-50 p-3 rounded">
                {result.matched_policies.length > 0 ? (
                  <ul className="text-sm space-y-1">
                    {result.matched_policies.map((policyId, index) => (
                      <li key={index} className="text-blue-600">{policyId}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No policies matched</p>
                )}
              </div>
            </div>
          </div>

          {result.denied_reason && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Denial Reason</h5>
              <div className="bg-red-50 border border-red-200 p-3 rounded">
                <p className="text-sm text-red-800">{result.denied_reason}</p>
              </div>
            </div>
          )}

          {/* Raw Result */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Raw Result</h5>
            <div className="bg-gray-50 border border-gray-200 rounded p-3">
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      
    </div>
  )
} 