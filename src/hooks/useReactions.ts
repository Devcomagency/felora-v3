import { useState, useEffect } from 'react'

export type ReactionType = 'LIKE' | 'LOVE' | 'FIRE' | 'WOW' | 'SMILE'

interface ReactionStats {
  reactions: Record<string, number>
  total: number
}

interface UseReactionsOptions {
  mediaId: string
  userId?: string
}

export function useReactions({ mediaId, userId }: UseReactionsOptions) {
  const [stats, setStats] = useState<ReactionStats>({ reactions: {}, total: 0 })
  const [userHasLiked, setUserHasLiked] = useState(false)
  const [userReactions, setUserReactions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const fetchStats = async () => {
    if (!mediaId) return

    try {
      const params = new URLSearchParams({ mediaId })
      if (userId) params.append('userId', userId)

      const response = await fetch(`/api/reactions?${params}`)
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
        setUserHasLiked(data.userHasLiked)
        setUserReactions(data.userReactions)
      }
    } catch (error) {
      console.error('Erreur récupération réactions:', error)
    }
  }

  const addReaction = async (type: ReactionType) => {
    if (!mediaId || !userId || loading) return

    setLoading(true)
    try {
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaId,
          userId,
          type,
          meta: {
            ownerType: 'ESCORT',
            ownerId: 'unknown',
            type: 'IMAGE',
            url: `media:${mediaId}`
          }
        })
      })

      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
        setUserHasLiked(data.userHasLiked)
        setUserReactions(data.userReactions)
      }
    } catch (error) {
      console.error('Erreur ajout réaction:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [mediaId, userId])

  return {
    stats,
    userHasLiked,
    userReactions,
    loading,
    addReaction,
    refetch: fetchStats
  }
}

export default useReactions