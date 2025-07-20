'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useNotification } from '@/lib/notification-context'
import { UsersFoursyzService, RbacService } from '@/lib/api-service'

export function UserForm({ user = null, onSuccess, onCancel }) {
  const { hasPermission, isOwner, isAdmin } = useAuth()
  const { success, error: showError } = useNotification()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    is_active: true,
    roles: [],
    generate_password: true,
    password: ''
  })
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    loadRoles()
    if (user) {
      setIsEditing(true)
      // Handle both UserFoursyz objects and plain user objects
      const userData = user.user || user
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        phone: userData.phone || '',
        is_active: userData.is_active !== undefined ? userData.is_active : true,
        roles: userData.roles?.map(role => role.id) || []
      })
    }
  }, [user])

  const loadRoles = async () => {
    try {
      const response = await RbacService.getRoles()
      setRoles(response.results || [])
    } catch (error) {
      console.error('Failed to load roles:', error)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Validate email domain for 4syz users
    if (formData.email && !formData.email.endsWith('@4syz.com')) {
      newErrors.email = '4syz users must use @4syz.com email domain'
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (formData.roles.length === 0) {
      newErrors.roles = 'At least one role must be selected'
    }

    // Password validation for new users
    if (!isEditing) {
      if (!formData.generate_password && !formData.password.trim()) {
        newErrors.password = 'Password is required when not generating automatically'
      } else if (!formData.generate_password && formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      let userData = { ...formData }

      if (isEditing) {
        // Handle both UserFoursyz objects and plain user objects
        const userId = user.id || user.user?.id
        // Remove password fields for updates unless new password is provided
        delete userData.password
        delete userData.generate_password
        await UsersFoursyzService.update(userId, userData)
      } else {
        // For new users, handle password generation
        if (formData.generate_password) {
          delete userData.password
        } else if (!formData.password) {
          setErrors({ password: 'Password is required when not generating automatically' })
          setLoading(false)
          return
        }
        // Remove generate_password flag from the request
        delete userData.generate_password
        
        const response = await UsersFoursyzService.create(userData)
        
        // Show generated password if it was generated
        if (response.generated_password) {
          success(`User created successfully! Generated password: ${response.generated_password}. Please share this password securely with the user. They will be required to change it on first login.`, 10000)
        } else {
          success('User created successfully!')
        }
      }

      onSuccess()
    } catch (error) {
      console.error('Failed to save user:', error)
      if (error.response?.data) {
        // Handle validation errors from backend
        const backendErrors = error.response.data
        const newErrors = {}
        Object.keys(backendErrors).forEach(key => {
          if (Array.isArray(backendErrors[key])) {
            newErrors[key] = backendErrors[key][0]
          } else {
            newErrors[key] = backendErrors[key]
          }
        })
        setErrors(newErrors)
      } else {
        const errorMessage = error.message || 'Failed to save user'
        setErrors({ submit: errorMessage })
        showError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleRoleChange = (roleId) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter(id => id !== roleId)
        : [...prev.roles, roleId]
    }))
    
    if (errors.roles) {
      setErrors(prev => ({ ...prev, roles: '' }))
    }
  }

  if (!hasPermission('manage_users') && !isOwner() && !isAdmin()) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">You don&apos;t have permission to manage users.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? 'Edit User' : 'Create New User'}
        </h2>
        <p className="text-gray-600 mt-1">
          {isEditing ? 'Update user information and roles' : 'Add a new 4syz user to the system'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{errors.submit}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.username ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter username"
              disabled={isEditing}
            />
            {errors.username && (
              <p className="text-red-600 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="user@4syz.com"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Section - Only for new users */}
          {!isEditing && (
            <>
              {/* Password Generation Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="generate_password"
                  name="generate_password"
                  checked={formData.generate_password}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="generate_password" className="ml-2 block text-sm text-gray-700">
                  Generate secure password automatically
                </label>
              </div>

              {/* Manual Password Input */}
              {!formData.generate_password && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter secure password"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 8 characters with uppercase, lowercase, numbers, and symbols
                  </p>
                  {errors.password && (
                    <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* First Name */}
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.first_name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter first name"
            />
            {errors.first_name && (
              <p className="text-red-600 text-sm mt-1">{errors.first_name}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.last_name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter last name"
            />
            {errors.last_name && (
              <p className="text-red-600 text-sm mt-1">{errors.last_name}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="+1234567890"
            />
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              Active User
            </label>
          </div>
        </div>

        {/* Roles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Roles *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {roles.length > 0 ? (
              roles.map(role => (
                <div key={role.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`role-${role.id}`}
                    checked={formData.roles.includes(role.id)}
                    onChange={() => handleRoleChange(role.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`role-${role.id}`} className="ml-2 block text-sm text-gray-700">
                    {role.name}
                  </label>
                </div>
              ))
            ) : (
              <div className="col-span-full">
                <p className="text-gray-500 text-sm">Loading roles...</p>
              </div>
            )}
          </div>
          {errors.roles && (
            <p className="text-red-600 text-sm mt-1">{errors.roles}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
          </button>
        </div>
      </form>
    </div>
  )
} 