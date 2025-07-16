"use client";

import { ReactNode, createContext, useContext, useState, useEffect } from "react";

// Environment variables for API integration
const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000';
const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8001';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'company' | 'client';
  role: 'admin' | 'manager' | 'user' | 'viewer';
  phone?: string;
  department?: string;
  position?: string;
  company_name?: string;
  company_short_name?: string;
  client_name?: string;
  client_short_name?: string;
  company?: {
    id: number;
    name: string;
    email_domain: string;
    short_name: string;
  };
  client?: {
    id: number;
    name: string;
    company: number;
    short_name: string;
  };
}

interface ServiceHealth {
  django: boolean;
  fastapi: boolean;
  lastCheck: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  serviceHealth: ServiceHealth;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  fastapiFetch: (url: string, options?: RequestInit) => Promise<Response>;
  inGroup: (group: string | string[]) => boolean;
  hasPermission: (perm: string) => boolean;
  primaryGroup: () => string | null;
  refreshToken: () => Promise<void>;
  checkServiceHealth: () => Promise<void>;
}

// Create the AuthContext for managing authentication state and actions
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [serviceHealth, setServiceHealth] = useState<ServiceHealth>({
    django: false,
    fastapi: false,
    lastCheck: new Date()
  });

  // Load tokens from localStorage on mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    
    if (storedAccessToken && storedRefreshToken) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      fetchUserDetails(storedAccessToken);
    } else {
      setLoading(false);
    }
    
    // Check service health on mount
    checkServiceHealth();
  }, []);

  // Check health of both Django and FastAPI services
  const checkServiceHealth = async () => {
    const health = {
      django: false,
      fastapi: false,
      lastCheck: new Date()
    };

    try {
      // Check Django health
      const djangoResponse = await fetch(`${DJANGO_API_URL}/api/v1/health/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      health.django = djangoResponse.ok;
    } catch (error) {
      console.warn('Django service health check failed:', error);
    }

    try {
      // Check FastAPI health
      const fastapiResponse = await fetch(`${FASTAPI_URL}/api/v1/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      health.fastapi = fastapiResponse.ok;
    } catch (error) {
      console.warn('FastAPI service health check failed:', error);
    }

    setServiceHealth(health);
  };

  const fetchUserDetails = async (token: string) => {
    try {
      // Try company users endpoint first
      let response = await fetch(`${DJANGO_API_URL}/api/v1/company/users/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        // Extract the first user from the results
        if (userData.results && userData.results.length > 0) {
          const user = userData.results[0];
          setUser(user);
          setLoading(false);
          return;
        }
      }

      // If company endpoint fails, try client endpoint
      response = await fetch(`${DJANGO_API_URL}/api/v1/client/users/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        // Extract the first user from the results
        if (userData.results && userData.results.length > 0) {
          const user = userData.results[0];
          setUser(user);
          setLoading(false);
          return;
        }
      }

      // If both fail, clear tokens and user
      clearAuth();
    } catch (error) {
      console.error('Error fetching user details:', error);
      clearAuth();
    }
  };

  const clearAuth = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setLoading(false);
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${DJANGO_API_URL}/api/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newAccessToken = data.access;
        setAccessToken(newAccessToken);
        localStorage.setItem('accessToken', newAccessToken);
        return newAccessToken;
      } else {
        clearAuth();
        return null;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      clearAuth();
      return null;
    }
  };

  // Login with JWT
  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${DJANGO_API_URL}/api/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.access);
        setRefreshToken(data.refresh);
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        
        await fetchUserDetails(data.access);
        return true;
      } else {
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return false;
    }
  };

  // Logout: clear all auth data
  const logout = () => {
    clearAuth();
  };

  // Helper for authenticated Django API calls with automatic token refresh
  const authFetch = async (url: string, options: RequestInit = {}) => {
    let token = accessToken;
    
    // If no token, try to refresh
    if (!token && refreshToken) {
      token = await refreshAccessToken();
    }

    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // If token expired, try to refresh and retry once
    if (response.status === 401 && refreshToken) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
      }
    }

    return response;
  };

  // Helper for authenticated FastAPI calls
  const fastapiFetch = async (url: string, options: RequestInit = {}) => {
    let token = accessToken;
    
    // If no token, try to refresh
    if (!token && refreshToken) {
      token = await refreshAccessToken();
    }

    if (!token) {
      throw new Error('No authentication token available');
    }

    // Ensure URL is absolute
    const fullUrl = url.startsWith('http') ? url : `${FASTAPI_URL}${url}`;

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // If token expired, try to refresh and retry once
    if (response.status === 401 && refreshToken) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return fetch(fullUrl, {
          ...options,
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
      }
    }

    return response;
  };

  const inGroup = (group: string | string[]) => {
    if (!user) return false;
    
    // Check user type
    if (Array.isArray(group)) {
      return group.some(g => g === user.user_type || g === user.role);
    }
    return group === user.user_type || group === user.role;
  };

  const hasPermission = (perm: string) => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Check specific permissions based on role
    const rolePermissions = {
      'manager': ['view', 'edit', 'create'],
      'user': ['view', 'edit'],
      'viewer': ['view'],
    };
    
    return rolePermissions[user.role]?.includes(perm) || false;
  };

  const primaryGroup = () => {
    if (!user) return null;
    return user.user_type;
  };

  const refreshTokenFunction = async () => {
    if (refreshToken) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        await fetchUserDetails(newToken);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      serviceHealth,
      login, 
      logout, 
      authFetch, 
      fastapiFetch,
      inGroup, 
      hasPermission, 
      primaryGroup,
      refreshToken: refreshTokenFunction,
      checkServiceHealth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use authentication context in components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
