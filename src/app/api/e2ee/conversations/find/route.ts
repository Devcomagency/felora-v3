import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    // participants=a,b or multiple params
    const p = searchParams.get('participants')
    let participants: string[] = []
    if (p) participants = p.split(',').map(s => s.trim()).filter(Boolean)
    if (participants.length < 2) {
      return NextResponse.json({ error: 'need_at_least_two_participants' }, { status: 400 })
    }

    // Build deterministic key to find the unique conversation
    const uniq = Array.from(new Set(participants.map(s => String(s).trim()).filter(Boolean)))
    const key = uniq.slice().sort().join('|')
    const conv = await prisma.e2EEConversation.findUnique({ where: { participantsKey: key } })
    if (!conv) return NextResponse.json({ conversation: null })
    return NextResponse.json({ conversation: conv })
  } catch (e) {
    console.error('conversations/find error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
