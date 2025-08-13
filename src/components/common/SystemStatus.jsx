import React from 'react'
import { AlertCircle, CheckCircle, XCircle, AlertTriangle, RefreshCw, Info } from 'lucide-react'

const SystemStatus = ({ 
  systemStatus, 
  configuration, 
  backend, 
  auth, 
  cors, 
  onRetry, 
  isLoading = false 
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'HEALTHY':
      case 'AVAILABLE':
      case 'CONFIGURED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'CONFIG_ERROR':
      case 'NETWORK_ERROR':
      case 'CORS_ERROR':
      case 'UNAVAILABLE':
      case 'ERROR':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'CONFIG_WARNING':
      case 'UNKNOWN':
      case 'UNKNOWN_ERROR':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'HEALTHY':
      case 'AVAILABLE':
      case 'CONFIGURED':
        return 'border-green-200 bg-green-50'
      case 'CONFIG_ERROR':
      case 'NETWORK_ERROR':
      case 'CORS_ERROR':
      case 'UNAVAILABLE':
      case 'ERROR':
        return 'border-red-200 bg-red-50'
      case 'CONFIG_WARNING':
      case 'UNKNOWN':
      case 'UNKNOWN_ERROR':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'HEALTHY':
      case 'AVAILABLE':
      case 'CONFIGURED':
        return 'text-green-800'
      case 'CONFIG_ERROR':
      case 'NETWORK_ERROR':
      case 'CORS_ERROR':
      case 'UNAVAILABLE':
      case 'ERROR':
        return 'text-red-800'
      case 'CONFIG_WARNING':
      case 'UNKNOWN':
      case 'UNKNOWN_ERROR':
        return 'text-yellow-800'
      default:
        return 'text-blue-800'
    }
  }

  const renderConfigurationSection = () => {
    if (!configuration) return null

    const { errors, warnings } = configuration

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Configuración</h3>
        
        {/* Errores de configuración */}
        {errors.map((error, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 border border-red-200 bg-red-50 rounded-lg">
            <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">{error.message}</h4>
              <p className="text-xs text-red-700 mt-1">{error.details}</p>
              <p className="text-xs text-red-600 mt-1">Código: {error.code}</p>
            </div>
          </div>
        ))}

        {/* Advertencias de configuración */}
        {warnings.map((warning, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-800">{warning.message}</h4>
              <p className="text-xs text-yellow-700 mt-1">{warning.details}</p>
              <p className="text-xs text-yellow-600 mt-1">Código: {warning.code}</p>
            </div>
          </div>
        ))}

        {errors.length === 0 && warnings.length === 0 && (
          <div className="flex items-center space-x-3 p-3 border border-green-200 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <h4 className="text-sm font-medium text-green-800">Configuración correcta</h4>
              <p className="text-xs text-green-700">Todas las variables de entorno están configuradas</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderHealthSection = () => {
    if (!backend && !auth && !cors) return null

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Estado del Sistema</h3>
        
        {/* Backend Health */}
        {backend && (
          <div className={`flex items-start space-x-3 p-3 border rounded-lg ${getStatusColor(backend.status)}`}>
            {getStatusIcon(backend.status)}
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${getStatusTextColor(backend.status)}`}>
                Backend: {backend.message}
              </h4>
              {backend.details && (
                <div className="text-xs text-gray-600 mt-1">
                  {backend.details.suggestion && (
                    <p className="text-yellow-700">{backend.details.suggestion}</p>
                  )}
                  {backend.details.status && (
                    <p>Status: {backend.details.status} {backend.details.statusText}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Auth Endpoint */}
        {auth && (
          <div className={`flex items-start space-x-3 p-3 border rounded-lg ${getStatusColor(auth.status)}`}>
            {getStatusIcon(auth.status)}
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${getStatusTextColor(auth.status)}`}>
                Autenticación: {auth.message}
              </h4>
              {auth.details && (
                <div className="text-xs text-gray-600 mt-1">
                  Status: {auth.details.status} {auth.details.statusText}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CORS Configuration */}
        {cors && (
          <div className={`flex items-start space-x-3 p-3 border rounded-lg ${getStatusColor(cors.status)}`}>
            {getStatusIcon(cors.status)}
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${getStatusTextColor(cors.status)}`}>
                CORS: {cors.message}
              </h4>
              {cors.details && (
                <div className="text-xs text-gray-600 mt-1">
                  {cors.details.suggestion && (
                    <p className="text-yellow-700">{cors.details.suggestion}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderSystemStatus = () => {
    if (!systemStatus) return null

    return (
      <div className={`flex items-center space-x-3 p-4 border rounded-lg ${getStatusColor(systemStatus)}`}>
        {getStatusIcon(systemStatus)}
        <div className="flex-1">
          <h3 className={`text-base font-semibold ${getStatusTextColor(systemStatus)}`}>
            Estado del Sistema
          </h3>
          <p className={`text-sm ${getStatusTextColor(systemStatus)}`}>
            {systemStatus === 'HEALTHY' && 'Sistema funcionando correctamente'}
            {systemStatus === 'CONFIG_ERROR' && 'Errores de configuración detectados'}
            {systemStatus === 'BACKEND_ERROR' && 'Problemas de conectividad con el backend'}
            {systemStatus === 'AUTH_ERROR' && 'Problemas con el endpoint de autenticación'}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            <span>Reintentar</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {renderSystemStatus()}
      {renderConfigurationSection()}
      {renderHealthSection()}
    </div>
  )
}

export default SystemStatus 