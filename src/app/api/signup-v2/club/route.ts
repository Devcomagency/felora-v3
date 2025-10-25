import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { clubPreSignupSchema } from '@/components/signup-v2/validation'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req as any)
    const rl = rateLimit(`signup:club:${ip}`, 10 * 60_000, 5)
    if (!rl.ok) return NextResponse.json({ error: 'too_many_requests' }, { status: 429 })
    const body = await req.json()
    if (body?.hp) return NextResponse.json({ error: 'invalid' }, { status: 200 })
    const parsed = clubPreSignupSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'invalid' }, { status: 200 })
    const { email, phoneE164, password, companyName } = parsed.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 200 })

    // Generate handle from companyName
    const baseHandle = companyName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '_') // Replace non-alphanumeric with underscore
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .substring(0, 24) // Max 24 chars

    // Auto-suffix handle if taken
    let finalHandle = baseHandle
    if (await prisma.clubProfileV2.findUnique({ where: { handle: finalHandle } })) {
      let i = 2
      while (await prisma.clubProfileV2.findUnique({ where: { handle: `${baseHandle}_${i}` } })) {
        i += 1
        if (i > 50) break
      }
      finalHandle = `${baseHandle}_${i}`
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, phoneE164: phoneE164 ?? null, passwordHash, role: 'CLUB' as any } })
    await prisma.clubProfileV2.create({ data: { userId: user.id, handle: finalHandle, companyName } })
    return NextResponse.json({ ok: true, userId: user.id, next: '/profile-test-signup/club?step=2' })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 })
  }
}
