/**
 * Utilitaire pour optimiser les URLs des médias
 * Ajoute des paramètres de compression et de format optimisé
 */

export interface MediaOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png' | 'avif'
  blur?: number
}

/**
 * Optimise une URL d'image pour de meilleures performances
 */
export function optimizeImageUrl(
  originalUrl: string,
  options: MediaOptimizationOptions = {}
): string {
  // Retourner une URL placeholder si l'URL est invalide
  if (!originalUrl || originalUrl === 'undefined' || originalUrl === 'null') {
    return 'https://picsum.photos/1080/1920?random=placeholder'
  }

  // Si c'est déjà une URL optimisée ou une URL externe, retourner tel quel
  if (originalUrl.includes('_optimized') || originalUrl.startsWith('http')) {
    return originalUrl
  }

  const {
    width = 1080,
    height = 1920,
    quality = 80,
    format = 'webp',
    blur = 0
  } = options

  // Pour les URLs Cloudflare R2 ou similaires, ajouter des paramètres d'optimisation
  if (originalUrl.includes('r2.dev') || originalUrl.includes('cloudflare') || originalUrl.includes('media.felora.ch')) {
    const url = new URL(originalUrl)
    url.searchParams.set('width', width.toString())
    url.searchParams.set('height', height.toString())
    url.searchParams.set('quality', quality.toString())
    url.searchParams.set('format', format)
    if (blur > 0) {
      url.searchParams.set('blur', blur.toString())
    }
    return url.toString()
  }

  // Pour les URLs locales ou autres, ajouter un suffixe d'optimisation
  const url = new URL(originalUrl, 'http://localhost')
  url.searchParams.set('w', width.toString())
  url.searchParams.set('h', height.toString())
  url.searchParams.set('q', quality.toString())
  url.searchParams.set('f', format)
  if (blur > 0) {
    url.searchParams.set('blur', blur.toString())
  }
  
  return url.pathname + url.search
}

/**
 * Optimise une URL de vidéo pour de meilleures performances
 */
export function optimizeVideoUrl(
  originalUrl: string,
  options: { quality?: 'low' | 'medium' | 'high' } = {}
): string {
  // Retourner une URL placeholder si l'URL est invalide
  if (!originalUrl || originalUrl === 'undefined' || originalUrl === 'null') {
    return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  }

  const { quality = 'medium' } = options

  // Pour les URLs Cloudflare R2 ou similaires, ajouter des paramètres d'optimisation vidéo
  if (originalUrl.includes('r2.dev') || originalUrl.includes('cloudflare') || originalUrl.includes('media.felora.ch')) {
    const url = new URL(originalUrl)

    // Paramètres d'optimisation vidéo
    switch (quality) {
      case 'low':
        url.searchParams.set('bitrate', '500k')
        url.searchParams.set('resolution', '720p')
        break
      case 'medium':
        url.searchParams.set('bitrate', '1500k')
        url.searchParams.set('resolution', '1080p')
        break
      case 'high':
        url.searchParams.set('bitrate', '3000k')
        url.searchParams.set('resolution', '1080p')
        break
    }

    url.searchParams.set('format', 'mp4')
    url.searchParams.set('codec', 'h264')

    return url.toString()
  }

  return originalUrl
}

/**
 * Génère une URL de thumbnail optimisée
 */
export function generateThumbnailUrl(
  mediaUrl: string,
  options: { width?: number; height?: number; blur?: number } = {}
): string {
  const { width = 400, height = 600, blur = 5 } = options
  
  return optimizeImageUrl(mediaUrl, {
    width,
    height,
    quality: 60,
    format: 'webp',
    blur
  })
}

/**
 * Détecte le type de média basé sur l'URL
 */
export function detectMediaType(url: string): 'image' | 'video' {
  if (!url) return 'image'
  
  const lowerUrl = url.toLowerCase()
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v']
  
  return videoExtensions.some(ext => lowerUrl.includes(ext)) ? 'video' : 'image'
}

/**
 * Optimise une URL de média selon son type
 */
export function optimizeMediaUrl(
  originalUrl: string,
  type: 'IMAGE' | 'VIDEO',
  options: MediaOptimizationOptions = {}
): string {
  if (type === 'VIDEO') {
    return optimizeVideoUrl(originalUrl, { quality: 'medium' })
  } else {
    return optimizeImageUrl(originalUrl, {
      width: 1080,
      height: 1920,
      quality: 85,
      format: 'webp',
      ...options
    })
  }
}
