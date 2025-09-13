'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
  
  // Chargement de plus d'items (génération infinie)
  const loadMoreItems = useCallback(async () => {
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Générer du contenu infini
      const timestamp = Date.now()
      const infiniteItems: MediaItem[] = Array.from({ length: 3 }, (_, i) => {
        const seed = timestamp + i
        const isVideo = false
        return {
          id: `infinite-${seed}-${i}`,
          type: 'IMAGE',
          url: `https://picsum.photos/400/600?random=${seed}`,
          thumb: `https://picsum.photos/400/600?random=${seed}`,
          visibility: 'PUBLIC',
          author: {
            id: `user-${seed % 1000}`,
            handle: `@infinite_${seed % 1000}`,
            name: `Creator ${seed % 1000}`,
            avatar: `https://picsum.photos/100/100?random=${seed + 2000}`
          },
          likeCount: (seed * 13) % 2000,
          reactCount: (seed * 5) % 200,
          createdAt: new Date(timestamp - (i * 3600000)).toISOString()
        }
      })
      setItems(prev => [...prev, ...infiniteItems])
      setNextCursor(`infinite-cursor-${timestamp}`)
    } catch (error) {
      console.error('Error loading more items:', error)
      // Générer des items mock en fallback
      const fallbackTime = Date.now()
      const newMockItems: MediaItem[] = Array.from({ length: 3 }, (_, i) => {
        const seed = fallbackTime + i
        const isVideo = false
        return {
          id: `generated-${seed}-${i}`,
          type: 'IMAGE',
          url: `https://picsum.photos/400/600?random=${seed}`,
          thumb: `https://picsum.photos/400/600?random=${seed}`,
          visibility: 'PUBLIC',
          author: {
            id: `fallback-user-${seed % 1000}`,
            handle: `@user_${seed % 1000}`,
            name: `User ${seed % 1000}`,
            avatar: `https://picsum.photos/100/100?random=${seed + 3000}`
          },
          likeCount: (seed * 11) % 1000,
          reactCount: (seed * 3) % 100,
          createdAt: new Date(fallbackTime - (i * 1800000)).toISOString()
        }
      })
      
      setItems(prev => [...prev, ...newMockItems])
      setNextCursor(`fallback-cursor-${fallbackTime}`)
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
      
      // Charger plus quand on approche de la fin (80% scrollé) - Scroll infini permanent
      if (scrollTop + clientHeight >= scrollHeight * 0.8 && !isLoading) {
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
    </main>
  )
}
