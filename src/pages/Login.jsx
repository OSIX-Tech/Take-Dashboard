import React, { useState, useEffect } from 'react'
import { AlertCircle, Shield, Coffee, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { authService } from '@/services/authService'
import { useApiState } from '@/hooks/useApi'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import { AUTH_CONFIG, DEMO_USER } from '@/config/auth'
import { useSearchParams } from 'react-router-dom'

const Login = ({ onLogin }) => {
  const { loading, error, executeApiCall: login } = useApiState()
  const [searchParams] = useSearchParams()
  const [authError, setAuthError] = useState(null)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Manejar errores de autenticación que vienen como parámetros de URL
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      const decodedError = decodeURIComponent(errorParam)
      setAuthError(decodedError)
      console.error('❌ Login - Error de autenticación recibido:', decodedError)
    }
  }, [searchParams])

  // Limpiar localStorage al cargar la página para evitar errores de tokens inválidos
  useEffect(() => {
    // Limpiar tokens inválidos
    const authToken = localStorage.getItem('authToken')
    const adminToken = localStorage.getItem('adminToken')
    
    if (authToken || adminToken) {
      try {
        // Intentar decodificar para verificar si es válido
        const tokenToCheck = adminToken || authToken
        
        // Manejar token demo
        if (tokenToCheck.includes('.demo.signature')) {
          const payload = JSON.parse(atob(tokenToCheck.split('.')[0]))
          const currentTime = Math.floor(Date.now() / 1000)
          
          if (payload.exp && payload.exp < currentTime) {
            localStorage.removeItem('authToken')
            localStorage.removeItem('adminToken')
            console.log('🔄 Tokens demo expirados eliminados')
          }
        } else {
          // Manejar JWT real
          const payload = JSON.parse(atob(tokenToCheck.split('.')[1]))
          const currentTime = Math.floor(Date.now() / 1000)
          
          if (payload.exp && payload.exp < currentTime) {
            localStorage.removeItem('authToken')
            localStorage.removeItem('adminToken')
            console.log('🔄 Tokens JWT expirados eliminados')
          }
        }
      } catch (error) {
        // Si hay error al decodificar, el token es inválido
        localStorage.removeItem('authToken')
        localStorage.removeItem('adminToken')
        console.log('🔄 Tokens inválidos eliminados')
      }
    }
  }, [])



  // Handler para login demo (sin Google)
  const handleDemoLogin = async () => {
    try {
      setIsDemoLoading(true)
      console.log('🚀 Login - Iniciando demo login')
      
      // Simular delay para mejor UX
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Crear un token demo que simule un admin completo
      const demoPayload = {
        id: 'demo-admin-123',
        name: 'Demo Admin',
        email: 'demo@take.com',
        picture: 'https://via.placeholder.com/150/6366f1/ffffff?text=Demo',
        isDemo: true,
        isAdmin: true,
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 horas
      }
      
      const demoToken = btoa(JSON.stringify(demoPayload)) + '.demo.signature'
      localStorage.setItem('adminToken', demoToken)
      
      console.log('✅ Login - Demo login completado, redirigiendo al dashboard')
      window.location.href = '/menu'
    } catch (error) {
      console.error('❌ Login - Error en demo login:', error)
      setAuthError('Error iniciando demo: ' + error.message)
    } finally {
      setIsDemoLoading(false)
    }
  }

  // Handler para login de admin con Google OAuth
  const handleAdminGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)
      console.log('🚀 Login - Iniciando Google OAuth para admin')
      
      // Usar el endpoint correcto según la documentación: /admin/auth/login
      await authService.adminLogin()
    } catch (err) {
      console.error('❌ Login - Error iniciando login de admin:', err)
      
      // Categorizar errores específicos
      let errorMessage = 'Error iniciando login de admin'
      
      if (err.message.includes('CONFIG_ERROR')) {
        errorMessage = 'Error de configuración: ' + err.message.split(': ')[1]
      } else if (err.message.includes('NETWORK_ERROR')) {
        errorMessage = 'Error de conexión: No se puede conectar al servidor'
      } else if (err.message.includes('CORS_ERROR')) {
        errorMessage = 'Error de configuración CORS: El servidor no permite solicitudes desde este origen'
      } else if (err.message.includes('BACKEND_ERROR')) {
        errorMessage = 'Error del servidor: ' + err.message.split(': ')[1]
      } else {
        errorMessage = 'Error inesperado: ' + (err.message || 'Error desconocido')
      }
      
      setAuthError(errorMessage)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  // Limpiar errores
  const clearErrors = () => {
    setAuthError(null)
  }





  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <img
                src="/logo.png"
                alt="TAKE Logo"
                className="h-12 sm:h-14 lg:h-16 w-auto object-contain mx-auto drop-shadow-sm"
              />
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full opacity-20 blur-lg"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              Panel Administrativo
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-sm mx-auto leading-relaxed">
              Gestiona eventos, menús, recompensas y más con tu cuenta de Google
            </p>
          </div>
        </div>



        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 opacity-50"></div>
          <CardContent className="relative p-6 sm:p-8">
            {/* Error Display */}
            {authError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-800 mb-1">
                      Error de Autenticación
                    </h3>
                    <p className="text-sm text-red-700 mb-2">{authError}</p>
                    <div className="text-xs text-red-600 space-y-1">
                      <p>• Verifica que tu email esté en la whitelist de administradores</p>
                      <p>• Asegúrate de usar la cuenta de Google correcta</p>
                      <p>• Contacta al administrador si el problema persiste</p>
                    </div>
                    <button
                      onClick={clearErrors}
                      className="mt-3 text-xs text-red-600 hover:text-red-800 underline"
                    >
                      Cerrar mensaje
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-6">
                <ErrorMessage message={error} />
              </div>
            )}

            {/* Main Login Section */}
            <div className="space-y-6">
              {/* Admin Login Button - Main Focus */}
              <div className="space-y-3">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Iniciar Sesión
                  </h2>
                  <p className="text-sm text-gray-600">
                    Accede con tu cuenta de Google autorizada
                  </p>
                </div>
                
                <Button 
                  onClick={handleAdminGoogleLogin}
                  disabled={isGoogleLoading}
                  variant="outline"
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 px-6 py-3 rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center space-x-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGoogleLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  <span>{isGoogleLoading ? 'Conectando...' : 'Acceder con Google'}</span>
                </Button>
              </div>

              {/* Footer Info */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <Shield className="w-3 h-3" />
                  <span>Acceso seguro y protegido</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Option - More Visible */}
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-2">
            ¿Solo quieres probar?
          </div>
          <button
            onClick={handleDemoLogin}
            disabled={isDemoLoading}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDemoLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Coffee className="w-4 h-4 mr-2" />
            )}
            {isDemoLoading ? 'Cargando...' : 'Acceso de Prueba'}
          </button>
        </div>



        {/* Additional Info */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            © 2025 OSIX. Todos los derechos reservados.
          </p>
          <p className="text-xs text-gray-400">
            Versión 1.0.0 - Panel Administrativo
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login 