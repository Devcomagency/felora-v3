import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import { cookies } from 'next/headers'

export default getRequestConfig(async ({ requestLocale }) => {
  // Lire la locale depuis le cookie NEXT_LOCALE
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value

  // Priorité : cookie > requestLocale > default
  let locale = cookieLocale || (await requestLocale) || routing.defaultLocale

  // Vérifier que la locale est valide, sinon utiliser la locale par défaut
  if (!routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})

