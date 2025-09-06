import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ hasEscortProfile: false })
    const escort = await prisma.escortProfile.findUnique({ where: { userId }, select: { id: true } })
    return NextResponse.json({ hasEscortProfile: !!escort, escortId: escort?.id || null })
  } catch (e:any) {
    return NextResponse.json({ hasEscortProfile: false, error: e?.message || 'server_error' }, { status: 200 })
  }
}

