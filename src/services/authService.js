import { apiService } from './api.js'

export const authService = {
  // Login with passkey (demo mode - no real server calls)
  async loginWithPasskey() {
    try {
      // Simular delay para que parezca real
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simular datos de usuario demo
      const demoUser = {
        id: "admin-uuid-123",
        name: "Administrador TAKE",
        email: "admin@take.com",
        phone: "+34600000000",
        google_id: null,
        jwt_secure_code: "admin-secure-code",
        created_at: "2024-01-01T00:00:00Z"
      }
      
      const demoResponse = {
        success: true,
        token: "admin-jwt-token-123",
        user: demoUser
      }

      // Store demo token in localStorage
      localStorage.setItem('authToken', demoResponse.token)
      localStorage.setItem('user', JSON.stringify(demoResponse.user))
      
      return demoResponse
    } catch (error) {
      console.error('Passkey login error:', error)
      throw error
    }
  },

  // Demo login (for testing without passkeys)
  async loginDemo() {
    try {
      // Simular delay para que parezca real
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const demoUser = {
        id: "demo-uuid-123",
        name: "Admin Demo",
        email: "admin@take.com",
        phone: "+34600000000",
        google_id: null,
        jwt_secure_code: "demo-secure-code",
        created_at: "2024-01-01T00:00:00Z"
      }
      
      const demoResponse = {
        success: true,
        token: "demo-jwt-token-123",
        user: demoUser
      }

      // Store demo token in localStorage
      localStorage.setItem('authToken', demoResponse.token)
      localStorage.setItem('user', JSON.stringify(demoResponse.user))
      
      return demoResponse
    } catch (error) {
      console.error('Demo login error:', error)
      throw error
    }
  },

  // Register passkey for user
  async registerPasskey(userId) {
    try {
      // Obtener opciones de registro del servidor
      const regOptionsResponse = await apiService.post('auth/passkey/register', { userId })
      const regOptions = regOptionsResponse.data

      // Crear credencial de registro
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(regOptions.challenge),
          rp: {
            name: regOptions.rp.name,
            id: regOptions.rp.id
          },
          user: {
            id: new Uint8Array(regOptions.user.id),
            name: regOptions.user.name,
            displayName: regOptions.user.displayName
          },
          pubKeyCredParams: regOptions.pubKeyCredParams,
          authenticatorSelection: regOptions.authenticatorSelection,
          timeout: 60000,
          attestation: 'direct'
        }
      })

      // Enviar credencial al servidor
      const regResponse = await apiService.post('auth/passkey/register/verify', {
        id: credential.id,
        response: {
          attestationObject: Array.from(new Uint8Array(credential.response.attestationObject)),
          clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON))
        }
      })

      return regResponse
    } catch (error) {
      console.error('Passkey registration error:', error)
      throw error
    }
  },

  // Logout user
  async logout() {
    try {
      // Call logout endpoint if available (skip for demo)
      const token = localStorage.getItem('authToken')
      if (token && !token.includes('demo')) {
        await apiService.post('auth/logout')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    }
  },

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken')
  },

  // Check if current session is demo
  isDemoSession() {
    const token = localStorage.getItem('authToken')
    return token && token.includes('demo')
  },

  // Check if passkeys are supported
  async isPasskeySupported() {
    try {
      if (!window.PublicKeyCredential) {
        return false
      }
      
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      return available
    } catch (error) {
      console.error('Error checking passkey support:', error)
      return false
    }
  },

  // Refresh token
  async refreshToken() {
    try {
      // Skip refresh for demo sessions
      if (this.isDemoSession()) {
        return { success: true }
      }
      
      const response = await apiService.post('auth/refresh')
      
      if (response.token) {
        localStorage.setItem('authToken', response.token)
      }
      
      return response
    } catch (error) {
      console.error('Token refresh error:', error)
      // If refresh fails, logout user
      this.logout()
      throw error
    }
  }
} 