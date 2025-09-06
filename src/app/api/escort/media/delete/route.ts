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

    // Vérifier que l'utilisateur est bien une escorte
    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!escortProfile) {
      return NextResponse.json(
        { success: false, error: 'Profil escorte non trouvé' },
        { status: 404 }
      )
    }

    const { mediaId, type } = await request.json()
    
    if (!mediaId) {
      return NextResponse.json(
        { success: false, error: 'ID média manquant' },
        { status: 400 }
      )
    }

    if (type === 'profile') {
      // Supprimer la photo de profil
      await prisma.escortProfile.update({
        where: { userId: session.user.id },
        data: { profilePhoto: null }
      })
    } else if (type === 'gallery') {
      // Supprimer de la galerie (photos ET vidéos sont dans galleryPhotos)
      const currentGallery = JSON.parse(escortProfile.galleryPhotos || '[]')
      const currentVideos = JSON.parse(escortProfile.videos || '[]')
      
      // Chercher dans la galerie d'abord
      const updatedGallery = currentGallery.filter((item: any) => item.id !== mediaId)
      
      // Si pas trouvé dans la galerie, chercher dans les vidéos
      let updatedVideos = currentVideos
      if (currentGallery.length === updatedGallery.length) {
        // Pas trouvé dans la galerie, chercher dans les vidéos
        updatedVideos = currentVideos.filter((item: any) => item.id !== mediaId)
      }
      
      await prisma.escortProfile.update({
        where: { userId: session.user.id },
        data: { 
          galleryPhotos: JSON.stringify(updatedGallery),
          videos: JSON.stringify(updatedVideos)
        }
      })
      
      console.log(`🗑️ Suppression média ${mediaId}:`)
      console.log(`- Galerie: ${currentGallery.length} → ${updatedGallery.length}`)
      console.log(`- Vidéos: ${currentVideos.length} → ${updatedVideos.length}`)
    }

    // TODO: Supprimer aussi le fichier du service de stockage

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