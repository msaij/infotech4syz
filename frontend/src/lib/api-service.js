import { API_CONFIG } from './api-config'

// Default headers
const getDefaultHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  }
  
  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  
  return headers
}

// API response handler
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`)
  }
  return response.json()
}

// API service class
export class ApiService {
  // GET request
  static async get(url, options = {}) {
    const response = await fetch(url, {
      method: 'GET',
      headers: getDefaultHeaders(),
      ...options,
    })
    return handleResponse(response)
  }

  // POST request
  static async post(url, data = null, options = {}) {
    const response = await fetch(url, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    return handleResponse(response)
  }

  // PUT request
  static async put(url, data = null, options = {}) {
    const response = await fetch(url, {
      method: 'PUT',
      headers: getDefaultHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    return handleResponse(response)
  }

  // PATCH request
  static async patch(url, data = null, options = {}) {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getDefaultHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    return handleResponse(response)
  }

  // DELETE request
  static async delete(url, options = {}) {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getDefaultHeaders(),
      ...options,
    })
    return handleResponse(response)
  }
}

// Specific API services
export const AuthService = {
  login: (credentials) => ApiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials),
  refresh: (refreshToken) => ApiService.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH, { refresh: refreshToken }),
  getMe: () => ApiService.get(API_CONFIG.ENDPOINTS.AUTH.ME),
}

export const FoursyzService = {
  getDetails: () => ApiService.get(API_CONFIG.ENDPOINTS.FOURSYZ.DETAILS),
  update: (data) => ApiService.put(API_CONFIG.ENDPOINTS.FOURSYZ.DETAILS, data),
}

export const UsersFoursyzService = {
  getAll: () => ApiService.get(API_CONFIG.ENDPOINTS.USERS_FOURSYZ.BASE),
  getMe: () => ApiService.get(API_CONFIG.ENDPOINTS.USERS_FOURSYZ.ME),
  getById: (id) => ApiService.get(`${API_CONFIG.ENDPOINTS.USERS_FOURSYZ.BASE}${id}/`),
  create: (data) => ApiService.post(API_CONFIG.ENDPOINTS.USERS_FOURSYZ.BASE, data),
  update: (id, data) => ApiService.put(`${API_CONFIG.ENDPOINTS.USERS_FOURSYZ.BASE}${id}/`, data),
  delete: (id) => ApiService.delete(`${API_CONFIG.ENDPOINTS.USERS_FOURSYZ.BASE}${id}/`),
  bulkUpdate: (data) => ApiService.post(`${API_CONFIG.ENDPOINTS.USERS_FOURSYZ.BASE}bulk_update/`, data),
  bulkDelete: (data) => ApiService.post(`${API_CONFIG.ENDPOINTS.USERS_FOURSYZ.BASE}bulk_delete/`, data),
}

export const UsersClientsService = {
  getAll: () => ApiService.get(API_CONFIG.ENDPOINTS.USERS_CLIENTS.BASE),
  getMe: () => ApiService.get(API_CONFIG.ENDPOINTS.USERS_CLIENTS.ME),
  getById: (id) => ApiService.get(`${API_CONFIG.ENDPOINTS.USERS_CLIENTS.BASE}${id}/`),
  create: (data) => ApiService.post(API_CONFIG.ENDPOINTS.USERS_CLIENTS.BASE, data),
  update: (id, data) => ApiService.put(`${API_CONFIG.ENDPOINTS.USERS_CLIENTS.BASE}${id}/`, data),
  delete: (id) => ApiService.delete(`${API_CONFIG.ENDPOINTS.USERS_CLIENTS.BASE}${id}/`),
}

export const ClientsService = {
  getAll: () => ApiService.get(API_CONFIG.ENDPOINTS.CLIENTS.BASE),
  getById: (id) => ApiService.get(`${API_CONFIG.ENDPOINTS.CLIENTS.BASE}${id}/`),
  create: (data) => ApiService.post(API_CONFIG.ENDPOINTS.CLIENTS.BASE, data),
  update: (id, data) => ApiService.put(`${API_CONFIG.ENDPOINTS.CLIENTS.BASE}${id}/`, data),
  delete: (id) => ApiService.delete(`${API_CONFIG.ENDPOINTS.CLIENTS.BASE}${id}/`),
}

export const Queries4syzService = {
  getAll: () => ApiService.get(API_CONFIG.ENDPOINTS.QUERIES_4SYZ.BASE),
  getMyQueries: () => ApiService.get(API_CONFIG.ENDPOINTS.QUERIES_4SYZ.MY_QUERIES),
  create: (data) => ApiService.post(API_CONFIG.ENDPOINTS.QUERIES_4SYZ.BASE, data),
  resolve: (id, data) => ApiService.post(`${API_CONFIG.ENDPOINTS.QUERIES_4SYZ.BASE}${id}/resolve/`, data),
}

export const QueriesClientsService = {
  getAll: () => ApiService.get(API_CONFIG.ENDPOINTS.QUERIES_CLIENTS.BASE),
  getMyQueries: () => ApiService.get(API_CONFIG.ENDPOINTS.QUERIES_CLIENTS.MY_QUERIES),
  create: (data) => ApiService.post(API_CONFIG.ENDPOINTS.QUERIES_CLIENTS.BASE, data),
  resolve: (id, data) => ApiService.post(`${API_CONFIG.ENDPOINTS.QUERIES_CLIENTS.BASE}${id}/resolve/`, data),
}

// Alias for backward compatibility and general queries
export const QueriesService = Queries4syzService

export const RbacService = {
  getPermissions: () => ApiService.get(API_CONFIG.ENDPOINTS.RBAC.PERMISSIONS),
  getRoles: () => ApiService.get(API_CONFIG.ENDPOINTS.RBAC.ROLES),
  getUserRoles: () => ApiService.get(API_CONFIG.ENDPOINTS.RBAC.USER_ROLES),
  getMyRoles: () => ApiService.get(API_CONFIG.ENDPOINTS.RBAC.MY_ROLES),
  getMyPermissions: () => ApiService.get(API_CONFIG.ENDPOINTS.RBAC.MY_PERMISSIONS),
  assignRole: (data) => ApiService.post(API_CONFIG.ENDPOINTS.RBAC.USER_ROLES, data),
  removeUserRole: (userRoleId) => ApiService.delete(`${API_CONFIG.ENDPOINTS.RBAC.USER_ROLES}${userRoleId}/`),
  updateUserRole: (userRoleId, data) => ApiService.put(`${API_CONFIG.ENDPOINTS.RBAC.USER_ROLES}${userRoleId}/`, data),
  createRole: (data) => ApiService.post(API_CONFIG.ENDPOINTS.RBAC.ROLES, data),
  updateRole: (roleId, data) => ApiService.put(`${API_CONFIG.ENDPOINTS.RBAC.ROLES}${roleId}/`, data),
  deleteRole: (roleId) => ApiService.delete(`${API_CONFIG.ENDPOINTS.RBAC.ROLES}${roleId}/`),
}

// Public service for public endpoints
export const PublicService = {
  getInfo: () => ApiService.get(API_CONFIG.ENDPOINTS.PUBLIC.BASE),
} 