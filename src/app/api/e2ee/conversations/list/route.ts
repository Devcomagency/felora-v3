import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

    // Fetch conversations (filter in app because participants stored as JSON)
    const convs = await prisma.e2EEConversation.findMany({ orderBy: { updatedAt: 'desc' } })
    const mine = convs.filter((c: any) => Array.isArray(c.participants) && (c.participants as any).includes(userId))

    // Batch last messages per conversation
    const convIds = mine.map(c => c.id)
    const lastMessagesAll = await prisma.e2EEMessageEnvelope.findMany({
      where: { conversationId: { in: convIds } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, conversationId: true, senderUserId: true, cipherText: true, attachmentUrl: true, createdAt: true }
    })
    const lastByConv = new Map<string, typeof lastMessagesAll[number]>()
    for (const m of lastMessagesAll) {
      if (!lastByConv.has(m.conversationId)) lastByConv.set(m.conversationId, m)
    }

    // 🔥 Compter TOUS les messages non lus (pas juste le dernier)
    const allMessages = await prisma.e2EEMessageEnvelope.findMany({
      where: {
        conversationId: { in: convIds },
        senderUserId: { not: userId }, // Seulement les messages reçus
        readAt: null // Non lus
      },
      select: { conversationId: true }
    })
    const unreadByConv = new Map<string, number>()
    for (const m of allMessages) {
      unreadByConv.set(m.conversationId, (unreadByConv.get(m.conversationId) || 0) + 1)
    }

    // Batch users
    const allParticipantIds = Array.from(new Set(mine.flatMap(c => (c.participants as any as string[]) || [])))
    const users = await prisma.user.findMany({ where: { id: { in: allParticipantIds } }, select: { id: true, name: true, role: true } })
    const escortProfiles = await prisma.escortProfile.findMany({ where: { userId: { in: allParticipantIds } }, select: { userId: true, stageName: true, profilePhoto: true } })
    const stageByUser = new Map<string, string>()
    const photoByUser = new Map<string, string | null>()
    for (const ep of escortProfiles) {
      stageByUser.set(ep.userId, ep.stageName || '')
      photoByUser.set(ep.userId, ep.profilePhoto)
    }
    // Batch read markers
    const reads = await prisma.e2EEConversationRead.findMany({ where: { conversationId: { in: convIds }, userId } })
    const readMap = new Map<string, Date>()
    for (const r of reads) readMap.set(r.conversationId, r.lastReadAt)

    const result = mine.map(c => {
      const parts: string[] = (c.participants as any) || []
      const participants = parts.map(pid => {
        const u = users.find(x => x.id === pid)
        const display = stageByUser.get(pid) || u?.name || pid
        const avatar = photoByUser.get(pid) || null
        return { id: pid, name: display, avatar, role: (u?.role || 'client') as any, isPremium: false, isVerified: false, onlineStatus: 'offline' }
      })
      const last = lastByConv.get(c.id)
      const lastMsg = last
        ? {
            id: last.id,
            conversationId: c.id,
            senderId: last.senderUserId,
            type: last.attachmentUrl ? 'file' : 'text',
            content: last.attachmentUrl
              ? '[Pièce jointe]'
              : ((): string => {
                  try {
                    const ct = last.cipherText || ''
                    if (ct.startsWith('sg:')) return 'Message chiffré'
                    return Buffer.from(ct, 'base64').toString('utf8')
                  } catch {
                    return 'Message chiffré'
                  }
                })(),
            status: 'sent',
            createdAt: last.createdAt as any,
            updatedAt: last.createdAt as any,
          }
        : undefined
      const lastReadAt = readMap.get(c.id)
      const unreadCount = unreadByConv.get(c.id) || 0 // 🔥 Nombre réel de messages non lus
      return {
        id: c.id,
        type: 'direct',
        participants,
        lastMessage: lastMsg,
        unreadCount,
        isPinned: false,
        isMuted: false,
        isArchived: false,
        isBlocked: false,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }
    })

    // Dédupliquer côté serveur par sécurité
    const uniqueResult = Array.from(
      new Map(result.map((conv: any) => [conv.id, conv])).values()
    )

    if (uniqueResult.length !== result.length) {
      console.warn('[E2EE LIST API] ⚠️ Doublons détectés et supprimés:', result.length - uniqueResult.length)
    }

    return NextResponse.json({ conversations: uniqueResult })
  } catch (e) {
    console.error('e2ee/conversations/list error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
