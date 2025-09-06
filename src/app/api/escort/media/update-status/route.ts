import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { mediaId, isPrivate, price } = data

    if (!mediaId) {
      return NextResponse.json(
        { success: false, error: 'ID média requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur a un profil escort
    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!escortProfile) {
      return NextResponse.json(
        { success: false, error: 'Profil escorte non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour les médias dans la galerie
    let galleryPhotos = []
    let videos = []

    // Parser les galeries existantes
    try {
      galleryPhotos = JSON.parse(escortProfile.galleryPhotos || '[]')
      videos = JSON.parse(escortProfile.videos || '[]')
    } catch (e) {
      // Galerie vide ou corrompue
    }

    // Trouver et mettre à jour le média
    let mediaUpdated = false

    // Chercher dans les photos
    galleryPhotos = galleryPhotos.map((photo: any) => {
      if (photo.id === mediaId) {
        mediaUpdated = true
        return {
          ...photo,
          isPrivate: isPrivate !== undefined ? isPrivate : photo.isPrivate,
          price: price !== undefined ? price : photo.price
        }
      }
      return photo
    })

    // Si pas trouvé dans les photos, chercher dans les vidéos
    if (!mediaUpdated) {
      videos = videos.map((video: any) => {
        if (video.id === mediaId) {
          mediaUpdated = true
          return {
            ...video,
            isPrivate: isPrivate !== undefined ? isPrivate : video.isPrivate,
            price: price !== undefined ? price : video.price
          }
        }
        return video
      })
    }

    if (!mediaUpdated) {
      return NextResponse.json(
        { success: false, error: 'Média non trouvé' },
        { status: 404 }
      )
    }

    // Sauvegarder en base
    await prisma.escortProfile.update({
      where: { userId: session.user.id },
      data: {
        galleryPhotos: JSON.stringify(galleryPhotos),
        videos: JSON.stringify(videos),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Média mis à jour avec succès'
    })

  } catch (error) {
    console.error('Erreur mise à jour média:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}