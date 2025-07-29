import { env } from '@/config/env'
import { AuthService, UserData } from './auth'

// Core interfaces
export interface PermissionStatement {
  effect: 'Allow' | 'Deny'
  actions: string[]
  resources: string[]
  conditions?: Record<string, unknown>
}

export interface Policy {
  id: string
  name: string
  description: string
  version: string
  statements: PermissionStatement[]
  created_at: string
  updated_at: string
}

export interface PolicyAssignment {
  id: string
  user_id: string
  policy_id: string
  assigned_at: string
  assigned_by: string
  expires_at?: string
  notes?: string
  active: boolean
}

export interface PermissionEvaluation {
  allowed: boolean
  reason: string
  matched_statement?: PermissionStatement
  evaluated_policies: string[]
  required_action?: string
  required_resource?: string
}

export interface SystemHealth {
  total_policies: number
  total_assignments: number
  active_assignments: number
  expired_assignments: number
  system_status: 'healthy' | 'warning' | 'error'
  last_updated: string
}

// Request/Response interfaces
export interface CreatePolicyData {
  name: string
  description: string
  version: string
  statements: PermissionStatement[]
}

export interface UpdatePolicyData {
  name?: string
  description?: string
  version?: string
  statements?: PermissionStatement[]
}

export interface AssignmentData {
  expires_at?: string
  notes?: string
  active?: boolean
}

export interface PermissionEvaluationData {
  user_id: string
  action: string
  resource: string
  context?: Record<string, unknown>
}

// Response interfaces
export interface PolicyListResponse {
  status: string
  message: string
  policies: Policy[]
  total: number
}

export interface PolicyResponse {
  status: string
  message: string
  policy: Policy
}

export interface PolicyAssignmentResponse {
  status: string
  message: string
  assignment: PolicyAssignment
}

export interface PolicyAssignmentListResponse {
  status: string
  message: string
  assignments: PolicyAssignment[]
  total: number
}

export interface PermissionEvaluationResponse {
  status: string
  message: string
  evaluation: PermissionEvaluation
}

export interface SystemHealthResponse {
  status: string
  message: string
  health: SystemHealth
}

export interface InitializeResponse {
  status: string
  message: string
  created_policies: string[]
}

export interface MigrateResponse {
  status: string
  message: string
  migration_results: Record<string, string[]>
}

export interface CleanupResponse {
  status: string
  message: string
  cleaned_count: number
}

export class PolicyService {
  private static async getAuthHeaders(): Promise<HeadersInit> {
    const token = AuthService.getStoredToken(env.STORAGE_KEYS.ACCESS_TOKEN)
    const csrfToken = AuthService.getStoredToken(env.STORAGE_KEYS.CSRF_TOKEN)
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken
    }
    
