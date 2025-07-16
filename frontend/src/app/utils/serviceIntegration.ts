// Service Integration Utilities
// Handles communication between Django, FastAPI, and Next.js services

import { useAuth } from '@/app/components/access-providers/auth-context';

// Service URLs
export const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000';
export const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8001';

// Service endpoints
export const ENDPOINTS = {
  // Django endpoints
  DJANGO: {
    HEALTH: `${DJANGO_API_URL}/api/v1/health/`,
    TOKEN: `${DJANGO_API_URL}/api/token/`,
    TOKEN_REFRESH: `${DJANGO_API_URL}/api/token/refresh/`,
    COMPANY_DETAILS: `${DJANGO_API_URL}/api/v1/company/details/`,
    CLIENT_DETAILS: `${DJANGO_API_URL}/api/v1/client/details/`,
    DELIVERY_CHALLAN: `${DJANGO_API_URL}/api/v1/company/delivery-challan/`,
    PRODUCTS: `${DJANGO_API_URL}/api/v1/company/products/`,
    CLIENTS: `${DJANGO_API_URL}/api/v1/company/clients/`,
    QUERIES: `${DJANGO_API_URL}/api/v1/company/queries/`,
  },
  // FastAPI endpoints
  FASTAPI: {
    HEALTH: `${FASTAPI_URL}/api/v1/health`,
    METRICS: `${FASTAPI_URL}/api/v1/metrics`,
    SSE_DELIVERY_CHALLAN: `${FASTAPI_URL}/api/v1/sse/delivery-challan`,
    AUTH_TEST: `${FASTAPI_URL}/api/v1/auth/test`,
    COMPANY_TEST: `${FASTAPI_URL}/api/v1/company/test`,
    CLIENT_TEST: `${FASTAPI_URL}/api/v1/client/test`,
  }
};

// Error types
export class ServiceError extends Error {
  constructor(
    message: string,
    public status: number,
    public service: 'django' | 'fastapi',
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export class AuthenticationError extends ServiceError {
  constructor(message: string, service: 'django' | 'fastapi', endpoint?: string) {
    super(message, 401, service, endpoint);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ServiceError {
  constructor(message: string, service: 'django' | 'fastapi', endpoint?: string) {
    super(message, 403, service, endpoint);
    this.name = 'AuthorizationError';
  }
}

// Service health check
export async function checkServiceHealth(): Promise<{
  django: boolean;
  fastapi: boolean;
  details: {
    django?: any;
    fastapi?: any;
  };
}> {
  const health: {
    django: boolean;
    fastapi: boolean;
    details: {
      django?: any;
      fastapi?: any;
    };
  } = {
    django: false,
    fastapi: false,
    details: {}
  };

  try {
    const djangoResponse = await fetch(ENDPOINTS.DJANGO.HEALTH, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    health.django = djangoResponse.ok;
    if (djangoResponse.ok) {
      (health.details as any).django = await djangoResponse.json();
    }
  } catch (error) {
    console.warn('Django service health check failed:', error);
  }

  try {
    const fastapiResponse = await fetch(ENDPOINTS.FASTAPI.HEALTH, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    health.fastapi = fastapiResponse.ok;
    if (fastapiResponse.ok) {
      (health.details as any).fastapi = await fastapiResponse.json();
    }
  } catch (error) {
    console.warn('FastAPI service health check failed:', error);
  }

  return health;
}

// Retry utility
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}

// Django API client
export class DjangoAPIClient {
  private authFetch: (url: string, options?: RequestInit) => Promise<Response>;

  constructor(authFetch: (url: string, options?: RequestInit) => Promise<Response>) {
    this.authFetch = authFetch;
  }

  async get(endpoint: string, options?: RequestInit): Promise<Response> {
    return retryRequest(() => this.authFetch(endpoint, { ...options, method: 'GET' }));
  }

  async post(endpoint: string, data?: any, options?: RequestInit): Promise<Response> {
    return retryRequest(() => this.authFetch(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }));
  }

  async put(endpoint: string, data?: any, options?: RequestInit): Promise<Response> {
    return retryRequest(() => this.authFetch(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }));
  }

  async patch(endpoint: string, data?: any, options?: RequestInit): Promise<Response> {
    return retryRequest(() => this.authFetch(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }));
  }

  async delete(endpoint: string, options?: RequestInit): Promise<Response> {
    return retryRequest(() => this.authFetch(endpoint, { ...options, method: 'DELETE' }));
  }

  // Specific API methods
  async getDeliveryChallans(params?: Record<string, any>): Promise<Response> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`${ENDPOINTS.DJANGO.DELIVERY_CHALLAN}${queryString}`);
  }

