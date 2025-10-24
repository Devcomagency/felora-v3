import { useState, useEffect, useCallback } from 'react'

interface MediaViewStats {
  viewCount: number
  loading: boolean
  error: string | null
}

/**
 * Hook pour récupérer et gérer les vues d'un média
 */
export function useMediaViews(mediaId: string): MediaViewStats {
  const [viewCount, setViewCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchViewCount = useCallback(async () => {
    if (!mediaId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/media/views?mediaId=${encodeURIComponent(mediaId)}`)
      const data = await response.json()

      if (data.success) {
        setViewCount(data.viewCount || 0)
      } else {
        setError(data.error || 'Erreur lors du chargement des vues')
      }
    } catch (err) {
      setError('Erreur de connexion')
      console.error('Failed to fetch media views:', err)
    } finally {
      setLoading(false)
    }
  }, [mediaId])

  useEffect(() => {
    fetchViewCount()
  }, [fetchViewCount])

  return { viewCount, loading, error }
}

export default useMediaViews
