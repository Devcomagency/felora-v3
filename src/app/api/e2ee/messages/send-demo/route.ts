import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// Note: avoid static import of pushSSE to prevent stale cache issues; use dynamic import instead

// Demo endpoint (no auth) to keep /messages-test working
export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  try {
    const body = await req.json()
    const { conversationId, senderUserId, senderDeviceId, messageId, cipherText, attachment } = body || {}
    if (!conversationId || !senderUserId || !senderDeviceId || !messageId || !cipherText) {
      return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
    }

    const conv = await prisma.e2EEConversation.findUnique({ where: { id: conversationId } })
    if (!conv) return NextResponse.json({ error: 'conversation_not_found' }, { status: 404 })

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

    ;(await import('@/app/api/e2ee/messages/stream')).pushSSE(conversationId, created)
    return NextResponse.json({ success: true, message: created })
  } catch (e) {
    console.error('messages/send-demo error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
