'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import VideoFeedCard from '../components/feed/VideoFeedCard'
import { useFeedStore } from '../stores/feedStore'
import { stableMediaId } from '@/lib/reactions/stableMediaId'

// Types pour le feed
interface MediaAuthor {
  id: string
  handle: string
  name: string
  avatar: string
}

interface MediaItem {
  id: string
  type: 'IMAGE' | 'VIDEO'
  url: string
  thumb: string
  visibility: string
  ownerType?: 'ESCORT' | 'CLUB'
  clubHandle?: string | null
  author: MediaAuthor
  likeCount: number
  reactCount: number
  createdAt: string
}

interface ClientFeedPageProps {
  initialItems: MediaItem[]
  initialCursor?: string
}

export default function ClientFeedPage({ initialItems, initialCursor }: ClientFeedPageProps) {
  const [items, setItems] = useState<MediaItem[]>(initialItems)
  const [nextCursor, setNextCursor] = useState<string | undefined>(initialCursor)
  const [isLoading, setIsLoading] = useState(false)
  const [hasInitialLoad, setHasInitialLoad] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [initialTotals, setInitialTotals] = useState<Record<string, number>>({})

  // Refs pour éviter les re-créations du callback
  const isLoadingRef = useRef(isLoading)
  const nextCursorRef = useRef(nextCursor)
  const hasInitialLoadRef = useRef(hasInitialLoad)

  // Synchroniser les refs avec les states
  useEffect(() => {
    isLoadingRef.current = isLoading
    nextCursorRef.current = nextCursor
    hasInitialLoadRef.current = hasInitialLoad
  }, [isLoading, nextCursor, hasInitialLoad])

  // Store du feed pour la gestion globale
  const { setVideoContainerRef, isRestore } = useFeedStore()

  // DÉSACTIVÉ : système de preloading trop lourd, cause des saccades
  // const currentIndex = useCurrentVideoIndex(containerRef)
  // const { getPreloadedVideo, loadingStatus } = useVideoPreloader({
  //   items: items.map(item => ({ id: item.id, url: item.url, type: item.type })),
  //   currentIndex,
  //   preloadCount: 2,
  //   unloadDistance: 3
  // })


  // Chargement de plus d'items (pagination infinie avec API)
  const loadMoreItems = useCallback(async () => {
    console.log('📱 [CLIENT PAGE] loadMoreItems appelé - isLoading:', isLoadingRef.current, 'nextCursor:', nextCursorRef.current, 'hasInitialLoad:', hasInitialLoadRef.current)

    if (isLoadingRef.current) {
      console.log('⏸️ [CLIENT PAGE] Déjà en cours de chargement, annulé')
      return
    }
    if (!nextCursorRef.current && hasInitialLoadRef.current) {
      console.log('⏸️ [CLIENT PAGE] Plus de contenu à charger, annulé')
      return
    }

    setIsLoading(true)

    try {
      console.log('📱 [CLIENT PAGE] Chargement de plus d\'items, cursor:', nextCursorRef.current || 'initial')

      // Appeler l'API pour récupérer plus de médias
      const apiUrl = nextCursorRef.current && nextCursorRef.current !== 'initial'
        ? `/api/feed/public?cursor=${nextCursorRef.current}&limit=10`
        : `/api/feed/public?limit=10`

      console.log('📱 [CLIENT PAGE] API URL:', apiUrl)

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })

      if (response.ok) {
        const data = await response.json()
        const newItems = data.items || []
        const newCursor = data.nextCursor || null

        console.log('📱 [CLIENT PAGE] Nouveaux médias récupérés:', newItems.length, 'items, nouveau cursor:', newCursor)

        setItems(prev => [...prev, ...newItems])
        setNextCursor(newCursor)
        setHasInitialLoad(true)
      } else {
        console.error('❌ [CLIENT PAGE] Erreur API feed:', response.status)
        setHasInitialLoad(true)
      }
    } catch (error) {
      console.error('❌ [CLIENT PAGE] Erreur récupération feed:', error)
      setHasInitialLoad(true)
    } finally {
      setIsLoading(false)
      console.log('✅ [CLIENT PAGE] Chargement terminé')
    }
  }, [])

  // Chargement initial au montage du composant
  useEffect(() => {
    console.log('🚀 [CLIENT PAGE] useEffect montage - hasInitialLoad:', hasInitialLoad, 'items.length:', items.length, 'isLoading:', isLoading)
    if (!hasInitialLoad && items.length === 0 && !isLoading) {
      console.log('✅ [CLIENT PAGE] Conditions OK, lancement du chargement initial')
      loadMoreItems()
    } else {
      console.log('❌ [CLIENT PAGE] Conditions pas remplies pour charger')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Seulement au montage, pas de dépendances

  // Initialiser le ref du conteneur dans le store
  useEffect(() => {
    if (containerRef.current) {
      setVideoContainerRef(containerRef as React.RefObject<HTMLElement>)
    }
  }, [setVideoContainerRef])

  // Reset scroll position après changement de route
  useEffect(() => {
    const container = containerRef.current
    if (!container || isRestore) return

    container.scrollTop = 0
  }, [isRestore])

  // Détection du scroll pour pagination infinie
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container

      // Charger plus quand on approche de la fin (80% scrollé) - Scroll infini avec pagination
      if (scrollTop + clientHeight >= scrollHeight * 0.8) {
        if (hasInitialLoadRef.current && !isLoadingRef.current && nextCursorRef.current && nextCursorRef.current !== 'initial') {
          console.log('📜 [CLIENT PAGE] Scroll détecté, chargement de la page suivante')
          loadMoreItems()
        }
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [loadMoreItems])

  return (
    <main
      ref={containerRef}
      className="feed-container h-screen snap-y snap-mandatory overflow-y-scroll bg-black"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        // Gestion complète des safe areas
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
        // Fallback pour les navigateurs qui ne supportent pas dvh
        height: '100vh',
        minHeight: '100vh',
        // Scroll snap MANDATORY pour caler sur chaque vidéo
        scrollSnapType: 'y mandatory',
        scrollBehavior: 'smooth'
      }}
    >
      <style jsx>{`
        main::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {items.map((item, index) => {
        const mediaId = stableMediaId({ rawId: item.id, profileId: item.author.id, url: item.url })
        const initialTotal = initialTotals[mediaId]

        // Clé composite pour garantir l'unicité : authorId + mediaId + index
        const uniqueKey = `${item.author.id}-${item.id}-${index}`
        return (
          <section
            key={uniqueKey}
            className="feed-item snap-start snap-always"
            style={{
              scrollSnapStop: 'always',
              scrollSnapAlign: 'start'
            }}
          >
            <VideoFeedCard
              item={item}
              initialTotal={initialTotal}
            />
          </section>
        )
      })}
      
      {/* Indicateur de chargement pour pagination */}
      {isLoading && (
        <section className="snap-start h-32 flex items-center justify-center">
          <div className="text-center">
            <img
              src="/icon.png"
              alt="Chargement"
              className="w-10 h-10 mx-auto mb-2 animate-pulse"
              style={{ filter: 'drop-shadow(0 0 15px rgba(255, 107, 157, 0.4))' }}
            />
            <p className="text-white/90 text-sm">Chargement...</p>
          </div>
        </section>
      )}
      
      {/* Message si pas d'items */}
      {items.length === 0 && (
        <section className="snap-start h-dvh flex items-center justify-center">
          <div className="text-center">
            <img
              src="/icon.png"
              alt="Felora"
              className="w-20 h-20 mx-auto mb-4 animate-pulse"
              style={{ filter: 'drop-shadow(0 0 20px rgba(255, 107, 157, 0.5))' }}
            />
            <p className="text-white/90 text-lg">Chargement du feed...</p>
          </div>
        </section>
      )}

      {/* Message si fin du feed */}
      {items.length > 0 && !nextCursor && !isLoading && (
        <section className="snap-start h-32 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/80 text-sm">Fin du feed - Plus de contenu à charger</p>
          </div>
        </section>
      )}

    </main>
  )
}
