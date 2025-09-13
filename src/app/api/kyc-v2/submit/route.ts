import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Configuration pour accepter les gros payloads JSON
export const maxDuration = 30
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    // Basic rate limit: 10 requests / 60s per IP
    const { rateLimit, rateKey } = await import('@/lib/rate-limit')
    const key = rateKey(req as any, 'kyc-submit')
    const rl = rateLimit({ key, limit: 10, windowMs: 60_000 })
    if (!rl.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    const session = await getServerSession(authOptions as any)
    const body = await req.json().catch(() => ({}))
    const bodyUserId = String(body?.userId || '').trim()
    const sessionUid = (session as any)?.user?.id as string | undefined
    const uid = sessionUid || (bodyUserId || undefined)
    if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    // Security: ensure the target user exists and is ESCORT or in signup flow
    const user = await prisma.user.findUnique({ where: { id: uid }, select: { id: true, role: true } })
    if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
    if (user.role !== 'ESCORT' as any) {
      // Allow only escort role to submit KYC
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const { role: rawRole, ...urls } = body || {}
    const role = (rawRole as string) || 'ESCORT'

    // Derive storage keys from URLs (R2 signed URL or local API path)
    const deriveKey = (u?: string) => {
      if (!u) return undefined
      try {
        if (u.startsWith('/api/kyc-v2/file/')) return decodeURIComponent(u.split('/').pop() || '')
        const url = new URL(u)
        // Path like /<bucket>/<folder>/<filename>
        const parts = url.pathname.replace(/^\/+/, '').split('/')
        if (process.env.CLOUDFLARE_R2_BUCKET && parts[0] === process.env.CLOUDFLARE_R2_BUCKET) parts.shift()
        return parts.join('/').split('?')[0]
      } catch { return undefined }
    }
    // Validate required documents
    const required = ['docFrontUrl','docBackUrl','selfieSignUrl','selfieUrl','livenessVideoUrl']
    const missing = required.filter((k)=> !urls?.[k])
    if (missing.length) {
      return NextResponse.json({ error: 'missing_documents', missing }, { status: 400 })
    }

    const notes = {
      kycKeys: {
        selfieKey: deriveKey(urls?.selfieUrl),
        selfieSignKey: deriveKey(urls?.selfieSignUrl),
        docFrontKey: deriveKey(urls?.docFrontUrl),
        docBackKey: deriveKey(urls?.docBackUrl),
        livenessKey: deriveKey((urls as any)?.livenessVideoUrl),
      }
    }

    await prisma.kycSubmission.upsert({
      where: { id: `${uid}_${role}` },
      update: { ...urls, status: 'PENDING' as any, notes: JSON.stringify(notes) },
      create: { id: `${uid}_${role}`, userId: uid, role: role as any, status: 'PENDING' as any, ...urls, notes: JSON.stringify(notes) }
    })
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'submit_failed' }, { status: 500 })
  }
}
