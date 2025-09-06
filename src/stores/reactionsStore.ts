import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Reaction {
  emoji: string
  timestamp: number
  userId?: string // Pour les utilisateurs connectés
  sessionId: string // Pour les utilisateurs non connectés
}

interface ProfileReactions {
  [profileId: string]: {
    reactions: Reaction[]
    totalCount: number
    userReaction?: Reaction // La réaction de l'utilisateur actuel
  }
}

interface MediaLikes {
  [mediaId: string]: {
    likes: number
    likedBy: string[] // sessionIds ou userIds
  }
}

interface ReactionsStore {
  profileReactions: ProfileReactions
  mediaLikes: MediaLikes
  currentSessionId: string
  
  // Actions
  setProfileReaction: (profileId: string, emoji: string, userId?: string) => void
  removeProfileReaction: (profileId: string, userId?: string) => void
  getProfileReactions: (profileId: string) => Reaction[]
  getTotalReactions: (profileId: string) => number
  getUserReaction: (profileId: string, userId?: string) => string | null
  clearAllReactions: () => void
  initializeSession: () => void
  
  // Media likes actions
  toggleMediaLike: (mediaId: string, userId?: string) => void
  getMediaLikes: (mediaId: string) => number
  isMediaLiked: (mediaId: string, userId?: string) => boolean
}

// Générer un ID de session unique pour les utilisateurs non connectés
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

export const useReactionsStore = create<ReactionsStore>()(
  persist(
    (set, get) => ({
      profileReactions: {},
      mediaLikes: {},
      currentSessionId: generateSessionId(),

      initializeSession: () => {
        const state = get()
        if (!state.currentSessionId) {
          set({ currentSessionId: generateSessionId() })
        }
      },

      setProfileReaction: (profileId: string, emoji: string, userId?: string) => {
        const state = get()
        const currentReactions = state.profileReactions[profileId] || { 
          reactions: [], 
          totalCount: 0 
        }

        const sessionId = state.currentSessionId
        const userIdentifier = userId || sessionId

        // Vérifier si l'utilisateur a déjà une réaction
        const existingReactionIndex = currentReactions.reactions.findIndex(
          reaction => (userId && reaction.userId === userId) || (!userId && reaction.sessionId === sessionId)
        )

        const newReaction: Reaction = {
          emoji,
          timestamp: Date.now(),
          userId,
          sessionId
        }

        let updatedReactions: Reaction[]

        if (existingReactionIndex >= 0) {
          // Remplacer la réaction existante
          updatedReactions = [...currentReactions.reactions]
          updatedReactions[existingReactionIndex] = newReaction
        } else {
          // Ajouter une nouvelle réaction
          updatedReactions = [...currentReactions.reactions, newReaction]
        }

        set({
          profileReactions: {
            ...state.profileReactions,
            [profileId]: {
              reactions: updatedReactions,
              totalCount: updatedReactions.length,
              userReaction: newReaction
            }
          }
        })
      },

      removeProfileReaction: (profileId: string, userId?: string) => {
        const state = get()
        const currentReactions = state.profileReactions[profileId]
        
        if (!currentReactions) return

        const sessionId = state.currentSessionId
        
        // Filtrer pour enlever la réaction de l'utilisateur
        const updatedReactions = currentReactions.reactions.filter(
          reaction => {
            if (userId) {
              return reaction.userId !== userId
            } else {
              return reaction.sessionId !== sessionId
            }
          }
        )

        set({
          profileReactions: {
            ...state.profileReactions,
            [profileId]: {
              reactions: updatedReactions,
              totalCount: updatedReactions.length,
              userReaction: undefined
            }
          }
        })
      },

      getProfileReactions: (profileId: string) => {
        const state = get()
        return state.profileReactions[profileId]?.reactions || []
      },

      getTotalReactions: (profileId: string) => {
        const state = get()
        return state.profileReactions[profileId]?.totalCount || 0
      },

      getUserReaction: (profileId: string, userId?: string) => {
        const state = get()
        const currentReactions = state.profileReactions[profileId]
        
        if (!currentReactions) return null

        const sessionId = state.currentSessionId
        
        // Chercher la réaction de l'utilisateur
        const userReaction = currentReactions.reactions.find(
          reaction => {
            if (userId) {
              return reaction.userId === userId
            } else {
              return reaction.sessionId === sessionId
            }
          }
        )

        return userReaction?.emoji || null
      },

      clearAllReactions: () => {
        set({
          profileReactions: {},
          mediaLikes: {},
          currentSessionId: generateSessionId()
        })
      },

      // Media likes functions
      toggleMediaLike: (mediaId: string, userId?: string) => {
        const state = get()
        const currentLikes = state.mediaLikes[mediaId] || { likes: 0, likedBy: [] }
        const sessionId = state.currentSessionId
        const userIdentifier = userId || sessionId

        const isAlreadyLiked = currentLikes.likedBy.includes(userIdentifier)
        
        let updatedLikedBy: string[]
        
        if (isAlreadyLiked) {
          // Retirer le like
          updatedLikedBy = currentLikes.likedBy.filter(id => id !== userIdentifier)
        } else {
          // Ajouter le like
          updatedLikedBy = [...currentLikes.likedBy, userIdentifier]
        }

        set({
          mediaLikes: {
            ...state.mediaLikes,
            [mediaId]: {
              likes: updatedLikedBy.length,
              likedBy: updatedLikedBy
            }
          }
        })
      },

      getMediaLikes: (mediaId: string) => {
        const state = get()
        return state.mediaLikes[mediaId]?.likes || 0
      },

      isMediaLiked: (mediaId: string, userId?: string) => {
        const state = get()
        const currentLikes = state.mediaLikes[mediaId]
        if (!currentLikes) return false

        const sessionId = state.currentSessionId
        const userIdentifier = userId || sessionId
        
        return currentLikes.likedBy.includes(userIdentifier)
      }
    }),
    {
      name: 'felora-reactions-store',
      version: 1,
      // Persister seulement les réactions, likes de médias et l'ID de session
      partialize: (state) => ({
        profileReactions: state.profileReactions,
        mediaLikes: state.mediaLikes,
        currentSessionId: state.currentSessionId
      })
    }
  )
)

// Utilitaires pour les statistiques
export const getReactionStats = (profileId: string) => {
  const store = useReactionsStore.getState()
  const reactions = store.getProfileReactions(profileId)
  
  // Compter par type d'emoji
  const emojiCounts: { [emoji: string]: number } = {}
  reactions.forEach(reaction => {
    emojiCounts[reaction.emoji] = (emojiCounts[reaction.emoji] || 0) + 1
  })
  
  // Trouver l'emoji le plus populaire
  const mostPopularEmoji = Object.entries(emojiCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || null
  
  return {
    totalReactions: reactions.length,
    emojiCounts,
    mostPopularEmoji,
    recentReactions: reactions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10) // Les 10 dernières réactions
  }
}

// Initialiser la session au chargement
if (typeof window !== 'undefined') {
  useReactionsStore.getState().initializeSession()
}