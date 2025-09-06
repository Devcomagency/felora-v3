import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    return NextResponse.json({ success: true, message: updated })
  } catch (e) {
    console.error('messages/ack error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
