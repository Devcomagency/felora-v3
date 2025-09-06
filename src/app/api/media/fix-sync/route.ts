import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getMediaService } from '../../../../../packages/core/services/media/index'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    console.log(`🔧 SYNC FIX - Démarrage pour utilisateur: ${session.user.id}`)

    // Mapper vers escortId
    const escort = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, galleryPhotos: true }
    })

    if (!escort) {
      return NextResponse.json({ 
        error: 'Profil escort requis' 
      }, { status: 409 })
    }

    console.log(`🎯 SYNC FIX - Profil escort trouvé: ${escort.id}`)

    // Analyser les données actuelles
    let currentGallery = []
    try {
      currentGallery = escort.galleryPhotos ? JSON.parse(escort.galleryPhotos) : []
    } catch {
      currentGallery = []
    }

    console.log(`📊 SYNC FIX - État actuel: ${currentGallery.length} items dans galleryPhotos`)

    // 1. Récupérer les vrais médias depuis le MediaService
    const mediaService = await getMediaService()
    const realMedias = await mediaService.listByEscort(escort.id)
    
    console.log(`📊 SYNC FIX - Médias réels dans MediaService: ${realMedias.length}`)
    if (realMedias.length > 0) {
      realMedias.forEach((media, index) => {
        console.log(`  ${index + 1}. ${media.type} - ${media.visibility} - ${media.url}`)
      })
    }
    
    // 2. Transformer les médias réels en format galleryPhotos
    const cleanGallery = realMedias.map(media => ({
      type: media.type.toLowerCase(), // 'IMAGE' -> 'image', 'VIDEO' -> 'video'
      url: media.url,
      isPrivate: media.visibility === 'PRIVATE'
    }))

    console.log(`🔄 SYNC FIX - Nouvelle galerie créée avec ${cleanGallery.length} éléments:`)
    cleanGallery.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.type} - ${item.isPrivate ? 'PRIVÉ' : 'PUBLIC'} - ${item.url}`)
    })

    // 3. Mettre à jour la base de données
    await prisma.escortProfile.update({
      where: { id: escort.id },
      data: { 
        galleryPhotos: JSON.stringify(cleanGallery)
      }
    })

    console.log(`✅ SYNC FIX - Synchronisation terminée`)

    return NextResponse.json({ 
      success: true, 
      message: `Synchronisation terminée`,
      escortId: escort.id,
      userId: session.user.id,
      beforeCount: currentGallery.length,
      afterCount: cleanGallery.length,
      realMediasCount: realMedias.length,
      cleanedGallery: cleanGallery
    })

  } catch (error) {
    console.error('❌ SYNC FIX ERROR:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la synchronisation',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'API Media Sync Fix',
    description: 'POST pour synchroniser les médias entre MediaService et profil galleryPhotos'
  })
}