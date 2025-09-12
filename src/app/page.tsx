import { Suspense } from 'react'
import ClientFeedPage from './client-page'
import OldHomePage from './old-home-page'

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
  author: MediaAuthor
  likeCount: number
  reactCount: number
  createdAt: string
}

export default async function HomePage() {
  // Données mock directes pour éviter les erreurs de service
  const items: MediaItem[] = [
    {
      id: 'feed-1',
      type: 'IMAGE',
      url: 'https://picsum.photos/400/600?random=1',
      thumb: 'https://picsum.photos/400/600?random=1',
      visibility: 'PUBLIC',
      author: {
        id: 'sofia-elite-1',
        handle: '@sofia_elite',
        name: 'Sofia Elite',
        avatar: 'https://picsum.photos/100/100?random=10'
      },
      likeCount: 1247,
      reactCount: 89,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'feed-2',
      type: 'VIDEO',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumb: 'https://picsum.photos/400/600?random=2',
      visibility: 'PUBLIC',
      author: {
        id: 'bella-dreams-2',
        handle: '@bella_dreams',
        name: 'Bella Dreams',
        avatar: 'https://picsum.photos/100/100?random=20'
      },
      likeCount: 892,
      reactCount: 124,
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'feed-3',
      type: 'IMAGE',
      url: 'https://picsum.photos/400/600?random=3',
      thumb: 'https://picsum.photos/400/600?random=3',
      visibility: 'PUBLIC',
      author: {
        id: 'v-diamond-3',
        handle: '@v_diamond',
        name: 'V Diamond',
        avatar: 'https://picsum.photos/100/100?random=30'
      },
      likeCount: 2156,
      reactCount: 267,
      createdAt: new Date(Date.now() - 10800000).toISOString()
    }
  ]
  
  const nextCursor = 'initial-cursor'

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeClient initialItems={items} initialCursor={nextCursor} />
    </Suspense>
  )
}

'use client'

import { useFeatureFlag } from '@/hooks/useFeatureFlag'

function HomeClient({ initialItems, initialCursor }: { initialItems: MediaItem[]; initialCursor: string }) {
  const showNewUI = useFeatureFlag('NEXT_PUBLIC_FEATURE_UI_HOME')
  if (showNewUI) {
    return <ClientFeedPage initialItems={initialItems} initialCursor={initialCursor} />
  }
  return <OldHomePage />
}
