import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

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

    const { newEmail, code } = await request.json()

    // Validation
    if (!newEmail || !code) {
      return NextResponse.json(
        { error: 'Email et code requis' },
        { status: 400 }
      )
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Le code doit contenir 6 chiffres' },
        { status: 400 }
      )
    }

    // Normaliser l'email
    const safeEmail = newEmail.toLowerCase().trim()

    // Récupérer l'entrée de vérification
    const verification = await prisma.emailVerification.findUnique({
      where: { email: safeEmail }
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'Aucun code de vérification trouvé pour cet email' },
        { status: 400 }
      )
    }

    // Vérifier l'expiration
    if (new Date() > verification.expiresAt) {
      return NextResponse.json(
        { error: 'Le code a expiré. Veuillez en demander un nouveau.' },
        { status: 400 }
      )
    }

    // Vérifier le code
    const codeHash = crypto.createHash('sha256').update(code).digest('hex')
    if (codeHash !== verification.codeHash) {
      return NextResponse.json(
        { error: 'Code incorrect' },
        { status: 400 }
      )
    }

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

    // Mettre à jour l'email de l'utilisateur
    await prisma.user.update({
      where: { id: session.user.id },
      data: { email: safeEmail }
    })

    // Marquer la vérification comme utilisée
    await prisma.emailVerification.update({
      where: { email: safeEmail },
      data: { verifiedAt: new Date() }
    })

    console.log('[EMAIL CHANGE] ✅ Email modifié avec succès pour l\'utilisateur:', session.user.id)

    return NextResponse.json({
      success: true,
      message: 'Email modifié avec succès'
    })

  } catch (error) {
    console.error('[EMAIL CHANGE] Erreur vérification code:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du code' },
      { status: 500 }
    )
  }
}
