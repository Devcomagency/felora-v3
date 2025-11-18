import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'

export type EntityType =
  | 'profile_bio'
  | 'profile_description'
  | 'chat_message'
  | 'post_caption'
  | 'review_text'

interface UseTranslatedTextOptions {
  entityId: string
  entityType: EntityType
  text: string
  sourceLang: string
  enabled?: boolean // Permet de désactiver la traduction
}

interface UseTranslatedTextResult {
  translatedText: string
  isTranslating: boolean
  error: string | null
  fromCache: boolean
}

/**
 * Hook pour traduire automatiquement du texte selon la langue de l'utilisateur
 *
 * @example
 * const { translatedText, isTranslating } = useTranslatedText({
 *   entityId: profile.id,
 *   entityType: 'profile_bio',
 *   text: profile.bio,
 *   sourceLang: 'fr'
 * })
 */
export function useTranslatedText({
  entityId,
  entityType,
  text,
  sourceLang,
  enabled = true
}: UseTranslatedTextOptions): UseTranslatedTextResult {
  const locale = useLocale()
  const [translatedText, setTranslatedText] = useState<string>(text)
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fromCache, setFromCache] = useState(false)

  useEffect(() => {
    // Debug logs
    console.log('[useTranslatedText] Hook called:', {
      entityId,
      entityType,
      sourceLang,
      targetLang: locale,
      textLength: text?.length || 0,
      enabled
    })

    // Si traduction désactivée, retourner le texte original
    if (!enabled) {
      console.log('[useTranslatedText] Translation disabled')
      setTranslatedText(text)
      return
    }

    // Si même langue ou texte vide, pas besoin de traduire
    if (sourceLang === locale || !text || text.trim().length === 0) {
      console.log('[useTranslatedText] No translation needed:', { sourceLang, locale, hasText: !!text })
      setTranslatedText(text)
      setIsTranslating(false)
      setFromCache(false)
      return
    }

    let cancelled = false

    const translateText = async () => {
      console.log('[useTranslatedText] Starting translation...', { entityId, entityType, sourceLang, targetLang: locale })
      setIsTranslating(true)
      setError(null)

      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            entityId,
            entityType,
            text,
            sourceLang,
            targetLang: locale
          })
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()

        if (cancelled) return

        if (data.success && data.translatedText) {
          console.log('[useTranslatedText] Translation successful!', { fromCache: data.fromCache, textLength: data.translatedText.length })
          setTranslatedText(data.translatedText)
          setFromCache(data.fromCache || false)
          setError(null)
        } else {
          // En cas d'échec, afficher le texte original
          setTranslatedText(text)
          setError(data.error || 'Translation failed')
        }
      } catch (err) {
        if (cancelled) return

        // En cas d'erreur, afficher le texte original
        setTranslatedText(text)
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('[useTranslatedText] Error:', err)
      } finally {
        if (!cancelled) {
          setIsTranslating(false)
        }
      }
    }

    translateText()

    return () => {
      cancelled = true
    }
  }, [entityId, entityType, text, sourceLang, locale, enabled])

  return {
    translatedText,
    isTranslating,
    error,
    fromCache
  }
}
