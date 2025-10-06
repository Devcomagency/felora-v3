import { Suspense } from 'react'
import ClientFeedPage from './client-page'

// Types pour le feed (extraits de V2)
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

export default async function HomePage() {
  let items: MediaItem[] = []
  let nextCursor: string | null = null
  
  try {
    // Appeler l'API pour récupérer les médias publics
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/feed/public?limit=10`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Désactiver le cache pour avoir des données fraîches
      cache: 'no-store'
    })

    if (response.ok) {
      const data = await response.json()
      items = data.items || []
      nextCursor = data.nextCursor || null
      console.log('📱 [HOME PAGE] Médias récupérés:', items.length, 'items')
    } else {
      console.error('❌ [HOME PAGE] Erreur API feed:', response.status)
    }
  } catch (error) {
    console.error('❌ [HOME PAGE] Erreur récupération feed:', error)
  }

  // Fallback avec des données mock si l'API échoue
  if (items.length === 0) {
    console.log('⚠️ [HOME PAGE] Utilisation des données mock en fallback')
    items = [
      {
        id: 'fallback-1',
        type: 'IMAGE',
        url: 'https://picsum.photos/400/600?random=1',
        thumb: 'https://picsum.photos/400/600?random=1',
        visibility: 'PUBLIC',
        author: {
          id: 'fallback-user-1',
          handle: '@felora_demo',
          name: 'Felora Demo',
          avatar: 'https://picsum.photos/100/100?random=10'
        },
        likeCount: 0,
        reactCount: 0,
        createdAt: new Date().toISOString()
      }
    ]
    nextCursor = null
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientFeedPage initialItems={items} initialCursor={nextCursor} />
    </Suspense>
  )
}
