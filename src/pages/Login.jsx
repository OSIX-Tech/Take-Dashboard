import React, { useState, useEffect } from 'react'
import { AlertCircle, Shield, Coffee } from 'lucide-react'
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

  // Manejar errores de autenticación que vienen como parámetros de URL
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setAuthError(decodeURIComponent(errorParam))
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
        const payload = JSON.parse(atob(tokenToCheck.split('.')[1]))
        const currentTime = Math.floor(Date.now() / 1000)
        
        // Si el token está expirado, limpiarlo
        if (payload.exp && payload.exp < currentTime) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('adminToken')
          console.log('Tokens expirados eliminados')
        }
      } catch (error) {
        // Si hay error al decodificar, el token es inválido
        localStorage.removeItem('authToken')
        localStorage.removeItem('adminToken')
        console.log('Tokens inválidos eliminados')
      }
    }
  }, [])

  // Handler para login demo (sin Google)
  const handleDemoLogin = async () => {
    setIsDemoLoading(true)
    try {
      // Simular delay para mejor UX
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Crear token demo seguro (NO es un JWT real)
      const demoPayload = {
        demo: true,
        name: 'Demo User',
        email: 'demo@example.com',
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hora
        isDemo: true,
        isAdmin: false,
        role: 'user'
      }
      
      // Token demo simple (no es un JWT real, solo para frontend)
      const demoToken = btoa(JSON.stringify(demoPayload)) + '.demo.signature'
      localStorage.setItem('authToken', demoToken)
      
      // Redirigir directamente a /menu
      window.location.href = '/menu'
    } catch (err) {
      console.error('Error en demo login:', err)
    } finally {
      setIsDemoLoading(false)
    }
  }

  // Handler para login de admin con Google OAuth
  const handleAdminGoogleLogin = async () => {
    try {
      // Lógica anterior: redirección directa al endpoint de admin
      window.location.href = `${AUTH_CONFIG.API_BASE_URL}/admin/auth/login`
    } catch (err) {
      console.error('Error iniciando login de admin:', err)
      alert('Error iniciando login de admin: ' + (err.message || 'Error desconocido'))
    }
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
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 px-6 py-3 rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center space-x-3 font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Acceder con Google</span>
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

        {/* Demo Option - Minimal */}
        <div className="text-center">
          <button
            onClick={handleDemoLogin}
            disabled={isDemoLoading}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors duration-200 underline underline-offset-2"
          >
            {isDemoLoading ? 'Cargando...' : 'Acceso de prueba'}
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