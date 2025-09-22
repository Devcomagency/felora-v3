import { useState, useEffect } from 'react'

/**
 * Hook unifié pour gérer les données de profil
 * Remplace la logique dispersée entre dashboard et modal
 *
 * Usage:
 * - Dashboard: useUnifiedProfile('me')
 * - Modal: useUnifiedProfile(profileId)
 */

export interface UnifiedProfileData {
  id: string
  stageName: string
  description: string
  age?: number
  category?: string // escort, masseuse_erotique, dominatrice_bdsm, transsexuel

  // Localisation
  city: string
  canton: string
  address?: string // Dashboard uniquement
  coordinates?: { lat: number; lng: number } // Dashboard uniquement

  // Langues et services
  languages: string[]
  services: string[]
  practices: string[]

  // Services détaillés
  servicesDetailed: {
    classic: string[] // Rapport, French kiss, GFE, etc.
    bdsm: string[] // Domination soft, Fessées, Donjon SM, etc.
    massage: string[] // Tantrique, Érotique, Corps à corps, etc.
  }

  // Tarifs
  rates: {
    oneHour?: number
    twoHours?: number
    overnight?: number
    currency: string
    baseRate?: number // Tarif "À partir de"
  }

  // Physique
  physical: {
    height?: number
    bodyType?: string
    hairColor?: string
    eyeColor?: string
    ethnicity?: string
    bustSize?: string
    breastType?: string // naturel, silicone
    tattoos?: boolean
    piercings?: boolean
    pubicHair?: string // naturel, partiellement_rasee, rasee
    smoker?: boolean
  }

  // Services
  availability: {
    outcall: boolean
    incall: boolean
    availableNow: boolean
    weekendAvailable: boolean
  }

  // Clientèle
  clientele: {
    acceptsCouples: boolean
    acceptsWomen: boolean
    acceptsHandicapped: boolean
    acceptsSeniors: boolean
  }

  // Options de paiement et de lieu
  options: {
    paymentMethods: string[] // Cash, TWINT, Crypto, Visa, etc.
    venueOptions: string[] // Douche à deux, Jacuzzi, Sauna, Climatisation, etc.
    acceptedCurrencies: string[] // CHF, EUR, USD
  }

  // Méta (dashboard uniquement)
  userId?: string
  firstName?: string
  nationality?: string
  originDetails?: string // Origine détaillée
  phoneVisibility?: string
  phoneDisplayType?: string // visible, cache_avec_boutons, messagerie_privee
  minimumDuration?: string
  legacyRates?: string
  legacyAvailability?: string
  rateStructure?: string // Structure tarifs détaillée
  ageVerified?: boolean // Âge certifié
  isVerifiedBadge?: boolean
  profileCompleted?: boolean
  telegram?: {
    connected: boolean
    enabled: boolean
    preference: string
  }
  status?: string
  user?: {
    email: string
    phone?: string
    name?: string
  }
  createdAt?: string
  updatedAt: string
}

interface UseUnifiedProfileReturn {
  profile: UnifiedProfileData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useUnifiedProfile(profileId: string): UseUnifiedProfileReturn {
  const [profile, setProfile] = useState<UnifiedProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/profile/unified/${profileId}`, {
        cache: 'no-store',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Unknown error')
      }

      setProfile(data.profile)
    } catch (err: any) {
      console.error('❌ [useUnifiedProfile] Error:', err)
      setError(err.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profileId) {
      fetchProfile()
    }
  }, [profileId])

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile
  }
}

/**
 * Hook spécialisé pour le dashboard (mode édition)
 */
export function useDashboardProfile() {
  return useUnifiedProfile('me')
}

/**
 * Hook spécialisé pour le modal public (mode lecture)
 */
export function usePublicProfile(profileId: string) {
  return useUnifiedProfile(profileId)
}