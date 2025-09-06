import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id
    if (!userId) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversationId') || ''
    if (!conversationId) return NextResponse.json({ error: 'missing_conversation' }, { status: 400 })

    const conv = await prisma.e2EEConversation.findUnique({ where: { id: conversationId } })
    if (!conv) return NextResponse.json({ error: 'conversation_not_found' }, { status: 404 })
    if (!(conv.participants as any)?.includes(userId)) return NextResponse.json({ error: 'not_authorized' }, { status: 403 })

    const messages = await prisma.e2EEMessageEnvelope.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' }, take: 200 })
    return NextResponse.json({ messages })
  } catch (e) {
    console.error('e2ee/messages/history error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

