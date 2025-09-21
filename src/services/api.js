// API Service Configuration
// Ensure the URL always ends with /api
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/api$/, '') + '/api'

import { getErrorMessageByStatus } from '@/utils/errorMessages'

// API Service Class
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.corsStatus = null // Cache CORS status
    this.corsCheckPromise = null // Prevent multiple simultaneous checks
  }

  // Get authorization headers
  getAuthHeaders() {
    const token = localStorage.getItem('authToken')
    const adminToken = localStorage.getItem('adminToken')
    const tokenToUse = adminToken || token
    
    // Para usuarios demo, no enviar Authorization header (usar solo cookies)
    if (tokenToUse && tokenToUse.includes('.demo.signature')) {
      return {}
    }
    
    return tokenToUse ? { 'Authorization': `Bearer ${tokenToUse}` } : {}
  }

  // Check if backend CORS is properly configured (cached)
  async checkCorsStatus() {
    // Return cached result if available
    if (this.corsStatus !== null) {
      return this.corsStatus
    }

    // If already checking, wait for that check to complete
    if (this.corsCheckPromise) {
      return this.corsCheckPromise
    }

    // Start new check
    this.corsCheckPromise = (async () => {
      try {
        // Handle both cases: baseURL with or without /api
        const healthUrl = this.baseURL.endsWith('/api') 
          ? `${this.baseURL}/health`
          : `${this.baseURL}/api/health`
        
        const response = await fetch(healthUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })
        this.corsStatus = response.ok
        return this.corsStatus
      } catch (error) {
        this.corsStatus = false
        return false
      } finally {
        this.corsCheckPromise = null
      }
    })()

    return this.corsCheckPromise
  }

  // Get credentials option based on CORS status (cached)
  async getCredentialsOption() {
    const corsOk = await this.checkCorsStatus()
    return corsOk ? 'include' : 'omit'
  }

  // Handle response
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Use centralized error message or custom message from API
      const errorMessage = errorData.message || getErrorMessageByStatus(response.status)
      
      throw new Error(errorMessage)
    }
    
    // Try to parse JSON, if it fails return the text
    try {
      return response.json()
    } catch (error) {
      return response.text()
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    try {
      const url = new URL(`${this.baseURL}/${endpoint}`)
      
      // Agregar parámetros de consulta
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key])
        }
      })


      // Detectar si CORS está configurado
      const credentials = await this.getCredentialsOption()

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        credentials: credentials
      })

      return this.handleResponse(response, endpoint)
    } catch (error) {
      throw error
    }
  }

  // POST request
  async post(endpoint, data = {}) {
    try {
      const url = new URL(`${this.baseURL}/${endpoint}`)

      // Detectar si CORS está configurado
      const credentials = await this.getCredentialsOption()

      const bodyToSend = JSON.stringify(data)

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: bodyToSend,
        credentials: credentials
      })

      return this.handleResponse(response, endpoint)
    } catch (error) {
      throw error
    }
  }

  // POST request with FormData (multipart)
  async postFormData(endpoint, formData) {
    try {
      const url = new URL(`${this.baseURL}/${endpoint}`)

      const credentials = await this.getCredentialsOption()

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          // Do not set Content-Type explicitly; browser will set the correct boundary
          ...this.getAuthHeaders()
        },
        body: formData,
        credentials: credentials
      })

      return this.handleResponse(response, endpoint)
    } catch (error) {
      throw error
    }
  }

  // PUT request
  async put(endpoint, data = {}) {
    try {
      const url = new URL(`${this.baseURL}/${endpoint}`)

      // Detectar si CORS está configurado
      const credentials = await this.getCredentialsOption()

      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(data),
        credentials: credentials
      })

      return this.handleResponse(response, endpoint)
    } catch (error) {
      throw error
    }
  }

  // PUT request with FormData (multipart)
  async putFormData(endpoint, formData) {
    try {
      const url = new URL(`${this.baseURL}/${endpoint}`)

      const credentials = await this.getCredentialsOption()

      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          // Do not set Content-Type explicitly; browser will set the correct boundary
          ...this.getAuthHeaders()
        },
        body: formData,
        credentials: credentials
      })

      return this.handleResponse(response, endpoint)
    } catch (error) {
      throw error
    }
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    try {
      const url = new URL(`${this.baseURL}/${endpoint}`)

      // Detectar si CORS está configurado
      const credentials = await this.getCredentialsOption()

      const response = await fetch(url.toString(), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(data),
        credentials: credentials
      })

      return this.handleResponse(response, endpoint)
    } catch (error) {
      throw error
    }
  }

  // DELETE request
  async delete(endpoint) {
    try {
      const url = new URL(`${this.baseURL}/${endpoint}`)

      // Detectar si CORS está configurado
      const credentials = await this.getCredentialsOption()

      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        credentials: credentials
      })

      return this.handleResponse(response, endpoint)
    } catch (error) {
      throw error
    }
  }

  // Get mock data based on endpoint
  async getMockData(endpoint, params = {}) {
    // Return empty data structures for different endpoints
    switch (endpoint) {
      case 'menu':
      case 'menu/items':
      case 'menu/categories':
      case 'events':
      case 'games':
      case 'games/leaderboard':
        return { success: true, data: [] }
      case 'rewards':
        return { success: true, data: [], stats: {} }
      default:
        return { success: false, error: 'Mock endpoint not found' }
    }
  }

  // Alias for postFormData for compatibility
  async postMultipart(endpoint, formData) {
    return this.postFormData(endpoint, formData)
  }

  // Alias for putFormData for compatibility
  async putMultipart(endpoint, formData) {
    return this.putFormData(endpoint, formData)
  }

  // Upload file
  async upload(endpoint, file, onProgress = null) {

    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (onProgress && event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          onProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } catch (error) {
            resolve(xhr.responseText)
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })

      xhr.open('POST', `${this.baseURL}/${endpoint}`)
      
      const token = localStorage.getItem('authToken')
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }
      
      xhr.send(formData)
    })
  }
}

// Create and export API service instance
export const apiService = new ApiService()

// Export the class for testing or custom instances
export { ApiService } 