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
    
    const { role: rawRole, ...data } = body || {}
    const role = (rawRole as string) || 'ESCORT'

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

    // Support des deux formats: URLs (mobile) et Keys (desktop)
    const extractKey = (urlOrKey?: string) => {
      if (!urlOrKey) return undefined
      // Si c'est déjà une clé (pas d'URL), la retourner
      if (!urlOrKey.includes('/')) return urlOrKey
      // Sinon, extraire la clé de l'URL
      return urlOrKey.split('/').pop() || undefined
    }

    // Normaliser les données reçues (support des deux formats)
    const fileKeys = {
      docFrontKey: data.docFrontKey || extractKey(data.docFrontUrl),
      docBackKey: data.docBackKey || extractKey(data.docBackUrl),
      selfieSignKey: data.selfieSignKey || extractKey(data.selfieSignUrl),
      livenessKey: data.livenessKey || extractKey(data.livenessVideoUrl)
    }

    console.log('Normalized fileKeys:', fileKeys, 'from data:', Object.keys(data))

    // Reconstruire les URLs à partir des clés
    const buildUrl = (key?: string) => {
      if (!key) return undefined
      // Si c'est déjà une URL complète, la retourner
      if (key.startsWith('http')) return key
      // Sinon, construire l'URL locale
      return `/api/kyc-v2/file/${encodeURIComponent(key)}`
    }

    // Validate required documents
    const required = ['docFrontKey','docBackKey','selfieSignKey','livenessKey'] as const
    const missing = required.filter((k)=> !fileKeys[k])
    if (missing.length) {
      console.log('Missing document keys:', missing, 'Received:', Object.keys(data), 'Normalized:', fileKeys)
      return NextResponse.json({ error: 'missing_documents', missing, debug: { received: Object.keys(data), normalized: fileKeys } }, { status: 400 })
    }

    // Reconstruire les URLs pour la base de données
    const urls = {
      docFrontUrl: buildUrl(fileKeys.docFrontKey),
      docBackUrl: buildUrl(fileKeys.docBackKey),
      selfieSignUrl: buildUrl(fileKeys.selfieSignKey),
      livenessVideoUrl: buildUrl(fileKeys.livenessKey)
    }

    const notes = {
      kycKeys: {
        selfieSignKey: fileKeys.selfieSignKey,
        docFrontKey: fileKeys.docFrontKey,
        docBackKey: fileKeys.docBackKey,
        livenessKey: fileKeys.livenessKey,
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
