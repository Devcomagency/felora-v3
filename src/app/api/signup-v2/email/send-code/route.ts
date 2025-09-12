import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendEmailResend, emailTemplates } from '@/lib/resend'
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

    // Utiliser le template Resend pour l'email de vérification
    const emailTemplate = emailTemplates.verification(code)
    const resendRes = await sendEmailResend({ 
      to: safeEmail, 
      subject: emailTemplate.subject, 
      html: emailTemplate.html 
    })
    if (!resendRes?.success) {
      // En production, on force l'utilisation de Resend et on échoue clairement si indisponible
      if (process.env.NODE_ENV === 'production') {
        console.error('[MAIL] Resend failed in production:', {
          error: resendRes?.error,
          to: safeEmail,
          from: process.env.RESEND_FROM,
          hasApiKey: !!process.env.RESEND_API_KEY,
          provider: resendRes?.provider
        })
        return NextResponse.json({ 
          error: 'mail_failed_resend', 
          details: resendRes?.error,
          debug: { to: safeEmail, from: process.env.RESEND_FROM }
        }, { status: 500 })
      }
      // En développement seulement: fallback SMTP/dev pour faciliter les tests
      const smtpRes = await sendMail(safeEmail, emailTemplate.subject, emailTemplate.html)
      if (!smtpRes?.ok) {
        return NextResponse.json({ error: 'mail_failed' }, { status: 500 })
      }
    } else {
      console.log('[MAIL] Resend success:', { to: safeEmail, id: resendRes?.messageId })
    }

    const dev = process.env.NODE_ENV !== 'production'
    return NextResponse.json({ success: true, devCode: dev ? code : undefined })
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
