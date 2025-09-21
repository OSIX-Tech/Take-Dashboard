import { useState, useEffect, useCallback } from 'react'
import { healthService } from '@/services/healthService'

export const useSystemHealth = () => {
  const [systemStatus, setSystemStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastCheck, setLastCheck] = useState(null)

  // Verificar estado del sistema
  const checkSystemHealth = useCallback(async () => {
    try {
      setIsLoading(true)
      const diagnostic = await healthService.runFullDiagnostic()
      setSystemStatus(diagnostic)
      setLastCheck(new Date())
      return diagnostic
    } catch (error) {
      
      const errorStatus = {
        systemStatus: 'UNKNOWN_ERROR',
        systemMessage: 'Error verificando estado del sistema',
        timestamp: new Date().toISOString(),
        configuration: { errors: [], warnings: [] },
        backend: { status: 'UNKNOWN_ERROR', message: 'Error desconocido' },
        auth: { status: 'ERROR', message: 'Error verificando autenticación' },
        cors: { status: 'UNKNOWN', message: 'Error verificando CORS' }
      }
      setSystemStatus(errorStatus)
      setLastCheck(new Date())
      return errorStatus
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Verificar configuración específica
  const checkConfiguration = useCallback(async () => {
    try {
      return await healthService.validateConfiguration()
    } catch (error) {
      
      return { errors: [], warnings: [] }
    }
  }, [])

  // Verificar conectividad del backend
  const checkBackendHealth = useCallback(async () => {
    try {
      return await healthService.checkBackendHealth()
    } catch (error) {
      
      return { status: 'UNKNOWN_ERROR', message: 'Error verificando backend' }
    }
  }, [])

  // Verificar endpoint de autenticación
  const checkAuthEndpoint = useCallback(async () => {
    try {
      return await healthService.checkAuthEndpoint()
    } catch (error) {
      
      return { status: 'ERROR', message: 'Error verificando autenticación' }
    }
  }, [])

  // Verificar configuración CORS
  const checkCorsConfiguration = useCallback(async () => {
    try {
      return await healthService.checkCorsConfiguration()
    } catch (error) {
      
      return { status: 'UNKNOWN', message: 'Error verificando CORS' }
    }
  }, [])

  // Verificar estado inicial al montar el hook
  useEffect(() => {
    checkSystemHealth()
  }, [checkSystemHealth])

  // Verificar si hay errores críticos
  const hasCriticalErrors = systemStatus?.systemStatus === 'CONFIG_ERROR'
  const hasBackendIssues = systemStatus?.systemStatus === 'BACKEND_ERROR'
  const hasAuthIssues = systemStatus?.systemStatus === 'AUTH_ERROR'
  const isHealthy = systemStatus?.systemStatus === 'HEALTHY'

  // Obtener errores de configuración
  const configErrors = systemStatus?.configuration?.errors || []
  const configWarnings = systemStatus?.configuration?.warnings || []

  return {
    // Estado
    systemStatus,
    isLoading,
    lastCheck,
    
    // Funciones
    checkSystemHealth,
    checkConfiguration,
    checkBackendHealth,
    checkAuthEndpoint,
    checkCorsConfiguration,
    
    // Helpers
    hasCriticalErrors,
    hasBackendIssues,
    hasAuthIssues,
    isHealthy,
    configErrors,
    configWarnings,
    
    // Datos específicos
    backend: systemStatus?.backend,
    auth: systemStatus?.auth,
    cors: systemStatus?.cors,
    configuration: systemStatus?.configuration
  }
} 