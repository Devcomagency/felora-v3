import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    const uid = (session as any)?.user?.id as string | undefined
    if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const interval = searchParams.get('interval') || 'day'
    const n = interval === 'month' ? 12 : interval === 'week' ? 12 : 14
    const series = Array.from({ length: n }).map((_, i) => ({ t: Date.now() - (n-i)*86400000, v: Math.round(10 + Math.random()*90) }))
    return NextResponse.json({ series, interval })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 })
  }
}

