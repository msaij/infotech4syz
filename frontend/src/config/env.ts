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
    DELIVERY_CHALLAN_TRACKER: '/foursyz/delivery_challan_tracker',
    POLICY_MANAGEMENT: '/foursyz/policy_management'
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
      ME: '/auth/me',
      USERS: '/auth/users'
    },
    CLIENT_ENDPOINTS: {
      LIST: '/clients/',
      GET: '/clients/',
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
    },
    POLICY_ENDPOINTS: {
      POLICIES: '/permissions/policies',
      POLICY_ASSIGNMENTS: '/permissions/users',
      ASSIGNMENTS: '/permissions/assignments',
      EVALUATE: '/permissions/evaluate',
      INITIALIZE: '/permissions/initialize',
      MIGRATE: '/permissions/migrate',
      CLEANUP: '/permissions/cleanup/expired',
      HEALTH: '/permissions/health'
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
  },

  // Permission actions and resources
  PERMISSIONS: {
    ACTIONS: {
      AUTH_LOGIN: 'auth:login',
      AUTH_LOGOUT: 'auth:logout',
      AUTH_REFRESH: 'auth:refresh',
      AUTH_ME: 'auth:me',
      USER_CREATE: 'user:create',
      USER_READ: 'user:read',
      USER_UPDATE: 'user:update',
      USER_DELETE: 'user:delete',
      USER_LIST: 'user:list',
      CLIENT_CREATE: 'client:create',
      CLIENT_READ: 'client:read',
      CLIENT_UPDATE: 'client:update',
      CLIENT_DELETE: 'client:delete',
      CLIENT_LIST: 'client:list',
      DELIVERY_CHALLAN_CREATE: 'delivery_challan:create',
      DELIVERY_CHALLAN_READ: 'delivery_challan:read',
      DELIVERY_CHALLAN_UPDATE: 'delivery_challan:update',
      DELIVERY_CHALLAN_DELETE: 'delivery_challan:delete',
      DELIVERY_CHALLAN_LIST: 'delivery_challan:list',
      DELIVERY_CHALLAN_UPLOAD: 'delivery_challan:upload',
      DELIVERY_CHALLAN_LINK_INVOICE: 'delivery_challan:link_invoice',
      PERMISSIONS_CREATE: 'permissions:create',
      PERMISSIONS_READ: 'permissions:read',
      PERMISSIONS_UPDATE: 'permissions:update',
      PERMISSIONS_DELETE: 'permissions:delete',
      PERMISSIONS_ASSIGN: 'permissions:assign',
      PERMISSIONS_EVALUATE: 'permissions:evaluate'
    },
    RESOURCES: {
      AUTH_ALL: 'auth:*',
      USER_ALL: 'user:*',
      CLIENT_ALL: 'client:*',
      DELIVERY_CHALLAN_ALL: 'delivery_challan:*',
      DELIVERY_CHALLAN_FILE: 'delivery_challan:file',
      PERMISSIONS_ALL: 'permissions:*'
    }
  }
} 