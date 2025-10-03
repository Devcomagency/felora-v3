import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { id } = await context.params
    const { action } = await request.json()

    console.log('🔧 [MEDIA MANAGE] Action:', action, 'Media ID:', id, 'User:', session.user.id)

    // Récupérer le média et vérifier la propriété
    const media = await prisma.media.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        ownerType: true,
        visibility: true,
        type: true,
        url: true
      }
    })

    if (!media) {
      return NextResponse.json(
        { success: false, error: 'Média non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (media.ownerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Exécuter l'action demandée
    switch (action) {
      case 'delete':
        await prisma.media.delete({
          where: { id }
        })
        console.log('✅ [MEDIA MANAGE] Média supprimé:', id)
        return NextResponse.json({ 
          success: true, 
          message: 'Média supprimé avec succès' 
        })

      case 'visibility:PUBLIC':
        await prisma.media.update({
          where: { id },
          data: { visibility: 'PUBLIC' }
        })
        console.log('✅ [MEDIA MANAGE] Visibilité changée en PUBLIC:', id)
        return NextResponse.json({ 
          success: true, 
          message: 'Média rendu public' 
        })

      case 'visibility:PRIVATE':
        await prisma.media.update({
          where: { id },
          data: { visibility: 'PRIVATE' }
        })
        console.log('✅ [MEDIA MANAGE] Visibilité changée en PRIVATE:', id)
        return NextResponse.json({ 
          success: true, 
          message: 'Média rendu privé' 
        })

      case 'visibility:PREMIUM':
        await prisma.media.update({
          where: { id },
          data: { visibility: 'PREMIUM' }
        })
        console.log('✅ [MEDIA MANAGE] Visibilité changée en PREMIUM:', id)
        return NextResponse.json({ 
          success: true, 
          message: 'Média rendu premium' 
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Action non reconnue' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('❌ [MEDIA MANAGE] Erreur:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
