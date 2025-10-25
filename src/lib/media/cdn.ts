/**
 * Configuration et utilitaires CDN pour Cloudflare R2
 * Optimise la distribution des médias via CDN
 */

// URL publique du CDN Cloudflare R2
// Note: On utilise NEXT_PUBLIC_ pour le client ET sans préfixe pour le serveur
const CDN_BASE_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL ||
                     process.env.CLOUDFLARE_R2_PUBLIC_URL ||
                     'https://media.felora.ch'

/**
 * Construit une URL CDN complète pour un média
 */
export function buildCdnUrl(path: string): string {
  // Si le path est vide ou invalide, retourner un placeholder
  if (!path || path === 'undefined' || path === 'null') {
    return '/placeholder-profile.jpg'
  }

  // Nettoyer le chemin des préfixes invalides
  let cleanPath = path
    .replace(/^undefined\//, '')  // Retirer "undefined/" au début
    .replace(/^null\//, '')       // Retirer "null/" au début
    .replace(/^\/+/, '')          // Retirer les slashes au début

  // Si c'est déjà une URL complète, la retourner
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath
  }

  // Vérifier que CDN_BASE_URL est défini
  if (!CDN_BASE_URL || CDN_BASE_URL === 'undefined') {
    console.warn('[CDN] CDN_BASE_URL not configured, using fallback')
    return `/uploads/${cleanPath}`
  }

  return `${CDN_BASE_URL}/${cleanPath}`
}

/**
 * Optimise une URL pour le CDN avec paramètres de transformation
 */
export function optimizeCdnUrl(
  path: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'avif' | 'jpeg' | 'png'
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
    position?: 'center' | 'top' | 'bottom' | 'left' | 'right'
    blur?: number
  } = {}
): string {
  const cdnUrl = buildCdnUrl(path)
  const url = new URL(cdnUrl)

  // Ajouter les paramètres de transformation d'image
  if (options.width) url.searchParams.set('w', options.width.toString())
  if (options.height) url.searchParams.set('h', options.height.toString())
  if (options.quality) url.searchParams.set('q', options.quality.toString())
  if (options.format) url.searchParams.set('f', options.format)
  if (options.fit) url.searchParams.set('fit', options.fit)
  if (options.position) url.searchParams.set('position', options.position)
  if (options.blur) url.searchParams.set('blur', options.blur.toString())

  return url.toString()
}

/**
 * Génère plusieurs variantes d'une image pour responsive
 */
export function generateResponsiveImageSet(path: string): {
  thumbnail: string
  small: string
  medium: string
  large: string
  original: string
} {
  return {
    thumbnail: optimizeCdnUrl(path, { width: 150, height: 150, quality: 60, format: 'webp' }),
    small: optimizeCdnUrl(path, { width: 640, quality: 70, format: 'webp' }),
    medium: optimizeCdnUrl(path, { width: 1080, quality: 80, format: 'webp' }),
    large: optimizeCdnUrl(path, { width: 1920, quality: 85, format: 'webp' }),
    original: buildCdnUrl(path)
  }
}

/**
 * Vérifie si une URL utilise le CDN
 */
export function isCdnUrl(url: string): boolean {
  return url.includes('media.felora.ch') ||
         url.includes('r2.cloudflarestorage.com') ||
         url.includes('.r2.dev')
}

/**
 * Convertit une URL de stockage en URL CDN
 */
export function convertToCdnUrl(storageUrl: string): string {
  // Si c'est déjà une URL CDN, la retourner
  if (isCdnUrl(storageUrl)) {
    return storageUrl
  }

  // Extraire le chemin de la ressource
  try {
    const url = new URL(storageUrl)
    const pathParts = url.pathname.split('/')
    const resourcePath = pathParts[pathParts.length - 1]

    return buildCdnUrl(resourcePath)
  } catch {
    // Si l'URL n'est pas valide, retourner tel quel
    return storageUrl
  }
}

/**
 * Configuration des headers pour mise en cache optimale
 */
export const CDN_CACHE_HEADERS = {
  // Cache public pendant 1 an
  'Cache-Control': 'public, max-age=31536000, immutable',
  // Headers de sécurité
  'X-Content-Type-Options': 'nosniff',
  // CORS pour permettre l'accès depuis le domaine principal
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Max-Age': '86400'
}

/**
 * Précharge une image via CDN
 */
export function preloadCdnImage(url: string, as: 'image' | 'video' = 'image'): void {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = as
  link.href = url

  if (as === 'image') {
    link.setAttribute('imagesrcset', url)
  }

  document.head.appendChild(link)
}

/**
 * Calcule l'URL optimale selon la largeur de l'écran
 */
export function getResponsiveImageUrl(
  path: string,
  screenWidth: number
): string {
  if (screenWidth <= 640) {
    return optimizeCdnUrl(path, { width: 640, quality: 70, format: 'webp' })
  } else if (screenWidth <= 1080) {
    return optimizeCdnUrl(path, { width: 1080, quality: 80, format: 'webp' })
  } else {
    return optimizeCdnUrl(path, { width: 1920, quality: 85, format: 'webp' })
  }
}
