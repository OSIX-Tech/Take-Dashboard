import React from 'react'
import { LogOut, User, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/authService'

const Topbar = ({ title, onLogout }) => {
  const currentUser = authService.getCurrentUser()
  const isDemoSession = currentUser?.isDemo || false
  const isAdmin = currentUser?.isAdmin || false

  return (
    <div className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-3 lg:py-4 safe-area">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
          <img
            src="/logo.png"
            alt="TAKE Logo"
            className="h-6 sm:h-7 md:h-8 lg:h-10 w-auto object-contain"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-900 truncate">{title}</h1>
            <div className="flex items-center space-x-2 mt-0.5">
              {isDemoSession && (
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span className="text-xs lg:text-sm text-orange-600 font-medium">Modo Demo</span>
                </div>
              )}
              {isAdmin && (
                <div className="flex items-center space-x-1">
                  <Crown className="w-3 h-3 text-purple-600" />
                  <span className="text-xs lg:text-sm text-purple-600 font-medium">Administrador</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-3">
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="w-6 sm:w-7 md:w-8 lg:w-10 h-6 sm:h-7 md:h-8 lg:h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-3 sm:w-3.5 md:w-4 lg:w-5 h-3 sm:h-3.5 md:h-4 lg:h-5 text-gray-600" />
            </div>
            <div className="hidden sm:block text-xs lg:text-sm">
              <div className="font-medium text-gray-900 truncate">
                {currentUser?.name || 'Usuario'}
              </div>
              <div className="text-gray-500 truncate">
                {currentUser?.email || 'admin@take.com'}
              </div>
            </div>
          </div>
          
          <Button
            onClick={onLogout}
            variant="ghost"
            size="sm"
            className="h-6 sm:h-7 md:w-8 lg:w-10 w-6 sm:w-7 md:w-8 lg:w-10 p-0 focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation"
          >
            <LogOut className="w-3 sm:w-3.5 md:w-4 lg:w-5 h-3 sm:h-3.5 md:h-4 lg:h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Topbar 