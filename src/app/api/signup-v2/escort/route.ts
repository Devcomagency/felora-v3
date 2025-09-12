import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { escortPreSignupLite } from '@/components/signup-v2/validation'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { sendEmailResend, emailTemplates } from '@/lib/resend'
import { sendMail } from '@/lib/mail'

export async function POST(req: NextRequest) {
  try {
    console.log('[SIGNUP] Escort signup attempt started')
    const ip = getClientIp(req as any)
    const rl = rateLimit(`signup:escort:${ip}`, 10 * 60_000, 5)
    if (!rl.ok) return NextResponse.json({ error: 'too_many_requests' }, { status: 429 })
    const body = await req.json()
    console.log('[SIGNUP] Body received:', { email: body?.email, handle: body?.handle })
    if (body?.hp) return NextResponse.json({ error: 'invalid' }, { status: 200 })
    const parsed = escortPreSignupLite.safeParse(body)
    if (!parsed.success) {
      console.error('[SIGNUP] Validation failed:', parsed.error.issues)
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'invalid' }, { status: 400 })
    }
    const { email, phoneE164, handle, birthDate, password } = parsed.data
    console.log('[SIGNUP] Validation passed for:', { email, handle })

    // Note: La vérification d'email est maintenant gérée côté client via le système en mémoire
    // L'utilisateur doit avoir vérifié son email avant d'arriver ici

    console.log('[SIGNUP] Checking existing user...')
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      console.log('[SIGNUP] Email already exists:', email)
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 200 })
    }

    if (handle) {
      console.log('[SIGNUP] Checking existing handle...')
      const existingHandle = await prisma.escortProfileV2.findUnique({ where: { handle } })
      if (existingHandle) {
        console.log('[SIGNUP] Handle already exists:', handle)
        return NextResponse.json({ error: 'Handle déjà pris' }, { status: 400 })
      }
    }

    console.log('[SIGNUP] Creating user...')
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, phoneE164, passwordHash, role: 'ESCORT' as any } })
    console.log('[SIGNUP] User created:', user.id)
    
    if (handle && birthDate) {
      console.log('[SIGNUP] Creating escort profile...')
      await prisma.escortProfileV2.create({ data: { userId: user.id, handle, birthDate: new Date(birthDate) } })
    }
    console.log('[SIGNUP] Creating KYC submission...')
    await prisma.kycSubmission.create({ data: { userId: user.id, role: 'ESCORT' as any, status: 'PENDING' as any } })

    // Envoyer l'email de bienvenue à l'escorte
    try {
      const welcomeEmail = emailTemplates.welcome(handle || email.split('@')[0])
      const emailResult = await sendEmailResend({
        to: email,
        subject: welcomeEmail.subject,
        html: welcomeEmail.html
      })
      
      if (!emailResult.success) {
        // En production, forcer Resend uniquement avec logging détaillé
        if (process.env.NODE_ENV === 'production') {
          console.error('[MAIL] Escort signup - Resend failed in production:', {
            error: emailResult?.error,
            to: email,
            from: process.env.RESEND_FROM,
            hasApiKey: !!process.env.RESEND_API_KEY,
            provider: emailResult?.provider
          })
          // On continue l'inscription même si l'email échoue
        } else {
          // En développement seulement: fallback SMTP
          console.log('Resend failed, trying SMTP fallback...')
          const smtpRes = await sendMail(email, welcomeEmail.subject, welcomeEmail.html)
          if (smtpRes?.ok) {
            console.log('✅ Email de bienvenue escorte envoyé via SMTP')
          } else {
            console.error('❌ Erreur envoi email de bienvenue escorte (Resend + SMTP failed)')
          }
        }
      } else {
        console.log('✅ Email de bienvenue escorte envoyé via Resend:', emailResult.messageId)
      }
    } catch (emailError) {
      console.error('❌ Exception envoi email bienvenue escorte:', emailError)
      // On continue même si l'email échoue
    }

    console.log('[SIGNUP] Escort signup completed successfully for:', email)
    return NextResponse.json({ ok: true, userId: user.id, next: '/profile-test-signup/escort?step=2' })
  } catch (e:any) {
    console.error('[SIGNUP] Error during escort signup:', e)
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 })
  }
}
