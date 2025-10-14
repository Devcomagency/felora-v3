/**
 * Wrapper autour de fetch() avec timeout intégré
 * Évite les requêtes qui restent en attente indéfiniment
 */

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 10000 // 10 secondes par défaut
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error: any) {
    clearTimeout(timeoutId)
    
    if (error.name === 'AbortError') {
      throw new Error(`Délai d'attente dépassé (${timeout}ms)`)
    }
    
    throw error
  }
}

/**
 * Version avec retry automatique
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  timeout = 10000
): Promise<Response> {
  let lastError: Error | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetchWithTimeout(url, options, timeout)
      
      // Retry sur erreurs serveur 5xx
      if (response.status >= 500 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
        continue
      }
      
      return response
    } catch (error) {
      lastError = error as Error
      
      // Ne pas retry sur erreurs d'auth
      if (lastError.message.includes('401') || lastError.message.includes('403')) {
        throw lastError
      }
      
      // Attendre avant de retry (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
      }
    }
  }
  
  throw lastError || new Error('Toutes les tentatives ont échoué')
}

