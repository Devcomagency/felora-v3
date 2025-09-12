'use client'

import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import type { ReactNode } from 'react'
import ClientFeedPage from './client-page'
import OldHomePage from './old-home-page'

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

export default function HomeClient({ initialItems, initialCursor }: { initialItems: MediaItem[]; initialCursor: string }) {
  // Accepte NEXT_PUBLIC_FEATURE_UI_HOME ou FEATURE_UI_HOME
  const showNewUI = useFeatureFlag('NEXT_PUBLIC_FEATURE_UI_HOME') || useFeatureFlag('FEATURE_UI_HOME')
  if (showNewUI) {
    return <ClientFeedPage initialItems={initialItems} initialCursor={initialCursor} />
  }
  return <OldHomePage />
}

