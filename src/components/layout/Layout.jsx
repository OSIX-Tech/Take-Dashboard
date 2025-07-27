import React from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const Layout = ({ children, onLogout }) => {
  const location = useLocation()

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/menu': return 'Menú'
      case '/events': return 'Eventos'
      case '/rewards': return 'Recompensas'
      case '/game': return 'Juego'
      default: return 'Dashboard'
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={getPageTitle()} onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout 