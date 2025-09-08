import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email et code requis' },
        { status: 400 }
      )
    }

    // Récupérer les données de vérification depuis PostgreSQL
    const verification = await prisma.emailVerification.findUnique({
      where: { email: email.toLowerCase() }
    })

    console.log(`Vérification pour ${email}: code reçu = ${code}`)

    if (!verification) {
      return NextResponse.json(
        { error: 'Code non trouvé ou expiré' },
        { status: 400 }
      )
    }

    // Vérifier expiration
    if (verification.expiresAt < new Date()) {
      await prisma.emailVerification.delete({
        where: { email: email.toLowerCase() }
      })
      return NextResponse.json(
        { error: 'Code expiré' },
        { status: 400 }
      )
    }

    // Vérifier le code avec bcrypt
    const isCodeValid = await bcrypt.compare(code, verification.codeHash)
    if (!isCodeValid) {
      return NextResponse.json(
        { error: 'Code incorrect' },
        { status: 400 }
      )
    }

    // Code valide - marquer comme vérifié
    await prisma.emailVerification.update({
      where: { email: email.toLowerCase() },
      data: { verifiedAt: new Date() }
    })

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