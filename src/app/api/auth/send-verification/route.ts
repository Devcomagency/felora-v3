import { NextRequest, NextResponse } from 'next/server'

// Store temporaire pour les codes de vérification (en production, utiliser Redis ou DB)
declare global {
  var verificationCodes: Map<string, { code: string, expires: number }> | undefined
}

const getVerificationCodes = () => {
  if (!global.verificationCodes) {
    global.verificationCodes = new Map()
  }
  return global.verificationCodes
}

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
    
    // Stocker le code avec expiration (5 minutes)
    const verificationCodes = getVerificationCodes()
    verificationCodes.set(email, {
      code,
      expires: Date.now() + (5 * 60 * 1000) // 5 minutes
    })

    // En production, envoyer un vrai email ici
    // Pour le développement, log le code
    console.log(`Code de vérification pour ${email}: ${code}`)

    // Simuler l'envoi d'email (remplacer par un vrai service d'email en production)
    // await sendEmail(email, 'Code de vérification Felora', `Votre code: ${code}`)

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
