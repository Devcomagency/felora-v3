import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { email, code } = await req.json().catch(() => ({}))
    const safeEmail = String(email || '').trim().toLowerCase()
    const codeStr = String(code || '').trim()
    if (!safeEmail || !codeStr) {
      return NextResponse.json({ error: 'missing_params' }, { status: 400 })
    }

    // Basic email format check
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(safeEmail)) {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
    }

    // Ensure email not taken
    const existing = await prisma.user.findUnique({ where: { email: safeEmail }, select: { id: true } })
    if (existing && existing.id !== userId) {
      return NextResponse.json({ error: 'email_taken' }, { status: 400 })
    }

    // Verify code
    const rec = await prisma.emailVerification.findUnique({ where: { email: safeEmail } })
    if (!rec || rec.expiresAt < new Date()) {
      return NextResponse.json({ error: 'expired_or_not_found' }, { status: 400 })
    }
    const hash = crypto.createHash('sha256').update(codeStr).digest('hex')
    if (hash !== rec.codeHash) {
      return NextResponse.json({ error: 'code_invalid' }, { status: 400 })
    }

    // Update user email atomically and mark verification consumed
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { email: safeEmail } }),
      prisma.emailVerification.update({ where: { email: safeEmail }, data: { verifiedAt: new Date() } })
    ])

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

