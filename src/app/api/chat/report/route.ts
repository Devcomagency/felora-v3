import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id
    if (!userId) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const targetUserId = String(body?.targetUserId || '')
    const conversationId = body?.conversationId ? String(body.conversationId) : undefined
    const messageId = body?.messageId ? String(body.messageId) : undefined
    const reason = String(body?.reason || '')
    const details = body?.details ? String(body.details) : undefined

    if (!targetUserId || !reason) return NextResponse.json({ error: 'missing_fields' }, { status: 400 })

    const created = await prisma.chatReport.create({
      data: { reporterUserId: userId, targetUserId, conversationId, messageId, reason, details }
    })

    return NextResponse.json({ success: true, report: created })
  } catch (e) {
    console.error('chat/report error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

