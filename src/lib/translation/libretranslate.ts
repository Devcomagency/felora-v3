/**
 * Service de traduction utilisant MyMemory Translation API
 * Gratuit: 1000 requêtes/jour sans clé, 10000/jour avec email
 * Plus fiable et stable que LibreTranslate
 */

// Mapping des codes de langue
const LANG_MAP: Record<string, string> = {
  fr: 'fr',
  en: 'en',
  de: 'de',
  es: 'es',
  it: 'it',
  pt: 'pt',
  ru: 'ru',
  ar: 'ar',
  sq: 'sq'
}

export interface TranslationResult {
  success: boolean
  translatedText?: string
  error?: string
  fromCache?: boolean
}

/**
 * Traduit un texte d'une langue source vers une langue cible
 * @param text - Texte à traduire
 * @param sourceLang - Langue source (code ISO 639-1)
 * @param targetLang - Langue cible (code ISO 639-1)
 * @returns Résultat de la traduction
 */
export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslationResult> {
  // Si même langue, pas besoin de traduire
  if (sourceLang === targetLang) {
    return {
      success: true,
      translatedText: text,
      fromCache: false
    }
  }

  // Validation du texte
  if (!text || text.trim().length === 0) {
    return {
      success: false,
      error: 'Empty text'
    }
  }

  // Mapping des codes de langue
  const sourceCode = LANG_MAP[sourceLang] || sourceLang
  const targetCode = LANG_MAP[targetLang] || targetLang

  try {
    // MyMemory API - GET request avec paramètres dans l'URL
    const url = new URL('https://api.mymemory.translated.net/get')
    url.searchParams.append('q', text)
    url.searchParams.append('langpair', `${sourceCode}|${targetCode}`)
    url.searchParams.append('de', 'contact@felora.ch') // Pour 10000 req/jour au lieu de 1000

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      console.error('[MyMemory] API error:', {
        status: response.status
      })

      return {
        success: false,
        error: `API error: ${response.status}`
      }
    }

    const data = await response.json()

    // MyMemory retourne: { responseData: { translatedText: "..." }, responseStatus: 200 }
    if (data.responseStatus !== 200 || !data.responseData?.translatedText) {
      console.error('[MyMemory] No translated text in response:', data)
      return {
        success: false,
        error: 'No translation returned'
      }
    }

    return {
      success: true,
      translatedText: data.responseData.translatedText,
      fromCache: false
    }
  } catch (error) {
    console.error('[MyMemory] Translation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Détecte la langue d'un texte
 * @param text - Texte à analyser
 * @returns Code de langue détecté ou null en cas d'erreur
 */
export async function detectLanguage(text: string): Promise<string | null> {
  // MyMemory ne supporte pas la détection de langue
  // On pourrait utiliser une autre API pour ça si besoin
  return null
}
