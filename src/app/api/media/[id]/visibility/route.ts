import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getMediaService } from '../../../../../../packages/core/services/media/index'
import type { MediaVisibility } from '../../../../../../packages/core/services/media/MediaService'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const { id } = await params
    const body = await req.json().catch(()=> ({}))
    const visibility = body.visibility as MediaVisibility
    const price = typeof body.price === 'number' ? body.price : undefined
    const escort = await prisma.escortProfile.findUnique({ where: { userId }, select: { id: true } })
    if (!escort) return NextResponse.json({ error: 'escort_not_found' }, { status: 404 })
    // Récupérer le média pour sync
    const service = await getMediaService()
    const allMedias = await service.listByEscort(escort.id)
    const mediaToUpdate = allMedias.find(m => m.id === id)
    
    // Mettre à jour dans le service
    await service.updateVisibility(id, visibility, price)
    
    // Synchroniser avec galleryPhotos
    if (mediaToUpdate?.url) {
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
        
        // Mettre à jour la visibilité dans la galerie
        const updatedGallery = galleryPhotos.map((item: any) => {
          if (item.url === mediaToUpdate.url) {
            return { ...item, isPrivate: visibility === 'PRIVATE' }
          }
          return item
        })
        
        // Sauvegarder
        await prisma.escortProfile.update({
          where: { id: escort.id },
          data: { 
            galleryPhotos: JSON.stringify(updatedGallery)
          }
        })
      } catch (syncError) {
        console.log('Erreur synchronisation visibilité:', syncError)
      }
    }
    
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'update_failed' }, { status: 500 })
  }
}

