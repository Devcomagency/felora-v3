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
  latitude?: number
  longitude?: number
  updatedAt: string
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

const DEFAULT_FILTERS: SearchFilters = {
  q: '',
  city: '',
  canton: '',
  services: [],
  languages: [],
  status: '',
  sort: 'recent'
}

export function useSearch(): UseSearchReturn {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [escorts, setEscorts] = useState<Escort[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [filters, setFiltersState] = useState<SearchFilters>(DEFAULT_FILTERS)
  const [nextCursor, setNextCursor] = useState<string | undefined>()
  
  const abortControllerRef = useRef<AbortController | null>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Parse URL params on mount
  useEffect(() => {
    const urlFilters: SearchFilters = {
      q: searchParams.get('q') || '',
      city: searchParams.get('city') || '',
      canton: searchParams.get('canton') || '',
      services: searchParams.get('services')?.split(',').filter(Boolean) || [],
      languages: searchParams.get('languages')?.split(',').filter(Boolean) || [],
      status: searchParams.get('status') || '',
      sort: searchParams.get('sort') || 'recent'
    }
    setFiltersState(urlFilters)
  }, [searchParams])

  // Update URL when filters change
  const updateURL = useCallback((newFilters: SearchFilters) => {
    const params = new URLSearchParams()
    
    if (newFilters.q) params.set('q', newFilters.q)
    if (newFilters.city) params.set('city', newFilters.city)
    if (newFilters.canton) params.set('canton', newFilters.canton)
    if (newFilters.services.length > 0) params.set('services', newFilters.services.join(','))
    if (newFilters.languages.length > 0) params.set('languages', newFilters.languages.join(','))
    if (newFilters.status) params.set('status', newFilters.status)
    if (newFilters.sort !== 'recent') params.set('sort', newFilters.sort)

    const newURL = params.toString() ? `?${params.toString()}` : ''
    router.replace(`/search${newURL}`, { scroll: false })
  }, [router])

  // Build API query string
  const buildQueryString = useCallback((filters: SearchFilters, cursor?: string) => {
    const params = new URLSearchParams()
    
    if (filters.q) params.set('q', filters.q)
    if (filters.city) params.set('city', filters.city)
    if (filters.canton) params.set('canton', filters.canton)
    if (filters.services.length > 0) params.set('services', filters.services.join(','))
    if (filters.languages.length > 0) params.set('languages', filters.languages.join(','))
    if (filters.status) params.set('status', filters.status)
    if (filters.sort !== 'recent') params.set('sort', filters.sort)
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

  // Debounced search
  const debouncedSearch = useCallback((newFilters: SearchFilters) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setFiltersState(newFilters)
      updateURL(newFilters)
      fetchEscorts(newFilters, undefined, false)
    }, 300)
  }, [updateURL, fetchEscorts])

  // Set filters with debounce
  const setFilters = useCallback((newFilters: SearchFilters) => {
    setFiltersState(newFilters)
    debouncedSearch(newFilters)
  }, [debouncedSearch])

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

  // Initial load
  useEffect(() => {
    fetchEscorts(filters, undefined, false)
  }, []) // Only run on mount

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
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
