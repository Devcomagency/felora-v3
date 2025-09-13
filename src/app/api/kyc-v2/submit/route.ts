import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Configuration pour accepter les gros payloads JSON
export const maxDuration = 30
export const runtime = 'nodejs'
export const preferredRegion = 'auto'

// Configuration pour les gros payloads JSON (URLs longues R2/S3)

export async function POST(req: NextRequest) {
  try {
    // Basic rate limit: 10 requests / 60s per IP
    const { rateLimit, rateKey } = await import('@/lib/rate-limit')
    const key = rateKey(req as any, 'kyc-submit')
    const rl = rateLimit({ key, limit: 10, windowMs: 60_000 })
    if (!rl.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    
    const session = await getServerSession(authOptions as any)
    
    // Lecture du JSON - utilisation directe pour éviter body stream conflicts
    let body
    try {
      body = await req.json()
    } catch (e) {
      console.error('Failed to parse JSON:', e)
      return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
    }
    
    // Debug logging
    console.log('KYC Submit Debug:', {
      hasSession: !!session,
      sessionUserId: (session as any)?.user?.id,
      bodyUserId: body?.userId,
      bodyKeys: Object.keys(body || {})
    })
    
    const bodyUserId = String(body?.userId || '').trim()
    const sessionUid = (session as any)?.user?.id as string | undefined
    
    // Priorité: session > body > fallback pour signup
    let uid = sessionUid || bodyUserId || undefined
    
    // Si toujours pas d'ID mais qu'on a une session, utiliser l'email comme fallback
    const sessionUser = (session as any)?.user
    if (!uid && sessionUser?.email) {
      console.log('Fallback: trying to find user by email:', sessionUser.email)
      const userByEmail = await prisma.user.findUnique({ 
        where: { email: sessionUser.email },
        select: { id: true }
      })
      uid = userByEmail?.id
    }
    
    // Si toujours pas d'ID mais qu'on a un bodyUserId valide, l'utiliser directement
    if (!uid && bodyUserId && bodyUserId !== '') {
      console.log('Using bodyUserId directly:', bodyUserId)
      uid = bodyUserId
    }
    
    if (!uid) {
      console.error('No valid userId found:', { 
        sessionUid, 
        bodyUserId, 
        sessionEmail: sessionUser?.email,
        sessionUser: sessionUser,
        body: body
      })
      return NextResponse.json({ 
        error: 'unauthorized', 
        debug: { 
          hasSession: !!session, 
          bodyUserId: !!bodyUserId, 
          email: !!sessionUser?.email,
          sessionUser: sessionUser,
          bodyKeys: Object.keys(body || {})
        }
      }, { status: 401 })
    }

    // Security: ensure the target user exists and is ESCORT or in signup flow
    let user = await prisma.user.findUnique({ where: { id: uid }, select: { id: true, role: true } })
    
    // Si l'utilisateur n'existe pas, créer un utilisateur temporaire
    if (!user) {
      console.log('Creating temporary user for KYC:', { uid, role, hasSession: !!sessionUser })
      try {
        user = await prisma.user.create({
          data: {
            id: uid,
            email: sessionUser?.email || `temp-${uid}@felora.com`,
            role: role || 'ESCORT',
            name: sessionUser?.name || 'Temporary User',
            emailVerified: null,
            image: sessionUser?.image || null,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          select: { id: true, role: true }
        })
        console.log('Temporary user created:', user)
      } catch (createError) {
        console.error('Failed to create temporary user:', createError)
        return NextResponse.json({ error: 'user_creation_failed' }, { status: 500 })
      }
    }
    
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
    const required = ['docFrontUrl','docBackUrl','selfieSignUrl','livenessVideoUrl']
    const missing = required.filter((k)=> !urls?.[k])
    if (missing.length) {
      console.log('Missing documents:', missing, 'Received URLs:', Object.keys(urls || {}))
      return NextResponse.json({ error: 'missing_documents', missing }, { status: 400 })
    }

    const notes = {
      kycKeys: {
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
