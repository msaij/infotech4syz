export const env = {
  // API Configuration
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  
  // Auth Configuration
  AUTH_ENDPOINTS: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  
  // Client Management Configuration
  CLIENT_ENDPOINTS: {
    CSRF_TOKEN: '/clients/csrf-token',
    LIST: '/clients',
    CREATE: '/clients',
    GET: '/clients',
    UPDATE: '/clients',
    DELETE: '/clients',
  },
  
  // User Validation
  REQUIRED_EMAIL_DOMAIN: process.env.NEXT_PUBLIC_REQUIRED_EMAIL_DOMAIN || '@4syz.com',
  
  // Routes
  ROUTES: {
    LOGIN: '/foursyz/login',
    DASHBOARD: '/foursyz/dashboard',
    CLIENT_DETAILS: '/foursyz/client_details',
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    CSRF_TOKEN: 'csrf_token',
  },
  
  // HTTP Status Codes
  HTTP_STATUS: {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    OK: 200,
  },
  
  // User Roles
  USER_ROLES: {
    CEO: 'ceo',
  },
} as const 