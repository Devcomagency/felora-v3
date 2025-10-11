import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { jwtVerify } from 'jose'

export async function POST(request: NextRequest) {
  try {
    const { conversationId, ephemeralMode, ephemeralDuration } = await request.json()
    
    if (!conversationId) {
      return NextResponse.json({ error: 'ID de conversation requis' }, { status: 400 })
    }

    // Authentification
    let session = await getServerSession(authOptions)
    let user = null
    
    if (session?.user?.id) {
      user = session.user
    } else {
      const cookieHeader = request.headers.get('cookie')
      const sessionToken = cookieHeader?.match(/next-auth\.session-token=([^;]+)/)?.[1]
      
      if (sessionToken) {
        try {
          const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
          const { payload } = await jwtVerify(sessionToken, secret)
          
          if (payload.sub) {
            user = {
              id: payload.sub,
              email: payload.email as string,
              name: payload.name as string,
              role: (payload as any).role as string,
            }
          }
        } catch (jwtError) {
          console.error('[UPDATE EPHEMERAL] Error decoding JWT:', jwtError)
        }
      }
    }
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que la conversation existe et que l'utilisateur y participe
    const conversation = await prisma.e2EEConversation.findUnique({
      where: { id: conversationId }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 })
    }

    const participants = conversation.participants as string[]
    if (!participants.includes(user.id)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Mettre à jour les paramètres éphémères
    const updated = await prisma.e2EEConversation.update({
      where: { id: conversationId },
      data: {
        ephemeralMode: ephemeralMode || false,
        ephemeralDuration: ephemeralDuration || 86400
      }
    })

    return NextResponse.json({
      success: true,
      ephemeralMode: updated.ephemeralMode,
      ephemeralDuration: updated.ephemeralDuration
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du mode éphémère:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

