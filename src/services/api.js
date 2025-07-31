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
    return tokenToUse ? { 'Authorization': `Bearer ${tokenToUse}` } : {}
  }

  // Handle response
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
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
      // If mock data is enabled or backend is not available, use mock data
      if (this.useMockData) {
        console.log(`🔧 Using mock data for: ${endpoint}`)
        return this.getMockData(endpoint, params)
      }

      const url = new URL(`${this.baseURL}/${endpoint}`)
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

      console.log(`🌐 Making GET request to: ${url.toString()}`)
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      })

      const result = await this.handleResponse(response)
      console.log(`✅ GET ${endpoint} successful:`, result)
      return result
    } catch (error) {
      console.error(`❌ GET ${endpoint} failed:`, error)
      // Fallback to mock data if backend is not available
      console.log(`🔧 Falling back to mock data for: ${endpoint}`)
      return this.getMockData(endpoint, params)
    }
  }

  // POST request
  async post(endpoint, data = {}) {
    try {
      // If mock data is enabled, use mock data
      if (this.useMockData) {
        console.log(`🔧 Using mock data for: ${endpoint}`)
        return this.getMockData(endpoint, data)
      }

      console.log(`🌐 Making POST request to: ${this.baseURL}/${endpoint}`, data)
      
      const response = await fetch(`${this.baseURL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(data)
      })

      const result = await this.handleResponse(response)
      console.log(`✅ POST ${endpoint} successful:`, result)
      return result
    } catch (error) {
      console.error(`❌ POST ${endpoint} failed:`, error)
      // For POST requests, we don't fallback to mock data, we throw the error
      throw error
    }
  }

  // PUT request
  async put(endpoint, data = {}) {
    try {
      // If mock data is enabled, use mock data
      if (this.useMockData) {
        console.log(`🔧 Using mock data for: ${endpoint}`)
        return this.getMockData(endpoint, data)
      }

      console.log(`🌐 Making PUT request to: ${this.baseURL}/${endpoint}`, data)
      
      const response = await fetch(`${this.baseURL}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(data)
      })

      const result = await this.handleResponse(response)
      console.log(`✅ PUT ${endpoint} successful:`, result)
      return result
    } catch (error) {
      console.error(`❌ PUT ${endpoint} failed:`, error)
      throw error
    }
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    try {
      // If mock data is enabled, use mock data
      if (this.useMockData) {
        console.log(`🔧 Using mock data for: ${endpoint}`)
        return this.getMockData(endpoint, data)
      }

      console.log(`🌐 Making PATCH request to: ${this.baseURL}/${endpoint}`, data)
      
      const response = await fetch(`${this.baseURL}/${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(data)
      })

      const result = await this.handleResponse(response)
      console.log(`✅ PATCH ${endpoint} successful:`, result)
      return result
    } catch (error) {
      console.error(`❌ PATCH ${endpoint} failed:`, error)
      throw error
    }
  }

  // DELETE request
  async delete(endpoint) {
    try {
      // If mock data is enabled, use mock data
      if (this.useMockData) {
        console.log(`🔧 Using mock data for: ${endpoint}`)
        return this.getMockData(endpoint)
      }

      console.log(`🌐 Making DELETE request to: ${this.baseURL}/${endpoint}`)
      
      const response = await fetch(`${this.baseURL}/${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      })

      const result = await this.handleResponse(response)
      console.log(`✅ DELETE ${endpoint} successful:`, result)
      return result
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