import { env } from '@/config/env'

// Types for resource permissions
export interface ResourcePermission {
  id: string
  resource: string
  actions: string[]
  description: string
  category: string
  created_at?: string
  updated_at?: string
}

export interface UserResourceAssignment {
  id?: string
  user_id: string
  resource_permission_id: string
  assigned_at: string
  assigned_by: string
  expires_at?: string
  notes?: string
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface PermissionEvaluation {
  allowed: boolean
  reason: string
  matched_statement?: Record<string, unknown>
  evaluated_policies: string[]
  required_action?: string
  required_resource?: string
}

// Request/Response types
export interface ResourcePermissionListResponse {
  status: string
  message: string
  permissions: ResourcePermission[]
  total: number
}

export interface UserResourceAssignmentListResponse {
  status: string
  message: string
  assignments: UserResourceAssignment[]
  total: number
}

export interface UserResourcePermissionsResponse {
  status: string
  message: string
  user_id: string
  permissions: ResourcePermission[]
  assignments: UserResourceAssignment[]
}

export interface PermissionEvaluationRequest {
  user_id: string
  action: string
  resource: string
  context?: Record<string, unknown>
}

export interface PermissionEvaluationResponse {
  status: string
  message: string
  evaluation: PermissionEvaluation
}

export interface UserResourceAssignmentRequest {
  assigned_by: string
  expires_at?: string
  notes?: string
}

export interface AssignmentData {
  assigned_by: string
  expires_at?: string
  notes?: string
}

export interface PermissionEvaluationData {
  user_id: string
  action: string
  resource: string
  context?: Record<string, unknown>
}

class ResourcePermissionService {
  private baseUrl: string

  constructor() {
    this.baseUrl = env.API_BASE_URL
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem(env.STORAGE_KEYS.ACCESS_TOKEN)
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Initialize resource permissions
  async initializeResourcePermissions(): Promise<{ status: string; message: string; permissions_created: number }> {
    return this.makeRequest('/resource-permissions/initialize', {
      method: 'POST',
    })
  }

  // Get all resource permissions
  async getResourcePermissions(): Promise<ResourcePermission[]> {
    const response = await this.makeRequest<ResourcePermissionListResponse>('/resource-permissions/')
    return response.permissions
  }

  // Get resource permissions by category
  async getResourcePermissionsByCategory(): Promise<Record<string, ResourcePermission[]>> {
    return this.makeRequest<Record<string, ResourcePermission[]>>('/resource-permissions/categorized')
  }

  // Get specific resource permission
  async getResourcePermission(permissionId: string): Promise<ResourcePermission> {
    return this.makeRequest<ResourcePermission>(`/resource-permissions/${permissionId}`)
  }

  // Assign resource permission to user
  async assignResourcePermissionToUser(
    userId: string,
    permissionId: string,
    assignmentData: AssignmentData
  ): Promise<{ status: string; message: string; assignment: UserResourceAssignment }> {
    return this.makeRequest(`/resource-permissions/assign/${userId}/${permissionId}`, {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    })
  }

  // Unassign resource permission from user
  async unassignResourcePermissionFromUser(
    userId: string,
    permissionId: string
  ): Promise<{ status: string; message: string }> {
    return this.makeRequest(`/resource-permissions/unassign/${userId}/${permissionId}`, {
      method: 'DELETE',
    })
  }

  // Get user resource assignments
  async getUserResourceAssignments(userId: string): Promise<UserResourceAssignment[]> {
    const response = await this.makeRequest<UserResourceAssignmentListResponse>(
      `/resource-permissions/user/${userId}/assignments`
    )
    return response.assignments
  }

  // Get user resource permissions
  async getUserResourcePermissions(userId: string): Promise<{
    permissions: ResourcePermission[]
    assignments: UserResourceAssignment[]
  }> {
    const response = await this.makeRequest<UserResourcePermissionsResponse>(
      `/resource-permissions/user/${userId}/permissions`
    )
    return {
      permissions: response.permissions,
      assignments: response.assignments,
    }
  }

  // Evaluate permission
  async evaluatePermission(evaluationData: PermissionEvaluationData): Promise<PermissionEvaluation> {
    const response = await this.makeRequest<PermissionEvaluationResponse>(
      '/resource-permissions/evaluate',
      {
        method: 'POST',
        body: JSON.stringify(evaluationData),
      }
    )
    return response.evaluation
  }

  // Get all user assignments
  async getAllUserAssignments(): Promise<UserResourceAssignment[]> {
    const response = await this.makeRequest<UserResourceAssignmentListResponse>(
      '/resource-permissions/assignments/all'
    )
    return response.assignments
  }

  // Get users (assuming this is available from auth service)
  async getUsers(): Promise<Record<string, unknown>[]> {
    // This would typically come from a user service
    // For now, we'll need to implement this or use existing auth service
    throw new Error('getUsers method needs to be implemented or use existing auth service')
  }

  // Helper method to check if user has permission
  async hasPermission(userId: string, action: string, resource: string): Promise<boolean> {
    try {
      const evaluation = await this.evaluatePermission({
        user_id: userId,
        action,
        resource,
      })
      return evaluation.allowed
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }

  // Helper method to get user's permissions for navigation
  async getUserPermissionsForNavigation(userId: string): Promise<ResourcePermission[]> {
    try {
      const { permissions } = await this.getUserResourcePermissions(userId)
      return permissions
    } catch (error) {
      console.error('Error getting user permissions for navigation:', error)
      return []
    }
  }
}

// Export singleton instance
export const resourcePermissionService = new ResourcePermissionService() 