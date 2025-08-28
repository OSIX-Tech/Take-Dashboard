import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Enhanced error logging
    console.error('🚨🚨🚨 ErrorBoundary caught an error:', error)
    console.error('🚨🚨🚨 Error message:', error.message)
    console.error('🚨🚨🚨 Error stack:', error.stack)
    console.error('🚨🚨🚨 Component stack:', errorInfo.componentStack)
    
    // Check if this is the {seals, rewards} error
    if (error.message && error.message.includes('object with keys')) {
      console.error('🚨🚨🚨 DETECTED OBJECT RENDERING ERROR!')
      console.error('🚨🚨🚨 This usually means a component is trying to render an object directly.')
      console.error('🚨🚨🚨 Check the component stack above to identify the problematic component.')
    }
    
    // Update state with error details
    this.setState({
      error,
      errorInfo
    })
    
    // Here you could also log to an error reporting service
    // logErrorToService(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    // Optionally reload the page
    if (this.props.onReset) {
      this.props.onReset()
    } else {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Algo salió mal
                </h1>
                
                <p className="text-gray-600 mb-6">
                  Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta recargar la página.
                </p>
                
                {/* Show error details in development */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="w-full mb-6">
                    <details className="text-left">
                      <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                        Detalles del error (solo desarrollo)
                      </summary>
                      <div className="bg-gray-100 rounded p-3 text-xs font-mono text-gray-700 overflow-auto max-h-40">
                        <div className="font-semibold mb-1">{this.state.error.toString()}</div>
                        {this.state.errorInfo && (
                          <div className="mt-2 text-gray-600">
                            {this.state.errorInfo.componentStack}
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                )}
                
                <div className="flex gap-3 w-full">
                  <Button
                    onClick={() => window.history.back()}
                    variant="outline"
                    className="flex-1"
                  >
                    Volver atrás
                  </Button>
                  <Button
                    onClick={this.handleReset}
                    className="flex-1 bg-black"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recargar
                  </Button>
                </div>
              </div>
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              Si el problema persiste, por favor contacta al soporte técnico.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary