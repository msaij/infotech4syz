import { env } from '@/config/env'
import { AuthService } from './auth'

export interface ClientData {
  id: string
  client_full_name: string
  client_tag_name: string
  address: string
  city: string
  zip: string
  state: string
  country: string
  onboarding_date: string
  offboarding_date?: string
}

export interface CreateClientData {
  client_full_name: string
  client_tag_name: string
  address: string
  city: string
  zip: string
  state: string
  country: string
  onboarding_date: string
  offboarding_date?: string
}

export interface UpdateClientData {
  client_full_name?: string
  client_tag_name?: string
  address?: string
  city?: string
  zip?: string
  state?: string
  country?: string
  onboarding_date?: string
  offboarding_date?: string
}

export interface ClientListResponse {
  status: string
  message: string
  clients: ClientData[]
  total: number
}

export interface ClientResponse {
  status: string
  message: string
  client: ClientData
}

export interface CSRFResponse {
  status: string
  message: string
  csrf_token: string
}

export class ClientService {
  private static async getAuthHeaders(): Promise<HeadersInit> {
    const token = AuthService.getStoredToken(env.STORAGE_KEYS.ACCESS_TOKEN)
    const csrfToken = AuthService.getStoredToken(env.STORAGE_KEYS.CSRF_TOKEN)
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken
    }
    
    return headers
  }

  private static async ensureCSRFToken(): Promise<string> {
    let csrfToken = AuthService.getStoredToken(env.STORAGE_KEYS.CSRF_TOKEN)
    
    if (!csrfToken) {
      const token = AuthService.getStoredToken(env.STORAGE_KEYS.ACCESS_TOKEN)
      if (!token) {
        throw new Error('No access token available')
      }
      
      const response = await fetch(`${env.API_BASE_URL}${env.CLIENT_ENDPOINTS.CSRF_TOKEN}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.status === env.HTTP_STATUS.OK) {
        const data: CSRFResponse = await response.json()
        csrfToken = data.csrf_token
        AuthService.setStoredToken(env.STORAGE_KEYS.CSRF_TOKEN, csrfToken)
      } else {
        throw new Error('Failed to get CSRF token')
      }
    }
    
    return csrfToken
  }

  static async getClients(skip: number = 0, limit: number = 100): Promise<ClientListResponse> {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(
      `${env.API_BASE_URL}${env.CLIENT_ENDPOINTS.LIST}?skip=${skip}&limit=${limit}`,
      { headers }
    )
    
    if (response.status === env.HTTP_STATUS.OK) {
      return await response.json()
    } else if (response.status === env.HTTP_STATUS.FORBIDDEN) {
      throw new Error('Access denied. Only CEO users can manage clients.')
    } else {
      throw new Error('Failed to fetch clients')
    }
  }

  static async getClient(clientId: string): Promise<ClientData> {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(
      `${env.API_BASE_URL}${env.CLIENT_ENDPOINTS.GET}/${clientId}`,
      { headers }
    )
    
    if (response.status === env.HTTP_STATUS.OK) {
      return await response.json()
    } else if (response.status === env.HTTP_STATUS.FORBIDDEN) {
      throw new Error('Access denied. Only CEO users can manage clients.')
    } else {
      throw new Error('Failed to fetch client')
    }
  }

  static async createClient(clientData: CreateClientData): Promise<ClientResponse> {
    await this.ensureCSRFToken()
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(`${env.API_BASE_URL}${env.CLIENT_ENDPOINTS.CREATE}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(clientData),
    })
    
    if (response.status === env.HTTP_STATUS.OK) {
      // Clear CSRF token after successful use
      AuthService.removeStoredToken(env.STORAGE_KEYS.CSRF_TOKEN)
      return await response.json()
    } else if (response.status === env.HTTP_STATUS.FORBIDDEN) {
      throw new Error('Access denied. Only CEO users can manage clients.')
    } else {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to create client')
    }
  }

  static async updateClient(clientId: string, clientData: UpdateClientData): Promise<ClientResponse> {
    await this.ensureCSRFToken()
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(`${env.API_BASE_URL}${env.CLIENT_ENDPOINTS.UPDATE}/${clientId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(clientData),
    })
    
    if (response.status === env.HTTP_STATUS.OK) {
      // Clear CSRF token after successful use
      AuthService.removeStoredToken(env.STORAGE_KEYS.CSRF_TOKEN)
      return await response.json()
    } else if (response.status === env.HTTP_STATUS.FORBIDDEN) {
      throw new Error('Access denied. Only CEO users can manage clients.')
    } else {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to update client')
    }
  }

  static async deleteClient(clientId: string): Promise<{ status: string; message: string }> {
    await this.ensureCSRFToken()
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(`${env.API_BASE_URL}${env.CLIENT_ENDPOINTS.DELETE}/${clientId}`, {
      method: 'DELETE',
      headers,
    })
    
    if (response.status === env.HTTP_STATUS.OK) {
      // Clear CSRF token after successful use
      AuthService.removeStoredToken(env.STORAGE_KEYS.CSRF_TOKEN)
      return await response.json()
    } else if (response.status === env.HTTP_STATUS.FORBIDDEN) {
      throw new Error('Access denied. Only CEO users can manage clients.')
    } else {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to delete client')
    }
  }

  static isCEOUser(userData: any): boolean {
    return userData?.designation?.toLowerCase() === env.USER_ROLES.CEO.toLowerCase()
  }
} 