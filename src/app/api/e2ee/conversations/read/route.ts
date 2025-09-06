import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id
    if (!userId) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
    const body = await req.json().catch(() => ({}))
    const conversationId = String(body?.conversationId || '')
    if (!conversationId) return NextResponse.json({ error: 'missing_conversation' }, { status: 400 })

    // Ensure conversation exists and belongs to user
    const conv = await prisma.e2EEConversation.findUnique({ where: { id: conversationId } })
    if (!conv) return NextResponse.json({ error: 'conversation_not_found' }, { status: 404 })
    if (!(conv.participants as any)?.includes(userId)) return NextResponse.json({ error: 'not_authorized' }, { status: 403 })

    await prisma.e2EEConversationRead.upsert({
      where: { conversationId_userId: { conversationId, userId } },
      update: { lastReadAt: new Date() },
      create: { conversationId, userId, lastReadAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('conversations/read error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

