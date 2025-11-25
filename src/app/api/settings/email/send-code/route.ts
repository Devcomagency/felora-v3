import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendEmailResend, emailTemplates } from '@/lib/resend'
import { sendMail } from '@/lib/mail'

// Rate limiting simple (3 tentatives par 60s par IP+email)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60000 })
    return true
  }

  if (entry.count >= 3) {
    return false
  }

  entry.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { newEmail } = await request.json()

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      )
    }

    // Normaliser l'email
    const safeEmail = newEmail.toLowerCase().trim()

    // Vérifier que l'email n'est pas déjà utilisé par un autre compte
    const existingUser = await prisma.user.findUnique({
      where: { email: safeEmail }
    })

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé par un autre compte' },
        { status: 400 }
      )
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitKey = `${ip}:${safeEmail}`

    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Veuillez patienter 1 minute.' },
        { status: 429 }
      )
    }

    // Générer le code de vérification (6 chiffres)
    const code = '' + Math.floor(100000 + Math.random() * 900000)
    const codeHash = crypto.createHash('sha256').update(code).digest('hex')
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Stocker le code dans la table emailVerification
    await prisma.emailVerification.upsert({
      where: { email: safeEmail },
      create: {
        email: safeEmail,
        codeHash,
        expiresAt,
        verifiedAt: null
      },
      update: {
        codeHash,
        expiresAt,
        verifiedAt: null
      }
    })

    // Envoyer l'email avec le code via Resend
    const emailTemplate = emailTemplates.verification(code)
    const resendRes = await sendEmailResend({
      to: safeEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    })

    if (!resendRes?.success) {
      // En production, on force l'utilisation de Resend
      if (process.env.NODE_ENV === 'production') {
        console.error('[EMAIL CHANGE] Resend failed in production:', {
          error: resendRes?.error,
          to: safeEmail
        })
        return NextResponse.json({
          error: 'Impossible d\'envoyer l\'email de vérification',
          details: resendRes?.error
        }, { status: 500 })
      }

      // En développement: fallback SMTP
      const smtpRes = await sendMail(safeEmail, emailTemplate.subject, emailTemplate.html)
      if (!smtpRes?.ok) {
        return NextResponse.json({
          error: 'Impossible d\'envoyer l\'email de vérification'
        }, { status: 500 })
      }
    } else {
      console.log('[EMAIL CHANGE] ✅ Resend success:', { to: safeEmail, id: resendRes?.messageId })
    }

    // En développement, retourner le code pour faciliter les tests
    const isDev = process.env.NODE_ENV === 'development'

    return NextResponse.json({
      success: true,
      message: 'Code de vérification envoyé',
      ...(isDev && { devCode: code })
    })

  } catch (error) {
    console.error('[EMAIL CHANGE] Erreur envoi code:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du code de vérification' },
      { status: 500 }
    )
  }
}
