'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface SearchFilters {
  q: string
  city: string
  canton: string
  services: string[]
  languages: string[]
  status: string
  sort: string
  // Nouveaux filtres V2
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

interface Escort {
  id: string
  stageName: string
  age?: number
  city?: string
  canton?: string
  isVerifiedBadge?: boolean
  isActive?: boolean
  profilePhoto?: string
  heroMedia?: { type: 'IMAGE'|'VIDEO'; url: string; thumb?: string }
  languages?: string[]
  services?: string[]
  rate1H?: number
  rate2H?: number
  rateOvernight?: number
  latitude?: number
  longitude?: number
  updatedAt: string
  // Nouveaux champs V2
  height?: number
  bodyType?: string
  hairColor?: string
  eyeColor?: string
  ethnicity?: string
  bustSize?: string
  tattoos?: string
  piercings?: string
  availableNow?: boolean
  outcall?: boolean
  incall?: boolean
  weekendAvailable?: boolean
  hasPrivatePhotos?: boolean
  hasPrivateVideos?: boolean
  hasWebcamLive?: boolean
  messagingPreference?: string
  minimumDuration?: string
  acceptsCards?: boolean
  rating?: number
  reviewCount?: number
  views?: number
  likes?: number
  status?: string
}

interface SearchResponse {
  items: Escort[]
  nextCursor?: string
  total?: number
}

