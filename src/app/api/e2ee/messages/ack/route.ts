import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sseBroadcaster } from '@/lib/sse-broadcast'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { conversationId, messageId, status } = body || {}

    if (!conversationId || !messageId || !status) {
      return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
    }

    const updateData: any = { status }
    if (status === 'DELIVERED') updateData.deliveredAt = new Date()
    if (status === 'READ') updateData.readAt = new Date()

    const updated = await prisma.e2EEMessageEnvelope.update({
      where: { conversationId_messageId: { conversationId, messageId } },
      data: updateData,
    })

    // Broadcast le changement de statut via SSE pour mise à jour en temps réel
    sseBroadcaster.broadcast(conversationId, {
      type: 'message_status_update',
      messageId,
      status: status.toLowerCase(), // 'DELIVERED' -> 'delivered', 'READ' -> 'read'
      deliveredAt: updateData.deliveredAt?.toISOString(),
      readAt: updateData.readAt?.toISOString(),
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ success: true, message: updated })
  } catch (e) {
    console.error('[E2EE ACK] Erreur:', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
