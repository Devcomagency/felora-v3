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

  // Photo de profil
  avatar?: string // URL de la photo de profil

  // Localisation
  city: string
  canton: string
  address?: string // Dashboard uniquement
  coordinates?: { lat: number; lng: number } // Dashboard uniquement

  // Langues et services
  languages: Record<string, number> // { "Français": 5, "Anglais": 3, ... }
  services: string[]

  // Services détaillés supprimés (pour éviter doublons avec services principal)

  // Tarifs
  rates: {
    fifteenMin?: number
    thirtyMin?: number
    oneHour?: number
    twoHours?: number
    halfDay?: number
    fullDay?: number
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

  // Options de paiement et équipements
  options: {
    paymentMethods: string[] // Cash, TWINT, Crypto, Visa, etc.
    amenities: string[] // Équipements du lieu : Douche à deux, Jacuzzi, Sauna, Climatisation, etc.
    acceptedCurrencies: string[] // CHF, EUR, USD
  }

  // Contact et visibilité téléphone
  contact?: {
    phoneVisibility: string // 'visible', 'hidden', 'private'
    phoneDisplayType: string // 'visible', 'hidden', 'private_messaging'
    phone?: string // Numéro de téléphone depuis user.phone
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

  // Tarifs personnalisés et blocage géographique (commun pour dashboard et public)
  customPrices?: any[]
  blockedCountries?: string[]
}

interface UseUnifiedProfileReturn {
  profile: UnifiedProfileData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  save: (data: Partial<UnifiedProfileData>) => Promise<boolean>
  saving: boolean
}

export function useUnifiedProfile(profileId: string): UseUnifiedProfileReturn {
  const [profile, setProfile] = useState<UnifiedProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

      // Transform contact data for compatibility
      const profileData = data.profile
      // Ne pas transformer 'none' car c'est maintenant la valeur correcte

      // Debug: Logger les services et avatar
      console.log('🔍 [useUnifiedProfile] Data from API:', {
        services: profileData.services,
        servicesLength: profileData.services?.length,
        avatar: profileData.avatar,
        profilePhoto: profileData.profilePhoto,
        isVerifiedBadge: profileData.isVerifiedBadge,
        profileId
      })

      setProfile(profileData)
    } catch (err: any) {
      console.error('❌ [useUnifiedProfile] Error:', err)
      setError(err.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async (data: Partial<UnifiedProfileData>): Promise<boolean> => {
    // Seul le mode dashboard permet la sauvegarde
    if (profileId !== 'me') {
      console.error('❌ [useUnifiedProfile] Save only allowed in dashboard mode')
      return false
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/profile/unified/${profileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erreur de sauvegarde')
      }

      // Recharger le profil après sauvegarde
      await fetchProfile()
      return true

    } catch (err: any) {
      console.error('❌ [useUnifiedProfile] Save error:', err)
      setError(err.message || 'Erreur de sauvegarde')
      return false
    } finally {
      setSaving(false)
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
    refetch: fetchProfile,
    save: saveProfile,
    saving
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