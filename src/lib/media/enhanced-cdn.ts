/**
 * Enhanced CDN Manager - Gestion améliorée des URLs de médias
 * Version robuste avec fallbacks et validation
 */

import { MediaUrlValidator } from './url-validator'

export interface CDNConfig {
  baseUrl: string
  fallbackUrl: string
  enableValidation: boolean
  enableRetry: boolean
  maxRetries: number
}

export class EnhancedCDNManager {
  private static instance: EnhancedCDNManager
  private config: CDNConfig

  private constructor() {
    this.config = {
      baseUrl: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || process.env.CLOUDFLARE_R2_PUBLIC_URL || '',
      fallbackUrl: '/api/placeholder/400x600',
      enableValidation: true,
      enableRetry: true,
      maxRetries: 3
    }
  }

  static getInstance(): EnhancedCDNManager {
    if (!EnhancedCDNManager.instance) {
      EnhancedCDNManager.instance = new EnhancedCDNManager()
    }
    return EnhancedCDNManager.instance
  }

  /**
   * Obtient l'URL de base du CDN avec validation
   */
  getBaseUrl(): string {
    if (!this.config.baseUrl) {
      console.warn('⚠️ CDN base URL not configured, using fallback')
      return this.config.fallbackUrl
    }
    return this.config.baseUrl
  }

  /**
   * Construit une URL complète pour un média
   */
  buildMediaUrl(key: string, type: 'avatar' | 'image' | 'video' = 'image'): string {
    // Validation de la clé
    if (!key || key === 'undefined' || key.startsWith('undefined/')) {
      console.warn('⚠️ Invalid media key:', key)
      return this.getFallbackUrl(type)
    }

    // Nettoyage de la clé
    const cleanKey = key.startsWith('undefined/') ? key.replace('undefined/', '') : key
    
    // Construction de l'URL
    const baseUrl = this.getBaseUrl()
    const fullUrl = `${baseUrl}/${cleanKey}`

    // Validation de l'URL finale
    if (this.config.enableValidation) {
      const validation = MediaUrlValidator.validateUrl(fullUrl, type)
      if (!validation.isValid) {
        console.warn('⚠️ Invalid media URL:', fullUrl, validation.error)
        return validation.fallback || this.getFallbackUrl(type)
      }
      return validation.correctedUrl || fullUrl
    }

    return fullUrl
  }

  /**
   * Obtient l'URL de fallback selon le type
   */
  private getFallbackUrl(type: 'avatar' | 'image' | 'video'): string {
    switch (type) {
      case 'avatar':
        return '/logo-principal.png'
      case 'video':
        return '/api/placeholder/400x600'
      default:
        return '/api/placeholder/400x600'
    }
  }

  /**
   * Valide et corrige une URL existante
   */
  validateAndFixUrl(url: string | undefined | null, type: 'avatar' | 'image' | 'video' = 'image'): string {
    if (!url) {
      return this.getFallbackUrl(type)
    }

    const validation = MediaUrlValidator.validateUrl(url, type)
    
    if (validation.isValid && validation.correctedUrl) {
      return validation.correctedUrl
    }

    return validation.fallback || this.getFallbackUrl(type)
  }

  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig: Partial<CDNConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Obtient la configuration actuelle
   */
  getConfig(): CDNConfig {
    return { ...this.config }
  }

  /**
   * Teste la connectivité du CDN
   */
  async testConnectivity(): Promise<boolean> {
    try {
      const testUrl = `${this.getBaseUrl()}/test`
      const response = await fetch(testUrl, { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }
}

// Instance singleton
export const enhancedCDN = EnhancedCDNManager.getInstance()

// Fonctions utilitaires pour compatibilité
export const getMediaUrl = (key: string, type: 'avatar' | 'image' | 'video' = 'image') => {
  return enhancedCDN.buildMediaUrl(key, type)
}

export const validateMediaUrl = (url: string | undefined | null, type: 'avatar' | 'image' | 'video' = 'image') => {
  return enhancedCDN.validateAndFixUrl(url, type)
}
