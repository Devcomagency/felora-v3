import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { escortPreSignupLite } from '@/components/signup-v2/validation'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req as any)
    const rl = rateLimit(`signup:escort:${ip}`, 10 * 60_000, 5)
    if (!rl.ok) return NextResponse.json({ error: 'too_many_requests' }, { status: 429 })
    const body = await req.json()
    if (body?.hp) return NextResponse.json({ error: 'invalid' }, { status: 200 })
    const parsed = escortPreSignupLite.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'invalid' }, { status: 400 })
    const { email, phoneE164, handle, birthDate, password } = parsed.data

    // Enforce verified email for escorts
    const verified = await prisma.emailVerification.findUnique({ where: { email: email.toLowerCase() } })
    if (!verified || !verified.verifiedAt || verified.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Email non vérifié' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 200 })

    if (handle) {
      const existingHandle = await prisma.escortProfileV2.findUnique({ where: { handle } })
      if (existingHandle) return NextResponse.json({ error: 'Handle déjà pris' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, phoneE164, passwordHash, role: 'ESCORT' as any } })
    if (handle && birthDate) {
      await prisma.escortProfileV2.create({ data: { userId: user.id, handle, birthDate: new Date(birthDate) } })
    }
    await prisma.kycSubmission.create({ data: { userId: user.id, role: 'ESCORT' as any, status: 'PENDING' as any } })
    return NextResponse.json({ ok: true, userId: user.id, next: '/profile-test-signup/escort?step=2' })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 })
  }
}
