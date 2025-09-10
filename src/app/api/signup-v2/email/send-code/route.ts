import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendMail } from '@/lib/mail'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    // Rate limit per IP+email
    const ip = getClientIp(req)
    const { email } = await req.json()
    const safeEmail = String(email || '').trim().toLowerCase()
    const rl = rateLimit(`sendcode:${ip}:${safeEmail}`, 60_000, 3)
    if (!rl.ok) {
      return NextResponse.json({ error: 'too_many_requests' }, { status: 429 })
    }
    if (!safeEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(safeEmail)) {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
    }

    const code = ('' + Math.floor(100000 + Math.random() * 900000)) // 6 digits
    const codeHash = crypto.createHash('sha256').update(code).digest('hex')
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await prisma.emailVerification.upsert({
      where: { email: safeEmail },
      create: { email: safeEmail, codeHash, expiresAt, verifiedAt: null },
      update: { codeHash, expiresAt, verifiedAt: null }
    })

    const baseUrl = process.env.NEXTAUTH_URL || (req.headers.get('origin') || '') || 'http://localhost:3000'
    const html = `
      <div style="font-family:Inter,system-ui,sans-serif;font-size:14px;color:#111">
        <p>Bonjour,</p>
        <p>Votre code de vérification FELORA est :</p>
        <p style="font-size:24px;font-weight:700;letter-spacing:2px">${code}</p>
        <p style="color:#666">Ce code expire dans 10 minutes.</p>
      </div>
    `
    const mailRes = await sendMail(safeEmail, 'Votre code de vérification', html)
    if (!mailRes?.ok) {
      return NextResponse.json({ error: 'mail_failed' }, { status: 500 })
    }

    const dev = process.env.NODE_ENV !== 'production'
    return NextResponse.json({ success: true, devCode: dev ? code : undefined })
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}