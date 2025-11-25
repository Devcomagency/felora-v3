import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { newEmail } = await request.json()

    // Validation
    if (!newEmail) {
      return NextResponse.json(
        { error: 'Le nouvel email est requis' },
        { status: 400 }
      )
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      )
    }

    // Vérifier que l'email n'est pas déjà utilisé
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail }
    })

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé par un autre compte' },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur actuel
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      )
    }

    // Vérifier que le nouvel email est différent
    if (user.email === newEmail) {
      return NextResponse.json(
        { error: 'Ce email est déjà votre email actuel' },
        { status: 400 }
      )
    }

    // Mettre à jour l'email
    await prisma.user.update({
      where: { id: session.user.id },
      data: { email: newEmail }
    })

    console.log('[SETTINGS] ✅ Email modifié:', {
      userId: session.user.id,
      oldEmail: user.email,
      newEmail: newEmail
    })

    // TODO: Envoyer un email de confirmation aux deux adresses
    // - À l'ancienne adresse: "Votre email a été modifié"
    // - À la nouvelle adresse: "Bienvenue avec votre nouvelle adresse"

    return NextResponse.json({
      success: true,
      message: 'Email modifié avec succès'
    })
  } catch (error) {
    console.error('[SETTINGS] Erreur changement email:', error)
    return NextResponse.json(
      { error: 'Erreur lors du changement d\'email' },
      { status: 500 }
    )
  }
}
