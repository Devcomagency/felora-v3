/**
 * Hook pour tracker les vues facilement dans les composants
 */

import { useCallback, useEffect, useState } from 'react'
import { ViewStats, ViewType } from '@/lib/analytics/viewTracker'

interface UseViewTrackerOptions {
  targetId: string
  viewType: ViewType
  autoTrack?: boolean // Track automatiquement au mount
  enabled?: boolean // Permet de désactiver temporairement
}

interface UseViewTrackerReturn {
  stats: ViewStats | null
  loading: boolean
  trackView: () => Promise<void>
  refreshStats: () => Promise<void>
}

export function useViewTracker({
  targetId,
  viewType,
  autoTrack = false,
  enabled = true
}: UseViewTrackerOptions): UseViewTrackerReturn {
  const [stats, setStats] = useState<ViewStats | null>(null)
  const [loading, setLoading] = useState(false)

  // Fonction pour tracker une vue
  const trackView = useCallback(async () => {
    if (!enabled || !targetId) return

    try {
      setLoading(true)
      
      const response = await fetch('/api/analytics/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, viewType })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats(data.stats)
        }
      }
    } catch (error) {
      console.error('Failed to track view:', error)
    } finally {
      setLoading(false)
    }
  }, [targetId, viewType, enabled])

  // Fonction pour rafraîchir les stats
  const refreshStats = useCallback(async () => {
    if (!enabled || !targetId) return

    try {
      setLoading(true)
      
      const response = await fetch(`/api/analytics/track-view?targetId=${targetId}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats(data.stats)
        }
      }
    } catch (error) {
      console.error('Failed to get view stats:', error)
    } finally {
      setLoading(false)
    }
  }, [targetId, enabled])

  // Auto-track au mount si demandé
  useEffect(() => {
    if (autoTrack && enabled && targetId) {
      trackView()
    }
  }, [autoTrack, enabled, targetId, trackView])

  // Charger les stats initiales
  useEffect(() => {
    if (enabled && targetId) {
      refreshStats()
    }
  }, [enabled, targetId, refreshStats])

  return {
    stats,
    loading,
    trackView,
    refreshStats
  }
}

/**
 * Hook spécialisé pour tracker les vues de profil
 */
export function useProfileViewTracker(profileId: string, autoTrack: boolean = true) {
  return useViewTracker({
    targetId: profileId,
    viewType: 'profile',
    autoTrack,
    enabled: !!profileId
  })
}

/**
 * Hook spécialisé pour tracker les vues de média
 */
export function useMediaViewTracker(mediaId: string) {
  return useViewTracker({
    targetId: mediaId,
    viewType: 'media',
    autoTrack: false, // On track manuellement quand l'user regarde
    enabled: !!mediaId
  })
}

/**
 * Hook spécialisé pour tracker les vues de story (futur)
 */
export function useStoryViewTracker(storyId: string) {
  return useViewTracker({
    targetId: storyId,
    viewType: 'story',
    autoTrack: false,
    enabled: !!storyId
  })
}