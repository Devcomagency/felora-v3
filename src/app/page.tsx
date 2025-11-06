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
  // Pour l'instant, on démarre avec un feed vide
  // Le client-page chargera les données via l'API côté client
  const items: MediaItem[] = []
  const nextCursor: string | null = 'initial'

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientFeedPage initialItems={items} initialCursor={nextCursor} />
    </Suspense>
  )
}
