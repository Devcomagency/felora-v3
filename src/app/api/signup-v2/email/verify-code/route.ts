import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json()
    const safeEmail = String(email || '').trim().toLowerCase()
    const codeStr = String(code || '').trim()
    if (!safeEmail || !codeStr) {
      return NextResponse.json({ error: 'missing_params' }, { status: 400 })
    }

    const rec = await prisma.emailVerification.findUnique({ where: { email: safeEmail } })
    if (!rec || rec.expiresAt < new Date()) {
      return NextResponse.json({ error: 'expired_or_not_found' }, { status: 400 })
    }

    const hash = crypto.createHash('sha256').update(codeStr).digest('hex')
    if (hash !== rec.codeHash) {
      return NextResponse.json({ error: 'code_invalid' }, { status: 400 })
    }

    await prisma.emailVerification.update({ where: { email: safeEmail }, data: { verifiedAt: new Date() } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}