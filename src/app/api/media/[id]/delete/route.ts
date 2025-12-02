import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getMediaService } from '../../../../../../packages/core/services/media/index'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 🔐 SÉCURITÉ : Vérifier l'authentification
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { id } = await params

    // 🔐 SÉCURITÉ : Vérifier la propriété du média
    const media = await prisma.media.findUnique({
      where: { id },
      select: { ownerId: true, ownerType: true, url: true, deletedAt: true }
    })

    if (!media) {
      return NextResponse.json({ error: 'media_not_found' }, { status: 404 })
    }

    if (media.deletedAt) {
      return NextResponse.json({ error: 'media_already_deleted' }, { status: 410 })
    }

    // 🔐 SÉCURITÉ : Vérifier que l'utilisateur est propriétaire OU admin
    let isOwner = false
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, escortProfile: true, clubProfileV2: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
    }

    // Vérifier la propriété selon le type
    if (media.ownerType === 'ESCORT' && user.escortProfile?.id === media.ownerId) {
      isOwner = true
    } else if (media.ownerType === 'CLUB' && user.clubProfileV2?.id === media.ownerId) {
      isOwner = true
    } else if (user.role === 'ADMIN') {
      isOwner = true // Les admins peuvent tout supprimer
      console.log(`[SECURITY] Admin ${userId} deleting media ${id}`)
    }

    if (!isOwner) {
      console.warn(`[SECURITY] User ${userId} attempted to delete media ${id} owned by ${media.ownerId}`)
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    // Récupérer l'URL du média avant suppression pour la sync
    const service = await getMediaService()
    const escort = user.escortProfile
    if (!escort && media.ownerType === 'ESCORT') {
      return NextResponse.json({ error: 'escort_not_found' }, { status: 404 })
    }
    const allMedias = escort ? await service.listByEscort(escort.id) : []
    const mediaToDelete = allMedias.find(m => m.id === id) || media
    
    // Supprimer du service
    await service.remove(id)
    
    // Synchroniser avec galleryPhotos
    if (mediaToDelete?.url) {
      try {
        const currentProfile = await prisma.escortProfile.findUnique({
          where: { id: escort.id },
          select: { galleryPhotos: true }
        })
        
        let galleryPhotos = []
        try {
          galleryPhotos = currentProfile?.galleryPhotos ? JSON.parse(currentProfile.galleryPhotos) : []
        } catch {
          galleryPhotos = []
        }
        
        // Supprimer le média de la galerie
        const filteredGallery = galleryPhotos.filter((item: any) => item.url !== mediaToDelete.url)
        
        // Sauvegarder
        await prisma.escortProfile.update({
          where: { id: escort.id },
          data: { 
            galleryPhotos: JSON.stringify(filteredGallery)
          }
        })
      } catch (syncError) {
        console.log('Erreur synchronisation suppression:', syncError)
      }
    }
    
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'delete_failed' }, { status: 500 })
  }
}

