'use client'

import { useCallback, useEffect, useState } from 'react'
import { getEffectiveUserId } from '@/lib/guestId'

/**
 * 🎯 HOOK RÉACTIONS UNIFIÉ - VERSION 2.0
 *
 * Gère les likes et réactions pour tous les types de médias
 * (Escort, Club, Feed)
 *
 * Gère automatiquement:
 * - Utilisateurs authentifiés
 * - Utilisateurs invités (guest_xxx via localStorage)
 */

export type ReactionType = 'LIKE' | 'LOVE' | 'FIRE' | 'WOW' | 'SMILE'

interface Stats {
  reactions: Record<ReactionType, number>
  total: number
}

interface UseReactionsReturn {
  stats: Stats
  userHasLiked: boolean
  userReactions: string[]
  loading: boolean
  error: string | null
  toggleReaction: (type: ReactionType) => Promise<void>
}

/**
 * Hook principal pour gérer les réactions d'un média
 *
 * @param mediaId - ID du média (généré par stableMediaId)
 * @param authenticatedUserId - ID de l'utilisateur connecté (optionnel, génère un guest sinon)
 * @param refreshTrigger - Nombre pour forcer un refresh (optionnel)
 */
export function useReactions(
  mediaId: string,
  authenticatedUserId?: string | null,
  refreshTrigger?: number
): UseReactionsReturn {

  // État
  const [stats, setStats] = useState<Stats>({
    reactions: { LIKE: 0, LOVE: 0, FIRE: 0, WOW: 0, SMILE: 0 },
    total: 0
  })
  const [userHasLiked, setUserHasLiked] = useState(false)
  const [userReactions, setUserReactions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)

  // Récupérer l'userId effectif (authentifié ou guest)
  const [effectiveUserId, setEffectiveUserId] = useState<string>('')

  useEffect(() => {
    // Client-side only
    if (typeof window !== 'undefined') {
      const userId = getEffectiveUserId(authenticatedUserId)
      setEffectiveUserId(userId)
      console.log('[useReactions] UserId effectif:', userId, '(authenticated:', authenticatedUserId, ')')
    }
  }, [authenticatedUserId])

  // Fetch initial des stats
  useEffect(() => {
    if (!mediaId || !effectiveUserId) return

    const fetchStats = async () => {
      try {
        const url = `/api/reactions?mediaId=${encodeURIComponent(mediaId)}&userId=${encodeURIComponent(effectiveUserId)}`
        console.log('[useReactions] Fetching stats:', url)

        const res = await fetch(url, { cache: 'no-store' })
        const data = await res.json()

        if (data.success) {
          console.log('[useReactions] Stats reçues:', data)
          setStats(data.stats || { reactions: { LIKE: 0, LOVE: 0, FIRE: 0, WOW: 0, SMILE: 0 }, total: 0 })
          setUserHasLiked(data.userHasLiked || false)
          setUserReactions(data.userReactions || [])
        } else {
          console.error('[useReactions] Erreur:', data.error)
        }
      } catch (err) {
        console.error('[useReactions] Fetch error:', err)
      }
    }

    fetchStats()
  }, [mediaId, effectiveUserId, refreshTrigger])

  // Toggle une réaction
  const toggleReaction = useCallback(async (type: ReactionType) => {
    if (!mediaId) {
      console.warn('[useReactions] toggleReaction: pas de mediaId')
      return
    }

    if (!effectiveUserId) {
      console.warn('[useReactions] toggleReaction: pas de userId')
      setError('Chargement en cours...')
      return
    }

    if (posting) {
      console.warn('[useReactions] toggleReaction: déjà en cours')
      return
    }

    console.log(`[useReactions] Toggle ${type} pour ${mediaId}`)
    setPosting(true)
    setError(null)

    // Optimistic update
    const prevStats = { ...stats }
    const prevLiked = userHasLiked
    const prevReactions = [...userReactions]

    if (type === 'LIKE') {
      const nextLiked = !userHasLiked
      setUserHasLiked(nextLiked)

      setStats(s => {
        const newStats = { ...s, reactions: { ...s.reactions } }
        newStats.reactions.LIKE = Math.max(0, (s.reactions.LIKE || 0) + (nextLiked ? 1 : -1))
        newStats.total = Object.values(newStats.reactions).reduce((a, b) => a + b, 0)
        return newStats
      })
    } else {
      const had = userReactions.includes(type)

      setStats(s => {
        const newStats = { ...s, reactions: { ...s.reactions } }

        if (had) {
          // Toggle OFF
          newStats.reactions[type] = Math.max(0, (s.reactions[type] || 0) - 1)
          setUserReactions([])
        } else {
          // Toggle ON : retirer l'ancienne et ajouter la nouvelle
          if (userReactions.length > 0) {
            userReactions.forEach(oldType => {
              if (oldType !== 'LIKE') {
                newStats.reactions[oldType as ReactionType] = Math.max(0, (s.reactions[oldType as ReactionType] || 0) - 1)
              }
            })
          }
          newStats.reactions[type] = (s.reactions[type] || 0) + 1
          setUserReactions([type])
        }

        newStats.total = Object.values(newStats.reactions).reduce((a, b) => a + b, 0)
        return newStats
      })
    }

    // Appel API
    try {
      setLoading(true)

      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaId,
          userId: effectiveUserId,
          type: type.toUpperCase()
        })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors du toggle')
      }

      // Mettre à jour avec les vraies stats du serveur
      console.log('[useReactions] Stats serveur:', data)
      setStats(data.stats)
      setUserHasLiked(data.userHasLiked)
      setUserReactions(data.userReactions)

    } catch (err: any) {
      console.error('[useReactions] Erreur toggle:', err)

      // Rollback optimistic update
      setStats(prevStats)
      setUserHasLiked(prevLiked)
      setUserReactions(prevReactions)
      setError(err.message || 'Erreur')

    } finally {
      setLoading(false)
      setPosting(false)
    }

  }, [mediaId, effectiveUserId, stats, userHasLiked, userReactions, posting])

  return {
    stats,
    userHasLiked,
    userReactions,
    loading,
    error,
    toggleReaction
  }
}

export default useReactions
