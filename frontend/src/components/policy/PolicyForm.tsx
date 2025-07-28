'use client'

import { useState, useEffect } from 'react'
import { Policy, CreatePolicyData, UpdatePolicyData, PermissionStatement } from '@/utils/policyService'
import StatementBuilder from './StatementBuilder'

interface PolicyFormProps {
  policy?: Policy
  onSubmit: (policyData: CreatePolicyData | UpdatePolicyData) => void
  onCancel: () => void
  loading: boolean
}

export default function PolicyForm({ policy, onSubmit, onCancel, loading }: PolicyFormProps) {
  const [formData, setFormData] = useState<CreatePolicyData>({
    name: '',
    description: '',
    version: '1.0',
    statements: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (policy) {
      setFormData({
        name: policy.name,
        description: policy.description,
        version: policy.version,
        statements: policy.statements
      })
    } else {
      // Initialize with a default statement
      setFormData({
        name: '',
        description: '',
        version: '1.0',
        statements: [{
          effect: 'Allow',
          actions: [],
          resources: []
        }]
      })
    }
  }, [policy])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Policy name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Policy description is required'
    }

    if (!formData.version.trim()) {
      newErrors.version = 'Version is required'
    }

    if (formData.statements.length === 0) {
      newErrors.statements = 'At least one statement is required'
    }

    // Validate each statement
    formData.statements.forEach((statement, index) => {
      if (statement.actions.length === 0) {
        newErrors[`statement_${index}_actions`] = 'At least one action is required'
      }
      if (statement.resources.length === 0) {
        newErrors[`statement_${index}_resources`] = 'At least one resource is required'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    onSubmit(formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleStatementChange = (index: number, statement: PermissionStatement) => {
    const newStatements = [...formData.statements]
    newStatements[index] = statement
    setFormData(prev => ({ ...prev, statements: newStatements }))
    
    // Clear statement-specific errors
    const newErrors = { ...errors }
    delete newErrors[`statement_${index}_actions`]
    delete newErrors[`statement_${index}_resources`]
    setErrors(newErrors)
  }

  const handleAddStatement = () => {
    const newStatement: PermissionStatement = {
      effect: 'Allow',
      actions: [],
      resources: []
    }
    setFormData(prev => ({
      ...prev,
      statements: [...prev.statements, newStatement]
    }))
  }

  const handleRemoveStatement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      statements: prev.statements.filter((_, i) => i !== index)
    }))
  }

  const handleDuplicateStatement = (index: number) => {
    const statementToDuplicate = formData.statements[index]
    const newStatement: PermissionStatement = {
      ...statementToDuplicate,
      actions: [...statementToDuplicate.actions],
      resources: [...statementToDuplicate.resources]
    }
    
    const newStatements = [...formData.statements]
    newStatements.splice(index + 1, 0, newStatement)
    setFormData(prev => ({ ...prev, statements: newStatements }))
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          {policy ? 'Edit Policy' : 'Create New Policy'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Policy Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Policy Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter policy name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">
              Version *
            </label>
            <input
              type="text"
              id="version"
              name="version"
              value={formData.version}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.version ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., 1.0"
            />
            {errors.version && <p className="mt-1 text-sm text-red-600">{errors.version}</p>}
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Describe what this policy allows or denies"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Statements Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-900">Permission Statements</h4>
            <button
              type="button"
              onClick={handleAddStatement}
              className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
            >
              Add Statement
            </button>
          </div>

          {errors.statements && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-600">{errors.statements}</p>
            </div>
          )}

          {formData.statements.map((statement, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h5 className="text-sm font-medium text-gray-700">
                  Statement {index + 1}
                </h5>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleDuplicateStatement(index)}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                  >
                    Duplicate
                  </button>
                  {formData.statements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStatement(index)}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <StatementBuilder
                statement={statement}
                onChange={(updatedStatement) => handleStatementChange(index, updatedStatement)}
                onRemove={() => handleRemoveStatement(index)}
              />

              {/* Statement-specific errors */}
              {errors[`statement_${index}_actions`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`statement_${index}_actions`]}</p>
              )}
              {errors[`statement_${index}_resources`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`statement_${index}_resources`]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Policy Preview */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-2">Policy Preview</h4>
          <div className="bg-gray-50 border border-gray-200 rounded p-4">
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify({
                name: formData.name,
                description: formData.description,
                version: formData.version,
                statements: formData.statements
              }, null, 2)}
            </pre>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (policy ? 'Update Policy' : 'Create Policy')}
          </button>
        </div>
      </form>
    </div>
  )
} 