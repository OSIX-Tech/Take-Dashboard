// API Service Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Import mock data
import { mockApiService } from './mockData.js'

// API Service Class
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
    this.useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('authToken')
  }

  // Add auth header if token exists
  getHeaders() {
    const token = this.getAuthToken()
    return {
      ...this.defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  // Check if backend is available
  async checkBackendHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: this.getHeaders(),
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  // Handle API response
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  // GET request with fallback to mock data
  async get(endpoint, params = {}) {
    // If mock data is enabled or backend is not available, use mock data
    if (this.useMockData) {
      console.log(`🔧 Using mock data for: ${endpoint}`)
      return this.getMockData(endpoint, params)
    }

    try {
      const url = new URL(`${this.baseURL}/${endpoint}`)
      
      // Add query parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key])
        }
      })

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      })

      return this.handleResponse(response)
    } catch (error) {
      console.log(`⚠️ Backend unavailable, falling back to mock data for: ${endpoint}`)
      return this.getMockData(endpoint, params)
    }
  }

  // POST request
  async post(endpoint, data = {}) {
    if (this.useMockData) {
      console.log(`🔧 Using mock data for POST: ${endpoint}`)
      return { success: true, data: data }
    }

    try {
      const response = await fetch(`${this.baseURL}/${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })

      return this.handleResponse(response)
    } catch (error) {
      console.log(`⚠️ Backend unavailable for POST: ${endpoint}`)
      return { success: false, error: 'Backend unavailable' }
    }
  }

  // PUT request
  async put(endpoint, data = {}) {
    if (this.useMockData) {
      console.log(`🔧 Using mock data for PUT: ${endpoint}`)
      return { success: true, data: data }
    }

    try {
      const response = await fetch(`${this.baseURL}/${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })

      return this.handleResponse(response)
    } catch (error) {
      console.log(`⚠️ Backend unavailable for PUT: ${endpoint}`)
      return { success: false, error: 'Backend unavailable' }
    }
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    if (this.useMockData) {
      console.log(`🔧 Using mock data for PATCH: ${endpoint}`)
      return { success: true, data: data }
    }

    try {
      const response = await fetch(`${this.baseURL}/${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })

      return this.handleResponse(response)
    } catch (error) {
      console.log(`⚠️ Backend unavailable for PATCH: ${endpoint}`)
      return { success: false, error: 'Backend unavailable' }
    }
  }

  // DELETE request
  async delete(endpoint) {
    if (this.useMockData) {
      console.log(`🔧 Using mock data for DELETE: ${endpoint}`)
      return { success: true, message: 'Item deleted (mock)' }
    }

    try {
      const response = await fetch(`${this.baseURL}/${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      })

      return this.handleResponse(response)
    } catch (error) {
      console.log(`⚠️ Backend unavailable for DELETE: ${endpoint}`)
      return { success: false, error: 'Backend unavailable' }
    }
  }

  // Get mock data based on endpoint
  async getMockData(endpoint, params = {}) {
    switch (endpoint) {
      case 'menu/items':
        return mockApiService.getMenuItems()
      case 'menu/categories':
        return mockApiService.getCategories()
      case 'menu/stats':
        return mockApiService.getMenuStats()
      case 'events':
        return mockApiService.getEvents()
      case 'rewards':
        return mockApiService.getRewards()
      case 'rewards/stats':
        return mockApiService.getRewardsStats()
      case 'games':
        return mockApiService.getGames()
      case 'games/leaderboard':
        return mockApiService.getLeaderboard()
      case 'games/stats':
        return mockApiService.getGameStats()
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
      
      const token = this.getAuthToken()
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