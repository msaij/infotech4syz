import { env } from '@/config/env'

export interface UserData {
  id: string
  username: string
  email: string
  designation: string
  date_of_joining: string
  date_of_relieving?: string
  active: boolean
  notes?: string
}

export interface AuthResponse {
  status: string
  message: string
  user: UserData
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface RefreshResponse {
  status: string
  message: string
  access_token: string
  expires_in: number
}

export class AuthService {
  private static getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  static async validateUser(token: string): Promise<UserData | null> {
    try {
      const response = await fetch(`${env.API_BASE_URL}${env.AUTH_ENDPOINTS.ME}`, {
        headers: this.getAuthHeaders(token),
      })

      if (response.status === env.HTTP_STATUS.OK) {
        const userData: UserData = await response.json()
        return userData
      }
      
      return null
    } catch (error) {
      console.error('User validation error:', error)
      return null
    }
  }

  static async refreshToken(refreshToken: string): Promise<string | null> {
    try {
      const response = await fetch(`${env.API_BASE_URL}${env.AUTH_ENDPOINTS.REFRESH}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (response.status === env.HTTP_STATUS.OK) {
        const data: RefreshResponse = await response.json()
        return data.access_token
      }
      
      return null
    } catch (error) {
      console.error('Token refresh error:', error)
      return null
    }
  }

  static isValidUser(userData: UserData): boolean {
    return Boolean(userData.email && userData.email.endsWith(env.REQUIRED_EMAIL_DOMAIN))
  }

  static getStoredToken(key: string): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(key)
  }

  static setStoredToken(key: string, value: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(key, value)
  }

  static removeStoredToken(key: string): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  }

  static clearAuthTokens(): void {
    this.removeStoredToken(env.STORAGE_KEYS.ACCESS_TOKEN)
    this.removeStoredToken(env.STORAGE_KEYS.REFRESH_TOKEN)
  }
} 