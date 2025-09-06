'use client'

import { create } from 'zustand'
import { RefObject } from 'react'

// Types pour les vidéos en intersection
export type TIntersectingVideo = {
  inView: boolean
  id: string
  videoRef: RefObject<HTMLVideoElement>
}

// Interface pour le store de feed
interface FeedSlice {
  isMute: boolean
  isRestore: boolean
  prevScroll: number
  videoContainerRef: RefObject<HTMLElement> | null
  currentVideo: {
    videoRef: RefObject<HTMLVideoElement> | null
    isPlaying: boolean
  }
  toggleMute: () => void
  setIsMute: (muted: boolean) => void
  setIsRestore: (isRestore: boolean) => void
  setPrevScroll: (scrollHeight: number) => void
  setVideoContainerRef: (ref: RefObject<HTMLElement> | null) => void
  setCurrentVideo: (
    videoRef: RefObject<HTMLVideoElement> | null,
    isPlaying: boolean,
  ) => void
}

// Interface pour les réactions
interface ReactionsSlice {
  likedItems: Set<string>
  followedUsers: Set<string>
  toggleLike: (itemId: string) => void
  toggleFollow: (userId: string) => void
  isItemLiked: (itemId: string) => boolean
  isUserFollowed: (userId: string) => boolean
}

// Interface pour les interactions temporaires
interface InteractionSlice {
  loadingLikes: Set<string>
  loadingFollows: Set<string>
  setLikeLoading: (itemId: string, loading: boolean) => void
  setFollowLoading: (userId: string, loading: boolean) => void
  isLikeLoading: (itemId: string) => boolean
  isFollowLoading: (userId: string) => boolean
}

// Slice pour la gestion des vidéos
const createFeedSlice = (set: any): FeedSlice => ({
  isMute: true, // TikTok commence en mode muet
  isRestore: false,
  prevScroll: 0,
  videoContainerRef: null,
  currentVideo: { isPlaying: false, videoRef: null },
  
  toggleMute: () => set((state: FeedSlice) => ({ isMute: !state.isMute })),
  setIsMute: (muted) => set(() => ({ isMute: muted })),
  setIsRestore: (isRestore) => set(() => ({ isRestore })),
  setPrevScroll: (scrollHeight) => set(() => ({ prevScroll: scrollHeight })),
  setVideoContainerRef: (ref) => set(() => ({ videoContainerRef: ref })),
  setCurrentVideo: (videoRef, isPlaying) =>
    set(() => ({ currentVideo: { isPlaying, videoRef } })),
})

// Slice pour les réactions
const createReactionsSlice = (set: any, get: any): ReactionsSlice => ({
  likedItems: new Set(),
  followedUsers: new Set(),
  
  toggleLike: (itemId: string) => set((state: ReactionsSlice) => {
    const newLikedItems = new Set(state.likedItems)
    if (newLikedItems.has(itemId)) {
      newLikedItems.delete(itemId)
    } else {
      newLikedItems.add(itemId)
    }
    return { likedItems: newLikedItems }
  }),
  
  toggleFollow: (userId: string) => set((state: ReactionsSlice) => {
    const newFollowedUsers = new Set(state.followedUsers)
    if (newFollowedUsers.has(userId)) {
      newFollowedUsers.delete(userId)
    } else {
      newFollowedUsers.add(userId)
    }
    return { followedUsers: newFollowedUsers }
  }),
  
  isItemLiked: (itemId: string) => get().likedItems.has(itemId),
  isUserFollowed: (userId: string) => get().followedUsers.has(userId),
})

// Slice pour les états de chargement
const createInteractionSlice = (set: any, get: any): InteractionSlice => ({
  loadingLikes: new Set(),
  loadingFollows: new Set(),
  
  setLikeLoading: (itemId: string, loading: boolean) => set((state: InteractionSlice) => {
    const newLoadingLikes = new Set(state.loadingLikes)
    if (loading) {
      newLoadingLikes.add(itemId)
    } else {
      newLoadingLikes.delete(itemId)
    }
    return { loadingLikes: newLoadingLikes }
  }),
  
  setFollowLoading: (userId: string, loading: boolean) => set((state: InteractionSlice) => {
    const newLoadingFollows = new Set(state.loadingFollows)
    if (loading) {
      newLoadingFollows.add(userId)
    } else {
      newLoadingFollows.delete(userId)
    }
    return { loadingFollows: newLoadingFollows }
  }),
  
  isLikeLoading: (itemId: string) => get().loadingLikes.has(itemId),
  isFollowLoading: (userId: string) => get().loadingFollows.has(userId),
})

// Store combiné
export const useFeedStore = create<FeedSlice & ReactionsSlice & InteractionSlice>()(
  (set, get) => ({
    ...createFeedSlice(set),
    ...createReactionsSlice(set, get),
    ...createInteractionSlice(set, get),
  })
)