interface UseSearchReturn {
  escorts: Escort[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  total: number
  filters: SearchFilters
  setFilters: (filters: SearchFilters) => void
  loadMore: () => void
  refresh: () => void
}

export function useSearch(): UseSearchReturn {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [escorts, setEscorts] = useState<Escort[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [nextCursor, setNextCursor] = useState<string | undefined>()

  const abortControllerRef = useRef<AbortController | null>(null)

  // Parse URL params and initialize filters (synchronously on mount)
  const initialFilters: SearchFilters = {
    q: searchParams.get('q') || '',
    city: searchParams.get('city') || '',
    canton: searchParams.get('canton') || '',
    services: searchParams.get('services')?.split(',').filter(Boolean) || [],
    languages: searchParams.get('languages')?.split(',').filter(Boolean) || [],
    status: searchParams.get('status') || '',
    sort: searchParams.get('sort') || 'recent',
    categories: searchParams.get('categories')?.split(',').filter(Boolean) || []
  }

  const [filters, setFiltersState] = useState<SearchFilters>(initialFilters)

  // Update URL when filters change
  const updateURL = useCallback((newFilters: SearchFilters) => {
    const params = new URLSearchParams()

    if (newFilters.q) params.set('q', newFilters.q)
    if (newFilters.city) params.set('city', newFilters.city)
    if (newFilters.canton) params.set('canton', newFilters.canton)
    if (newFilters.services && newFilters.services.length > 0) params.set('services', newFilters.services.join(','))
    if (newFilters.languages && newFilters.languages.length > 0) params.set('languages', newFilters.languages.join(','))
    if (newFilters.status) params.set('status', newFilters.status)
    if (newFilters.sort !== 'recent') params.set('sort', newFilters.sort)
    // Ajouter categories dans URL
    if (newFilters.categories && newFilters.categories.length > 0) params.set('categories', newFilters.categories.join(','))

    const newURL = params.toString() ? `?${params.toString()}` : ''
    router.replace(`/search${newURL}`, { scroll: false })
  }, [router])

  // Build API query string
  const buildQueryString = useCallback((filters: SearchFilters, cursor?: string) => {
    const params = new URLSearchParams()

    // Filtres de base
    if (filters.q) params.set('q', filters.q)
    if (filters.city) params.set('city', filters.city)
    if (filters.canton) params.set('canton', filters.canton)
    if (filters.services && filters.services.length > 0) params.set('services', filters.services.join(','))
    if (filters.languages && filters.languages.length > 0) params.set('languages', filters.languages.join(','))
    if (filters.status) params.set('status', filters.status)
    if (filters.sort !== 'recent') params.set('sort', filters.sort)

    // Nouveaux filtres V2
    if (filters.categories && filters.categories.length > 0) {
      console.log('[useSearch] 🔍 Adding categories to query:', filters.categories)
      params.set('categories', filters.categories.join(','))
    }
    if (filters.ageRange) {
      params.set('ageMin', filters.ageRange[0].toString())
      params.set('ageMax', filters.ageRange[1].toString())
    }
    if (filters.heightRange) {
      params.set('heightMin', filters.heightRange[0].toString())
      params.set('heightMax', filters.heightRange[1].toString())
    }
    if (filters.bodyType) params.set('bodyType', filters.bodyType)
    if (filters.hairColor) params.set('hairColor', filters.hairColor)
    if (filters.eyeColor) params.set('eyeColor', filters.eyeColor)
    if (filters.ethnicity) params.set('ethnicity', filters.ethnicity)
    if (filters.breastSize) params.set('breastSize', filters.breastSize)
    if (filters.hasTattoos) params.set('hasTattoos', filters.hasTattoos)
    if (filters.serviceTypes && filters.serviceTypes.length > 0) params.set('serviceTypes', filters.serviceTypes.join(','))
    if (filters.specialties && filters.specialties.length > 0) params.set('specialties', filters.specialties.join(','))
    if (filters.experienceTypes && filters.experienceTypes.length > 0) params.set('experienceTypes', filters.experienceTypes.join(','))
    if (filters.roleTypes && filters.roleTypes.length > 0) params.set('roleTypes', filters.roleTypes.join(','))
    if (filters.budgetRange) {
      params.set('budgetMin', filters.budgetRange[0].toString())
      params.set('budgetMax', filters.budgetRange[1].toString())
    }
    if (filters.minDuration) params.set('minDuration', filters.minDuration)
    if (filters.acceptsCards) params.set('acceptsCards', 'true')
    if (filters.availability && filters.availability.length > 0) params.set('availability', filters.availability.join(','))
    if (filters.timeSlots && filters.timeSlots.length > 0) params.set('timeSlots', filters.timeSlots.join(','))
    if (filters.weekendAvailable) params.set('weekendAvailable', 'true')
    if (filters.verified) params.set('verified', 'true')
    if (filters.minRating) params.set('minRating', filters.minRating.toString())
    if (filters.minReviews) params.set('minReviews', filters.minReviews.toString())
    if (filters.premiumContent) params.set('premiumContent', 'true')
    if (filters.liveCam) params.set('liveCam', 'true')
    if (filters.premiumMessaging) params.set('premiumMessaging', 'true')
    if (filters.privatePhotos) params.set('privatePhotos', 'true')
    if (filters.exclusiveVideos) params.set('exclusiveVideos', 'true')
    if (filters.availableNow) params.set('availableNow', 'true')
    if (filters.outcall) params.set('outcall', 'true')
    if (filters.incall) params.set('incall', 'true')
    if (filters.radius) params.set('radius', filters.radius.toString())
    
    if (cursor) params.set('cursor', cursor)
    params.set('limit', '20')
    
    return params.toString()
  }, [])

  // Fetch escorts
  const fetchEscorts = useCallback(async (filters: SearchFilters, cursor?: string, append = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      setIsLoading(true)
      setError(null)

      const queryString = buildQueryString(filters, cursor)
      
      const response = await fetch(`/api/escorts?${queryString}`, {
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const data: SearchResponse = await response.json()

      if (append) {
        setEscorts(prev => [...prev, ...data.items])
      } else {
        setEscorts(data.items)
      }

      setNextCursor(data.nextCursor)
      setHasMore(!!data.nextCursor)
      setTotal(data.total || data.items.length)

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Erreur lors du chargement des escortes:', err)
        setError(err.message || 'Erreur lors du chargement')
      }
    } finally {
      setIsLoading(false)
    }
  }, [buildQueryString])

  // Set filters (will trigger useEffect)
  const setFilters = useCallback((newFilters: SearchFilters) => {
    console.log('[useSearch] Setting filters:', newFilters)
    setFiltersState(newFilters)
    updateURL(newFilters)
  }, [updateURL])

  // Load more results
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading && nextCursor) {
      fetchEscorts(filters, nextCursor, true)
    }
  }, [hasMore, isLoading, nextCursor, filters, fetchEscorts])

  // Refresh results
  const refresh = useCallback(() => {
    fetchEscorts(filters, undefined, false)
  }, [filters, fetchEscorts])

  // Fetch when filters change
  useEffect(() => {
    console.log('[useSearch] Filters changed, fetching escorts:', filters)
    fetchEscorts(filters, undefined, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.q,
    filters.city,
    filters.canton,
    filters.sort,
    filters.categories?.join(',') || ''
  ])

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    escorts,
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
