/**
 * Service de traduction utilisant LibreTranslate
 * API gratuite et open source
 */

// URL de l'API LibreTranslate - Instance allemande gratuite (pas de clé requise)
// Alternative: https://translate.argosopentech.com/translate
const LIBRETRANSLATE_API = 'https://libretranslate.de/translate'

// Mapping des codes de langue next-intl vers LibreTranslate
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
    const response = await fetch(LIBRETRANSLATE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceCode,
        target: targetCode,
        format: 'text'
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[LibreTranslate] API error:', {
        status: response.status,
        error: errorData
      })

      return {
        success: false,
        error: `API error: ${response.status}`
      }
    }

    const data = await response.json()

    if (!data.translatedText) {
      console.error('[LibreTranslate] No translated text in response:', data)
      return {
        success: false,
        error: 'No translation returned'
      }
    }

    return {
      success: true,
      translatedText: data.translatedText,
      fromCache: false
    }
  } catch (error) {
    console.error('[LibreTranslate] Translation error:', error)
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
  if (!text || text.trim().length === 0) {
    return null
  }

  try {
    const response = await fetch('https://libretranslate.de/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text
      })
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    // L'API retourne un tableau de langues détectées avec leur confiance
    if (Array.isArray(data) && data.length > 0) {
      return data[0].language
    }

    return null
  } catch (error) {
    console.error('[LibreTranslate] Language detection error:', error)
    return null
  }
}
