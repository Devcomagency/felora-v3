import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { jwtVerify } from 'jose'

export async function POST(request: NextRequest) {
  try {
    const { conversationId, senderUserId, senderDeviceId, messageId, cipherText } = await request.json()
    
    if (!conversationId || !senderUserId || !messageId || !cipherText) {
      return NextResponse.json({ 
        error: 'Paramètres requis manquants' 
      }, { status: 400 })
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
          console.error('[SEND API] Error decoding JWT:', jwtError)
        }
      }
    }
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que l'utilisateur peut envoyer des messages dans cette conversation
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

    // Créer le message
    const message = await prisma.e2EEMessageEnvelope.create({
      data: {
        conversationId,
        senderUserId,
        senderDeviceId: senderDeviceId || `${senderUserId}-device`,
        cipherText,
        messageId,
        status: 'SENT'
      }
    })

    // Mettre à jour la conversation avec le dernier message
    await prisma.e2EEConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({ 
      message: {
        id: message.id,
        content: message.cipherText,
        senderId: message.senderUserId,
        timestamp: message.createdAt,
        isRead: message.readAt !== null,
        isEncrypted: true
      }
    })

  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}