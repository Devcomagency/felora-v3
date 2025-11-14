import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  // Détecter la locale depuis l'URL ou les headers
  let locale = await requestLocale

  // Vérifier que la locale est valide, sinon utiliser la locale par défaut
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})

