import { useState, useCallback } from 'react'

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const executeApiCall = useCallback(async (apiFunction, ...args) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiFunction(...args)
      setLoading(false)
      return result
    } catch (err) {
      setError(err.message || 'An error occurred')
      setLoading(false)
      throw err
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    executeApiCall,
    clearError
  }
}

export const useApiState = (initialData = null) => {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const executeApiCall = useCallback(async (apiFunction, ...args) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiFunction(...args)
      setData(result)
      setLoading(false)
      return result
    } catch (err) {
      setError(err.message || 'An error occurred')
      setLoading(false)
      throw err
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const resetData = useCallback(() => {
    setData(initialData)
  }, [initialData])

  return {
    data,
    loading,
    error,
    executeApiCall,
    clearError,
    resetData,
    setData
  }
} 