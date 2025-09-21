import { apiService } from './api.js'
import { AUTH_CONFIG } from '@/config/auth'

export const authService = {
  // Admin authentication endpoints only

  // Admin authentication endpoints
  async adminLogin() {
    
    try {
      // Solo verificar que tengamos la URL del backend
      
      if (!AUTH_CONFIG.API_BASE_URL) {
        throw new Error('CONFIG_ERROR: API Base URL no configurado')
      }

      // Verificar conectividad básica con el backend
      
      try {
        const healthUrl = `${AUTH_CONFIG.API_BASE_URL}/health`

        const response = await fetch(healthUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error(`BACKEND_ERROR: Backend respondió con status ${response.status}`)
        }
      } catch (error) {
        
        if (error.message.includes('fetch')) {
          throw new Error('NETWORK_ERROR: No se puede conectar al servidor')
        } else if (error.message.includes('CORS')) {
          throw new Error('CORS_ERROR: Error de configuración CORS')
        } else {
          throw new Error(`BACKEND_ERROR: ${error.message}`)
        }
      }

      // Inicia el flujo de autenticación de admin
      const loginUrl = `${AUTH_CONFIG.API_BASE_URL}/admin/auth/login`
      
      window.location.href = loginUrl
    } catch (error) {
      
      throw error
    }
  },

  async adminGoogleAuth() {
    const googleAuthUrl = `${AUTH_CONFIG.API_BASE_URL}/admin/auth/google`
    
    window.location.href = googleAuthUrl
  },

  async adminGoogleCallback(code) {
    
    const response = await apiService.get(`admin/auth/google/callback?code=${code}`)
    
    return response
  },

  async adminAuthError() {
    return apiService.get('admin/auth/error')
  },

  async adminLogout() {
    
    try {
      const result = await apiService.post('admin/auth/logout')
      
      return result
    } catch (error) {
      
      throw error
    }
  },

  async getAdminProfile() {
    
    const profile = await apiService.get('admin/auth/me')
    
    return profile
  },

  async refreshAdminToken() {
    return apiService.post('admin/auth/refresh')
  },

  async checkSession() {
    
    try {
      const response = await apiService.get('admin/auth/me')
      
      return response
    } catch (error) {
      
      throw error
    }
  },

  // Utility methods
  isAuthenticated() {
    const hasToken = !!localStorage.getItem('adminToken')
    
    return hasToken
  },

  isAdminAuthenticated() {
    const hasAdminToken = !!localStorage.getItem('adminToken')
    
    return hasAdminToken
  },

  getCurrentUser() {
    const adminToken = localStorage.getItem('adminToken')
    
    if (!adminToken) return null
    
    try {
      // Intentar decodificar el token admin
      const tokenToDecode = adminToken
      
      // Manejar token demo (formato: base64.demo.signature)
      if (tokenToDecode.includes('.demo.signature')) {
        const payload = JSON.parse(atob(tokenToDecode.split('.')[0]))
        return {
          name: payload.name || 'Demo User',
          email: payload.email || 'demo@example.com',
          isDemo: payload.demo || true,
          isAdmin: payload.isAdmin || false,
          role: payload.role || 'user'
        }
      }
      
      // Manejar JWT real (formato: header.payload.signature)
      const payload = JSON.parse(atob(tokenToDecode.split('.')[1]))
      return {
        name: payload.name || 'Usuario',
        email: payload.email || 'admin@take.com',
        isDemo: payload.demo || false,
        isAdmin: !!adminToken,
        role: adminToken ? 'admin' : 'user'
      }
    } catch (error) {
      
      return {
        name: 'Usuario',
        email: 'admin@take.com',
        isDemo: false,
        isAdmin: !!adminToken,
        role: adminToken ? 'admin' : 'user'
      }
    }
  },

  clearAuth() {
    localStorage.removeItem('adminToken')
  },

  // Admin specific methods
  async handleAdminLogin() {
    try {
      // Iniciar flujo de autenticación de admin
      await this.adminLogin()
    } catch (error) {
      
      throw error
    }
  },

  async handleAdminCallback(code) {
    
    try {
      const response = await this.adminGoogleCallback(code)

      if (response && response.token) {
        
        localStorage.setItem('adminToken', response.token)
        
        const user = response.user || {
          name: 'Admin User',
          email: 'admin@take.com',
          isAdmin: true,
          role: 'admin'
        }
        
        return user
      }

      throw new Error('No token received from admin callback')
    } catch (error) {
      
      throw error
    }
  }
}

// Función auxiliar para extraer token del callback URL
export function extractTokenFromUrl() {

  // Buscar en hash fragment (después de #)
  if (window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const token = hashParams.get('token')
    const adminToken = hashParams.get('adminToken')
    if (token || adminToken) {
      
      return token || adminToken
    }
  }
  
  // Buscar en query params
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')
  const adminToken = urlParams.get('adminToken')
  const accessToken = urlParams.get('access_token')
  
  if (token || adminToken || accessToken) {
    
    return token || adminToken || accessToken
  }
  
  // Buscar adminInfo en params (podría venir encoded)
  const adminInfo = urlParams.get('adminInfo')
  if (adminInfo) {
    try {
      const decoded = JSON.parse(decodeURIComponent(adminInfo))
      
      // Guardar info del admin aunque no tengamos token
      localStorage.setItem('adminInfo', JSON.stringify(decoded))
    } catch (e) {
      
    }
  }

  return null
} 