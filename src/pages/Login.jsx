import React, { useState } from 'react'
import { Key, Shield, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { authService } from '@/services/authService'
import { useApiState } from '@/hooks/useApi'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'

const Login = ({ onLogin }) => {
  const { loading, error, executeApiCall: login } = useApiState()

  const handlePasskeyLogin = async () => {
    try {
      const response = await login(authService.loginWithPasskey)
      if (response.user) {
        onLogin(response.user)
      }
    } catch (error) {
      console.error('Passkey login failed:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-sm w-full space-y-3 sm:space-y-4 lg:space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-2 sm:mb-3 lg:mb-4">
            <img
              src="/logo.png"
              alt="TAKE Logo"
              className="h-8 sm:h-10 lg:h-12 w-auto object-contain mx-auto"
            />
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            Acceso Administrativo
          </h2>
          <p className="mt-1 text-xs sm:text-sm lg:text-base text-gray-600">
            Inicia sesión con tu llave de acceso
          </p>
        </div>

        <Card className="p-3 sm:p-4 lg:p-6 shadow-lg rounded-2xl bg-white border border-gray-200">
          <CardContent className="p-0">
            {error && <ErrorMessage message={error} className="mb-3 sm:mb-4" />}
            
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                  <Key className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 mb-1">
                  Iniciar sesión con Passkey
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                  Usa tu huella dactilar, Face ID, PIN o patrón para acceder
                </p>
              </div>

              <Button
                onClick={handlePasskeyLogin}
                disabled={loading}
                className="w-full bg-black hover:bg-gray-800 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    <span className="hidden sm:inline">Verificando identidad...</span>
                    <span className="sm:hidden">Verificando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Key className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                    <span>Usar Passkey</span>
                  </div>
                )}
              </Button>

              <div className="bg-gray-50 p-2 sm:p-3 lg:p-4 rounded-lg">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm lg:text-base text-gray-600">
                    <p className="font-medium mb-1">¿Qué es una Passkey?</p>
                    <p>
                      Una passkey es una forma más segura de iniciar sesión que reemplaza 
                      las contraseñas. Usa tu huella dactilar, Face ID o PIN del dispositivo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login 