import { useState, useEffect, useCallback } from 'react'

export interface NetworkError {
  message: string
  code?: string
  retryable: boolean
  timestamp: Date
}

export interface NetworkErrorHandler {
  error: NetworkError | null
  isRetrying: boolean
  retryCount: number
  handleError: (error: Error, retryFn?: () => Promise<void>) => void
  clearError: () => void
  retry: () => Promise<void>
}

export function useNetworkError(): NetworkErrorHandler {
  const [error, setError] = useState<NetworkError | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [retryFn, setRetryFn] = useState<(() => Promise<void>) | null>(null)

  const handleError = useCallback((error: Error, retryFunction?: () => Promise<void>) => {
    const networkError: NetworkError = {
      message: getErrorMessage(error),
      code: getErrorCode(error),
      retryable: isRetryableError(error),
      timestamp: new Date()
    }

    setError(networkError)
    setRetryCount(0)
    setRetryFn(() => retryFunction || null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
    setRetryCount(0)
    setRetryFn(null)
  }, [])

  const retry = useCallback(async () => {
    if (!retryFn || isRetrying) return

    setIsRetrying(true)
    setRetryCount(prev => prev + 1)

    try {
      await retryFn()
      clearError()
    } catch (error) {
      handleError(error as Error, retryFn)
    } finally {
      setIsRetrying(false)
    }
  }, [retryFn, isRetrying, handleError, clearError])

  // Auto-retry pour les erreurs temporaires
  useEffect(() => {
    if (error && error.retryable && retryCount < 3) {
      const timer = setTimeout(() => {
        retry()
      }, Math.pow(2, retryCount) * 1000) // Exponential backoff

      return () => clearTimeout(timer)
    }
  }, [error, retryCount, retry])

  return {
    error,
    isRetrying,
    retryCount,
    handleError,
    clearError,
    retry
  }
}

function getErrorMessage(error: Error): string {
  if (error.name === 'AbortError') {
    return 'Requête annulée'
  }
  
  if (error.message.includes('Failed to fetch')) {
    return 'Connexion au serveur impossible'
  }
  
  if (error.message.includes('NetworkError')) {
    return 'Erreur de réseau'
  }
  
  if (error.message.includes('timeout')) {
    return 'Délai d\'attente dépassé'
  }
  
  if (error.message.includes('404')) {
    return 'Ressource non trouvée'
  }
  
  if (error.message.includes('403')) {
    return 'Accès refusé'
  }
  
  if (error.message.includes('401')) {
    return 'Authentification requise'
  }
  
  if (error.message.includes('500')) {
    return 'Erreur serveur'
  }
  
  return error.message || 'Une erreur inattendue s\'est produite'
}

function getErrorCode(error: Error): string | undefined {
  const match = error.message.match(/(\d{3})/)
  return match ? match[1] : undefined
}

function isRetryableError(error: Error): boolean {
  // Erreurs temporaires qui peuvent être retentées
  if (error.name === 'AbortError') return false
  if (error.message.includes('401')) return false // Auth errors
  if (error.message.includes('403')) return false // Permission errors
  if (error.message.includes('404')) return false // Not found errors
  
  // Erreurs réseau temporaires
  if (error.message.includes('Failed to fetch')) return true
  if (error.message.includes('NetworkError')) return true
  if (error.message.includes('timeout')) return true
  if (error.message.includes('500')) return true
  if (error.message.includes('502')) return true
  if (error.message.includes('503')) return true
  if (error.message.includes('504')) return true
  
  return false
}
