import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { jwtVerify } from 'jose'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    if (!conversationId) {
      return NextResponse.json({ error: 'ID de conversation requis' }, { status: 400 })
    }

    // Authentification
    let session = await getServerSession(authOptions)
    let user = null
    
    if (session?.user?.id) {
      user = session.user
    } else {
      // Fallback : décoder le JWT directement
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
          console.error('[HISTORY API] Error decoding JWT:', jwtError)
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

    // Récupérer les messages de la conversation avec pagination
    const messages = await prisma.e2EEMessageEnvelope.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      skip: offset,
      take: limit
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 })
    }

    // Vérifier que l'utilisateur participe à la conversation
    const participants = conversation.participants as string[]
    if (!participants.includes(user.id)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Formater les messages au format Envelope attendu par E2EEThread
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      messageId: msg.messageId || msg.id,
      senderUserId: msg.senderUserId,
      cipherText: msg.cipherText,
      attachmentUrl: msg.attachmentUrl,
      attachmentMeta: msg.attachmentMeta,
      createdAt: msg.createdAt.toISOString(),
      status: msg.readAt ? 'read' : (msg.deliveredAt ? 'delivered' : 'sent'),
      viewMode: msg.viewMode,
      downloadable: msg.downloadable,
      expiresAt: msg.expiresAt?.toISOString(),
      viewedBy: msg.viewedBy || []
    }))

    return NextResponse.json({ 
      messages: formattedMessages,
      hasMore: formattedMessages.length === limit,
      offset,
      limit
    })

  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}