import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getMediaService } from '../../../../../../packages/core/services/media/index'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const { id } = await params
    const escort = await prisma.escortProfile.findUnique({ where: { userId }, select: { id: true } })
    if (!escort) return NextResponse.json({ error: 'escort_not_found' }, { status: 404 })
    // Récupérer l'URL du média avant suppression pour la sync
    const service = await getMediaService()
    const allMedias = await service.listByEscort(escort.id)
    const mediaToDelete = allMedias.find(m => m.id === id)
    
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

