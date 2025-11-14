import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { mediaUrl } = await request.json()

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

    console.log('🔧 URL originale:', mediaUrl, 'URL nettoyée:', cleanMediaUrl)

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

    // Supprimer de la table media si le média existe
    // Chercher avec l'URL originale ET l'URL nettoyée
    const media = await prisma.media.findFirst({
      where: {
        OR: [
          { url: mediaUrl },
          { url: cleanMediaUrl }
        ],
        ownerType: 'ESCORT',
        ownerId: escortProfile.id // Utiliser l'ID du profil escort, pas userId
      }
    })

    if (media) {
      await prisma.media.delete({
        where: { id: media.id }
      })
      console.log('✅ Média supprimé de la table Media:', media.id)
    } else {
      console.log('⚠️ Média non trouvé dans la table Media')
    }

    // Supprimer de galleryPhotos
    let galleryPhotos = []
    try {
      galleryPhotos = escortProfile.galleryPhotos ? JSON.parse(escortProfile.galleryPhotos) : []
    } catch (e) {
      galleryPhotos = []
    }

    // Filtrer le média à supprimer (avec l'URL originale ET nettoyée)
    const updatedGallery = galleryPhotos.filter((item: any) => 
      item.url !== mediaUrl && item.url !== cleanMediaUrl
    )

    // Sauvegarder la galerie mise à jour
    await prisma.escortProfile.update({
      where: { userId: session.user.id },
      data: { 
        galleryPhotos: JSON.stringify(updatedGallery)
      }
    })

    console.log('✅ Média supprimé:', {
      mediaUrl,
      userId: session.user.id,
      removedFromGallery: galleryPhotos.length - updatedGallery.length
    })

    return NextResponse.json({
      success: true,
      message: 'Média supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur suppression média:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur lors de la suppression' },
      { status: 500 }
    )
  }
}
