import { env } from '@/config/env'

export interface DeliveryChallan {
  id: string
  delivery_challan_number: string
  delivery_challan_date: string
  client_name: string
  summary_of_delivery_challan: string
  tool_used: 'Zoho' | 'Excel'
  signed_acknowledgement_copy?: string
  invoice_number?: string
  invoice_date?: string
  invoice_submission_status: 'Submitted' | 'Not Submitted'
  created_at: string
  updated_at: string
}

export interface DeliveryChallanCreate {
  delivery_challan_date: string
  client_name: string
  summary_of_delivery_challan: string
  tool_used: 'Zoho' | 'Excel'
  signed_acknowledgement_copy?: string
  invoice_number?: string
  invoice_date?: string
  invoice_submission_status: 'Submitted' | 'Not Submitted'
}

export interface DeliveryChallanUpdate {
  delivery_challan_date?: string
  client_name?: string
  summary_of_delivery_challan?: string
  tool_used?: 'Zoho' | 'Excel'
  signed_acknowledgement_copy?: string
  invoice_number?: string
  invoice_date?: string
  invoice_submission_status?: 'Submitted' | 'Not Submitted'
}

export interface DeliveryChallanFilters {
  start_date?: string
  end_date?: string
  client_name?: string
  invoice_submission_status?: string
  skip?: number
  limit?: number
}

export interface DeliveryChallanListResponse {
  status: string
  message: string
  delivery_challans: DeliveryChallan[]
  total: number
}

export interface ClientListResponse {
  status: string
  message: string
  clients: string[]
}

export interface FileUploadResponse {
  status: string
  message: string
  file_path: string
  file_name: string
}

export interface InvoiceLinkRequest {
  challan_ids: string[]
  invoice_number: string
  invoice_date: string
}

export interface InvoiceLinkResponse {
  status: string
  message: string
  linked_challans: string[]
  invoice_number: string
}

class DeliveryChallanService {
  private baseUrl = `${env.BACKEND_URL}/delivery-challan`
  private csrfToken: string | null = null

