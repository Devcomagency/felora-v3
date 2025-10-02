/**
 * Utilitaires pour gérer la compatibilité entre les anciens et nouveaux formats de langues
 */

// Type pour les langues (ancien format: array, nouveau format: object avec étoiles)
export type LanguagesData = string[] | Record<string, number>

/**
 * Convertit les langues en array de strings (pour l'affichage simple)
 * Compatible avec les deux formats
 */
export function getLanguagesArray(languages: LanguagesData | undefined | null): string[] {
  if (!languages) return []
  
  if (Array.isArray(languages)) {
    return languages
  }
  
  if (typeof languages === 'object') {
    return Object.keys(languages)
  }
  
  return []
}

/**
 * Convertit les langues en objet avec étoiles (pour l'affichage avec étoiles)
 * Compatible avec les deux formats
 */
export function getLanguagesWithStars(languages: LanguagesData | undefined | null): Record<string, number> {
  if (!languages) return {}
  
  if (Array.isArray(languages)) {
    const result: Record<string, number> = {}
    languages.forEach(lang => {
      result[lang] = 5 // Par défaut 5 étoiles pour les langues existantes
    })
    return result
  }
  
  if (typeof languages === 'object') {
    return languages
  }
  
  return {}
}

/**
 * Vérifie si une langue est sélectionnée (compatible avec les deux formats)
 */
export function isLanguageSelected(languages: LanguagesData | undefined | null, language: string): boolean {
  if (!languages) return false
  
  if (Array.isArray(languages)) {
    return languages.includes(language)
  }
  
  if (typeof languages === 'object') {
    return language in languages && languages[language] > 0
  }
  
  return false
}

/**
 * Obtient le nombre d'étoiles pour une langue (compatible avec les deux formats)
 */
export function getLanguageRating(languages: LanguagesData | undefined | null, language: string): number {
  if (!languages) return 0
  
  if (Array.isArray(languages)) {
    return languages.includes(language) ? 5 : 0
  }
  
  if (typeof languages === 'object') {
    return languages[language] || 0
  }
  
  return 0
}
