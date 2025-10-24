/**
 * URL Validator - Validation et correction des URLs de médias
 * Système robuste pour éviter les URLs undefined
 */

export interface MediaUrlValidation {
  isValid: boolean
  correctedUrl?: string
  error?: string
  fallback?: string
}

export class MediaUrlValidator {
  private static readonly FALLBACK_AVATAR = '/logo-principal.png'
  private static readonly FALLBACK_IMAGE = '/api/placeholder/400x600'
  private static readonly FALLBACK_VIDEO = '/api/placeholder/400x600'

  /**
   * Valide et corrige une URL de média
   */
  static validateUrl(url: string | undefined | null, type: 'avatar' | 'image' | 'video' = 'image'): MediaUrlValidation {
    // Cas 1: URL undefined ou null
    if (!url || url === 'undefined' || url === 'null') {
      return {
        isValid: false,
        error: 'URL undefined ou null',
        fallback: this.getFallbackForType(type)
      }
    }

    // Cas 2: URL commence par "undefined"
    if (url.startsWith('undefined/')) {
      const correctedUrl = url.replace('undefined/', '')
      return {
        isValid: true,
        correctedUrl,
        error: 'URL corrigée (undefined supprimé)'
      }
    }

    // Cas 3: URL invalide (pas d'http/https et pas de slash)
    if (!url.startsWith('http') && !url.startsWith('/')) {
      return {
        isValid: false,
        error: 'URL invalide (pas d\'http ou de slash)',
        fallback: this.getFallbackForType(type)
      }
    }

    // Cas 4: URL valide
    return {
      isValid: true,
      correctedUrl: url
    }
  }

  /**
   * Obtient l'URL de fallback selon le type
   */
  private static getFallbackForType(type: 'avatar' | 'image' | 'video'): string {
    switch (type) {
      case 'avatar':
        return this.FALLBACK_AVATAR
      case 'video':
        return this.FALLBACK_VIDEO
      default:
        return this.FALLBACK_IMAGE
    }
  }

  /**
   * Valide une liste d'URLs de médias
   */
  static validateMediaList(urls: (string | undefined | null)[], type: 'image' | 'video' = 'image'): MediaUrlValidation[] {
    return urls.map(url => this.validateUrl(url, type))
  }

  /**
   * Nettoie une URL (supprime les paramètres de debug)
   */
  static cleanUrl(url: string): string {
    return url.split('?type=')[0].split('?debug=')[0]
  }

  /**
   * Vérifie si une URL est accessible (test basique)
   */
  static async isUrlAccessible(url: string): Promise<boolean> {
    try {
      // Test simple avec fetch (sans CORS)
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors' // Évite les erreurs CORS
      })
      return true // Si pas d'erreur, considéré comme accessible
    } catch {
      return false
    }
  }
}

/**
 * Hook React pour la validation d'URLs
 */
export function useMediaUrlValidation() {
  const validateAndGetUrl = (url: string | undefined | null, type: 'avatar' | 'image' | 'video' = 'image') => {
    const validation = MediaUrlValidator.validateUrl(url, type)
    
    if (validation.isValid && validation.correctedUrl) {
      return validation.correctedUrl
    }
    
    return validation.fallback || MediaUrlValidator.FALLBACK_IMAGE
  }

  return { validateAndGetUrl }
}
