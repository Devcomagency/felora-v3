import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { passwordSchema } from '@/components/signup-v2/validation'

export async function POST(req: NextRequest) {
  try {
    const { rateLimit, rateKey } = await import('@/lib/rate-limit')
    const key = rateKey(req as any, 'auth-reset')
    const rl = rateLimit({ key, limit: 5, windowMs: 60_000 })
    if (!rl.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    const { token, password } = await req.json()
    if (!token || !password) return NextResponse.json({ error: 'missing_params' }, { status: 400 })

    const parsed = passwordSchema.safeParse(password)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues?.[0]?.message || 'invalid_password' }, { status: 400 })
    }

    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex')
    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } })
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return NextResponse.json({ error: 'invalid_or_expired' }, { status: 400 })
    }

    const hash = await bcrypt.hash(String(password), 12)
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { password: hash } }),
      prisma.passwordResetToken.update({ where: { tokenHash }, data: { usedAt: new Date() } })
    ])

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
