/**
 * Service de cache de traductions avec Prisma
 * Évite de re-traduire les mêmes textes
 */

import { prisma } from '@/lib/prisma'
import { translateText, type TranslationResult } from './libretranslate'

export type EntityType =
  | 'profile_bio'
  | 'profile_description'
  | 'chat_message'
  | 'post_caption'
  | 'review_text'

/**
 * Récupère une traduction depuis le cache ou traduit et met en cache
 * @param entityId - ID de l'entité à traduire
 * @param entityType - Type d'entité
 * @param sourceText - Texte source
 * @param sourceLang - Langue source
 * @param targetLang - Langue cible
 * @returns Résultat de la traduction
 */
export async function getOrCreateTranslation(
  entityId: string,
  entityType: EntityType,
  sourceText: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslationResult> {
  // Si même langue, retourner le texte original
  if (sourceLang === targetLang) {
    return {
      success: true,
      translatedText: sourceText,
      fromCache: false
    }
  }

  // Texte vide
  if (!sourceText || sourceText.trim().length === 0) {
    return {
      success: true,
      translatedText: sourceText,
      fromCache: false
    }
  }

  try {
    // 1. Chercher dans le cache
    const cached = await prisma.translation.findUnique({
      where: {
        entityId_entityType_sourceLang_targetLang: {
          entityId,
          entityType,
          sourceLang,
          targetLang
        }
      }
    })

    // Si trouvé en cache et le texte source n'a pas changé
    if (cached && cached.sourceText === sourceText) {
      // Mettre à jour lastUsedAt
      await prisma.translation.update({
        where: { id: cached.id },
        data: { lastUsedAt: new Date() }
      }).catch(() => {}) // Ne pas bloquer si échec

      return {
        success: true,
        translatedText: cached.translatedText,
        fromCache: true
      }
    }

    // 2. Si pas en cache ou texte modifié, traduire
    const result = await translateText(sourceText, sourceLang, targetLang)

    if (!result.success || !result.translatedText) {
      // En cas d'échec, retourner le texte original
      return {
        success: false,
        translatedText: sourceText,
        error: result.error || 'Translation failed'
      }
    }

    // 3. Sauvegarder en cache
    try {
      await prisma.translation.upsert({
        where: {
          entityId_entityType_sourceLang_targetLang: {
            entityId,
            entityType,
            sourceLang,
            targetLang
          }
        },
        create: {
          entityId,
          entityType,
          sourceLang,
          sourceText,
          targetLang,
          translatedText: result.translatedText,
          lastUsedAt: new Date()
        },
        update: {
          sourceText,
          translatedText: result.translatedText,
          lastUsedAt: new Date()
        }
      })
    } catch (cacheError) {
      // Si erreur de cache, continuer quand même
      console.error('[TranslationCache] Cache save error:', cacheError)
    }

    return {
      success: true,
      translatedText: result.translatedText,
      fromCache: false
    }
  } catch (error) {
    console.error('[TranslationCache] Error:', error)
    // En cas d'erreur, retourner le texte original
    return {
      success: false,
      translatedText: sourceText,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Invalide le cache pour une entité spécifique
 * Utile quand le texte source change
 */
export async function invalidateTranslationCache(
  entityId: string,
  entityType: EntityType
): Promise<void> {
  try {
    await prisma.translation.deleteMany({
      where: {
        entityId,
        entityType
      }
    })
  } catch (error) {
    console.error('[TranslationCache] Invalidation error:', error)
  }
}

/**
 * Nettoie les traductions anciennes (plus de 90 jours sans utilisation)
 * À exécuter périodiquement (cron job)
 */
export async function cleanOldTranslations(): Promise<number> {
  try {
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const result = await prisma.translation.deleteMany({
      where: {
        lastUsedAt: {
          lt: ninetyDaysAgo
        }
      }
    })

    return result.count
  } catch (error) {
    console.error('[TranslationCache] Cleanup error:', error)
    return 0
  }
}
