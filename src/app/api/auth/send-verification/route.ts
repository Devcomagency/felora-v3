import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { rateLimit, rateKey } = await import('@/lib/rate-limit')
    const key = rateKey(request as any, 'auth-send-verification')
    const rl = rateLimit({ key, limit: 5, windowMs: 60_000 })
    if (!rl.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      )
    }

    // Générer un code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const codeHash = await bcrypt.hash(code, 10)
    
    // Stocker en base PostgreSQL avec expiration (10 minutes)
    await prisma.emailVerification.upsert({
      where: { email: email.toLowerCase() },
      update: {
        codeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        verifiedAt: null // Reset verification
      },
      create: {
        email: email.toLowerCase(),
        codeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    })

    // Envoyer l'email de vérification avec Resend
    const { sendEmail, emailTemplates } = await import('@/lib/email')
    const emailResult = await sendEmail({
      to: email,
      ...emailTemplates.verification(code)
    })

    if (!emailResult.success) {
      console.error('Erreur envoi email:', emailResult.error)
      // Log le code pour debug en cas d'erreur email
      console.log(`Code de vérification pour ${email}: ${code}`)
    } else {
      console.log(`✅ Email de vérification envoyé à ${email}`)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Code envoyé avec succès',
      // En développement seulement, retourner le code pour tester
      developmentCode: process.env.NODE_ENV === 'development' ? code : undefined
    })

  } catch (error) {
    console.error('Erreur envoi code:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
