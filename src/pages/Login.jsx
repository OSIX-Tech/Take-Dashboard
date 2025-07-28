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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="max-w-sm w-full space-y-4 sm:space-y-5 lg:space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-3 sm:mb-4 lg:mb-5">
            <img
              src="/logo.png"
              alt="TAKE Logo"
              className="h-10 sm:h-12 lg:h-14 w-auto object-contain mx-auto"
            />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
            Acceso Administrativo
          </h2>
          <p className="mt-2 text-sm sm:text-base lg:text-lg text-gray-600">
            Inicia sesión con tu llave de acceso
          </p>
        </div>

        <Card className="p-4 sm:p-5 lg:p-6 shadow-lg rounded-2xl bg-white border border-gray-200">
          <CardContent className="p-0">
            {error && <ErrorMessage message={error} className="mb-4 sm:mb-5" />}
            
            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <Key className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-600" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 mb-2">
                  Iniciar sesión con Passkey
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                  Usa tu huella dactilar, Face ID, PIN o patrón para acceder
                </p>
              </div>

              <Button
                onClick={handlePasskeyLogin}
                disabled={loading}
                className="w-full bg-black hover:bg-gray-800 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <span className="hidden sm:inline">Verificando identidad...</span>
                    <span className="sm:hidden">Verificando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Key className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                    <span>Usar Passkey</span>
                  </div>
                )}
              </Button>

              <div className="bg-gray-50 p-3 sm:p-4 lg:p-5 rounded-lg">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm sm:text-base lg:text-lg text-gray-600">
                    <p className="font-medium mb-2">¿Qué es una Passkey?</p>
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