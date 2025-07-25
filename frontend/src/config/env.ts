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
  
  // User Validation
  REQUIRED_EMAIL_DOMAIN: process.env.NEXT_PUBLIC_REQUIRED_EMAIL_DOMAIN || '@4syz.com',
  
  // Routes
  ROUTES: {
    LOGIN: '/foursyz/login',
    DASHBOARD: '/foursyz/dashboard',
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
  },
  
  // HTTP Status Codes
  HTTP_STATUS: {
    UNAUTHORIZED: 401,
    OK: 200,
  },
} as const 