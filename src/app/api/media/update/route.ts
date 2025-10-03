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

    const { mediaUrl, visibility, price } = await request.json()

    if (!mediaUrl) {
      return NextResponse.json(
        { success: false, error: 'URL du média requise' },
        { status: 400 }
      )
    }

    // Nettoyer l'URL si elle est malformée
    let cleanMediaUrl = mediaUrl
    if (mediaUrl.startsWith('undefined/')) {
      // Remplacer undefined/ par le domaine correct
      cleanMediaUrl = mediaUrl.replace('undefined/', 'https://media.felora.ch/')
    } else if (!mediaUrl.startsWith('http')) {
      // Ajouter le protocole si manquant
      cleanMediaUrl = `https://${mediaUrl}`
    }

    console.log('🔧 [UPDATE] URL originale:', mediaUrl, 'URL nettoyée:', cleanMediaUrl)

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

    // Mettre à jour dans la table media si le média existe
    // Chercher avec l'URL originale ET l'URL nettoyée
    const media = await prisma.media.findFirst({
      where: { 
        OR: [
          { url: mediaUrl },
          { url: cleanMediaUrl }
        ],
        ownerType: 'ESCORT',
        ownerId: session.user.id
      }
    })

    if (media) {
      await prisma.media.update({
        where: { id: media.id },
        data: {
          visibility: visibility || 'PUBLIC',
          price: visibility === 'PREMIUM' ? price : null
        }
      })
    }

    // Mettre à jour dans galleryPhotos
    let galleryPhotos = []
    try {
      galleryPhotos = escortProfile.galleryPhotos ? JSON.parse(escortProfile.galleryPhotos) : []
    } catch (e) {
      galleryPhotos = []
    }

    // Trouver et mettre à jour le média dans la galerie
    galleryPhotos = galleryPhotos.map((item: any) => {
      if (item.url === mediaUrl || item.url === cleanMediaUrl) {
        return {
          ...item,
          visibility: visibility || 'PUBLIC',
          isPrivate: visibility === 'PRIVATE',
          price: visibility === 'PREMIUM' ? price : undefined
        }
      }
      return item
    })

    // Sauvegarder la galerie mise à jour
    await prisma.escortProfile.update({
      where: { userId: session.user.id },
      data: { 
        galleryPhotos: JSON.stringify(galleryPhotos)
      }
    })

    console.log('✅ Média mis à jour:', {
      mediaUrl,
      visibility,
      price,
      userId: session.user.id
    })

    return NextResponse.json({
      success: true,
      message: 'Média mis à jour avec succès'
    })

  } catch (error) {
    console.error('Erreur mise à jour média:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur lors de la mise à jour' },
      { status: 500 }
    )
  }
}
