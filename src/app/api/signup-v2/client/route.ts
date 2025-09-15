import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Simple RL
    const { rateLimit, rateKey } = await import('@/lib/rate-limit')
    const rl = rateLimit({ key: rateKey(req as any, 'signup-client'), limit: 20, windowMs: 60_000 })
    if (!rl.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

    const body = await req.json().catch(() => ({} as any))
    const email = String(body?.email || '').trim().toLowerCase()
    const password = String(body?.password || '')
    const confirm = String(body?.confirm || '')
    const isAdult = Boolean(body?.isAdult)
    const acceptTos = Boolean(body?.acceptTos)
    // optional phone
    const phoneE164 = body?.phoneE164 ? String(body.phoneE164) : undefined
    // optional pseudo (can be generated)
    let pseudo = body?.pseudo ? String(body.pseudo) : ''

    if (!email || !email.includes('@')) return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
    if (!password || password.length < 8) return NextResponse.json({ error: 'weak_password' }, { status: 400 })
    if (password !== confirm) return NextResponse.json({ error: 'password_mismatch' }, { status: 400 })
    if (!isAdult) return NextResponse.json({ error: 'age_required' }, { status: 400 })
    if (!acceptTos) return NextResponse.json({ error: 'tos_required' }, { status: 400 })

    const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } })
    if (exists) return NextResponse.json({ error: 'email_exists' }, { status: 409 })

    if (!pseudo) {
      const prefix = email.split('@')[0] || 'client'
      pseudo = prefix.replace(/[^a-zA-Z0-9_.-]/g, '').toLowerCase().slice(0, 20) || 'client'
    }

    const hash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        role: 'CLIENT' as any,
        phone: phoneE164 || null,
        name: pseudo,
      },
      select: { id: true }
    })

    await prisma.clientProfile.create({
      data: {
        userId: user.id,
        firstName: null,
        lastName: null,
        city: null,
        preferences: null,
      }
    })

    return NextResponse.json({ ok: true, userId: user.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 })
  }
}

