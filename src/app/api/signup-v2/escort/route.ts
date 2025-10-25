import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Simple rate‑limit
    const { rateLimit, rateKey } = await import('@/lib/rate-limit')
    const rl = rateLimit({ key: rateKey(req as any, 'signup-escort'), limit: 15, windowMs: 60_000 })
    if (!rl.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

    const body = await req.json().catch(() => ({}))
    const email = String(body?.email || '').trim().toLowerCase()
    const password = String(body?.password || '')
    const confirm = String(body?.confirm || '')
    const phoneE164 = body?.phoneE164 ? String(body.phoneE164) : undefined
    const isAdult = Boolean(body?.isAdult)
    const acceptTos = Boolean(body?.acceptTos)

    if (!email || !email.includes('@')) return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
    if (!password || password.length < 6) return NextResponse.json({ error: 'weak_password' }, { status: 400 })
    if (password !== confirm) return NextResponse.json({ error: 'password_mismatch' }, { status: 400 })
    if (!isAdult) return NextResponse.json({ error: 'age_required' }, { status: 400 })
    if (!acceptTos) return NextResponse.json({ error: 'tos_required' }, { status: 400 })

    // Vérifier si email déjà utilisé
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
    if (existing) return NextResponse.json({ error: 'email_exists' }, { status: 409 })

    // Créer user minimal ESCORT
    const hash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        role: 'ESCORT' as any,
        phone: phoneE164 || null,
        name: email.split('@')[0],
      }
    })

    // Créer profil escort minimal (complété ensuite au dashboard)
    // Dates et valeurs placeholder sûres
    const birthYear = new Date().getFullYear() - 21
    const birthDate = new Date(birthYear, 0, 1)
    await prisma.escortProfile.create({
      data: {
        userId: user.id,
        firstName: '',
        stageName: user.name || 'Nouvelle escorte',
        dateOfBirth: birthDate,
        nationality: 'CH',
        languages: JSON.stringify(['fr']),
        city: 'Genève',
        workingArea: JSON.stringify(['Genève']),
        description: 'Profil en cours de configuration...',
        services: JSON.stringify([]),
        rates: JSON.stringify({}),
        availability: JSON.stringify({}),
        galleryPhotos: JSON.stringify([]),
        videos: JSON.stringify([]),
      }
    })

    // Créer abonnement en attente (sera choisi étape 2)
    try {
      await prisma.escortSubscription.create({
        data: {
          userId: user.id,
          plan: 'TRIAL' as any,
          amount: 0,
          startDate: new Date(),
          endDate: new Date(),
          status: 'PENDING_PAYMENT' as any,
        }
      })
    } catch {}

    return NextResponse.json({ ok: true, userId: user.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 })
  }
}

