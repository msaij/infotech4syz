// Environment configuration
export const env = {
  // Backend URLs
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  API_BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  
  // Frontend URLs
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  
  // Routes
  ROUTES: {
    LOGIN: '/foursyz/login',
    DASHBOARD: '/foursyz/dashboard',
    CLIENT_DETAILS: '/foursyz/client_details',
    CREATE_USER: '/foursyz/create_user4syz',
    DELIVERY_CHALLAN_TRACKER: '/foursyz/delivery_challan_tracker'
  },
  
  // Storage keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    CSRF_TOKEN: 'csrf_token'
  },
  
  // API endpoints
  API_ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
      ME: '/auth/me'
    },
    AUTH_ENDPOINTS: {
      LOGIN: '/auth/login',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
      ME: '/auth/me'
    },
    CLIENT_ENDPOINTS: {
      LIST: '/clients/',
      CREATE: '/clients/',
      UPDATE: '/clients/',
      DELETE: '/clients/',
      CSRF_TOKEN: '/clients/csrf-token'
    },
    DELIVERY_CHALLAN_ENDPOINTS: {
      LIST: '/delivery-challan/',
      CREATE: '/delivery-challan/',
      UPDATE: '/delivery-challan/',
      DELETE: '/delivery-challan/',
      CSRF_TOKEN: '/delivery-challan/csrf-token',
      CLIENTS: '/delivery-challan/clients',
      UPLOAD_FILE: '/delivery-challan/upload-file',
      LINK_INVOICE: '/delivery-challan/link-invoice'
    }
  },
  
  // Validation
  REQUIRED_EMAIL_DOMAIN: '@4syz.com',
  
  // HTTP status codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  },
  
  // User roles
  USER_ROLES: {
    CEO: 'ceo',
    ADMIN: 'admin',
    DC_TRACKER_MANAGER: 'DC_tracker_manager'
  }
} 