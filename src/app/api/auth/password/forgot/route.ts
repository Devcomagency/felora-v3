import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendEmailResend } from '@/lib/resend'
import { sendMail } from '@/lib/mail'

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
        <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;background:#0D0D0D;padding:30px;border-radius:16px;border:1px solid #7C3AED;">
          <div style="text-align:center;margin-bottom:20px;">
            <div style="font-size:60px;margin-bottom:10px;">🔑</div>
            <h1 style="color:#7C3AED;margin:0;font-size:24px;">Réinitialisation du mot de passe</h1>
          </div>
          <div style="background:rgba(255,255,255,0.05);padding:20px;border-radius:12px;margin:20px 0;">
            <p style="color:#F8F9FA;line-height:1.6;margin:0 0 15px 0;">Bonjour,</p>
            <p style="color:#F8F9FA;line-height:1.6;margin:0 0 15px 0;">Vous avez demandé la réinitialisation de votre mot de passe Felora.</p>
            <p style="color:#F8F9FA;line-height:1.6;margin:0;">Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
          </div>
          <div style="text-align:center;margin:30px 0;">
            <a href="${resetUrl}" style="background:linear-gradient(135deg,#7C3AED,#FF6B9D);color:white;padding:15px 30px;text-decoration:none;border-radius:50px;font-weight:bold;display:inline-block;">
              🔐 Réinitialiser mon mot de passe
            </a>
          </div>
          <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:8px;margin:20px 0;">
            <p style="color:#888;font-size:12px;margin:0 0 5px 0;">Ou copiez ce lien dans votre navigateur :</p>
            <p style="color:#4FD1C7;font-size:11px;word-break:break-all;margin:0;">${resetUrl}</p>
          </div>
          <div style="margin-top:30px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.1);">
            <p style="color:#888;font-size:12px;text-align:center;margin:0;">
              ⏱️ Ce lien expire dans <strong style="color:#FF6B9D;">30 minutes</strong><br/>
              Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.<br/><br/>
              Felora - Plateforme premium de rencontres en Suisse 🇨🇭
            </p>
          </div>
        </div>
      `

      // Envoyer via Resend
      const resendRes = await sendEmailResend({
        to: user.email,
        subject: '🔑 Réinitialisation de votre mot de passe - Felora',
        html: html
      })

      if (!resendRes?.success) {
        // En production, échouer si Resend ne fonctionne pas
        if (process.env.NODE_ENV === 'production') {
          console.error('[PASSWORD RESET] Resend failed:', resendRes?.error)
          // On retourne success:true quand même pour éviter l'énumération d'emails
        } else {
          // En dev: fallback SMTP
          const smtpRes = await sendMail(user.email, '🔑 Réinitialisation de votre mot de passe - Felora', html)
          if (smtpRes?.ok) {
            console.log('[PASSWORD RESET] ✅ Email sent via SMTP fallback')
          }
        }
      } else {
        console.log('[PASSWORD RESET] ✅ Resend success:', { to: user.email, id: resendRes?.messageId })
      }

      // En développement, logger le lien pour faciliter les tests
      if (process.env.NODE_ENV === 'development') {
        console.log('\n🔗 [DEV] Lien de réinitialisation:')
        console.log(resetUrl)
        console.log('\n')
      }
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: true })
  }
}
