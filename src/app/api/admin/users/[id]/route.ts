import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH - Éditer un utilisateur
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    const body = await request.json()
    const { email, name, role } = body

    // Validation
    if (!email || !name || !role) {
      return NextResponse.json({
        success: false,
        error: 'Email, nom et rôle sont requis'
      }, { status: 400 })
    }

    // Vérifier si l'email existe déjà (sauf pour cet utilisateur)
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId }
        }
      })

      if (existingUser) {
        return NextResponse.json({
          success: false,
          error: 'Cet email est déjà utilisé par un autre utilisateur'
        }, { status: 400 })
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: email.trim(),
        name: name.trim(),
        role
      }
    })

    // Log de l'action admin (à implémenter avec système de logs)
    // TODO: Créer log admin

    return NextResponse.json({
      success: true,
      user: updatedUser
    })
  } catch (error) {
    console.error('Erreur modification utilisateur:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la modification',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Utilisateur introuvable'
      }, { status: 404 })
    }

    // Empêcher la suppression d'un admin
    if (user.role === 'ADMIN') {
      return NextResponse.json({
        success: false,
        error: 'Impossible de supprimer un compte administrateur'
      }, { status: 403 })
    }

    // Supprimer l'utilisateur (CASCADE configuré dans Prisma supprimera les données liées)
    await prisma.user.delete({
      where: { id: userId }
    })

    // Log de l'action admin (à implémenter)
    // TODO: Créer log admin

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    })
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la suppression',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
