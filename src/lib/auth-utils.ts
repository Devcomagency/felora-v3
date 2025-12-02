import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

/**
 * 🔐 SÉCURITÉ : Récupère l'utilisateur authentifié de manière sécurisée
 * Utilise UNIQUEMENT getServerSession (pas de décodage JWT non vérifié)
 */
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Utiliser getServerSession (source de vérité sécurisée)
    const session = await getServerSession(authOptions)

    if (session?.user?.id) {
      return {
        success: true,
        user: session.user
      }
    }

    // Pas de session valide
    return {
      success: false,
      error: 'Non authentifié'
    }

  } catch (error) {
    console.error('[AUTH] Authentication error:', error)
    return {
      success: false,
      error: 'Erreur d\'authentification'
    }
  }
}
