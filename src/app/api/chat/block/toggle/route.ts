import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id
    const body = await req.json().catch(() => ({}))
    const targetUserId = String(body?.targetUserId || '')
    if (!userId) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
    if (!targetUserId) return NextResponse.json({ error: 'missing_target' }, { status: 400 })

    const existing = await prisma.userBlock.findUnique({ where: { blockerUserId_blockedUserId: { blockerUserId: userId, blockedUserId: targetUserId } } })
    if (existing) {
      await prisma.userBlock.delete({ where: { blockerUserId_blockedUserId: { blockerUserId: userId, blockedUserId: targetUserId } } })
      return NextResponse.json({ success: true, blocked: false })
    } else {
      await prisma.userBlock.create({ data: { blockerUserId: userId, blockedUserId: targetUserId } })
      return NextResponse.json({ success: true, blocked: true })
    }
  } catch (e) {
    console.error('block/toggle error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

