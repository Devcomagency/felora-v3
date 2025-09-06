import { create, StateCreator } from 'zustand'
import { RefObject } from 'react'

// Types pour le profil FELORA
export interface EscortProfile {
  id: string
  name: string
  stageName: string
  age: number
  location: string
  media: string
  gallery: string[]
  blurredGallery: string[]
  description: string
  services: string[]
  price: number
  rating: number
  reviews: number
  likes: number
  followers: number
  online: boolean
  lastSeen: string
  verified: boolean
  premium: boolean
  responseRate: number
  responseTime: string
  languages?: string[]
  stats?: {
    views: number
    hearts: number
    bookings: number
  }
  physicalDetails?: {
    height?: string
    bodyType?: string
    hairColor?: string
    eyeColor?: string
    ethnicity?: string
    bustSize?: string
    tattoos?: string
    piercings?: string
  }
  rates?: {
    hour?: number
    twoHours?: number
    halfDay?: number
    fullDay?: number
    overnight?: number
  }
  workingArea?: string
  practices?: string[]
  incall?: boolean
  outcall?: boolean
  availableNow?: boolean
  weekendAvailable?: boolean
}

// Slice pour la gestion des profils
interface ProfileSlice {
  currentProfile: EscortProfile | null
  profiles: EscortProfile[]
  favorites: string[]
  following: string[]
  isProfileLoading: boolean
  
  setCurrentProfile: (profile: EscortProfile | null) => void
  setProfiles: (profiles: EscortProfile[]) => void
  addFavorite: (profileId: string) => void
  removeFavorite: (profileId: string) => void
  toggleFollow: (profileId: string) => void
  setProfileLoading: (loading: boolean) => void
  updateProfileLikes: (profileId: string, increment: boolean) => void
}

// Slice pour la navigation et scroll (inspiré de TikTok)
interface NavigationSlice {
  isRestore: boolean
  prevScroll: number
  profileContainerRef: RefObject<HTMLElement> | null
  fullscreenIndex: number
  
  setIsRestore: (isRestore: boolean) => void
  setPrevScroll: (scrollHeight: number) => void
  setProfileContainerRef: (ref: RefObject<HTMLElement> | null) => void
  setFullscreenIndex: (index: number) => void
}

// Slice pour les médias et galerie
interface MediaSlice {
  isGalleryUnlocked: boolean
  unlockedContent: string[]
  currentMediaIndex: number
  isVideoPlaying: boolean
  isMuted: boolean
  
  setGalleryUnlocked: (unlocked: boolean) => void
  addUnlockedContent: (contentId: string) => void
  setCurrentMediaIndex: (index: number) => void
  setVideoPlaying: (playing: boolean) => void
  toggleMute: () => void
}

// Slice pour les interactions (likes, réactions)
interface InteractionSlice {
  likedProfiles: string[]
  mediaLikes: { [key: string]: number }
  profileReactions: { [profileId: string]: { [emoji: string]: number } }
  
  toggleProfileLike: (profileId: string) => void
  toggleMediaLike: (mediaId: string, baseCount: number) => void
  setProfileReaction: (profileId: string, emoji: string) => void
  removeProfileReaction: (profileId: string) => void
  getProfileReactions: (profileId: string) => { [emoji: string]: number }
  getTotalReactions: (profileId: string) => number
  getUserReaction: (profileId: string) => string | null
  isMediaLiked: (mediaId: string) => boolean
  getMediaLikes: (mediaId: string, baseCount: number) => number
}

// Implémentation des slices
const createProfileSlice: StateCreator<ProfileSlice> = (set, get) => ({
  currentProfile: null,
  profiles: [],
  favorites: typeof window !== 'undefined' ? JSON.parse(localStorage?.getItem('felora-favorites') || '[]') : [],
  following: typeof window !== 'undefined' ? JSON.parse(localStorage?.getItem('felora-following') || '[]') : [],
  isProfileLoading: false,
  
  setCurrentProfile: (profile) => set({ currentProfile: profile }),
  setProfiles: (profiles) => set({ profiles }),
  
  addFavorite: (profileId) => set((state) => {
    const newFavorites = [...state.favorites, profileId]
    if (typeof window !== 'undefined') {
      localStorage.setItem('felora-favorites', JSON.stringify(newFavorites))
    }
    return { favorites: newFavorites }
  }),
  
  removeFavorite: (profileId) => set((state) => {
    const newFavorites = state.favorites.filter(id => id !== profileId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('felora-favorites', JSON.stringify(newFavorites))
    }
    return { favorites: newFavorites }
  }),
  
  toggleFollow: (profileId) => set((state) => {
    const isFollowing = state.following.includes(profileId)
    const newFollowing = isFollowing 
      ? state.following.filter(id => id !== profileId)
      : [...state.following, profileId]
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('felora-following', JSON.stringify(newFollowing))
    }
    return { following: newFollowing }
  }),
  
  setProfileLoading: (loading) => set({ isProfileLoading: loading }),
  
  updateProfileLikes: (profileId, increment) => set((state) => {
    if (!state.currentProfile || state.currentProfile.id !== profileId) return state
    
    const updatedProfile = {
      ...state.currentProfile,
      likes: increment ? state.currentProfile.likes + 1 : state.currentProfile.likes - 1
    }
    
    return { currentProfile: updatedProfile }
  })
})

