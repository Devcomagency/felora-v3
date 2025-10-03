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
  const containerRef = useRef<HTMLDivElement>(null)
  const [initialTotals, setInitialTotals] = useState<Record<string, number>>({})

  // Store du feed pour la gestion globale
  const { setVideoContainerRef, isRestore } = useFeedStore()

  
  // Chargement de plus d'items (pagination infinie avec API)
  const loadMoreItems = useCallback(async () => {
    if (isLoading || !nextCursor) return
    
    setIsLoading(true)
    
    try {
      console.log('📱 [CLIENT PAGE] Chargement de plus d\'items, cursor:', nextCursor)
      
      // Appeler l'API pour récupérer plus de médias
      const response = await fetch(`/api/feed/public?cursor=${nextCursor}&limit=10`, {
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
        
        console.log('📱 [CLIENT PAGE] Nouveaux médias récupérés:', newItems.length, 'items')
        
        setItems(prev => [...prev, ...newItems])
        setNextCursor(newCursor)
      } else {
        console.error('❌ [CLIENT PAGE] Erreur API feed:', response.status)
        // Pas de fallback mock ici, on garde ce qu'on a
      }
    } catch (error) {
      console.error('❌ [CLIENT PAGE] Erreur récupération feed:', error)
      // Pas de fallback mock ici, on garde ce qu'on a
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, nextCursor])

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
      if (scrollTop + clientHeight >= scrollHeight * 0.8 && !isLoading && nextCursor) {
        loadMoreItems()
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [loadMoreItems, isLoading])

  return (
    <main 
      ref={containerRef}
      className="h-dvh snap-y snap-mandatory overflow-y-scroll bg-black"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <style jsx>{`
        main::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {items.map((item) => {
        const mediaId = stableMediaId({ rawId: item.id, profileId: item.author.id, url: item.url })
        const initialTotal = initialTotals[mediaId]
        return (
          <section key={item.id} className="snap-start">
            <VideoFeedCard item={item} initialTotal={initialTotal} />
          </section>
        )
      })}
      
      {/* Indicateur de chargement pour pagination */}
      {isLoading && (
        <section className="snap-start h-32 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#FF6B9D]/30 border-t-[#FF6B9D] rounded-full animate-spin mx-auto mb-2" />
            <p className="text-white/70 text-sm">Chargement...</p>
          </div>
        </section>
      )}
      
      {/* Message si pas d'items */}
      {items.length === 0 && (
        <section className="snap-start h-dvh flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#FF6B9D]/30 border-t-[#FF6B9D] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/70 text-lg">Chargement du feed...</p>
          </div>
        </section>
      )}

      {/* Message si fin du feed */}
      {items.length > 0 && !nextCursor && !isLoading && (
        <section className="snap-start h-32 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/50 text-sm">Fin du feed - Plus de contenu à charger</p>
          </div>
        </section>
      )}

    </main>
  )
}
