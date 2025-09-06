import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { isGroup, name, participants, initiatorUserId } = body || {}
    if (!Array.isArray(participants) || participants.length < 2) {
      return NextResponse.json({ error: 'invalid_participants' }, { status: 400 })
    }
    if (!initiatorUserId || !participants.includes(initiatorUserId)) {
      return NextResponse.json({ error: 'initiator_not_in_participants' }, { status: 400 })
    }

    // Normalise participants (trim + dedupe) and deterministically build key
    const norm = (Array.isArray(participants) ? participants : []).map((s: any) => String(s).trim()).filter(Boolean)
    const uniq = Array.from(new Set(norm))
    const key = uniq.slice().sort().join('|')

    const conv = await prisma.e2EEConversation.upsert({
      where: { participantsKey: key },
      update: { updatedAt: new Date() },
      create: {
        isGroup: !!isGroup,
        name: name || null,
        participants: uniq,
        participantsKey: key,
      }
    })

    return NextResponse.json({ success: true, conversation: conv })
  } catch (e) {
    console.error('conversations/create error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
