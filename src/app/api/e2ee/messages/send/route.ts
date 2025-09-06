import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { pushSSE } from '@/app/api/e2ee/messages/stream'

export async function POST(req: Request) {
  try {
    // Basic rate limit: 30 messages / 60s per IP
    const { rateLimit, rateKey } = await import('@/lib/rate-limit')
    const key = rateKey(req, 'e2ee-send')
    const rl = rateLimit({ key, limit: 30, windowMs: 60_000 })
    if (!rl.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    const session = await getServerSession(authOptions)
    const sessionUserId = (session as any)?.user?.id || ''
    const body = await req.json()
    const { conversationId, senderUserId, senderDeviceId, messageId, cipherText, attachment } = body || {}
    if (!conversationId || !senderUserId || !senderDeviceId || !messageId || !cipherText) {
      return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
    }
    if (!sessionUserId || sessionUserId !== senderUserId) {
      return NextResponse.json({ error: 'not_authorized' }, { status: 403 })
    }

    // Ensure conversation exists and the sender is a participant
    const conv = await prisma.e2EEConversation.findUnique({ where: { id: conversationId } })
    if (!conv) return NextResponse.json({ error: 'conversation_not_found' }, { status: 404 })
    if (!conv.participants.includes(senderUserId)) return NextResponse.json({ error: 'not_authorized' }, { status: 403 })

    // Idempotency by (conversationId, messageId)
    const existing = await prisma.e2EEMessageEnvelope.findUnique({ where: { conversationId_messageId: { conversationId, messageId } } })
    if (existing) return NextResponse.json({ success: true, message: existing })

    const created = await prisma.e2EEMessageEnvelope.create({
      data: {
        conversationId,
        senderUserId,
        senderDeviceId,
        messageId,
        cipherText,
        attachmentUrl: attachment?.url || null,
        attachmentMeta: attachment?.meta || null,
      }
    })

    // TODO: Fan-out via SSE (push to stream)
    pushSSE(conversationId, created)

    return NextResponse.json({ success: true, message: created })
  } catch (e) {
    console.error('messages/send error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

// Fan-out moved to ../stream for shared registry
