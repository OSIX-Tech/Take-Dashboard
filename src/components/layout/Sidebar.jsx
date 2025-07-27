import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Menu as MenuIcon, 
  Calendar, 
  Gift, 
  Trophy, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react'
import logo from '../../assets/logo.png'

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { 
      icon: <MenuIcon className="w-6 h-6" />, 
      label: 'Menú', 
      path: '/menu',
      description: 'Gestionar elementos del menú'
    },
    { 
      icon: <Calendar className="w-6 h-6" />, 
      label: 'Eventos', 
      path: '/events',
      description: 'Gestionar eventos'
    },
    { 
      icon: <Gift className="w-6 h-6" />, 
      label: 'Recompensas', 
      path: '/rewards',
      description: 'Gestionar recompensas'
    },
    { 
      icon: <Trophy className="w-6 h-6" />, 
      label: 'Juego', 
      path: '/game',
      description: 'Ver clasificación'
    },
  ]

  return (
    <div className={`bg-white border-r border-gray-200 h-screen transition-all duration-300 ease-in-out flex flex-col ${
      isCollapsed ? 'w-16 lg:w-20' : 'w-64 lg:w-72 xl:w-80'
    }`}>
      {/* Header */}
      <div className="p-3 lg:p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center justify-center w-full">
          {!isCollapsed && (
            <span className="font-bold text-lg lg:text-xl tracking-wide text-black transition-all duration-300">Dashboard</span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-2 p-2 lg:p-3 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4 flex flex-col gap-2">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `
              flex items-center ${isCollapsed ? 'justify-center' : ''} px-3 py-3 lg:py-4 rounded-xl text-base lg:text-lg font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation
              ${isActive
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100 hover:text-black'}
            `}
            title={item.label}
          >
            {({ isActive }) => (
              <>
                <span className={`${isActive ? 'text-white' : 'text-gray-700'} mr-0 flex items-center justify-center`}>
                  {isActive
                    ? <span className="[&_.lucide]:text-white">{item.icon}</span>
                    : <span className="[&_.lucide]:text-black">{item.icon}</span>
                  }
                </span>
                {!isCollapsed && (
                  <span className="ml-3 lg:ml-4 text-base lg:text-lg font-semibold">{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className={`p-3 lg:p-4 border-t border-gray-100 flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
        <div className={`w-8 h-8 lg:w-10 lg:h-10 bg-gray-200 rounded-full flex items-center justify-center`}>
          <span className="text-gray-600 text-sm lg:text-base font-medium">A</span>
        </div>
        {!isCollapsed && (
          <div className="flex-1 ml-3">
            <p className="text-xs lg:text-sm font-medium text-gray-700">Administrador</p>
            <p className="text-xs text-gray-500">admin@take.com</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar 