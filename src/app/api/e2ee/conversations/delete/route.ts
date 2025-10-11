import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { jwtVerify } from 'jose'

export async function POST(request: NextRequest) {
  try {
    const { conversationId } = await request.json()
    
    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId requis' }, { status: 400 })
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
          console.error('[DELETE CONVERSATION] Error decoding JWT:', jwtError)
        }
      }
    }
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await prisma.e2EEConversation.findUnique({
      where: { id: conversationId }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 })
    }

    const participants = conversation.participants as string[]
    if (!participants.includes(user.id)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Supprimer tous les messages de la conversation
    await prisma.e2EEMessageEnvelope.deleteMany({
      where: { conversationId }
    })

    // Supprimer les marqueurs de lecture
    await prisma.e2EEConversationRead.deleteMany({
      where: { conversationId }
    })

    // Supprimer la conversation
    await prisma.e2EEConversation.delete({
      where: { id: conversationId }
    })

    console.log(`[DELETE CONVERSATION] Conversation ${conversationId} deleted by user ${user.id}`)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[DELETE CONVERSATION] Error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

