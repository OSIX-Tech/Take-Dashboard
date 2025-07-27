import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Menu from './pages/Menu'
import Game from './pages/Game'
import Rewards from './pages/Rewards'
import Events from './pages/Events'
import Layout from './components/layout/Layout'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
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
