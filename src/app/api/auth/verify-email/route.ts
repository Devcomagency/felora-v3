import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email et code requis' },
        { status: 400 }
      )
    }

    // Récupérer le code depuis la base de données
    const storedData = await prisma.emailVerification.findUnique({
      where: { email }
    })

    // Log de débogage
    console.log(`Vérification pour ${email}:`)
    console.log(`Code reçu: ${code}`)
    console.log(`Données stockées:`, { ...storedData, codeHash: 'HIDDEN' })

    if (!storedData) {
      return NextResponse.json(
        { error: 'Code non trouvé ou expiré' },
        { status: 400 }
      )
    }

    // Vérifier expiration
    if (new Date() > storedData.expiresAt) {
      // Supprimer le code expiré
      await prisma.emailVerification.delete({ where: { email } })
      return NextResponse.json(
        { error: 'Code expiré' },
        { status: 400 }
      )
    }

    // Vérifier le code en comparant les hashs
    const codeHash = createHash('sha256').update(code).digest('hex')
    if (storedData.codeHash !== codeHash) {
      return NextResponse.json(
        { error: 'Code incorrect' },
        { status: 400 }
      )
    }

    // Code valide - supprimer de la base de données
    await prisma.emailVerification.delete({ where: { email } })

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