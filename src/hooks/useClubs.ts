import { useState, useEffect, useCallback } from 'react'

export interface Club {
  id: string
  name: string
  handle: string
  avatar: string
  cover: string
  city: string
  description: string
  establishmentType: 'club' | 'salon_erotique' | 'institut_massage' | 'agence_escorte'
  address: string
  openingHours: string
  website: string
  email: string
  phone: string
  verified: boolean
  isActive: boolean
  capacity: number | null
  latitude: number | null
  longitude: number | null
  services: {
    languages: string[]
    services: string[]
    equipments: string[]
    isOpen24_7: boolean
  }
  stats: {
    views: number
    likes: number
    reviews: number
  }
  createdAt: string
  updatedAt: string
}

export interface ClubFilters {
  q?: string
  city?: string
  canton?: string
  establishmentType?: string
  services?: string[]
  languages?: string[]
  status?: string
  sort?: string
  // Filtres étendus pour compatibilité avec SearchFilters
  categories?: string[]
  ageRange?: [number, number]
  heightRange?: [number, number]
  bodyType?: string
  hairColor?: string
  eyeColor?: string
  ethnicity?: string
  breastSize?: string
  hasTattoos?: string
  serviceTypes?: string[]
  specialties?: string[]
  experienceTypes?: string[]
  roleTypes?: string[]
  budgetRange?: [number, number]
  minDuration?: string
  acceptsCards?: boolean
  availability?: string[]
  timeSlots?: string[]
  weekendAvailable?: boolean
  verified?: boolean
  minRating?: number
  minReviews?: number
  premiumContent?: boolean
  liveCam?: boolean
  premiumMessaging?: boolean
  privatePhotos?: boolean
  exclusiveVideos?: boolean
  availableNow?: boolean
  outcall?: boolean
  incall?: boolean
  radius?: number
}

export interface UseClubsReturn {
  clubs: Club[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  total: number
  filters: ClubFilters
  setFilters: (filters: ClubFilters) => void
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
}

export function useClubs(): UseClubsReturn {
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [filters, setFilters] = useState<ClubFilters>({})

  const fetchClubs = useCallback(async (reset = false) => {
    if (isLoading) return

    try {
      setIsLoading(true)
      setError(null)

      const currentOffset = reset ? 0 : offset
      const searchParams = new URLSearchParams({
        limit: '20',
        cursor: currentOffset.toString()
      })

      // Filtres de base
      if (filters.q) searchParams.append('q', filters.q)
      if (filters.city) searchParams.append('city', filters.city)
      if (filters.canton) searchParams.append('canton', filters.canton)
      if (filters.establishmentType) searchParams.append('establishmentType', filters.establishmentType)
      if (filters.services && filters.services.length > 0) searchParams.append('services', filters.services.join(','))
      if (filters.languages && filters.languages.length > 0) searchParams.append('languages', filters.languages.join(','))
      if (filters.status) searchParams.append('status', filters.status)
      if (filters.sort && filters.sort !== 'recent') searchParams.append('sort', filters.sort)
      
      // Filtres étendus
      if (filters.categories && filters.categories.length > 0) searchParams.append('categories', filters.categories.join(','))
      if (filters.verified) searchParams.append('verified', 'true')
      if (filters.weekendAvailable) searchParams.append('weekendAvailable', 'true')
      if (filters.acceptsCards) searchParams.append('acceptsCards', 'true')

      const response = await fetch(`/api/clubs?${searchParams}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement des clubs')
      }

      if (data.success) {
        const newClubs = data.data || []
        
        if (reset) {
          setClubs(newClubs)
        } else {
          setClubs(prev => [...prev, ...newClubs])
        }

        setTotal(data.pagination?.total || 0)
        setHasMore(data.pagination?.hasMore || false)
        setOffset(currentOffset + newClubs.length)
      } else {
        throw new Error(data.error || 'Erreur inconnue')
      }

    } catch (err) {
      console.error('Erreur fetch clubs:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }, [filters, offset, isLoading])

  const loadMore = useCallback(async () => {
    if (hasMore && !isLoading) {
      await fetchClubs(false)
    }
  }, [hasMore, isLoading, fetchClubs])

  const refresh = useCallback(async () => {
    setOffset(0)
    setHasMore(true)
    await fetchClubs(true)
  }, [fetchClubs])

  // Effect pour charger les clubs quand les filtres changent (incluant le montage initial)
  const categoriesKey = filters.categories?.join(',') || ''
  useEffect(() => {
    console.log('[useClubs] Filters changed, fetching clubs:', filters)
    setOffset(0)
    setHasMore(true)
    fetchClubs(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.city, filters.canton, filters.sort, filters.establishmentType, categoriesKey])


  return {
    clubs,
    isLoading,
    error,
    hasMore,
    total,
    filters,
    setFilters,
    loadMore,
    refresh
  }
}
