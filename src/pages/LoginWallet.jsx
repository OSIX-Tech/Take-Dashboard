import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { walletAuthService } from '@/services/walletAuthService'

const LoginWallet = () => {
  const navigate = useNavigate()
  const [authError, setAuthError] = useState(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [googleInitialized, setGoogleInitialized] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const clientId = import.meta.env.VITE_GOOGLE_WALLET_CLIENT_ID

  useEffect(() => {
    // Check if mobile device
    setIsMobile(walletAuthService.isMobileDevice())

    // Check for OAuth redirect response first
    const oauthResponse = walletAuthService.handleOAuthRedirect()
    if (oauthResponse) {
      if (oauthResponse.error) {
        setAuthError(`Error de autenticación: ${oauthResponse.error}`)
      } else if (oauthResponse.credential) {
        // We have a token from redirect, process it
        
        handleGoogleResponse({ credential: oauthResponse.credential })
        return
      }
    }

    // Initialize Google Sign-In when component mounts (for non-mobile)
    const initGoogleSignIn = () => {
      try {
        if (!clientId) {
          setAuthError('Google Wallet Client ID no configurado. Por favor configura VITE_GOOGLE_WALLET_CLIENT_ID en el archivo .env')
          return
        }

        // Only initialize Google Sign-In JavaScript API for desktop
        if (!walletAuthService.isMobileDevice()) {
          walletAuthService.initializeGoogleSignIn(clientId, handleGoogleResponse)
        }
        setGoogleInitialized(true)
      } catch (error) {
        
        setAuthError('Error al inicializar Google Sign-In. Por favor recarga la página.')
      }
    }

    // For desktop, wait for Google library to load
    if (!walletAuthService.isMobileDevice()) {
      const checkGoogleLibrary = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(checkGoogleLibrary)
          initGoogleSignIn()
        }
      }, 100)

      // Cleanup
      return () => {
        clearInterval(checkGoogleLibrary)
      }
    } else {
      // For mobile, we don't need Google library, just mark as initialized
      setGoogleInitialized(true)
    }
  }, [])

  // Handle Google sign-in response
  const handleGoogleResponse = async (credentialResponse) => {
    
    setIsGoogleLoading(true)
    setAuthError(null)
    
    try {
      // Authenticate with backend using Google ID token
      await walletAuthService.handleGoogleCredential(credentialResponse)
      
      // Redirect to addWallet page after successful authentication
      navigate('/addWallet')
    } catch (error) {
      
      setAuthError(error.message || 'Error al autenticarse. Por favor intenta de nuevo.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  // Handle manual Google sign-in button click
  const handleGoogleLogin = () => {
    if (!googleInitialized || !clientId) {
      setAuthError('Google Sign-In no está inicializado. Por favor recarga la página.')
      return
    }

    setIsGoogleLoading(true)
    setAuthError(null)

    // For mobile devices or when cookies are blocked, use redirect flow
    if (isMobile) {
      
      try {
        // Generate OAuth URL and redirect
        const oauthUrl = walletAuthService.generateOAuthUrl(clientId)
        
        window.location.href = oauthUrl
      } catch (error) {
        
        setAuthError('Error al iniciar sesión con Google')
        setIsGoogleLoading(false)
      }
    } else {
      // For desktop, try the Google Sign-In JavaScript API
      try {
        // First try the prompt
        window.google.accounts.id.prompt((notification) => {
          
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // If One Tap doesn't work, fallback to redirect flow

            // Show message and use redirect flow
            setAuthError('Las cookies de terceros están bloqueadas. Usando método alternativo...')
            setTimeout(() => {
              const oauthUrl = walletAuthService.generateOAuthUrl(clientId)
              window.location.href = oauthUrl
            }, 1500)
          }
        })
      } catch (error) {
        
        // Fallback to redirect flow
        const oauthUrl = walletAuthService.generateOAuthUrl(clientId)
        window.location.href = oauthUrl
      }
    }
  }

  const clearErrors = () => {
    setAuthError(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      {/* Background decoration - same as Login page */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-60 sm:w-80 h-60 sm:h-80 bg-gray-100 rounded-full opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-60 sm:w-80 h-60 sm:h-80 bg-gray-100 rounded-full opacity-20"></div>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative max-w-md w-full space-y-6 sm:space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="inline-block p-3 sm:p-4 bg-white rounded-2xl shadow-sm mb-4 sm:mb-6">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-16 sm:h-20 lg:h-24 w-auto mx-auto"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Google Wallet
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-4 sm:px-0">
              Añade tu tarjeta a Google Wallet
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-0 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl bg-white">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              {/* Error Display */}
              {authError && (
                <div className="mb-4 sm:mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start sm:items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <p className="text-xs sm:text-sm text-red-700 flex-1">{authError}</p>
                    <button
                      onClick={clearErrors}
                      className="text-red-600 text-lg sm:text-base hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Main Login Section */}
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <div className="text-center mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
                      Iniciar Sesión
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Accede con tu cuenta de Google
                    </p>
                  </div>
                  
                  {/* Custom Google Sign-In Button (same style as Login page) */}
                  <Button 
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading || !googleInitialized}
                    className="w-full bg-black text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl flex items-center justify-center space-x-2 sm:space-x-3 font-medium text-sm sm:text-base shadow-lg"
                  >
                    {isGoogleLoading ? (
                      <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    <span>{isGoogleLoading ? 'Conectando...' : 'Continuar con Google'}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Footer logo - pinned to bottom */}
      <div className="relative py-6">
        <img 
          src="/osix.png" 
          alt="OSIX Logo" 
          className="h-6 sm:h-8 mx-auto"
        />
      </div>
    </div>
  )
}

export default LoginWallet