import React from 'react'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/authService'

const Topbar = ({ title, onLogout }) => {
  const currentUser = authService.getCurrentUser()
  const isDemoSession = authService.isDemoSession()

  return (
    <div className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 lg:px-8 py-3 lg:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
          <img
            src="/logo.png"
            alt="TAKE Logo"
            className="h-6 sm:h-8 md:h-10 lg:h-12 w-auto object-contain"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 truncate">{title}</h1>
            {isDemoSession && (
              <div className="flex items-center space-x-1 mt-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-xs lg:text-sm text-orange-600 font-medium">Modo Demo</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-3">
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="w-6 sm:w-8 md:w-10 lg:w-12 h-6 sm:h-8 md:h-10 lg:h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-3 sm:w-4 md:w-5 lg:w-6 h-3 sm:h-4 md:h-5 lg:h-6 text-gray-600" />
            </div>
            <div className="hidden sm:block text-sm lg:text-base">
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
            className="h-6 sm:h-8 md:h-10 lg:h-12 w-6 sm:w-8 md:w-10 lg:w-12 p-0 focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation"
          >
            <LogOut className="w-3 sm:w-4 md:w-5 lg:w-6 h-3 sm:h-4 md:h-5 lg:h-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Topbar 