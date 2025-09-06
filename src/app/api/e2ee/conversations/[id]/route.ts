import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
    const { id } = await ctx.params
    if (!id) return NextResponse.json({ error: 'missing_conversation' }, { status: 400 })

    const conv = await prisma.e2EEConversation.findUnique({ where: { id } })
    if (!conv) return NextResponse.json({ error: 'conversation_not_found' }, { status: 404 })
    const parts: string[] = Array.isArray(conv.participants) ? (conv.participants as any) : []
    if (!parts.includes(userId)) return NextResponse.json({ error: 'not_authorized' }, { status: 403 })

    // Delete envelopes and reads, then conversation
    await prisma.e2EEMessageEnvelope.deleteMany({ where: { conversationId: id } })
    await prisma.e2EEConversationRead.deleteMany({ where: { conversationId: id } })
    await prisma.e2EEConversation.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    console.error('DELETE /api/e2ee/conversations/[id] error:', e?.message)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

