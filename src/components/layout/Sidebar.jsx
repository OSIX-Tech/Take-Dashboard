import { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import gsap from 'gsap'
import {
  Menu as MenuIcon,
  Calendar,
  Gift,
  Trophy,
  Wallet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const Sidebar = () => {
  // On mobile, always collapsed. On desktop, can be toggled
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const sidebarRef = useRef(null)
  const titleRef = useRef(null)
  const navItemsRef = useRef([])

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

  // Set sidebar width based on collapsed state
  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.style.width = isCollapsed ? '64px' : '256px'
    }
  }, [isCollapsed])

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
      description: 'Leaderboard y periodos'
    },
    {
      icon: <Wallet className="w-5 h-5 md:w-6 md:h-6 lg:w-6 lg:h-6" />,
      label: 'Wallet',
      path: '/wallet',
      description: 'Gestionar Google Wallet'
    },
  ]

  const handleToggleCollapse = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed)
    }
  }

  return (
    <div 
      ref={sidebarRef}
      className={`glass-sidebar h-screen flex flex-col relative transition-all duration-300`}
      style={{ width: '256px' }}
    >
      {/* Header with macOS window controls style */}
      <div className="p-3 md:p-4 lg:p-4 border-b border-black/5 flex items-center justify-between">
        <div className="flex items-center justify-center w-full overflow-hidden">
          {/* Only show title on desktop when not collapsed */}
          {!isCollapsed && (
            <span 
              ref={titleRef}
              className="font-bold text-base md:text-lg lg:text-lg tracking-wide text-black whitespace-nowrap"
            >
              Dashboard
            </span>
          )}
        </div>
        {/* Only show collapse button on desktop */}
        <button
          onClick={handleToggleCollapse}
          className="hidden lg:block p-1.5 md:p-2 lg:p-2 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation"
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
            ref={el => navItemsRef.current[index] = el}
            to={item.path}
            className={({ isActive }) => `
              flex items-center px-2 md:px-3 py-2 md:py-3 lg:py-3 rounded-xl text-sm md:text-base lg:text-base font-medium transition-all duration-200 focus:outline-none touch-manipulation
              ${isCollapsed
                ? 'justify-center'
                : 'justify-start'
              }
              ${isActive
                ? 'bg-black text-white shadow-macos'
                : 'text-gray-700'}
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
                  <span 
                    className="ml-2 md:ml-3 lg:ml-3 whitespace-nowrap"
                    style={{
                      opacity: isCollapsed ? 0 : 1,
                      transform: isCollapsed ? 'translateX(-10px)' : 'translateX(0)',
                      transition: 'all 0.2s ease-out'
                    }}
                  >
                    {item.label}
                  </span>
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