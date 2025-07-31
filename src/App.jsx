import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import Login from './pages/Login'
import Menu from './pages/Menu'
import Game from './pages/Game'
import Rewards from './pages/Rewards'
import Events from './pages/Events'
import Layout from './components/layout/Layout'
import { authService } from './services/authService'

// Componente para manejar el callback de admin
const AdminCallback = ({ onLogin }) => {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        
        if (error) {
          setError('Error en autenticación: ' + decodeURIComponent(error))
          return
        }
        
        if (!code) {
          setError('No se recibió código de autorización')
          return
        }

        const userData = await authService.handleAdminCallback(code)
        onLogin(userData)
        
        // Redirigir al dashboard
        window.location.href = '/menu'
      } catch (err) {
        console.error('Error en callback de admin:', err)
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
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
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
      try {
        // Verificar si hay token en localStorage (user o admin)
        const hasAuthToken = authService.isAuthenticated()
        const hasAdminToken = authService.isAdminAuthenticated()
        
        if (hasAuthToken || hasAdminToken) {
          // Si hay token, intentar verificar la sesión
          try {
            await authService.checkSession()
            const user = authService.getCurrentUser()
            setCurrentUser(user)
            setIsAuthenticated(true)
          } catch (error) {
            // Si la sesión no es válida, limpiar y redirigir a login
            console.log('Sesión inválida, limpiando tokens')
            authService.clearAuth()
            setIsAuthenticated(false)
            setCurrentUser(null)
          }
        } else {
          // No hay tokens, no está autenticado
          setIsAuthenticated(false)
          setCurrentUser(null)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
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
      // Intentar hacer logout en el backend (user o admin)
      if (currentUser?.isAdmin) {
        await authService.adminLogout()
      } else {
        await authService.logout()
      }
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
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta por defecto - siempre redirige a login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Ruta del login - siempre muestra login */}
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          
          {/* Ruta del callback de admin */}
          <Route path="/admin/callback" element={
            <AdminCallback onLogin={handleLogin} />
          } />
          
          {/* Rutas protegidas - todas redirigen al login por ahora */}
          <Route path="/menu" element={<Navigate to="/login" replace />} />
          <Route path="/game" element={<Navigate to="/login" replace />} />
          <Route path="/rewards" element={<Navigate to="/login" replace />} />
          <Route path="/events" element={<Navigate to="/login" replace />} />
          
          {/* Ruta de fallback - redirige al login si la ruta no existe */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
