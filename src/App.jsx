import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import Layout from './components/layout/Layout'
import LoadingSpinner from './components/common/LoadingSpinner'
import ErrorBoundary from './components/common/ErrorBoundary'
import { authService, extractTokenFromUrl } from './services/authService'
import { AUTH_CONFIG } from './config/auth'

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'))
const Menu = lazy(() => import('./pages/Menu'))
const Game = lazy(() => import('./pages/Game'))
const Rewards = lazy(() => import('./pages/Rewards'))
const Events = lazy(() => import('./pages/Events'))
const Wallet = lazy(() => import('./pages/Wallet'))
const TestScanner = lazy(() => import('./pages/TestScanner'))
const LoginWallet = lazy(() => import('./pages/LoginWallet'))
const AddWallet = lazy(() => import('./pages/AddWallet'))

// Componente para manejar el callback de admin
const AdminCallback = ({ onLogin }) => {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      // Esperar un momento para que las cookies se establezcan
      await new Promise(resolve => setTimeout(resolve, 500))

      try {
        const code = searchParams.get('code')
        const token = searchParams.get('token')
        const error = searchParams.get('error')
        
        // También buscar token en las cookies que el backend pudo haber establecido
        const cookies = document.cookie.split(';')
        const adminTokenCookie = cookies.find(c => c.trim().startsWith('adminToken='))
        if (adminTokenCookie && !token) {
          const cookieToken = adminTokenCookie.split('=')[1]
          
          if (cookieToken) {
            localStorage.setItem('adminToken', cookieToken)
            const user = authService.getCurrentUser()
            onLogin(user)
            window.location.href = '/menu'
            return
          }
        }

        if (error) {
          
          setError('Error en autenticación: ' + decodeURIComponent(error))
          return
        }
        
        // Si recibimos un token directamente del backend
        if (token) {
          
          localStorage.setItem('adminToken', token)

          // Obtener el usuario desde el token o hacer una llamada al backend
          const user = authService.getCurrentUser()
          
          onLogin(user)
          
          window.location.href = '/menu'
          return
        }
        
        if (!code) {
          
          // Si no hay código ni token, verificar si hay un token en localStorage
          const adminToken = localStorage.getItem('adminToken')

          if (adminToken) {
            
            onLogin(authService.getCurrentUser())
            window.location.href = '/menu'
            return
          }

          setError('No se recibió código de autorización')
          return
        }

        const userData = await authService.handleAdminCallback(code)
        
        onLogin(userData)
        
        // Redirigir al dashboard
        
        window.location.href = '/menu'
      } catch (err) {

        setError('Error procesando autenticación: ' + err.message)
      } finally {
        
        setLoading(false)
      }
    }

    handleCallback()
  }, [searchParams, onLogin])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Procesando autenticación...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-lg font-semibold mb-2">Error de Autenticación</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Verifica que tu email esté en la whitelist de administradores</p>
            <p>• Asegúrate de usar la cuenta de Google correcta</p>
            <p>• Contacta al administrador si el problema persiste</p>
          </div>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded"
          >
            Volver al Login
          </button>
        </div>
      </div>
    )
  }

  return null
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {

      // Skip auth check for wallet routes - they have their own auth flow
      if (window.location.pathname === '/loginWallet' || window.location.pathname === '/addWallet') {
        
        setIsLoading(false)
        return
      }
      
      // PRIMERO: Verificar si venimos de un callback con token
      const tokenFromUrl = extractTokenFromUrl()
      if (tokenFromUrl) {
        
        localStorage.setItem('adminToken', tokenFromUrl)
        
        // Limpiar la URL
        window.history.replaceState({}, document.title, window.location.pathname)
        
        // Obtener datos del usuario y autenticar
        const user = authService.getCurrentUser()
        setCurrentUser(user)
        setIsAuthenticated(true)
        setIsLoading(false)
        return
      }
      
      // SEGUNDO: Si estamos en /menu y venimos de un login, intentar obtener sesión del backend
      if (window.location.pathname === '/menu' && document.referrer.includes('accounts.google.com')) {
        
        try {
          // Intentar obtener el perfil con las cookies que el backend debió establecer
          const profile = await authService.getAdminProfile()
          if (profile && profile.data) {
            
            setCurrentUser(profile.data)
            setIsAuthenticated(true)
            setIsLoading(false)
            return
          }
        } catch (error) {
          
        }
      }
      
      try {
        // Agregar un pequeño delay para dar tiempo a que las cookies se establezcan
        
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // ANÁLISIS DE COOKIES Y CROSS-DOMAIN

        // Analizar dominios
        const currentDomain = window.location.hostname
        const backendDomain = new URL(AUTH_CONFIG.API_BASE_URL).hostname

        // ADVERTENCIA CROSS-DOMAIN
        if (currentDomain !== backendDomain && !currentDomain.includes('localhost')) {

        } else if (currentDomain === backendDomain) {
          
        }

        // Verificar si las cookies pueden ser leídas

        // Primero, intentar leer la cookie adminInfo que el backend establece
        const cookies = document.cookie.split(';')
        const adminInfoCookie = cookies.find(c => c.trim().startsWith('adminInfo='))
        const adminTokenCookie = cookies.find(c => c.trim().startsWith('adminToken='))

        if (adminTokenCookie) {
          const token = adminTokenCookie.split('=')[1]
          
          localStorage.setItem('adminToken', token)
        }
        
        if (adminInfoCookie) {
          try {
            const adminInfo = JSON.parse(decodeURIComponent(adminInfoCookie.split('=')[1]))
            
            setCurrentUser(adminInfo)
            setIsAuthenticated(true)
            setIsLoading(false)
            return
          } catch (e) {
            
          }
        }
        
        // Verificar si hay token en localStorage (admin)
        const hasAuthToken = authService.isAuthenticated()
        const hasAdminToken = authService.isAdminAuthenticated()

        if (hasAuthToken || hasAdminToken) {
          // Si hay token, verificar si es demo o real
          const user = authService.getCurrentUser()

          if (user?.isDemo) {
            
            setCurrentUser(user)
            setIsAuthenticated(true)
          } else {
            // Token real - intentar verificar la sesión con el backend
            
            try {
              const sessionCheck = await authService.checkSession()
              
              setCurrentUser(user)
              setIsAuthenticated(true)
            } catch (error) {
              // Si la sesión no es válida, limpiar y redirigir a login

              authService.clearAuth()
              setIsAuthenticated(false)
              setCurrentUser(null)
            }
          }
        } else {
          // No hay tokens en localStorage, pero verificar si hay sesión en el backend
          
          try {
            const userData = await authService.getAdminProfile()
            
            if (userData) {
              
              setCurrentUser(userData)
              setIsAuthenticated(true)
            } else {
              
              setIsAuthenticated(false)
              setCurrentUser(null)
            }
          } catch (error) {
            
            setIsAuthenticated(false)
            setCurrentUser(null)
          }
        }
      } catch (error) {

        // En caso de error, asumir que no está autenticado
        authService.clearAuth()
        setIsAuthenticated(false)
        setCurrentUser(null)
      } finally {

        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    setCurrentUser(userData)
  }

  const handleLogout = async () => {
    try {
      await authService.adminLogout()
    } catch (error) {
      
    } finally {
      // Limpiar estado local independientemente del resultado del backend
      authService.clearAuth()
      setIsAuthenticated(false)
      setCurrentUser(null)
    }
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
            {/* Ruta por defecto - redirige a login o menu según autenticación */}
            <Route path="/" element={
              isLoading ? <LoadingSpinner /> : (isAuthenticated ? <Navigate to="/menu" replace /> : <Navigate to="/login" replace />)
            } />
            
            {/* Ruta del login - siempre muestra login */}
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            
            {/* Wallet routes - separate auth flow */}
            <Route path="/loginWallet" element={<LoginWallet />} />
            <Route path="/addWallet" element={<AddWallet />} />
            
            {/* Test Scanner - public route for testing */}
            <Route path="/test-scanner" element={<TestScanner />} />
            
            {/* OAuth callback route */}
            <Route path="/admin/auth/callback" element={<AdminCallback onLogin={handleLogin} />} />
            
            {/* Rutas adicionales para manejar redirecciones del backend */}
            <Route path="/admin/auth/success" element={
              isAuthenticated ? <Navigate to="/menu" replace /> : <AdminCallback onLogin={handleLogin} />
            } />
            
            {/* El callback ahora va directamente a /menu */}
            
            {/* Rutas protegidas - permiten acceso si está autenticado */}
            <Route path="/menu" element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout}>
                  <Menu />
                </Layout>
              ) : <Navigate to="/login" replace />
            } />
            <Route path="/game" element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout}>
                  <Game />
                </Layout>
              ) : <Navigate to="/login" replace />
            } />
            <Route path="/rewards" element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout}>
                  <Rewards />
                </Layout>
              ) : <Navigate to="/login" replace />
            } />
            <Route path="/events" element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout}>
                  <Events />
                </Layout>
              ) : <Navigate to="/login" replace />
            } />
            <Route path="/wallet" element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout}>
                  <Wallet />
                </Layout>
              ) : <Navigate to="/login" replace />
            } />

            {/* Ruta de fallback - redirige al login si la ruta no existe */}
            <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
