import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    const uid = (session as any)?.user?.id as string | undefined
    if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const total = 1200
    const orders = { amount: 600, pct: 50 }
    const paywalls = { amount: 360, pct: 30 }
    const gifts = { amount: 240, pct: 20 }
    return NextResponse.json({ orders, paywalls, gifts, total })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 })
  }
}

