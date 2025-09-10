import { useEffect, useRef } from 'react'

interface UseViewTrackerOptions {
  profileId: string
  profileType: 'escort' | 'club'
  enabled?: boolean
}

export function useViewTracker({ profileId, profileType, enabled = true }: UseViewTrackerOptions) {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (!enabled || !profileId || hasTracked.current) return

    const trackView = async () => {
      try {
        await fetch('/api/analytics/track-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profileId,
            profileType
          })
        })
        hasTracked.current = true
      } catch (error) {
        console.error('Erreur tracking vue:', error)
      }
    }

    // Délai pour éviter les vues multiples rapides
    const timeout = setTimeout(trackView, 1000)
    
    return () => clearTimeout(timeout)
  }, [profileId, profileType, enabled])
}

export const useProfileViewTracker = useViewTracker
export default useViewTracker