const createNavigationSlice: StateCreator<NavigationSlice> = (set) => ({
  isRestore: false,
  prevScroll: 0,
  profileContainerRef: null,
  fullscreenIndex: 0,
  
  setIsRestore: (isRestore) => set({ isRestore }),
  setPrevScroll: (scrollHeight) => set({ prevScroll: scrollHeight }),
  setProfileContainerRef: (ref) => set({ profileContainerRef: ref }),
  setFullscreenIndex: (index) => set({ fullscreenIndex: index })
})

const createMediaSlice: StateCreator<MediaSlice> = (set) => ({
  isGalleryUnlocked: false,
  unlockedContent: [],
  currentMediaIndex: 0,
  isVideoPlaying: false,
  isMuted: true,
  
  setGalleryUnlocked: (unlocked) => set({ isGalleryUnlocked: unlocked }),
  
  addUnlockedContent: (contentId) => set((state) => ({
    unlockedContent: [...state.unlockedContent, contentId]
  })),
  
  setCurrentMediaIndex: (index) => set({ currentMediaIndex: index }),
  setVideoPlaying: (playing) => set({ isVideoPlaying: playing }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted }))
})

const createInteractionSlice: StateCreator<InteractionSlice> = (set, get) => ({
  likedProfiles: typeof window !== 'undefined' ? JSON.parse(localStorage?.getItem('felora-liked-profiles') || '[]') : [],
  mediaLikes: typeof window !== 'undefined' ? JSON.parse(localStorage?.getItem('felora-media-likes') || '{}') : {},
  profileReactions: typeof window !== 'undefined' ? JSON.parse(localStorage?.getItem('felora-profile-reactions') || '{}') : {},
  
  toggleProfileLike: (profileId) => set((state) => {
    const isLiked = state.likedProfiles.includes(profileId)
    const newLikedProfiles = isLiked
      ? state.likedProfiles.filter(id => id !== profileId)
      : [...state.likedProfiles, profileId]
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('felora-liked-profiles', JSON.stringify(newLikedProfiles))
    }
    return { likedProfiles: newLikedProfiles }
  }),
  
  toggleMediaLike: (mediaId, baseCount) => set((state) => {
    const currentLikes = state.mediaLikes[mediaId] || baseCount
    const isLiked = currentLikes > baseCount
    const newLikes = isLiked ? baseCount : baseCount + 1
    
    const newMediaLikes = { ...state.mediaLikes, [mediaId]: newLikes }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('felora-media-likes', JSON.stringify(newMediaLikes))
    }
    
    return { mediaLikes: newMediaLikes }
  }),
  
  setProfileReaction: (profileId, emoji) => set((state) => {
    const reactions = state.profileReactions[profileId] || {}
    const newReactions = {
      ...state.profileReactions,
      [profileId]: {
        ...reactions,
        [emoji]: (reactions[emoji] || 0) + 1
      }
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('felora-profile-reactions', JSON.stringify(newReactions))
    }
    return { profileReactions: newReactions }
  }),
  
  removeProfileReaction: (profileId) => set((state) => {
    const newReactions = { ...state.profileReactions }
    delete newReactions[profileId]
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('felora-profile-reactions', JSON.stringify(newReactions))
    }
    return { profileReactions: newReactions }
  }),
  
  getProfileReactions: (profileId) => {
    const state = get()
    return state.profileReactions[profileId] || {}
  },
  
  getTotalReactions: (profileId) => {
    const state = get()
    const reactions = state.profileReactions[profileId] || {}
    return Object.values(reactions).reduce((sum, count) => sum + count, 0)
  },
  
  getUserReaction: (profileId) => {
    const state = get()
    const reactions = state.profileReactions[profileId] || {}
    // Simuler la réaction de l'utilisateur (dernière réaction ajoutée)
    const lastReaction = Object.keys(reactions).pop()
    return lastReaction || null
  },
  
  isMediaLiked: (mediaId) => {
    const state = get()
    return state.mediaLikes[mediaId] && state.mediaLikes[mediaId] > 0
  },
  
  getMediaLikes: (mediaId, baseCount) => {
    const state = get()
    return state.mediaLikes[mediaId] || baseCount
  }
})

// Store principal combinant tous les slices
export const useProfileStore = create<
  ProfileSlice & NavigationSlice & MediaSlice & InteractionSlice
>()((...a) => ({
  ...createProfileSlice(...a),
  ...createNavigationSlice(...a),
  ...createMediaSlice(...a),
  ...createInteractionSlice(...a)
}))

export default useProfileStore