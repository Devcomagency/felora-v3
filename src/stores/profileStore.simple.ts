import { create } from 'zustand'

// Types simplifiés pour l'ESC
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

// Store simplifié
interface ProfileStore {
  currentProfile: EscortProfile | null
  favorites: string[]
  following: string[]
  profileReactions: { [profileId: string]: { [emoji: string]: number } }
  
  setCurrentProfile: (profile: EscortProfile | null) => void
  toggleFavorite: (profileId: string) => void
  toggleFollow: (profileId: string) => void
  setProfileReaction: (profileId: string, emoji: string) => void
  getProfileReactions: (profileId: string) => { [emoji: string]: number }
  getTotalReactions: (profileId: string) => number
  getUserReaction: (profileId: string) => string | null
  isFavorite: (profileId: string) => boolean
  isFollowing: (profileId: string) => boolean
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  currentProfile: null,
  favorites: [],
  following: [],
  profileReactions: {},
  
  setCurrentProfile: (profile) => set({ currentProfile: profile }),
  
  toggleFavorite: (profileId) => set((state) => {
    const isFav = state.favorites.includes(profileId)
    const newFavorites = isFav
      ? state.favorites.filter(id => id !== profileId)
      : [...state.favorites, profileId]
    return { favorites: newFavorites }
  }),
  
  toggleFollow: (profileId) => set((state) => {
    const isFollowing = state.following.includes(profileId)
    const newFollowing = isFollowing 
      ? state.following.filter(id => id !== profileId)
      : [...state.following, profileId]
    return { following: newFollowing }
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
    return Object.keys(reactions).pop() || null
  },
  
  isFavorite: (profileId) => {
    const state = get()
    return state.favorites.includes(profileId)
  },
  
  isFollowing: (profileId) => {
    const state = get()
    return state.following.includes(profileId)
  }
}))

export default useProfileStore