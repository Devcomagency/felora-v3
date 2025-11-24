import { logger } from './logger'

/**
 * Fonction de retry avec backoff exponentiel
 * @param fn - Fonction asynchrone à exécuter
 * @param maxAttempts - Nombre maximum de tentatives (défaut: 3)
 * @param delayMs - Délai initial en millisecondes (défaut: 1000)
 * @returns Résultat de la fonction ou throw la dernière erreur
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Si c'est la dernière tentative, throw l'erreur
      if (attempt === maxAttempts) {
        throw error
      }

      // Backoff exponentiel : 1s, 2s, 4s
      const delay = delayMs * Math.pow(2, attempt - 1)
      logger.warn(`[RETRY] Tentative ${attempt}/${maxAttempts} échouée, retry dans ${delay}ms...`, error)

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Options pour l'upload avec progress
 */
export interface UploadOptions {
  url: string
  file: File | Blob
  method?: 'PUT' | 'POST'
  headers?: Record<string, string>
  onProgress?: (progress: number) => void
  maxAttempts?: number
}

/**
 * Upload un fichier avec progress bar et retry automatique
 * @param options - Options d'upload
 * @returns Promise qui se résout quand l'upload est terminé
 */
export async function uploadWithProgress(options: UploadOptions): Promise<void> {
  const {
    url,
    file,
    method = 'PUT',
    headers = {},
    onProgress,
    maxAttempts = 3
  } = options

  console.log('📤 [UPLOAD] Démarrage upload:', {
    url: url.substring(0, 100) + '...',
    fileSize: file.size,
    fileType: file.type,
    method,
    headers
  })

  return retryWithBackoff(async () => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Progress upload
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100)
            console.log(`📊 [UPLOAD] Progress: ${progress}%`)
            onProgress(progress)
          }
        })
      }

      // Success
      xhr.addEventListener('load', () => {
        console.log(`✅ [UPLOAD] Load event - Status: ${xhr.status}`)
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
        }
      })

      // Error
      xhr.addEventListener('error', (e) => {
        console.error('❌ [UPLOAD] Error event:', {
          readyState: xhr.readyState,
          status: xhr.status,
          statusText: xhr.statusText,
          responseURL: xhr.responseURL,
          event: e
        })
        reject(new Error(`Network error during upload - Status: ${xhr.status}, ReadyState: ${xhr.readyState}`))
      })

      // Timeout
      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'))
      })

      // Abort
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'))
      })

      // Configuration
      xhr.open(method, url)

      // Headers
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })

      // Timeout 10 minutes (pour grosses vidéos)
      xhr.timeout = 10 * 60 * 1000

      // Envoyer le fichier
      xhr.send(file)
    })
  }, maxAttempts)
}

/**
 * Fetch avec retry automatique
 * @param url - URL à fetcher
 * @param options - Options fetch standard
 * @param maxAttempts - Nombre de tentatives (défaut: 3)
 * @returns Response
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxAttempts: number = 3
): Promise<Response> {
  return retryWithBackoff(async () => {
    const response = await fetch(url, options)

    // Si erreur serveur (5xx), on retry
    if (response.status >= 500) {
      throw new Error(`Server error: ${response.status}`)
    }

    // Si erreur client (4xx), on ne retry pas
    if (!response.ok && response.status < 500) {
      throw new Error(`Client error: ${response.status}`, { cause: { noRetry: true } })
    }

    return response
  }, maxAttempts)
}