  private async ensureCSRFToken(): Promise<string> {
    // Always try to get a fresh token from the backend
    
    try {
      const response = await fetch(`${this.baseUrl}/csrf-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(env.STORAGE_KEYS.ACCESS_TOKEN)}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        this.csrfToken = data.csrf_token
        if (this.csrfToken) {
          localStorage.setItem(env.STORAGE_KEYS.CSRF_TOKEN, this.csrfToken)
        }
      } else {
        // Clear any stale token
        localStorage.removeItem(env.STORAGE_KEYS.CSRF_TOKEN)
        this.csrfToken = null
        throw new Error('Failed to get CSRF token')
      }
    } catch (error) {
      // Clear any stale token
      localStorage.removeItem(env.STORAGE_KEYS.CSRF_TOKEN)
      this.csrfToken = null
      throw new Error('Failed to get CSRF token')
    }
    
    if (!this.csrfToken) {
      throw new Error('Failed to get CSRF token')
    }
    
    return this.csrfToken
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Authorization': `Bearer ${localStorage.getItem(env.STORAGE_KEYS.ACCESS_TOKEN)}`,
      'Content-Type': 'application/json'
    }
    return headers
  }

  private getHeadersWithCSRF(): HeadersInit {
    const headers = this.getHeaders()
    if (this.csrfToken) {
      (headers as Record<string, string>)['X-CSRF-Token'] = this.csrfToken
    }
    return headers
  }

  async getDeliveryChallans(filters: DeliveryChallanFilters = {}): Promise<DeliveryChallanListResponse> {
    try {
      const params = new URLSearchParams()
      
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)
      if (filters.client_name) params.append('client_name', filters.client_name)
      if (filters.invoice_submission_status) params.append('invoice_submission_status', filters.invoice_submission_status)
      if (filters.skip) params.append('skip', filters.skip.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())

      const response = await fetch(`${this.baseUrl}/?${params.toString()}`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      if (!response.ok) {
        let errorMessage = `Failed to fetch delivery challans: ${response.statusText}`
        try {
          const errorData = await response.json()
          if (errorData.detail) {
            errorMessage = errorData.detail
          } else if (errorData.message) {
            errorMessage = errorData.message
          } else if (typeof errorData === 'string') {
            errorMessage = errorData
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError)
        }
        throw new Error(errorMessage)
      }

      return await response.json()
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server')
      }
      throw error
    }
  }

  async getDeliveryChallan(id: string): Promise<DeliveryChallan> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to fetch delivery challan: ${response.statusText}`)
      }

      return await response.json()
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server')
      }
      throw error
    }
  }

  async createDeliveryChallan(challanData: DeliveryChallanCreate): Promise<DeliveryChallan> {
    try {
      await this.ensureCSRFToken()

      const response = await fetch(`${this.baseUrl}/`, {
        method: 'POST',
        headers: this.getHeadersWithCSRF(),
        body: JSON.stringify(challanData)
      })

      if (!response.ok) {
        let errorMessage = `Failed to create delivery challan: ${response.statusText}`
        try {
          const errorData = await response.json()
          if (errorData.detail) {
            errorMessage = errorData.detail
          } else if (errorData.message) {
            errorMessage = errorData.message
          } else if (typeof errorData === 'string') {
            errorMessage = errorData
          }
        } catch (parseError) {
          // If JSON parsing fails, use the status text
          console.error('Error parsing response:', parseError)
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      return result.delivery_challan
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server')
      }
      throw error
    }
  }

  async updateDeliveryChallan(id: string, challanData: DeliveryChallanUpdate): Promise<DeliveryChallan> {
    try {
      await this.ensureCSRFToken()

      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: this.getHeadersWithCSRF(),
        body: JSON.stringify(challanData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to update delivery challan: ${response.statusText}`)
      }

      const result = await response.json()
      return result.delivery_challan
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server')
      }
      throw error
    }
  }

  async deleteDeliveryChallan(id: string): Promise<void> {
    try {
      await this.ensureCSRFToken()

      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: this.getHeadersWithCSRF()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to delete delivery challan: ${response.statusText}`)
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server')
      }
      throw error
    }
  }

  async getClients(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/clients`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to fetch clients: ${response.statusText}`)
      }

      const result: ClientListResponse = await response.json()
      return result.clients
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server')
      }
      throw error
    }
  }

  async uploadFile(file: File): Promise<FileUploadResponse> {
    try {
      await this.ensureCSRFToken()

      const formData = new FormData()
      formData.append('file', file)

      const headers = {
        'Authorization': `Bearer ${localStorage.getItem(env.STORAGE_KEYS.ACCESS_TOKEN)}`,
        'X-CSRF-Token': this.csrfToken!
      }

      const response = await fetch(`${this.baseUrl}/upload-file`, {
        method: 'POST',
        headers,
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to upload file: ${response.statusText}`)
      }

      return await response.json()
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server')
      }
      throw error
    }
  }

  async linkInvoice(linkData: InvoiceLinkRequest): Promise<InvoiceLinkResponse> {
    try {
      await this.ensureCSRFToken()

      const response = await fetch(`${this.baseUrl}/link-invoice`, {
        method: 'POST',
        headers: this.getHeadersWithCSRF(),
        body: JSON.stringify(linkData)
      })

      if (!response.ok) {
        let errorMessage = `Failed to link invoice: ${response.statusText}`
        try {
          const errorData = await response.json()
          if (errorData.detail) {
            errorMessage = errorData.detail
          } else if (errorData.message) {
            errorMessage = errorData.message
          } else if (typeof errorData === 'string') {
            errorMessage = errorData
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError)
        }
        throw new Error(errorMessage)
      }

      return await response.json()
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server')
      }
      throw error
    }
  }

  // Helper method to check if user has write access
  static isDeliveryChallanManager(userData: { designation?: string }): boolean {
    const allowedRoles = ['admin', 'ceo', 'DC_tracker_manager']
    return allowedRoles.includes(userData.designation?.toLowerCase() || '')
  }

  // Helper method to format date for display
  static formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB') // DD/MM/YYYY format
  }

  // Helper method to format date for input
  static formatDateForInput(dateString: string): string {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0] // YYYY-MM-DD format
  }
}

export default DeliveryChallanService 