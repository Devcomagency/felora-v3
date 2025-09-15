import { NextRequest, NextResponse } from 'next/server'
import { sendEmailResend, emailTemplates } from '@/lib/resend'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('[AUTH] Send verification attempt started')
    
    // Rate limit per IP
    const ip = getClientIp(request)
    const rl = rateLimit(`auth-verify:${ip}`, 60_000, 3)
    if (!rl.ok) {
      return NextResponse.json({ error: 'too_many_requests' }, { status: 429 })
    }

    const { email } = await request.json()
    console.log('[AUTH] Verification requested for:', email)

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    // Générer un code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Stocker le code en base de données avec expiration (5 minutes)
    const expiresAt = new Date(Date.now() + (5 * 60 * 1000)) // 5 minutes
    
    await prisma.emailVerification.upsert({
      where: { email },
      update: { 
        code, 
        expiresAt,
        createdAt: new Date()
      },
      create: { 
        email, 
        code, 
        expiresAt 
      }
    })

    // Envoyer le vrai email via Resend
    console.log('[AUTH] Sending verification email...')
    const emailTemplate = emailTemplates.verification(code)
    const emailResult = await sendEmailResend({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    })

    if (!emailResult.success) {
      // En production, forcer Resend uniquement avec logging détaillé
      if (process.env.NODE_ENV === 'production') {
        console.error('[AUTH] Resend failed in production:', {
          error: emailResult?.error,
          to: email,
          from: process.env.RESEND_FROM,
          hasApiKey: !!process.env.RESEND_API_KEY,
          provider: emailResult?.provider
        })
        return NextResponse.json({ error: 'send_failed' }, { status: 500 })
      } else {
        // En développement seulement: log le code
        console.log(`[AUTH] Resend failed, DEV CODE for ${email}: ${code}`)
      }
    } else {
      console.log('[AUTH] Verification email sent via Resend:', emailResult.messageId)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Code envoyé avec succès',
      // En développement seulement, retourner le code pour tester
      developmentCode: process.env.NODE_ENV === 'development' ? code : undefined
    })

  } catch (error) {
    console.error('[AUTH] Error sending verification code:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}