import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any)
    const uid = (session as any)?.user?.id as string | undefined
    if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const months = Array.from({ length: 12 }).map((_, i) => ({ label: `M${i+1}`, value: 200 + (i*30) }))
    return NextResponse.json({ months })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 })
  }
}

