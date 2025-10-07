import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { jwtVerify } from 'jose'

export async function POST(request: NextRequest) {
  try {
    console.log('[API DEBUG] Creating conversation - Headers:', request.headers.get('cookie'))
    console.log('[API DEBUG] Request headers:', Object.fromEntries(request.headers.entries()))
    
    // Essayer d'abord getServerSession
    let session = await getServerSession(authOptions)
    let user = null
    
    if (session?.user?.id) {
      user = session.user
      console.log('[API DEBUG] Authenticated via getServerSession:', { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: (user as any).role 
      })
    } else {
      // Fallback : essayer de décoder le JWT directement
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
            console.log('[API DEBUG] Authenticated via JWT decode:', { 
              id: user.id, 
              email: user.email, 
              name: user.name, 
              role: user.role 
            })
          }
        } catch (jwtError) {
          console.error('[API DEBUG] Error decoding JWT:', jwtError)
        }
      }
    }
    
    if (!user?.id) {
      console.log('[API DEBUG] Authentication failed: No valid user found')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { participantId, introMessage } = await request.json()
    
    if (!participantId) {
      return NextResponse.json({ error: 'ID du participant requis' }, { status: 400 })
    }

    // Vérifier que l'utilisateur cible existe
    const targetUser = await prisma.user.findUnique({
      where: { id: participantId },
      select: { id: true, name: true, role: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    // Vérifier que l'utilisateur connecté est un client
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, role: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Seuls les clients peuvent initier des conversations avec les escortes
    if (currentUser.role !== 'client') {
      return NextResponse.json({ 
        error: 'Seuls les clients peuvent initier des conversations' 
      }, { status: 403 })
    }

    // Vérifier que l'utilisateur cible est une escorte
    if (targetUser.role !== 'escort') {
      return NextResponse.json({ 
        error: 'Vous ne pouvez contacter que des escortes' 
      }, { status: 403 })
    }

    // Vérifier si une conversation E2EE existe déjà entre ces deux utilisateurs
    const existingConversation = await prisma.e2EEConversation.findFirst({
      where: {
        participants: {
          has: user.id
        }
      }
    })

    // Vérifier si l'autre participant est dans la conversation
    let conversationToUse = null
    if (existingConversation && Array.isArray(existingConversation.participants)) {
      const participants = existingConversation.participants as string[]
      if (participants.includes(participantId)) {
        conversationToUse = existingConversation
      }
    }

    if (conversationToUse) {
      // Récupérer les informations des participants
      const allParticipantIds = conversationToUse.participants as string[]
      const users = await prisma.user.findMany({ 
        where: { id: { in: allParticipantIds } }, 
        select: { id: true, name: true, role: true } 
      })
      
      const participants = allParticipantIds.map(pid => {
        const user = users.find(u => u.id === pid)
        return {
          id: pid,
          name: user?.name || 'Utilisateur',
          role: user?.role || 'client',
          isPremium: false,
          isVerified: false,
          onlineStatus: 'offline'
        }
      })

      return NextResponse.json({ 
        conversation: {
          id: conversationToUse.id,
          participants,
          lastMessage: null, // Pas de message d'intro pour les conversations existantes
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
          isArchived: false,
          isBlocked: false,
          createdAt: conversationToUse.createdAt,
          updatedAt: conversationToUse.updatedAt
        }
      })
    }

    // Créer une nouvelle conversation E2EE
    const conversation = await prisma.e2EEConversation.create({
      data: {
        participants: [user.id, participantId]
      }
    })

    // Récupérer les informations des participants pour la nouvelle conversation
    const users = await prisma.user.findMany({ 
      where: { id: { in: [user.id, participantId] } }, 
      select: { id: true, name: true, role: true } 
    })
    
    const participants = [user.id, participantId].map(pid => {
      const userData = users.find(u => u.id === pid)
      return {
        id: pid,
        name: userData?.name || 'Utilisateur',
        role: userData?.role || 'client',
        isPremium: false,
        isVerified: false,
        onlineStatus: 'offline'
      }
    })

    // Si un message d'introduction est fourni, l'envoyer via l'API E2EE
    if (introMessage) {
      try {
        // Envoyer le message d'introduction via l'API E2EE
        const messageResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/e2ee/messages/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: conversation.id,
            senderUserId: user.id,
            senderDeviceId: `${user.id}-device`,
            messageId: `intro-${Date.now()}`,
            cipherText: Buffer.from(introMessage).toString('base64') // Encodage simple pour le message d'intro
          })
        })

        if (messageResponse.ok) {
          console.log('Message d\'introduction envoyé avec succès')
        } else {
          console.error('Erreur lors de l\'envoi du message d\'introduction')
        }
      } catch (messageError) {
        console.error('Erreur lors de l\'envoi du message d\'introduction:', messageError)
      }
    }

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        participants,
        lastMessage: null,
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        isArchived: false,
        isBlocked: false,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      }
    })

  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}