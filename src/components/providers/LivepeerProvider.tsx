'use client'

import { LivepeerConfig, createReactClient, studioProvider } from '@livepeer/react'
import { ReactNode } from 'react'

// Créer le client Livepeer avec Studio provider
const livepeerClient = createReactClient({
  provider: studioProvider({
    apiKey: process.env.NEXT_PUBLIC_LIVEPEER_API_KEY || '',
  }),
})

interface LivepeerProviderProps {
  children: ReactNode
}

/**
 * Provider Livepeer pour l'app
 * Permet d'utiliser les hooks et composants Livepeer partout
 */
export default function LivepeerProvider({ children }: LivepeerProviderProps) {
  return (
    <LivepeerConfig client={livepeerClient}>
      {children}
    </LivepeerConfig>
  )
}
