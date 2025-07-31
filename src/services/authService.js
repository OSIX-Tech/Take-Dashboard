import { apiService } from './api.js'

export const authService = {
  // Autenticación con Google (Mobile user authentication)
  async googleLogin(data) {
    return apiService.post('auth/googleLogin', data)
  },

  // Cierre de sesión
  async logout() {
    return apiService.post('auth/logout')
  },

  // Verificar sesión del usuario
  async checkSession() {
    return apiService.get('auth/check-session')
  },

  // Admin authentication endpoints
  async adminLogin() {
    // Inicia el flujo de autenticación de admin
    // Redirige a Google OAuth
    window.location.href = `${apiService.baseURL}/admin/auth/login`
  },

  async adminGoogleAuth() {
    // Redirige directamente a Google OAuth para admin
    window.location.href = `${apiService.baseURL}/admin/auth/google`
  },

  async adminGoogleCallback(code) {
    return apiService.get(`admin/auth/google/callback?code=${code}`)
  },

  async adminLogout() {
    return apiService.post('admin/auth/logout')
  },

  async getAdminProfile() {
    return apiService.get('admin/auth/me')
  },

  async refreshAdminToken() {
    return apiService.post('admin/auth/refresh')
  },

  // Utility methods
  isAuthenticated() {
    return !!localStorage.getItem('authToken')
  },

  isAdminAuthenticated() {
    return !!localStorage.getItem('adminToken')
  },

  getCurrentUser() {
    const token = localStorage.getItem('authToken')
    const adminToken = localStorage.getItem('adminToken')
    
    if (!token && !adminToken) return null
    
    try {
      // Intentar decodificar el token (admin o user)
      const tokenToDecode = adminToken || token
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
    localStorage.removeItem('authToken')
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