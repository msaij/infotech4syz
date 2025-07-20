// API Configuration
export const API_CONFIG = {
  // Base configuration
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  VERSION: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  
  // Constructed URLs
  get API_URL() {
    return `${this.BASE_URL}/api/${this.VERSION}`
  },
  
  // Specific endpoints
  get ENDPOINTS() {
    return {
      // Auth
      AUTH: {
        LOGIN: `${this.API_URL}/token/`,
        REFRESH: `${this.API_URL}/token/refresh/`,
        ME: `${this.API_URL}/user/me/`,
      },
      
      // 4syz
      FOURSYZ: {
        BASE: `${this.API_URL}/foursyz/`,
        DETAILS: `${this.API_URL}/foursyz/1/`,
      },
      
      // Users
      USERS_FOURSYZ: {
        BASE: `${this.API_URL}/users-foursyz/`,
        ME: `${this.API_URL}/users-foursyz/me/`,
      },
      
      // Clients
      CLIENTS: {
        BASE: `${this.API_URL}/clients/`,
      },
      
      // User Clients
      USERS_CLIENTS: {
        BASE: `${this.API_URL}/users-clients/`,
        ME: `${this.API_URL}/users-clients/me/`,
      },
      
      // Queries
      QUERIES_4SYZ: {
        BASE: `${this.API_URL}/queries-4syz/`,
        MY_QUERIES: `${this.API_URL}/queries-4syz/my_queries/`,
      },
      
      QUERIES_CLIENTS: {
        BASE: `${this.API_URL}/queries-clients/`,
        MY_QUERIES: `${this.API_URL}/queries-clients/my_queries/`,
      },
      
      // RBAC
      RBAC: {
        PERMISSIONS: `${this.API_URL}/rbac/permissions/`,
        ROLES: `${this.API_URL}/rbac/roles/`,
        USER_ROLES: `${this.API_URL}/rbac/user-roles/`,
        MY_ROLES: `${this.API_URL}/rbac/user-roles/my_roles/`,
        MY_PERMISSIONS: `${this.API_URL}/rbac/user-roles/my_permissions/`,
      },
      
      // Public
      PUBLIC: {
        BASE: `${this.API_URL}/public/`,
      },
    }
  }
}

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.API_URL}${endpoint}`
}

// Helper function to get endpoint URL
export const getEndpoint = (category, subcategory = null) => {
  if (subcategory) {
    return API_CONFIG.ENDPOINTS[category]?.[subcategory]
  }
  return API_CONFIG.ENDPOINTS[category]
} 