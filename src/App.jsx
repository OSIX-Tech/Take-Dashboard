import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Menu from './pages/Menu'
import Game from './pages/Game'
import Rewards from './pages/Rewards'
import Events from './pages/Events'
import Layout from './components/layout/Layout'
import { authService } from './services/authService'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated()
      setIsAuthenticated(authenticated)
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsAuthenticated(false)
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
          {/* Ruta por defecto - redirige al login si no está autenticado */}
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/menu" replace /> : <Navigate to="/login" replace />
          } />
          
          {/* Ruta del login */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/menu" replace /> : <Login onLogin={handleLogin} />
          } />
          
          {/* Rutas protegidas - redirigen al login si no está autenticado */}
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
          
          {/* Ruta de fallback - redirige al login si la ruta no existe */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
