import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { clientSignupSchema } from '@/components/signup-v2/validation'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req as any)
    const rl = rateLimit(`signup:client:${ip}`, 10 * 60_000, 5)
    if (!rl.ok) return NextResponse.json({ error: 'too_many_requests' }, { status: 429 })
    const body = await req.json()
    if (body?.hp) return NextResponse.json({ error: 'invalid' }, { status: 200 })
    const parsed = clientSignupSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'invalid' }, { status: 200 })
    const { email, phoneE164, password, pseudo } = parsed.data
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 200 })
    // Ensure unique pseudo (name)
    let finalName = pseudo
    let suffix = 1
    while (await prisma.user.findFirst({ where: { name: finalName } })) {
      suffix += 1
      finalName = `${pseudo}_${suffix}`
      if (suffix > 50) break
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, phoneE164: phoneE164 ?? null, passwordHash, role: 'CLIENT' as any, name: finalName } })
    return NextResponse.json({ ok: true, userId: user.id })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 })
  }
}
