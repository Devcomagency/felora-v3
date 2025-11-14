import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  // Liste des langues supportées
  locales: ['fr', 'en', 'de', 'it', 'es'],
  
  // Langue par défaut
  defaultLocale: 'fr',
  
  // Préfixe de locale dans l'URL
  // 'as-needed': /search (fr par défaut), /en/search, /de/search
  // 'always': /fr/search, /en/search, /de/search
  localePrefix: 'as-needed'
})

// Navigation typée avec support des locales
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)

