import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    const uid = (session as any)?.user?.id as string | undefined
    if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    // Basic mock based on user id hash for stable results
    const seed = uid.split('').reduce((a,c)=>a+c.charCodeAt(0),0)
    const base = (n:number)=> Math.max(1, Math.round(n + (seed % 50)))

    const data = {
      vuesProfil: base(1240),
      reactions: base(320),
      fans: base(86),
      messages: base(210),
      revenus: base(980),
      reservations: base(24),
      delta: {
        vuesProfil: 12,
        reactions: 8,
        fans: 5,
        messages: 3,
        revenus: 10,
        reservations: -2,
      }
    }
    return NextResponse.json(data)
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 })
  }
}

