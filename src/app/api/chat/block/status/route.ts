import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id
    const { searchParams } = new URL(req.url)
    const targetUserId = searchParams.get('targetUserId') || ''
    if (!userId) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
    if (!targetUserId) return NextResponse.json({ error: 'missing_target' }, { status: 400 })

    const blk = await prisma.userBlock.findUnique({
      where: { blockerUserId_blockedUserId: { blockerUserId: userId, blockedUserId: targetUserId } }
    })
    return NextResponse.json({ blocked: !!blk })
  } catch (e) {
    console.error('block/status error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

