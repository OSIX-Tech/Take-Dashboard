import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Menu as MenuIcon, 
  Calendar, 
  Gift, 
  Trophy, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react'

const Sidebar = () => {
  // On mobile, always collapsed. On desktop, can be toggled
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile and force collapsed state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024 // lg breakpoint
      setIsMobile(mobile)
      if (mobile) {
        setIsCollapsed(true) // Force collapsed on mobile
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const menuItems = [
    { 
      icon: <MenuIcon className="w-5 h-5 md:w-6 md:h-6 lg:w-6 lg:h-6" />, 
      label: 'Menú', 
      path: '/menu',
      description: 'Gestionar elementos del menú'
    },
    { 
      icon: <Calendar className="w-5 h-5 md:w-6 md:h-6 lg:w-6 lg:h-6" />, 
      label: 'Eventos', 
      path: '/events',
      description: 'Gestionar eventos'
    },
    { 
      icon: <Gift className="w-5 h-5 md:w-6 md:h-6 lg:w-6 lg:h-6" />, 
      label: 'Recompensas', 
      path: '/rewards',
      description: 'Gestionar recompensas'
    },
    { 
      icon: <Trophy className="w-5 h-5 md:w-6 md:h-6 lg:w-6 lg:h-6" />, 
      label: 'Juego', 
      path: '/game',
      description: 'Ver clasificación'
    },
  ]

  const handleToggleCollapse = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed)
    }
  }

  return (
    <div className={`bg-white border-r border-gray-200 h-screen transition-all duration-300 ease-in-out flex flex-col ${
      // Mobile: always collapsed (w-14), Tablet: medium size, Desktop: can be toggled
      isCollapsed ? 'w-14 md:w-16 lg:w-16' : 'w-56 md:w-64 lg:w-64 xl:w-72'
    }`}>
      {/* Header */}
      <div className="p-2 md:p-3 lg:p-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center justify-center w-full">
          {/* Only show title on desktop when not collapsed */}
          {!isCollapsed && (
            <span className="font-bold text-base md:text-lg lg:text-lg tracking-wide text-black transition-all duration-300">Dashboard</span>
          )}
        </div>
        {/* Only show collapse button on desktop */}
        <button
          onClick={handleToggleCollapse}
          className="hidden lg:block p-1.5 md:p-2 lg:p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 md:p-3 lg:p-3 flex flex-col gap-1.5 md:gap-2">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `
              flex items-center px-2 md:px-3 py-2 md:py-3 lg:py-3 rounded-lg text-sm md:text-base lg:text-base font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation
              ${isCollapsed
                ? 'justify-center'
                : 'justify-start'
              }
              ${isActive
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100 hover:text-black'}
            `}
            title={item.label}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center justify-center">
                  <span className={`${isActive ? 'text-white' : 'text-gray-700'}`}>
                    {item.icon}
                  </span>
                </div>
                {/* Only show labels on desktop when not collapsed */}
                {!isCollapsed && (
                  <span className="ml-2 md:ml-3 lg:ml-3">{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar 