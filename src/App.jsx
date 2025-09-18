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
      console.log('🔍 [AdminCallback] Iniciando handleCallback')
      console.log('🔍 [AdminCallback] URL completa:', window.location.href)
      console.log('🔍 [AdminCallback] Search params:', Object.fromEntries(searchParams))
      console.log('🍪 [AdminCallback] Cookies actuales:', document.cookie)
      
      // Esperar un momento para que las cookies se establezcan
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('🍪 [AdminCallback] Cookies después de esperar:', document.cookie)
      
      try {
        const code = searchParams.get('code')
        const token = searchParams.get('token')
        const error = searchParams.get('error')
        
        // También buscar token en las cookies que el backend pudo haber establecido
        const cookies = document.cookie.split(';')
        const adminTokenCookie = cookies.find(c => c.trim().startsWith('adminToken='))
        if (adminTokenCookie && !token) {
          const cookieToken = adminTokenCookie.split('=')[1]
          console.log('🍪 [AdminCallback] Token encontrado en cookie:', !!cookieToken)
          if (cookieToken) {
            localStorage.setItem('adminToken', cookieToken)
            const user = authService.getCurrentUser()
            onLogin(user)
            window.location.href = '/menu'
            return
          }
        }
        
        console.log('🔍 [AdminCallback] Parámetros extraídos:', { code: !!code, token: !!token, error })
        
        if (error) {
          console.error('❌ [AdminCallback] Error recibido en URL:', error)
          setError('Error en autenticación: ' + decodeURIComponent(error))
          return
        }
        
        // Si recibimos un token directamente del backend
        if (token) {
          console.log('✅ [AdminCallback] Token recibido directamente del backend')
          localStorage.setItem('adminToken', token)
          console.log('💾 [AdminCallback] Token guardado en localStorage')
          
          // Obtener el usuario desde el token o hacer una llamada al backend
          const user = authService.getCurrentUser()
          console.log('👤 [AdminCallback] Usuario obtenido:', user)
          onLogin(user)
          console.log('🚀 [AdminCallback] Redirigiendo a /menu...')
          window.location.href = '/menu'
          return
        }
        
        if (!code) {
          console.log('⚠️ [AdminCallback] No hay código en la URL')
          // Si no hay código ni token, verificar si hay un token en localStorage
          const adminToken = localStorage.getItem('adminToken')
          console.log('🔍 [AdminCallback] Token en localStorage:', !!adminToken)
          
          if (adminToken) {
            console.log('✅ [AdminCallback] Token encontrado en localStorage, redirigiendo')
            onLogin(authService.getCurrentUser())
            window.location.href = '/menu'
            return
          }
          
          console.error('❌ [AdminCallback] No se recibió código de autorización')
          setError('No se recibió código de autorización')
          return
        }

        console.log('🔄 [AdminCallback] Procesando código de autorización...')
        const userData = await authService.handleAdminCallback(code)
        console.log('✅ [AdminCallback] Callback procesado, userData:', userData)
        onLogin(userData)
        
        // Redirigir al dashboard
        console.log('🚀 [AdminCallback] Redirigiendo a /menu después del callback...')
        window.location.href = '/menu'
      } catch (err) {
        console.error('❌ [AdminCallback] Error en callback de admin:', err)
        console.error('❌ [AdminCallback] Stack trace:', err.stack)
        setError('Error procesando autenticación: ' + err.message)
      } finally {
        console.log('🏁 [AdminCallback] Finalizando loading')
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
      console.log('🔐 [App] Iniciando checkAuth...')
      console.log('🔐 [App] URL actual:', window.location.pathname)
      console.log('🔐 [App] URL completa:', window.location.href)
      
      // Skip auth check for wallet routes - they have their own auth flow
      if (window.location.pathname === '/loginWallet' || window.location.pathname === '/addWallet') {
        console.log('🎫 [App] Wallet route detected, skipping main auth check')
        setIsLoading(false)
        return
      }
      
      // PRIMERO: Verificar si venimos de un callback con token
      const tokenFromUrl = extractTokenFromUrl()
      if (tokenFromUrl) {
        console.log('🎆 [App] Token encontrado en URL, procesando...')
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
        console.log('🔄 [App] Detectado retorno de Google OAuth, verificando sesión...')
        try {
          // Intentar obtener el perfil con las cookies que el backend debió establecer
          const profile = await authService.getAdminProfile()
          if (profile && profile.data) {
            console.log('✅ [App] Sesión obtenida del backend después de OAuth')
            setCurrentUser(profile.data)
            setIsAuthenticated(true)
            setIsLoading(false)
            return
          }
        } catch (error) {
          console.log('⚠️ [App] No se pudo obtener sesión después de OAuth:', error.message)
        }
      }
      
      try {
        // Agregar un pequeño delay para dar tiempo a que las cookies se establezcan
        console.log('⏳ [App] Esperando 100ms para cookies...')
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // ANÁLISIS DE COOKIES Y CROSS-DOMAIN
        console.log('🔒 [App] === ANÁLISIS DE COOKIES CROSS-DOMAIN ===')
        console.log('🔒 [App] Dominio actual:', window.location.hostname)
        console.log('🔒 [App] Origen actual:', window.location.origin)
        console.log('🔒 [App] Backend URL:', AUTH_CONFIG.API_BASE_URL)
        
        // Analizar dominios
        const currentDomain = window.location.hostname
        const backendDomain = new URL(AUTH_CONFIG.API_BASE_URL).hostname
        console.log('🌐 [App] Comparación de dominios:')
        console.log('  - Frontend:', currentDomain)
        console.log('  - Backend:', backendDomain)
        console.log('  - ¿Son el mismo?:', currentDomain === backendDomain)
        console.log('  - ¿Comparten dominio base?:', currentDomain.split('.').slice(-2).join('.') === backendDomain.split('.').slice(-2).join('.'))
        
        // ADVERTENCIA CROSS-DOMAIN
        if (currentDomain !== backendDomain && !currentDomain.includes('localhost')) {
          console.warn('⚠️ 🔴 [App] === PROBLEMA DETECTADO: CROSS-DOMAIN COOKIES ===')
          console.warn('⚠️ [App] Frontend:', currentDomain)
          console.warn('⚠️ [App] Backend:', backendDomain)
          console.warn('⚠️ [App] Las cookies del backend NO son accesibles desde este dominio')
          console.warn('⚠️ [App] Esto es una restricción de seguridad del navegador (SameSite)')
          console.warn('💡 [App] SOLUCIONES POSIBLES:')
          console.warn('  1️⃣  Usar subdominios: app.tudominio.com + api.tudominio.com')
          console.warn('  2️⃣  Backend debe enviar token en URL de redirección')
          console.warn('  3️⃣  Configurar proxy reverso en el mismo dominio')
          console.warn('  4️⃣  Usar localStorage con token en lugar de cookies')
          console.warn('🔴 [App] === FIN DEL ANÁLISIS ===')
        } else if (currentDomain === backendDomain) {
          console.log('✅ [App] Mismo dominio detectado, cookies deberían funcionar')
        }
        
        // Verificar si las cookies pueden ser leídas
        console.log('🍪 [App] document.cookie accesible:', typeof document.cookie)
        console.log('🍪 [App] Contenido de document.cookie:', document.cookie || '(VACIO - No hay cookies accesibles)')
        
        // Primero, intentar leer la cookie adminInfo que el backend establece
        const cookies = document.cookie.split(';')
        const adminInfoCookie = cookies.find(c => c.trim().startsWith('adminInfo='))
        const adminTokenCookie = cookies.find(c => c.trim().startsWith('adminToken='))
        
        console.log('🍪 [App] Cookies encontradas:', cookies.length > 1 || cookies[0] !== '' ? cookies.map(c => c.split('=')[0].trim()) : 'NINGUNA COOKIE ENCONTRADA')
        console.log('🍪 [App] adminTokenCookie encontrada:', !!adminTokenCookie)
        console.log('🍪 [App] adminInfoCookie encontrada:', !!adminInfoCookie)
        
        if (adminTokenCookie) {
          const token = adminTokenCookie.split('=')[1]
          console.log('✅ [App] Token encontrado en cookie, guardando en localStorage')
          localStorage.setItem('adminToken', token)
        }
        
        if (adminInfoCookie) {
          try {
            const adminInfo = JSON.parse(decodeURIComponent(adminInfoCookie.split('=')[1]))
            console.log('✅ [App] Admin info parseado desde cookie:', adminInfo)
            setCurrentUser(adminInfo)
            setIsAuthenticated(true)
            setIsLoading(false)
            return
          } catch (e) {
            console.error('❌ [App] Error parseando admin info cookie:', e)
          }
        }
        
        // Verificar si hay token en localStorage (admin)
        const hasAuthToken = authService.isAuthenticated()
        const hasAdminToken = authService.isAdminAuthenticated()
        
        console.log('🔍 [App] hasAuthToken:', hasAuthToken)
        console.log('🔍 [App] hasAdminToken:', hasAdminToken)
        console.log('🔍 [App] localStorage adminToken:', !!localStorage.getItem('adminToken'))
        
        if (hasAuthToken || hasAdminToken) {
          // Si hay token, verificar si es demo o real
          const user = authService.getCurrentUser()
          console.log('👤 [App] Usuario desde token:', user)
          
          if (user?.isDemo) {
            console.log('🎭 [App] Usuario demo detectado, no verificando con backend')
            setCurrentUser(user)
            setIsAuthenticated(true)
          } else {
            // Token real - intentar verificar la sesión con el backend
            console.log('🔄 [App] Token real, verificando sesión con backend...')
            try {
              const sessionCheck = await authService.checkSession()
              console.log('✅ [App] Sesión válida:', sessionCheck)
              setCurrentUser(user)
              setIsAuthenticated(true)
            } catch (error) {
              // Si la sesión no es válida, limpiar y redirigir a login
              console.error('❌ [App] Sesión inválida:', error.message)
              console.log('🧹 [App] Limpiando tokens...')
              authService.clearAuth()
              setIsAuthenticated(false)
              setCurrentUser(null)
            }
          }
        } else {
          // No hay tokens en localStorage, pero verificar si hay sesión en el backend
          console.log('⚠️ [App] No hay tokens locales, verificando sesión en backend...')
          try {
            const userData = await authService.getAdminProfile()
            console.log('📡 [App] Respuesta de getAdminProfile:', userData)
            if (userData) {
              console.log('✅ [App] Sesión válida encontrada en el backend')
              setCurrentUser(userData)
              setIsAuthenticated(true)
            } else {
              console.log('❌ [App] No hay datos de usuario del backend')
              setIsAuthenticated(false)
              setCurrentUser(null)
            }
          } catch (error) {
            console.error('❌ [App] Error verificando sesión en backend:', error.message)
            setIsAuthenticated(false)
            setCurrentUser(null)
          }
        }
      } catch (error) {
        console.error('❌ [App] Error general en checkAuth:', error)
        console.error('❌ [App] Stack trace:', error.stack)
        // En caso de error, asumir que no está autenticado
        authService.clearAuth()
        setIsAuthenticated(false)
        setCurrentUser(null)
      } finally {
        console.log('🏁 [App] checkAuth completado')
        console.log('🏁 [App] Estado final - isAuthenticated:', isAuthenticated)
        console.log('🏁 [App] Estado final - currentUser:', currentUser)
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
      console.log('🔍 Logout - Llamando adminLogout()')
      await authService.adminLogout()
    } catch (error) {
      console.error('Logout error:', error)
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
