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
      console.log('[API DEBUG] Missing participantId in request body')
      return NextResponse.json({ error: 'ID du participant requis' }, { status: 400 })
    }

    console.log('[API DEBUG] Looking for target user or profile:', participantId)

    // Essayer de trouver l'utilisateur directement
    let targetUser = await prisma.user.findUnique({
      where: { id: participantId },
      select: { id: true, name: true, role: true }
    })

    // Si pas trouvé, c'est peut-être un Profile ID - chercher dans escort_profiles
    if (!targetUser) {
      console.log('[API DEBUG] Not a User ID, checking if it\'s a Profile ID in escort_profiles...')
      const profile = await prisma.escortProfile.findUnique({
        where: { id: participantId },
        select: {
          userId: true,
          user: {
            select: { id: true, name: true, role: true }
          }
        }
      })

      if (profile) {
        console.log('[API DEBUG] escort_profiles found, using User ID:', profile.userId)
        targetUser = profile.user
      } else {
        // Essayer aussi EscortProfileV2
        console.log('[API DEBUG] Not in escort_profiles, checking EscortProfileV2...')
        const profileV2 = await prisma.escortProfileV2.findUnique({
          where: { id: participantId },
          select: {
            userId: true,
            user: {
              select: { id: true, name: true, role: true }
            }
          }
        })

        if (profileV2) {
          console.log('[API DEBUG] EscortProfileV2 found, using User ID:', profileV2.userId)
          targetUser = profileV2.user
        }
      }
    }

    if (!targetUser) {
      console.log('[API DEBUG] Target user/profile not found:', participantId)
      return NextResponse.json({
        error: 'Utilisateur introuvable',
        details: `L'utilisateur ou le profil avec l'ID ${participantId} n'existe pas`
      }, { status: 404 })
    }

    console.log('[API DEBUG] Target user found:', targetUser)

    // Vérifier que l'utilisateur connecté est un client
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, role: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Seuls les clients peuvent initier des conversations avec les escortes
    if (currentUser.role !== 'CLIENT') {
      return NextResponse.json({
        error: 'Seuls les clients peuvent initier des conversations'
      }, { status: 403 })
    }

    // Vérifier que l'utilisateur cible est une escorte
    if (targetUser.role !== 'ESCORT') {
      return NextResponse.json({
        error: 'Vous ne pouvez contacter que des escortes'
      }, { status: 403 })
    }

    // Vérifier si une conversation E2EE existe déjà entre ces deux utilisateurs
    // On récupère toutes les conversations et on filtre en JavaScript car JSON queries sont complexes
    console.log('[API DEBUG] Checking for existing conversation between:', user.id, 'and', targetUser.id)
    const allConversations = await prisma.e2EEConversation.findMany()

    let conversationToUse = null
    for (const conv of allConversations) {
      if (Array.isArray(conv.participants)) {
        const participants = conv.participants as string[]
        // Vérifier si les deux utilisateurs sont dans cette conversation (ORDER DOESN'T MATTER)
        const hasUser = participants.includes(user.id)
        const hasTarget = participants.includes(targetUser.id)
        console.log('[API DEBUG] Conversation', conv.id, 'participants:', participants, '- hasUser:', hasUser, 'hasTarget:', hasTarget)

        if (hasUser && hasTarget && participants.length === 2) {
          console.log('[API DEBUG] ✅ Existing conversation found:', conv.id)
          conversationToUse = conv
          break
        }
      }
    }

    if (!conversationToUse) {
      console.log('[API DEBUG] ❌ No existing conversation found, will create new one')
    }

    if (conversationToUse) {
      console.log('[API DEBUG] Conversation found, enriching participant data...')

      // Récupérer les informations des participants
      const allParticipantIds = conversationToUse.participants as string[]
      const users = await prisma.user.findMany({
        where: { id: { in: allParticipantIds } },
        select: { id: true, name: true, role: true }
      })

      // Récupérer les profils escort pour les escorts
      const escortProfiles = await prisma.escortProfile.findMany({
        where: { userId: { in: allParticipantIds } },
        select: { userId: true, stageName: true, profilePhoto: true }
      })

      const participants = allParticipantIds.map(pid => {
        const user = users.find(u => u.id === pid)
        const escortProfile = escortProfiles.find(ep => ep.userId === pid)

        return {
          id: pid,
          name: escortProfile?.stageName || user?.name || 'Utilisateur',
          avatar: escortProfile?.profilePhoto || null,
          role: user?.role || 'client',
          isPremium: false,
          isVerified: false,
          onlineStatus: 'offline'
        }
      })

      console.log('[API DEBUG] Returning existing conversation with enriched participants:', participants)

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

    // Créer une nouvelle conversation E2EE avec les User IDs (pas les Profile IDs !)
    console.log('[API DEBUG] Creating new conversation between:', user.id, 'and', targetUser.id)

    // Générer un participantsKey unique basé sur les IDs triés (pour éviter collision)
    const sortedIds = [user.id, targetUser.id].sort()
    const uniqueParticipantsKey = `${sortedIds[0]}-${sortedIds[1]}-${Date.now()}`

    const conversation = await prisma.e2EEConversation.create({
      data: {
        participants: [user.id, targetUser.id],
        participantsKey: uniqueParticipantsKey // Clé unique pour cette conversation
      }
    })

    console.log('[API DEBUG] Creating new conversation, enriching participant data...')

    // Récupérer les informations des participants pour la nouvelle conversation
    const users = await prisma.user.findMany({
      where: { id: { in: [user.id, targetUser.id] } },
      select: { id: true, name: true, role: true }
    })

    // Récupérer les profils escort pour les escorts
    const escortProfiles = await prisma.escortProfile.findMany({
      where: { userId: { in: [user.id, targetUser.id] } },
      select: { userId: true, stageName: true, profilePhoto: true }
    })

    const participants = [user.id, targetUser.id].map(pid => {
      const userData = users.find(u => u.id === pid)
      const escortProfile = escortProfiles.find(ep => ep.userId === pid)

      return {
        id: pid,
        name: escortProfile?.stageName || userData?.name || 'Utilisateur',
        avatar: escortProfile?.profilePhoto || null,
        role: userData?.role || 'client',
        isPremium: false,
        isVerified: false,
        onlineStatus: 'offline'
      }
    })

    console.log('[API DEBUG] New conversation participants:', participants)

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