    return headers
  }

  private static async ensureCSRFToken(): Promise<string> {
    let csrfToken = AuthService.getStoredToken(env.STORAGE_KEYS.CSRF_TOKEN)
    
    if (!csrfToken) {
      const token = AuthService.getStoredToken(env.STORAGE_KEYS.ACCESS_TOKEN)
      if (!token) {
        throw new Error('No access token available')
      }
      
      // For policy endpoints, we'll use a generic CSRF token endpoint
      const response = await fetch(`${env.API_BASE_URL}/auth/csrf-token`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.status === env.HTTP_STATUS.OK) {
        const data = await response.json()
        csrfToken = data.csrf_token
        AuthService.setStoredToken(env.STORAGE_KEYS.CSRF_TOKEN, csrfToken || '')
      } else {
        throw new Error('Failed to get CSRF token')
      }
    }
    
    return csrfToken || ''
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'Network error'
      try {
        const errorData = await response.json() as { detail?: string; message?: string }
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch {
        // If we can't parse the error response, use the status text
        errorMessage = response.statusText || 'Unknown error'
      }
      throw new Error(errorMessage)
    }
    
    return response.json()
  }

  // Policy CRUD operations
  static async getPolicies(): Promise<Policy[]> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${env.API_BASE_URL}${env.API_ENDPOINTS.POLICY_ENDPOINTS.POLICIES}`, {
        method: 'GET',
        headers,
      })
      
      const data: PolicyListResponse = await this.handleResponse(response)
      return data.policies
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch policies'
      throw new Error(errorMessage)
    }
  }

  static async getPolicy(policyId: string): Promise<Policy> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${env.API_BASE_URL}${env.API_ENDPOINTS.POLICY_ENDPOINTS.POLICIES}/${policyId}`, {
        method: 'GET',
        headers,
      })
      
      const data: PolicyResponse = await this.handleResponse(response)
      return data.policy
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch policy'
      throw new Error(errorMessage)
    }
  }

  static async createPolicy(policyData: CreatePolicyData): Promise<Policy> {
    try {
      await this.ensureCSRFToken()
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${env.API_BASE_URL}${env.API_ENDPOINTS.POLICY_ENDPOINTS.POLICIES}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(policyData),
      })
      
      const data: PolicyResponse = await this.handleResponse(response)
      return data.policy
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create policy'
      throw new Error(errorMessage)
    }
  }

  static async updatePolicy(policyId: string, policyData: UpdatePolicyData): Promise<Policy> {
    try {
      await this.ensureCSRFToken()
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${env.API_BASE_URL}${env.API_ENDPOINTS.POLICY_ENDPOINTS.POLICIES}/${policyId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(policyData),
      })
      
      const data: PolicyResponse = await this.handleResponse(response)
      return data.policy
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update policy'
      throw new Error(errorMessage)
    }
  }

  static async deletePolicy(policyId: string): Promise<{ status: string; message: string }> {
    try {
      await this.ensureCSRFToken()
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${env.API_BASE_URL}${env.API_ENDPOINTS.POLICY_ENDPOINTS.POLICIES}/${policyId}`, {
        method: 'DELETE',
        headers,
      })
      
      return await this.handleResponse(response)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete policy'
      throw new Error(errorMessage)
    }
  }

  // Policy assignments
  static async assignPolicyToUser(userId: string, policyId: string, assignmentData: AssignmentData): Promise<PolicyAssignment> {
    try {
      await this.ensureCSRFToken()
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${env.API_BASE_URL}${env.API_ENDPOINTS.POLICY_ENDPOINTS.POLICY_ASSIGNMENTS}/${userId}/policies/${policyId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(assignmentData),
      })
      
      const data: PolicyAssignmentResponse = await this.handleResponse(response)
      return data.assignment
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign policy to user'
      throw new Error(errorMessage)
    }
  }

  static async unassignPolicyFromUser(userId: string, policyId: string): Promise<{ status: string; message: string }> {
    try {
      await this.ensureCSRFToken()
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${env.API_BASE_URL}${env.API_ENDPOINTS.POLICY_ENDPOINTS.POLICY_ASSIGNMENTS}/${userId}/policies/${policyId}`, {
        method: 'DELETE',
        headers,
      })
      
      return await this.handleResponse(response)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unassign policy from user'
      throw new Error(errorMessage)
    }
  }

  static async getUserPolicies(userId: string): Promise<Policy[]> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${env.API_BASE_URL}${env.API_ENDPOINTS.POLICY_ENDPOINTS.POLICY_ASSIGNMENTS}/${userId}/policies`, {
        method: 'GET',
        headers,
      })
      
      const data: PolicyListResponse = await this.handleResponse(response)
      return data.policies
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user policies'
      throw new Error(errorMessage)
    }
  }

  static async getUserAssignments(userId: string): Promise<PolicyAssignment[]> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${env.API_BASE_URL}${env.API_ENDPOINTS.POLICY_ENDPOINTS.POLICY_ASSIGNMENTS}/${userId}/assignments`, {
        method: 'GET',
        headers,
      })
      
      const data: PolicyAssignmentListResponse = await this.handleResponse(response)
      return data.assignments
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user assignments'
      throw new Error(errorMessage)
    }
  }

  static async getAllAssignments(): Promise<PolicyAssignment[]> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${env.API_BASE_URL}${env.API_ENDPOINTS.POLICY_ENDPOINTS.ASSIGNMENTS}`, {
        method: 'GET',
        headers,
      })
      
      const data: PolicyAssignmentListResponse = await this.handleResponse(response)
      return data.assignments
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch all assignments'
      throw new Error(errorMessage)
    }
  }

  static async getUsers(): Promise<UserData[]> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${env.API_BASE_URL}${env.API_ENDPOINTS.AUTH_ENDPOINTS.USERS}`, {
        method: 'GET',
        headers,
      })
      
      return await this.handleResponse(response)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users'
      throw new Error(errorMessage)
    }
  }

  // Permission evaluation
  static async evaluatePermission(evaluationData: PermissionEvaluationData): Promise<PermissionEvaluation> {
    try {
      console.log('Evaluating permission:', evaluationData)
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${env.API_BASE_URL}${env.API_ENDPOINTS.POLICY_ENDPOINTS.EVALUATE}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(evaluationData),
      })
      
      if (!response.ok) {
        const errorText = await response.text() || 'Unknown error'
        console.error('Permission evaluation failed:', response.status, errorText)
        throw new Error(`Permission evaluation failed: ${response.status} - ${errorText}`)
      }
      
      const data: PermissionEvaluationResponse = await this.handleResponse(response)
      console.log('Permission evaluation result:', data.evaluation)
      return data.evaluation
    } catch (error: unknown) {
      console.error('Permission evaluation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to evaluate permission'
      throw new Error(errorMessage)
    }
  }

  // System management
  static async initializePolicies(): Promise<{ status: string; message: string; created_policies: string[] }> {
    try {
      await this.ensureCSRFToken()
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${env.API_BASE_URL}${env.API_ENDPOINTS.POLICY_ENDPOINTS.INITIALIZE}`, {
        method: 'POST',
        headers,
      })
      
      const data: InitializeResponse = await this.handleResponse(response)
      return {
        status: data.status,
        message: data.message,
        created_policies: data.created_policies
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize policies'
      throw new Error(errorMessage)
    }
  }

  static async migrateUserRoles(): Promise<{ status: string; message: string; migration_results: Record<string, string[]> }> {
    try {
      await this.ensureCSRFToken()
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${env.API_BASE_URL}${env.API_ENDPOINTS.POLICY_ENDPOINTS.MIGRATE}`, {
        method: 'POST',
        headers,
      })
      
      const data: MigrateResponse = await this.handleResponse(response)
      return {
        status: data.status,
        message: data.message,
        migration_results: data.migration_results
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to migrate user roles'
      throw new Error(errorMessage)
    }
  }

  static async cleanupExpiredAssignments(): Promise<{ status: string; message: string; cleaned_count: number }> {
    try {
      await this.ensureCSRFToken()
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${env.API_BASE_URL}${env.API_ENDPOINTS.POLICY_ENDPOINTS.CLEANUP}`, {
        method: 'POST',
        headers,
      })
      
      const data: CleanupResponse = await this.handleResponse(response)
      return {
        status: data.status,
        message: data.message,
        cleaned_count: data.cleaned_count
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cleanup expired assignments'
      throw new Error(errorMessage)
    }
  }

  static async getSystemHealth(): Promise<SystemHealth> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${env.API_BASE_URL}${env.API_ENDPOINTS.POLICY_ENDPOINTS.HEALTH}`, {
        method: 'GET',
        headers,
      })
      
      const data: SystemHealthResponse = await this.handleResponse(response)
      return data.health
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get system health'
      throw new Error(errorMessage)
    }
  }

  // Utility methods
  static isPolicyManager(userData: { designation?: string }): boolean {
    return userData?.designation === env.USER_ROLES.CEO || 
           userData?.designation === env.USER_ROLES.ADMIN
  }

  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString()
  }

  static formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString()
  }
} 