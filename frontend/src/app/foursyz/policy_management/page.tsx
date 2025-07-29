'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PolicyService, Policy, PolicyAssignment, PermissionEvaluation, CreatePolicyData, UpdatePolicyData, AssignmentData, PermissionEvaluationData } from '@/utils/policyService'
import { AuthService, UserData } from '@/utils/auth'
import { env } from '@/config/env'

// Tab components
import PolicyList from '@/components/policy/PolicyList'
import PolicyForm from '@/components/policy/PolicyForm'
import UserAssignment from '@/components/policy/UserAssignment'
import PermissionEvaluator from '@/components/policy/PermissionEvaluator'
import SystemStatus from '@/components/policy/SystemStatus'

export default function PolicyManagementPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('policies')
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Data states
  const [policies, setPolicies] = useState<Policy[]>([])
  const [users, setUsers] = useState<UserData[]>([])
  const [assignments, setAssignments] = useState<PolicyAssignment[]>([])
  const [evaluationResult, setEvaluationResult] = useState<PermissionEvaluation | undefined>(undefined)

  // Form states
  const [showCreatePolicy, setShowCreatePolicy] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null)

  useEffect(() => {
    checkUserAndLoadData()
  }, [])

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
      const evaluation = await PolicyService.evaluatePermission({
        user_id: userData.id,
        action: env.PERMISSIONS.ACTIONS.PERMISSIONS_READ,
        resource: env.PERMISSIONS.RESOURCES.PERMISSIONS_ALL
      })
      return evaluation.allowed
    } catch (error) {
      return false
    }
  }

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [policiesData, usersData, assignmentsData] = await Promise.all([
        PolicyService.getPolicies(),
        PolicyService.getUsers(),
        PolicyService.getAllAssignments()
      ])
      setPolicies(policiesData)
      setUsers(usersData)
      setAssignments(assignmentsData)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Policy management handlers
  const handleCreatePolicy = async (policyData: CreatePolicyData) => {
    try {
      setLoading(true)
      const newPolicy = await PolicyService.createPolicy(policyData)
      setPolicies(prev => [...prev, newPolicy])
      setShowCreatePolicy(false)
      setSuccess('Policy created successfully')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create policy'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePolicy = async (policyId: string, policyData: UpdatePolicyData) => {
    try {
      setLoading(true)
      const updatedPolicy = await PolicyService.updatePolicy(policyId, policyData)
      setPolicies(prev => prev.map(p => p.id === policyId ? updatedPolicy : p))
      setEditingPolicy(null)
      setSuccess('Policy updated successfully')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update policy'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return
    
    try {
      setLoading(true)
      await PolicyService.deletePolicy(policyId)
      setPolicies(prev => prev.filter(p => p.id !== policyId))
      setSuccess('Policy deleted successfully')
    } catch (error: any) {
      setError(error.message || 'Failed to delete policy')
    } finally {
      setLoading(false)
    }
  }

  // User assignment handlers
  const handleAssignPolicy = async (userId: string, policyId: string, assignmentData: AssignmentData) => {
    try {
      setLoading(true)
      console.log('Assigning policy:', { userId, policyId, assignmentData })
      
      const assignment = await PolicyService.assignPolicyToUser(userId, policyId, assignmentData)
      console.log('Assignment successful:', assignment)
      
      setAssignments(prev => [...prev, assignment])
      setSuccess('Policy assigned successfully')
    } catch (error: any) {
      console.error('Assignment error:', error)
      const errorMessage = error.message || 'Failed to assign policy'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleUnassignPolicy = async (userId: string, policyId: string) => {
    try {
      setLoading(true)
      await PolicyService.unassignPolicyFromUser(userId, policyId)
      setAssignments(prev => prev.filter(a => !(a.user_id === userId && a.policy_id === policyId)))
      setSuccess('Policy unassigned successfully')
    } catch (error: any) {
      setError(error.message || 'Failed to unassign policy')
    } finally {
      setLoading(false)
    }
  }

  // Permission evaluation handler
  const handleEvaluatePermission = async (evaluationData: PermissionEvaluationData) => {
    try {
      setLoading(true)
      const result = await PolicyService.evaluatePermission(evaluationData)
      setEvaluationResult(result)
    } catch (error: any) {
      setError(error.message || 'Failed to evaluate permission')
    } finally {
      setLoading(false)
    }
  }

  // System management handlers
  const handleInitializePolicies = async () => {
    try {
      setLoading(true)
      const result = await PolicyService.initializePolicies()
      setSuccess(`Policies initialized successfully. Created: ${result.created_policies.join(', ')}`)
      await loadInitialData() // Reload policies
    } catch (error: any) {
      setError(error.message || 'Failed to initialize policies')
    } finally {
      setLoading(false)
    }
  }

  const handleMigrateUserRoles = async () => {
    try {
      setLoading(true)
      const result = await PolicyService.migrateUserRoles()
      setSuccess(`Migration completed. Results: ${JSON.stringify(result.migration_results)}`)
    } catch (error: any) {
      setError(error.message || 'Failed to migrate user roles')
    } finally {
      setLoading(false)
    }
  }

  // Wrapper function to handle both CreatePolicyData and UpdatePolicyData
  const handlePolicySubmit = async (policyData: CreatePolicyData | UpdatePolicyData) => {
    if ('id' in policyData) {
      // This is UpdatePolicyData
      await handleUpdatePolicy(policyData.id as string, policyData)
    } else {
      // This is CreatePolicyData
      await handleCreatePolicy(policyData as CreatePolicyData)
    }
  }

  const clearError = () => setError('')
  const clearSuccessMessage = () => setSuccess('')

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Policy Management</h1>
          <p className="mt-2 text-gray-600">Manage permissions and access control for the system</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
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
                <button onClick={clearError} className="text-red-400 hover:text-red-600">
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
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
                <button onClick={clearSuccessMessage} className="text-green-400 hover:text-green-600">
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'policies', name: 'Policies', icon: 'DocumentTextIcon' },
              { id: 'assignments', name: 'User Assignments', icon: 'UserGroupIcon' },
              { id: 'evaluator', name: 'Permission Evaluator', icon: 'ShieldCheckIcon' },
              { id: 'system', name: 'System Status', icon: 'CogIcon' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'policies' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Policies</h2>
                <button
                  onClick={() => setShowCreatePolicy(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create Policy
                </button>
              </div>
              
              {showCreatePolicy && (
                <PolicyForm
                  onSubmit={handlePolicySubmit}
                  onCancel={() => setShowCreatePolicy(false)}
                  loading={loading}
                />
              )}
              
              {editingPolicy && (
                <PolicyForm
                  policy={editingPolicy}
                  onSubmit={handlePolicySubmit}
                  onCancel={() => setEditingPolicy(null)}
                  loading={loading}
                />
              )}
              
              <PolicyList
                policies={policies}
                onEdit={setEditingPolicy}
                onDelete={handleDeletePolicy}
                onView={(policy) => console.log('View policy:', policy)}
                loading={loading}
              />
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">User Assignments</h2>
              <UserAssignment
                users={users}
                policies={policies}
                assignments={assignments}
                onAssign={handleAssignPolicy}
                onUnassign={handleUnassignPolicy}
                loading={loading}
              />
            </div>
          )}

          {activeTab === 'evaluator' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Permission Evaluator</h2>
              <PermissionEvaluator
                users={users}
                onEvaluate={handleEvaluatePermission}
                result={evaluationResult}
                loading={loading}
              />
            </div>
          )}

          {activeTab === 'system' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">System Status</h2>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button
                    onClick={handleInitializePolicies}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Initialize Policies
                  </button>
                  <button
                    onClick={handleMigrateUserRoles}
                    disabled={loading}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50"
                  >
                    Migrate User Roles
                  </button>
                </div>
                <SystemStatus />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 