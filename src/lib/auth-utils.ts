import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Essayer d'abord getServerSession
    let session = await getServerSession(authOptions)
    
    if (session?.user?.id) {
      return {
        success: true,
        user: session.user
      }
    }

    // Si getServerSession ne fonctionne pas, essayer de décoder le JWT directement
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) {
      return { success: false, error: 'No cookies found' }
    }

    // Essayer de récupérer le token de session depuis les cookies
    const sessionToken = cookieHeader.match(/next-auth\.session-token=([^;]+)/)?.[1]
    if (!sessionToken) {
      return { success: false, error: 'No session token found' }
    }

    try {
      // Décoder le JWT sans vérification de signature (pour le debug)
      const payload = JSON.parse(Buffer.from(sessionToken.split('.')[1], 'base64').toString())
      
      if (payload.sub) {
        return {
          success: true,
          user: {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            role: payload.role
          }
        }
      }
    } catch (jwtError) {
      console.error('[AUTH DEBUG] Error decoding JWT:', jwtError)
    }

    return { success: false, error: 'Unable to authenticate user' }
  } catch (error) {
    console.error('[AUTH DEBUG] Authentication error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}
