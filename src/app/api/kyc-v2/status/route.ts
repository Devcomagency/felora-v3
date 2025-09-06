import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ status: 'NONE' })

    const sub = await prisma.kycSubmission.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { status: true },
    })
    if (!sub) return NextResponse.json({ status: 'NONE' })
    // Map DB enum to UI values
    const map: Record<string, 'PENDING' | 'APPROVED' | 'REJECTED'> = {
      PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED'
    }
    const status = map[(sub.status as any) || 'PENDING'] || 'PENDING'
    return NextResponse.json({ status })
  } catch (e:any) {
    return NextResponse.json({ status: 'NONE', error: e?.message || 'server_error' }, { status: 200 })
  }
}

