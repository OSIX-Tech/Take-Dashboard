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
        const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/health`, {
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
      // El backend maneja toda la configuración de Google OAuth
      window.location.href = `${AUTH_CONFIG.API_BASE_URL}/admin/auth/login`
    } catch (error) {
      console.error('❌ Error en adminLogin:', error)
      throw error
    }
  },

  async adminGoogleAuth() {
    // Redirige directamente a Google OAuth para admin
    window.location.href = `${AUTH_CONFIG.API_BASE_URL}/admin/auth/google`
  },

  async adminGoogleCallback(code) {
    return apiService.get(`admin/auth/google/callback?code=${code}`)
  },

  async adminLogout() {
    console.log('🔍 adminLogout - Iniciando logout')
    try {
      const result = await apiService.post('admin/auth/logout')
      console.log('✅ adminLogout - Logout exitoso:', result)
      return result
    } catch (error) {
      console.error('❌ adminLogout - Error:', error)
      throw error
    }
  },

  async getAdminProfile() {
    return apiService.get('admin/auth/me')
  },

  async refreshAdminToken() {
    return apiService.post('admin/auth/refresh')
  },

  async checkSession() {
    try {
      const response = await apiService.get('admin/auth/me')
      return response
    } catch (error) {
      console.error('Session check failed:', error)
      throw error
    }
  },

  // Utility methods
  isAuthenticated() {
    return !!localStorage.getItem('adminToken')
  },

  isAdminAuthenticated() {
    return !!localStorage.getItem('adminToken')
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
      console.error('Error decoding token:', error)
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
      console.error('Error initiating admin login:', error)
      throw error
    }
  },

  async handleAdminCallback(code) {
    try {
      const response = await this.adminGoogleCallback(code)
      if (response && response.token) {
        localStorage.setItem('adminToken', response.token)
        return response.user || {
          name: 'Admin User',
          email: 'admin@take.com',
          isAdmin: true,
          role: 'admin'
        }
      }
      throw new Error('No token received from admin callback')
    } catch (error) {
      console.error('Error in admin callback:', error)
      throw error
    }
  }
} 