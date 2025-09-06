import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any)
    const role = (session as any)?.user?.role
    if (role !== 'ADMIN') return NextResponse.json({ error: 'not_authorized' }, { status: 403 })

    const subs = await prisma.kycSubmission.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        userId: true,
        role: true,
        status: true,
        selfieUrl: true,
        selfieSignUrl: true,
        docFrontUrl: true,
        docBackUrl: true,
        livenessVideoUrl: true,
        notes: true,
        updatedAt: true,
      }
    })

    const items = subs.map(s => {
      let keys: any = {}
      try {
        const parsed = s.notes ? JSON.parse(s.notes) : null
        keys = parsed?.kycKeys || {}
      } catch {}
      return { ...s, keys }
    })

    return NextResponse.json({ items })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 })
  }
}

