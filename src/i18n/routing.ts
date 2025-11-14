import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

/**
 * Configuration des langues supportées
 * 
 * Langues principales (Suisse) :
 * - fr: Français (défaut)
 * - de: Deutsch (Allemand)
 * - it: Italiano (Italien)
 * 
 * Langues internationales :
 * - en: English (Anglais)
 * - es: Español (Espagnol)
 * - ru: Русский (Russe)
 * - ar: العربية (Arabe)
 * 
 * Langues additionnelles (communautés importantes en Suisse) :
 * - pt: Português (Portugais)
 * - sq: Shqip (Albanais)
 */
export const routing = defineRouting({
  // Liste des langues supportées (9 langues)
  locales: ['fr', 'de', 'it', 'en', 'es', 'ru', 'ar', 'pt', 'sq'],
  
  // Langue par défaut (Français pour la Suisse)
  defaultLocale: 'fr',
  
  // Préfixe de locale dans l'URL
  // 'as-needed': /search (fr par défaut), /en/search, /de/search
  // 'always': /fr/search, /en/search, /de/search
  localePrefix: 'as-needed'
})

// Navigation typée avec support des locales
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)

/**
 * Métadonnées des langues pour l'UI
 */
export const languageMetadata = {
  fr: { label: 'Français', flag: '🇫🇷', native: 'Français', rtl: false },
  de: { label: 'Deutsch', flag: '🇩🇪', native: 'Deutsch', rtl: false },
  it: { label: 'Italiano', flag: '🇮🇹', native: 'Italiano', rtl: false },
  en: { label: 'English', flag: '🇬🇧', native: 'English', rtl: false },
  es: { label: 'Español', flag: '🇪🇸', native: 'Español', rtl: false },
  ru: { label: 'Русский', flag: '🇷🇺', native: 'Русский', rtl: false },
  ar: { label: 'العربية', flag: '🇸🇦', native: 'العربية', rtl: true },
  pt: { label: 'Português', flag: '🇵🇹', native: 'Português', rtl: false },
  sq: { label: 'Shqip', flag: '🇦🇱', native: 'Shqip', rtl: false }
} as const

