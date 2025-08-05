// API Service Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'

// Import mock data
import { mockApiService } from './mockData.js'

// API Service Class
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.useMockData = USE_MOCK_DATA
  }

  // Get authorization headers
  getAuthHeaders() {
    const token = localStorage.getItem('authToken')
    const adminToken = localStorage.getItem('adminToken')
    const tokenToUse = adminToken || token
    
    // Para usuarios demo, no enviar Authorization header (usar solo cookies)
    if (tokenToUse && tokenToUse.includes('.demo.signature')) {
      console.log('🎭 API - Demo user detected, not sending Authorization header')
      return {}
    }
    
    return tokenToUse ? { 'Authorization': `Bearer ${tokenToUse}` } : {}
  }

  // Check if backend CORS is properly configured
  async checkCorsStatus() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
      return response.ok
    } catch (error) {
      console.log('⚠️ API - CORS not configured, using fallback mode')
      return false
    }
  }

  // Get credentials option based on CORS status
  async getCredentialsOption() {
    const corsOk = await this.checkCorsStatus()
    return corsOk ? 'include' : 'omit'
  }

  // Handle response
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Categorizar errores HTTP específicos
      let errorMessage = errorData.message || `HTTP error! status: ${response.status}`
      
      switch (response.status) {
        case 401:
          errorMessage = 'No autorizado: Credenciales inválidas o expiradas'
          break
        case 403:
          errorMessage = 'Acceso denegado: No tienes permisos para esta acción'
          break
        case 404:
          errorMessage = 'Recurso no encontrado: El endpoint solicitado no existe'
          break
        case 500:
          errorMessage = 'Error interno del servidor: Contacta al administrador'
          break
        case 503:
          errorMessage = 'Servicio no disponible: El servidor está temporalmente fuera de servicio'
          break
        default:
          if (response.status >= 400 && response.status < 500) {
            errorMessage = 'Error del cliente: Verifica tu solicitud'
          } else if (response.status >= 500) {
            errorMessage = 'Error del servidor: Contacta al administrador'
          }
      }
      
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

      console.log(`🌐 Making GET request to: ${url.toString()}`)
      console.log(`🔑 Headers:`, this.getAuthHeaders())

      // Detectar si CORS está configurado
      const credentials = await this.getCredentialsOption()
      console.log(`🔧 Using credentials: ${credentials}`)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        credentials: credentials
      })

      console.log(`📡 Response status: ${response.status} for ${endpoint}`)
      return this.handleResponse(response, endpoint)
    } catch (error) {
      console.error(`❌ GET ${endpoint} failed:`, error)
      console.error(`❌ Error details:`, {
        message: error.message,
        stack: error.stack,
        endpoint,
        params
      })
      throw error
    }
  }

  // POST request
  async post(endpoint, data = {}) {
    try {
      const url = new URL(`${this.baseURL}/${endpoint}`)
      console.log(`🌐 Making POST request to: ${url.toString()}`)
      console.log(`📦 Data:`, data)

      // Detectar si CORS está configurado
      const credentials = await this.getCredentialsOption()
      console.log(`🔧 Using credentials: ${credentials}`)

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(data),
        credentials: credentials
      })

      console.log(`📡 Response status: ${response.status} for ${endpoint}`)
      return this.handleResponse(response, endpoint)
    } catch (error) {
      console.error(`❌ POST ${endpoint} failed:`, error)
      throw error
    }
  }

  // PUT request
  async put(endpoint, data = {}) {
    try {
      const url = new URL(`${this.baseURL}/${endpoint}`)
      console.log(`🌐 Making PUT request to: ${url.toString()}`)
      console.log(`📦 Data:`, data)

      // Detectar si CORS está configurado
      const credentials = await this.getCredentialsOption()
      console.log(`🔧 Using credentials: ${credentials}`)

      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(data),
        credentials: credentials
      })

      console.log(`📡 Response status: ${response.status} for ${endpoint}`)
      return this.handleResponse(response, endpoint)
    } catch (error) {
      console.error(`❌ PUT ${endpoint} failed:`, error)
      throw error
    }
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    try {
      const url = new URL(`${this.baseURL}/${endpoint}`)
      console.log(`🌐 Making PATCH request to: ${url.toString()}`)
      console.log(`📦 Data:`, data)

      // Detectar si CORS está configurado
      const credentials = await this.getCredentialsOption()
      console.log(`🔧 Using credentials: ${credentials}`)

      const response = await fetch(url.toString(), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(data),
        credentials: credentials
      })

      console.log(`📡 Response status: ${response.status} for ${endpoint}`)
      return this.handleResponse(response, endpoint)
    } catch (error) {
      console.error(`❌ PATCH ${endpoint} failed:`, error)
      throw error
    }
  }

  // DELETE request
  async delete(endpoint) {
    try {
      const url = new URL(`${this.baseURL}/${endpoint}`)
      console.log(`🌐 Making DELETE request to: ${url.toString()}`)

      // Detectar si CORS está configurado
      const credentials = await this.getCredentialsOption()
      console.log(`🔧 Using credentials: ${credentials}`)

      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        credentials: credentials
      })

      console.log(`📡 Response status: ${response.status} for ${endpoint}`)
      return this.handleResponse(response, endpoint)
    } catch (error) {
      console.error(`❌ DELETE ${endpoint} failed:`, error)
      throw error
    }
  }

  // Get mock data based on endpoint
  async getMockData(endpoint, params = {}) {
    switch (endpoint) {
      case 'menu':
        return mockApiService.getMenuItems()
      case 'menu/items':
        return mockApiService.getMenuItems()
      case 'menu/categories':
        return mockApiService.getCategories()
      case 'events':
        return mockApiService.getEvents()
      case 'rewards':
        return mockApiService.getRewards()
      case 'games':
        return mockApiService.getGames()
      case 'games/leaderboard':
        return mockApiService.getLeaderboard()
      default:
        return { success: false, error: 'Mock endpoint not found' }
    }
  }

  // Upload file
  async upload(endpoint, file, onProgress = null) {
    if (this.useMockData) {
      console.log(`🔧 Using mock data for upload: ${endpoint}`)
      return { success: true, url: 'mock-upload-url' }
    }

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