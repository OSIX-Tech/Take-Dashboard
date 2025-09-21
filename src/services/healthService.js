import { AUTH_CONFIG } from '@/config/auth'

export const healthService = {
  // Verificar configuración del sistema
  async validateConfiguration() {
    const errors = []
    const warnings = []

    // Solo validar API Base URL (lo único que necesita el frontend)
    if (!AUTH_CONFIG.API_BASE_URL) {
      errors.push({
        type: 'CONFIG_ERROR',
        code: 'MISSING_API_BASE_URL',
        message: 'API Base URL no está configurado',
        details: 'Configura VITE_API_BASE_URL en tu archivo .env'
      })
    }

    // Verificar si el backend está disponible para obtener su estado
    if (AUTH_CONFIG.API_BASE_URL) {
      try {
        const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })
        
        if (response.ok) {
          // Si el backend responde, asumir que está bien configurado
          
        } else {
          warnings.push({
            type: 'BACKEND_WARNING',
            code: 'BACKEND_RESPONSE_ERROR',
            message: 'Backend respondió con error',
            details: `Status: ${response.status} - El backend puede tener problemas de configuración`
          })
        }
      } catch (error) {
        // Si no se puede conectar, no es un error de configuración del frontend
        
      }
    }

    return { errors, warnings }
  },

  // Verificar conectividad con el backend
  async checkBackendHealth() {
    try {
      const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        return {
          status: 'HEALTHY',
          message: 'Backend conectivo y funcionando',
          details: {
            status: response.status,
            statusText: response.statusText
          }
        }
      } else {
        return {
          status: 'UNHEALTHY',
          message: `Backend respondió con error: ${response.status}`,
          details: {
            status: response.status,
            statusText: response.statusText
          }
        }
      }
    } catch (error) {
      // Categorizar errores específicos
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          status: 'NETWORK_ERROR',
          message: 'No se puede conectar al servidor',
          details: {
            error: error.message,
            suggestion: 'Verifica que el backend esté ejecutándose y la URL sea correcta'
          }
        }
      } else if (error.message.includes('CORS')) {
        return {
          status: 'CORS_ERROR',
          message: 'Error de configuración CORS',
          details: {
            error: error.message,
            suggestion: 'El backend no permite solicitudes desde este origen'
          }
        }
      } else {
        return {
          status: 'UNKNOWN_ERROR',
          message: 'Error desconocido al conectar con el backend',
          details: {
            error: error.message
          }
        }
      }
    }
  },

  // Verificar endpoint de autenticación
  async checkAuthEndpoint() {
    try {
      const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/admin/auth/login`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      // El endpoint de login redirige a Google OAuth, así que cualquier respuesta 2xx es correcta
      if (response.ok) {
        return {
          status: 'AVAILABLE',
          message: 'Endpoint de autenticación disponible',
          details: {
            status: response.status,
            statusText: response.statusText,
            note: 'Endpoint redirige a Google OAuth (comportamiento esperado)'
          }
        }
      } else {
        return {
          status: 'UNAVAILABLE',
          message: `Endpoint de autenticación no disponible: ${response.status}`,
          details: {
            status: response.status,
            statusText: response.statusText
          }
        }
      }
    } catch (error) {
      // Si hay error de CORS, el endpoint existe pero no es accesible desde el frontend
      if (error.message.includes('CORS')) {
        return {
          status: 'CORS_ERROR',
          message: 'Endpoint existe pero hay problemas de CORS',
          details: {
            error: error.message,
            suggestion: 'Configura CORS en el backend para permitir solicitudes desde el frontend'
          }
        }
      }
      
      return {
        status: 'ERROR',
        message: 'Error verificando endpoint de autenticación',
        details: {
          error: error.message
        }
      }
    }
  },

  // Verificar configuración de CORS
  async checkCorsConfiguration() {
    try {
      const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      return {
        status: 'CONFIGURED',
        message: 'CORS configurado correctamente',
        details: {
          status: response.status,
          credentials: 'include'
        }
      }
    } catch (error) {
      if (error.message.includes('CORS')) {
        return {
          status: 'NOT_CONFIGURED',
          message: 'CORS no está configurado correctamente',
          details: {
            error: error.message,
            suggestion: 'El backend debe permitir solicitudes desde este origen'
          }
        }
      } else {
        return {
          status: 'UNKNOWN',
          message: 'No se pudo verificar la configuración de CORS',
          details: {
            error: error.message
          }
        }
      }
    }
  },

  // Ejecutar diagnóstico completo del sistema
  async runFullDiagnostic() {

    const results = {
      timestamp: new Date().toISOString(),
      configuration: await this.validateConfiguration(),
      backend: await this.checkBackendHealth(),
      auth: await this.checkAuthEndpoint(),
      cors: await this.checkCorsConfiguration()
    }

    // Determinar estado general del sistema
    const hasErrors = results.configuration.errors.length > 0
    const hasBackendIssues = ['NETWORK_ERROR', 'CORS_ERROR', 'UNHEALTHY'].includes(results.backend.status)
    const hasAuthIssues = results.auth.status !== 'AVAILABLE'

    if (hasErrors) {
      results.systemStatus = 'CONFIG_ERROR'
      results.systemMessage = 'Errores de configuración detectados'
    } else if (hasBackendIssues) {
      results.systemStatus = 'BACKEND_ERROR'
      results.systemMessage = 'Problemas de conectividad con el backend'
    } else if (hasAuthIssues) {
      results.systemStatus = 'AUTH_ERROR'
      results.systemMessage = 'Problemas con el endpoint de autenticación'
    } else {
      results.systemStatus = 'HEALTHY'
      results.systemMessage = 'Sistema funcionando correctamente'
    }

    return results
  }
} 