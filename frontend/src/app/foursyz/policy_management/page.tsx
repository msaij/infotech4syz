'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { resourcePermissionService, ResourcePermission, UserResourceAssignment as UserResourceAssignmentType, PermissionEvaluation, AssignmentData, PermissionEvaluationData } from '@/utils/resourcePermissionService'
import { AuthService, UserData } from '@/utils/auth'
import { env } from '@/config/env'

// Tab components
import ResourcePermissionList from '@/components/policy/ResourcePermissionList'
import UserResourceAssignment from '@/components/policy/UserResourceAssignment'
import PermissionEvaluator from '@/components/policy/PermissionEvaluator'
import SystemStatus from '@/components/policy/SystemStatus'

export default function PolicyManagementPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('permissions')
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Data states
  const [permissions, setPermissions] = useState<ResourcePermission[]>([])
  const [users, setUsers] = useState<UserData[]>([])
  const [assignments, setAssignments] = useState<UserResourceAssignmentType[]>([])
  const [evaluationResult, setEvaluationResult] = useState<PermissionEvaluation | undefined>(undefined)

  // Form states
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [selectedPermissionForAssignment, setSelectedPermissionForAssignment] = useState<string>('')

  useEffect(() => {
    checkUserAndLoadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkUserAndLoadData = async () => {
    try {
      const token = AuthService.getStoredToken(env.STORAGE_KEYS.ACCESS_TOKEN)
      if (!token) {
        router.push(env.ROUTES.LOGIN)
        return
      }

      const userData = await AuthService.validateUser(token)
      if (!userData || !AuthService.isValidUser(userData)) {
        router.push(env.ROUTES.LOGIN)
        return
      }

      setUser(userData)
      
      // Check if user has permission management access
      const hasPermissionAccess = await checkPermissionAccess(userData)
      if (!hasPermissionAccess) {
        router.push(env.ROUTES.DASHBOARD)
        return
      }

      await loadInitialData()
    } catch (error) {
      console.error('Error checking user:', error)
      setError('Failed to verify user permissions')
    } finally {
      setLoading(false)
    }
  }

  const checkPermissionAccess = async (userData: UserData): Promise<boolean> => {
    try {
      // Check if user has permission management access
      const evaluation = await resourcePermissionService.evaluatePermission({
        user_id: userData.id,
        action: "permissions:read",
        resource: "permissions:*"
      })
      return evaluation.allowed
    } catch (error) {
      return false
    }
  }

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [permissionsData, assignmentsData] = await Promise.all([
        resourcePermissionService.getResourcePermissions(),
        resourcePermissionService.getAllUserAssignments()
      ])
      setPermissions(permissionsData)
      setAssignments(assignmentsData)
      
      // Load users (this needs to be implemented or use existing auth service)
      // For now, we'll use a placeholder
      setUsers([])
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleInitializePermissions = async () => {
    try {
      setLoading(true)
      const result = await resourcePermissionService.initializeResourcePermissions()
      
      if (result.status === 'success') {
        setSuccess(`Successfully initialized ${result.permissions_created} resource permissions`)
        await loadInitialData() // Reload data
      } else {
        setError(result.message)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize permissions'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignPermission = async (userId: string, permissionId: string, assignmentData: AssignmentData) => {
    try {
      setLoading(true)
      await resourcePermissionService.assignResourcePermissionToUser(userId, permissionId, assignmentData)
      setSuccess(`Successfully assigned permission '${permissionId}' to user`)
      await loadInitialData() // Reload data
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign permission'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleUnassignPermission = async (userId: string, permissionId: string) => {
    try {
      setLoading(true)
      await resourcePermissionService.unassignResourcePermissionFromUser(userId, permissionId)
      setSuccess(`Successfully unassigned permission '${permissionId}' from user`)
      await loadInitialData() // Reload data
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unassign permission'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleEvaluatePermission = async (evaluationData: PermissionEvaluationData) => {
    try {
      setLoading(true)
      const result = await resourcePermissionService.evaluatePermission(evaluationData)
      setEvaluationResult(result)
      setSuccess('Permission evaluation completed')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to evaluate permission'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignPermissionFromList = (permissionId: string) => {
    setSelectedPermissionForAssignment(permissionId)
    setShowAssignmentModal(true)
    setActiveTab('assignments')
  }

  const clearError = () => setError('')
  const clearSuccessMessage = () => setSuccess('')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resource Permission Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage resource-based permissions and user assignments
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleInitializePermissions}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Initialize Permissions
              </button>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 px-4 sm:px-0">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={clearError}
                    className="inline-flex text-red-400 hover:text-red-600"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 px-4 sm:px-0">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={clearSuccessMessage}
                    className="inline-flex text-green-400 hover:text-green-600"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="px-4 sm:px-0">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'permissions', name: 'Resource Permissions', icon: '📋' },
                { id: 'assignments', name: 'User Assignments', icon: '👥' },
                { id: 'evaluator', name: 'Permission Evaluator', icon: '🔍' },
                { id: 'status', name: 'System Status', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6 px-4 sm:px-0">
          {activeTab === 'permissions' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Available Resource Permissions</h2>
                <p className="text-gray-600">
                  These are the predefined resource permissions that can be assigned to users. 
                  Permissions are organized by category and cannot be modified or deleted.
                </p>
              </div>
              <ResourcePermissionList
                permissions={permissions}
                onAssignPermission={handleAssignPermissionFromList}
                showAssignButton={true}
              />
            </div>
          )}

          {activeTab === 'assignments' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">User Permission Assignments</h2>
                <p className="text-gray-600">
                  Assign resource permissions to users and manage existing assignments.
                </p>
              </div>
              <UserResourceAssignment
                users={users}
                permissions={permissions}
                assignments={assignments}
                onAssignPermission={handleAssignPermission}
                onUnassignPermission={handleUnassignPermission}
              />
            </div>
          )}

          {activeTab === 'evaluator' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Permission Evaluator</h2>
                <p className="text-gray-600">
                  Test permission evaluations for specific users, actions, and resources.
                </p>
              </div>
              <PermissionEvaluator
                users={users}
                evaluationResult={evaluationResult}
                onEvaluate={handleEvaluatePermission}
                loading={loading}
              />
            </div>
          )}

          {activeTab === 'status' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">System Status</h2>
                <p className="text-gray-600">
                  View the current status of the permission system and related statistics.
                </p>
              </div>
              <SystemStatus
                permissions={permissions}
                assignments={assignments}
                users={users}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 