  async createDeliveryChallan(data: FormData): Promise<Response> {
    return this.authFetch(ENDPOINTS.DJANGO.DELIVERY_CHALLAN, {
      method: 'POST',
      body: data,
    });
  }

  async updateDeliveryChallan(id: string, data: FormData): Promise<Response> {
    return this.authFetch(`${ENDPOINTS.DJANGO.DELIVERY_CHALLAN}${id}/`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteDeliveryChallan(id: string): Promise<Response> {
    return this.delete(`${ENDPOINTS.DJANGO.DELIVERY_CHALLAN}${id}/`);
  }

  async getProducts(params?: Record<string, any>): Promise<Response> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`${ENDPOINTS.DJANGO.PRODUCTS}${queryString}`);
  }

  async getClients(params?: Record<string, any>): Promise<Response> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`${ENDPOINTS.DJANGO.CLIENTS}${queryString}`);
  }
}

// FastAPI client
export class FastAPIClient {
  private fastapiFetch: (url: string, options?: RequestInit) => Promise<Response>;

  constructor(fastapiFetch: (url: string, options?: RequestInit) => Promise<Response>) {
    this.fastapiFetch = fastapiFetch;
  }

  async get(endpoint: string, options?: RequestInit): Promise<Response> {
    return retryRequest(() => this.fastapiFetch(endpoint, { ...options, method: 'GET' }));
  }

  async post(endpoint: string, data?: any, options?: RequestInit): Promise<Response> {
    return retryRequest(() => this.fastapiFetch(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }));
  }

  // Specific API methods
  async getMetrics(): Promise<Response> {
    return this.get(ENDPOINTS.FASTAPI.METRICS);
  }

  async testAuth(): Promise<Response> {
    return this.get(ENDPOINTS.FASTAPI.AUTH_TEST);
  }

  async testCompanyAuth(): Promise<Response> {
    return this.get(ENDPOINTS.FASTAPI.COMPANY_TEST);
  }

  async testClientAuth(): Promise<Response> {
    return this.get(ENDPOINTS.FASTAPI.CLIENT_TEST);
  }

  // SSE connection
  createSSEConnection(endpoint: string = ENDPOINTS.FASTAPI.SSE_DELIVERY_CHALLAN): EventSource {
    return new EventSource(endpoint);
  }
}

// Hook for using service clients
export function useServiceClients() {
  const { authFetch, fastapiFetch } = useAuth();
  
  return {
    django: new DjangoAPIClient(authFetch),
    fastapi: new FastAPIClient(fastapiFetch),
  };
}

// Error handling utilities
export function handleServiceError(error: any, service: 'django' | 'fastapi', endpoint?: string): never {
  if (error instanceof ServiceError) {
    throw error;
  }

  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    throw new ServiceError(
      `Network error: Unable to connect to ${service} service`,
      0,
      service,
      endpoint
    );
  }

  if (error.status === 401) {
    throw new AuthenticationError(
      'Authentication required',
      service,
      endpoint
    );
  }

  if (error.status === 403) {
    throw new AuthorizationError(
      'Access denied',
      service,
      endpoint
    );
  }

  throw new ServiceError(
    error.message || 'Unknown service error',
    error.status || 500,
    service,
    endpoint
  );
}

// Response handling utilities
export async function handleResponse<T>(response: Response, service: 'django' | 'fastapi', endpoint?: string): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ServiceError(
      errorData.detail || errorData.message || `HTTP ${response.status}`,
      response.status,
      service,
      endpoint
    );
  }

  return response.json();
}

// Service status monitoring
export class ServiceMonitor {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private onHealthChange?: (health: { django: boolean; fastapi: boolean }) => void;

  constructor(onHealthChange?: (health: { django: boolean; fastapi: boolean }) => void) {
    this.onHealthChange = onHealthChange;
  }

  startMonitoring(intervalMs: number = 30000) {
    this.stopMonitoring();
    
    this.healthCheckInterval = setInterval(async () => {
      const health = await checkServiceHealth();
      this.onHealthChange?.(health);
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
} 