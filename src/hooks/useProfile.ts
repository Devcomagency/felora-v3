'use client'

import { useState, useEffect } from 'react'

interface Profile {
  id: string
  stageName: string
  bio?: string
  city?: string
  canton?: string
  isVerifiedBadge?: boolean
  media: Array<{ id: string; type: 'IMAGE'|'VIDEO'; url: string; thumb?: string }>
  stats?: { likes?: number; views?: number; rating?: number }
  services?: string[]
  languages?: Record<string, number> // { "Français": 5, "Anglais": 3, ... }
  rates?: { rate1H?: number; rate2H?: number; overnight?: number; currency?: string }
  updatedAt: string
}

interface UseProfileReturn {
  profile: Profile | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useProfile(profileId: string): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/public/profile/${profileId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Profil non trouvé')
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setProfile(data)

    } catch (err: any) {
      console.error('Erreur lors du chargement du profil:', err)
      setError(err.message || 'Erreur lors du chargement du profil')
    } finally {
      setIsLoading(false)
    }
  }

  const refresh = () => {
    fetchProfile()
  }

  useEffect(() => {
    if (profileId) {
      fetchProfile()
    }
  }, [profileId])

  return {
    profile,
    isLoading,
    error,
    refresh
  }
}
