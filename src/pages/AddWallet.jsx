import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Wallet, Check, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { walletAuthService } from '@/services/walletAuthService'

const AddWallet = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is authenticated for wallet flow
    if (!walletAuthService.isWalletAuthenticated()) {
      // Redirect to login if not authenticated
      navigate('/loginWallet')
      return
    }

    // Get user info from token
    const walletUser = walletAuthService.getWalletUser()
    setUser(walletUser)
    
    // Reset loading state when component mounts (in case user returns from Google Wallet)
    setIsLoading(false)
    
    // Handle page visibility change (when user returns to the tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Reset loading state when user returns to the page
        setIsLoading(false)
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [navigate])

  const handleAddToWallet = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Call backend to add pass to wallet
      const result = await walletAuthService.addPassToWallet()
      
      // The service will redirect to Google Wallet URL
      // Show success briefly before redirect happens
      if (result) {
        
        setSuccess(true)
        
        // Reset loading state after a brief moment since we're redirecting
        // This prevents the button from staying in loading state if user comes back
        setTimeout(() => {
          setIsLoading(false)
        }, 1000)
      }
    } catch (error) {
      
      setError(error.message || 'Error al añadir la tarjeta a Google Wallet')
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    walletAuthService.clearWalletAuth()
    navigate('/loginWallet')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-60 sm:w-80 h-60 sm:h-80 bg-gray-100 rounded-full opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-60 sm:w-80 h-60 sm:h-80 bg-gray-100 rounded-full opacity-20"></div>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative max-w-md w-full space-y-6 sm:space-y-8">
          {/* Back button */}
          <button
            onClick={handleBack}
            className="absolute -top-12 left-0 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="text-sm">Volver</span>
          </button>

          {/* Logo and Title */}
          <div className="text-center">
            <div className="inline-block p-3 sm:p-4 bg-white rounded-2xl shadow-sm mb-4 sm:mb-6">
              <Wallet className="h-16 sm:h-20 lg:h-24 w-auto mx-auto text-black" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Añade tu wallet:
            </h1>
            {user && (
              <p className="text-sm sm:text-base text-gray-600 px-4 sm:px-0">
                {user.email}
              </p>
            )}
          </div>

          {/* Main Card */}
          <Card className="border-0 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl bg-white">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              {/* Error Display */}
              {error && (
                <div className="mb-4 sm:mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start sm:items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <p className="text-xs sm:text-sm text-red-700 flex-1">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="text-red-600 text-lg sm:text-base hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-4 sm:mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm sm:text-base text-green-700 font-medium">
                        ¡Tarjeta añadida exitosamente!
                      </p>
                      <p className="text-xs sm:text-sm text-green-600 mt-1">
                        Redirigiendo...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Content */}
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm sm:text-base text-gray-600 mb-6">
                    Haz clic en el botón para añadir tu tarjeta de fidelidad a Google Wallet
                  </p>

                  {/* Google Wallet Add Button */}
                  <Button
                    onClick={handleAddToWallet}
                    disabled={isLoading || success}
                    className="w-full bg-black hover:bg-gray-800 text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl text-base sm:text-lg font-medium shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </span>
                    ) : success ? (
                      <span className="flex items-center justify-center">
                        <Check className="w-5 h-5 mr-2" />
                        Añadido exitosamente
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Añadir a Google Wallet
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Footer */}
      <div className="relative py-6">
        <p className="text-center text-xs text-gray-500">
          Powered by Google Wallet
        </p>
      </div>
    </div>
  )
}

export default AddWallet