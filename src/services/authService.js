import { apiService } from './api.js'
import { AUTH_CONFIG } from '@/config/auth'

export const authService = {
  // Admin authentication endpoints only

  // Admin authentication endpoints
  async adminLogin() {
    console.log('🔐 [authService.adminLogin] Iniciando proceso de login')
    try {
      // Solo verificar que tengamos la URL del backend
      console.log('🔍 [authService.adminLogin] API_BASE_URL:', AUTH_CONFIG.API_BASE_URL)
      if (!AUTH_CONFIG.API_BASE_URL) {
        throw new Error('CONFIG_ERROR: API Base URL no configurado')
      }

      // Verificar conectividad básica con el backend
      console.log('📡 [authService.adminLogin] Verificando conectividad con backend...')
      try {
        const healthUrl = `${AUTH_CONFIG.API_BASE_URL}/health`
        console.log('📡 [authService.adminLogin] Health check URL:', healthUrl)
        
        const response = await fetch(healthUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })
        
        console.log('📡 [authService.adminLogin] Health check response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`BACKEND_ERROR: Backend respondió con status ${response.status}`)
        }
      } catch (error) {
        console.error('❌ [authService.adminLogin] Error en health check:', error)
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
      console.log('🚀 [authService.adminLogin] Redirigiendo a:', loginUrl)
      window.location.href = loginUrl
    } catch (error) {
      console.error('❌ [authService.adminLogin] Error en adminLogin:', error)
      throw error
    }
  },

  async adminGoogleAuth() {
    const googleAuthUrl = `${AUTH_CONFIG.API_BASE_URL}/admin/auth/google`
    console.log('🚀 [authService.adminGoogleAuth] Redirigiendo a Google OAuth:', googleAuthUrl)
    window.location.href = googleAuthUrl
  },

  async adminGoogleCallback(code) {
    console.log('🔄 [authService.adminGoogleCallback] Procesando callback con código')
    const response = await apiService.get(`admin/auth/google/callback?code=${code}`)
    console.log('📦 [authService.adminGoogleCallback] Respuesta del callback:', response)
    return response
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
    console.log('👤 [authService.getAdminProfile] Obteniendo perfil de admin...')
    const profile = await apiService.get('admin/auth/me')
    console.log('👤 [authService.getAdminProfile] Perfil obtenido:', profile)
    return profile
  },

  async refreshAdminToken() {
    return apiService.post('admin/auth/refresh')
  },

  async checkSession() {
    console.log('🔍 [authService.checkSession] Verificando sesión...')
    try {
      const response = await apiService.get('admin/auth/me')
      console.log('✅ [authService.checkSession] Sesión verificada:', response)
      return response
    } catch (error) {
      console.error('❌ [authService.checkSession] Session check failed:', error.message)
      throw error
    }
  },

  // Utility methods
  isAuthenticated() {
    const hasToken = !!localStorage.getItem('adminToken')
    console.log('🔍 [authService.isAuthenticated] Token en localStorage:', hasToken)
    return hasToken
  },

  isAdminAuthenticated() {
    const hasAdminToken = !!localStorage.getItem('adminToken')
    console.log('🔍 [authService.isAdminAuthenticated] Admin token en localStorage:', hasAdminToken)
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
    console.log('🔄 [authService.handleAdminCallback] Manejando callback con código')
    try {
      const response = await this.adminGoogleCallback(code)
      console.log('📦 [authService.handleAdminCallback] Respuesta recibida:', response)
      
      if (response && response.token) {
        console.log('✅ [authService.handleAdminCallback] Token recibido, guardando en localStorage')
        localStorage.setItem('adminToken', response.token)
        
        const user = response.user || {
          name: 'Admin User',
          email: 'admin@take.com',
          isAdmin: true,
          role: 'admin'
        }
        console.log('👤 [authService.handleAdminCallback] Usuario final:', user)
        return user
      }
      
      console.error('❌ [authService.handleAdminCallback] No se recibió token en la respuesta')
      throw new Error('No token received from admin callback')
    } catch (error) {
      console.error('❌ [authService.handleAdminCallback] Error en admin callback:', error)
      throw error
    }
  }
} 