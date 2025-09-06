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
    const reason = body?.reason ? String(body.reason) : undefined
    if (!targetUserId) return NextResponse.json({ error: 'missing_target' }, { status: 400 })
    if (targetUserId === userId) return NextResponse.json({ error: 'cannot_block_self' }, { status: 400 })

    await prisma.userBlock.upsert({
      where: { blockerUserId_blockedUserId: { blockerUserId: userId, blockedUserId: targetUserId } },
      update: { reason },
      create: { blockerUserId: userId, blockedUserId: targetUserId, reason },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('chat/block error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

