import { NextRequest, NextResponse } from 'next/server'

// Import du même store que dans send-verification
// En production, utiliser une base de données partagée
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
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email et code requis' },
        { status: 400 }
      )
    }

    const verificationCodes = getVerificationCodes()
    const storedData = verificationCodes.get(email)

    // Log de débogage
    console.log(`Vérification pour ${email}:`)
    console.log(`Code reçu: ${code}`)
    console.log(`Données stockées:`, storedData)
    console.log(`Tous les codes stockés:`, Array.from(verificationCodes.keys()))

    if (!storedData) {
      return NextResponse.json(
        { error: 'Code non trouvé ou expiré' },
        { status: 400 }
      )
    }

    // Vérifier expiration
    if (Date.now() > storedData.expires) {
      verificationCodes.delete(email)
      return NextResponse.json(
        { error: 'Code expiré' },
        { status: 400 }
      )
    }

    // Vérifier le code
    if (storedData.code !== code) {
      return NextResponse.json(
        { error: 'Code incorrect' },
        { status: 400 }
      )
    }

    // Code valide - supprimer de la mémoire
    verificationCodes.delete(email)

    return NextResponse.json({ 
      success: true,
      message: 'Email vérifié avec succès'
    })

  } catch (error) {
    console.error('Erreur vérification code:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}