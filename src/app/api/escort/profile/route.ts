import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer le profil escort complet avec les données utilisateur
    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            name: true
          }
        }
      }
    })

    if (!escortProfile) {
      return NextResponse.json(
        { success: false, error: 'Profil escorte non trouvé' },
        { status: 404 }
      )
    }

    console.log('📡 API GET PROFILE - Données envoyées:')
    console.log('- ID utilisateur:', session.user.id)
    console.log('- galleryPhotos length:', escortProfile.galleryPhotos?.length || 0)
    console.log('- videos length:', escortProfile.videos?.length || 0)
    console.log('- galleryPhotos preview:', escortProfile.galleryPhotos?.substring(0, 100) + '...')

    return NextResponse.json({
      success: true,
      profile: escortProfile
    })

  } catch (error) {
    console.error('Erreur récupération profil:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}