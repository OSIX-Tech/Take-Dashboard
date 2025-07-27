// API Service Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// API Service Class
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
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

  // Handle API response
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  // GET request
  async get(endpoint, params = {}) {
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
  }

  // POST request
  async post(endpoint, data = {}) {
    const response = await fetch(`${this.baseURL}/${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    return this.handleResponse(response)
  }

  // PUT request
  async put(endpoint, data = {}) {
    const response = await fetch(`${this.baseURL}/${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    return this.handleResponse(response)
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    const response = await fetch(`${this.baseURL}/${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    return this.handleResponse(response)
  }

  // DELETE request
  async delete(endpoint) {
    const response = await fetch(`${this.baseURL}/${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })

    return this.handleResponse(response)
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