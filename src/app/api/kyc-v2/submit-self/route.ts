import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    // Basic rate limit: 10 requests / 60s per IP
    const { rateLimit, rateKey } = await import('@/lib/rate-limit')
    const key = rateKey(req, 'kyc-submit-self')
    const rl = rateLimit({ key, limit: 10, windowMs: 60_000 })
    if (!rl.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(()=> ({}))
    const role = (body?.role as string) || 'ESCORT'
    const { docFrontUrl, docBackUrl } = body || {}
    if (!docFrontUrl || !docBackUrl) return NextResponse.json({ error: 'missing_docs' }, { status: 400 })

    await prisma.kycSubmission.upsert({
      where: { id: `${userId}_${role}` },
      update: { docFrontUrl, docBackUrl, status: 'PENDING' as any },
      create: { id: `${userId}_${role}`, userId, role: role as any, docFrontUrl, docBackUrl, status: 'PENDING' as any },
    })
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'submit_failed' }, { status: 500 })
  }
}
