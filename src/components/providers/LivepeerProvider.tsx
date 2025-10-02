'use client'

import { LivepeerConfig, createReactClient } from '@livepeer/react'
import { ReactNode } from 'react'

// Créer le client Livepeer (nouvelle API v4+)
const livepeerClient = createReactClient({
  // Le provider n'est plus nécessaire dans la v4+
  // La clé API se configure directement
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
