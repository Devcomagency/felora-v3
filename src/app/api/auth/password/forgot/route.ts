import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { rateLimit, rateKey } = await import('@/lib/rate-limit')
    const key = rateKey(req as any, 'auth-forgot')
    const rl = rateLimit({ key, limit: 5, windowMs: 60_000 })
    if (!rl.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: true }) // Generic response to avoid email enumeration
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      // Invalidate existing tokens for this user
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })
      // Create token (random), store hash
      const token = crypto.randomBytes(32).toString('hex')
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30) // 30 minutes
      await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } })

      const baseUrl = process.env.NEXTAUTH_URL || (req.headers.get('origin') || '') || 'http://localhost:3000'
      const resetUrl = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`

      const html = `
        <div style="font-family:Inter,system-ui,sans-serif;font-size:14px;color:#111">
          <p>Bonjour,</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci‑dessous :</p>
          <p><a href="${resetUrl}" style="display:inline-block;background:#7C3AED;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Réinitialiser mon mot de passe</a></p>
          <p>Ou copiez le lien : <br />${resetUrl}</p>
          <p style="color:#666">Ce lien expire dans 30 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        </div>
      `
      await sendEmail({
        to: user.email,
        subject: 'Réinitialisation du mot de passe FELORA',
        html: html
      })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: true })
  }
}
