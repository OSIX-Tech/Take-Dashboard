import React from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import AnimatedLayout from './AnimatedLayout'

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
    <div className="flex h-screen bg-gray-50 safe-area">
      {/* Sidebar - always visible, collapsed on mobile, expandable on desktop */}
      <div className="flex-shrink-0">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title={getPageTitle()} 
          onLogout={onLogout}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 lg:p-6">
          <AnimatedLayout>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </AnimatedLayout>
        </main>
        {/* Super small footer */}
        <footer className="bg-white border-t border-gray-200 px-3 py-2 text-center">
          <p className="text-xs text-gray-500">© 2025 OSIX. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  )
}

export default Layout 