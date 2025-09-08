import type { MediaService, MediaItem, MediaVisibility, MediaType } from './MediaService'
import { prisma } from '@/lib/prisma'
import { mediaStorage } from '@/lib/storage'

export class MediaServicePrisma implements MediaService {
  
  async listPublic(cursor?: string, limit = 10): Promise<{ items: MediaItem[]; nextCursor?: string }> {
    const cursorId = cursor ? parseInt(cursor, 10) : 0
    
    const medias = await prisma.media.findMany({
      where: {
        ownerType: 'ESCORT',
        visibility: { not: 'PRIVATE' }
      },
      skip: cursorId,
      take: limit,
      orderBy: [
        { pos: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Récupérer les infos des escortes
    const escortIds = [...new Set(medias.map(m => m.ownerId))]
    const escorts = await prisma.escortProfile.findMany({
      where: { id: { in: escortIds } },
      select: { id: true, stageName: true, profilePhoto: true }
    })
    const escortMap = new Map(escorts.map(e => [e.id, e]))

    const items: MediaItem[] = medias.map(media => {
      const escort = escortMap.get(media.ownerId)
      return {
        id: media.id,
        type: media.type as MediaType,
        url: media.url,
        thumb: media.thumbUrl || undefined,
        visibility: media.visibility as MediaVisibility,
        price: media.price || undefined,
        position: media.pos || undefined,
        createdAt: media.createdAt.toISOString(),
        author: {
          id: media.ownerId,
          handle: `@${escort?.stageName || 'unknown'}`,
          name: escort?.stageName || 'Unknown',
          avatar: escort?.profilePhoto || undefined
        }
      }
    })

    const nextCursor = medias.length === limit ? (cursorId + limit).toString() : undefined
    return { items, nextCursor }
  }

  async listByEscort(escortId: string, visibility?: MediaVisibility): Promise<MediaItem[]> {
    const medias = await prisma.media.findMany({
      where: {
        ownerType: 'ESCORT',
        ownerId: escortId,
        ...(visibility && { visibility })
      },
      orderBy: [
        { pos: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Récupérer les infos de l'escorte
    const escort = await prisma.escortProfile.findUnique({
      where: { id: escortId },
      select: { id: true, stageName: true, profilePhoto: true }
    })

    return medias.map(media => ({
      id: media.id,
      type: media.type as MediaType,
      url: media.url,
      thumb: media.thumbUrl || undefined,
      visibility: media.visibility as MediaVisibility,
      price: media.price || undefined,
      position: media.pos || undefined,
      createdAt: media.createdAt.toISOString(),
      author: {
        id: escortId,
        handle: `@${escort?.stageName || 'unknown'}`,
        name: escort?.stageName || 'Unknown',
        avatar: escort?.profilePhoto || undefined
      }
    }))
  }

  async create(input: { 
    escortId: string; 
    type: MediaType; 
    file: File; 
    visibility: MediaVisibility; 
    price?: number; 
    position?: number 
  }): Promise<{ id: string }> {
    
    // Vérifier la limite Vercel 4MB
    if (input.file.size > 4 * 1024 * 1024) {
      throw new Error('Fichier trop volumineux (>4MB). Veuillez compresser votre vidéo.')
    }

    // Upload vers Cloudflare R2
    const uploadResult = await mediaStorage.upload(input.file, 'medias')
    if (!uploadResult?.success || !uploadResult?.url) {
      throw new Error(uploadResult?.error || 'Échec de l\'upload')
    }

    // Créer l'entrée en base avec le schéma existant
    const media = await prisma.media.create({
      data: {
        ownerType: 'ESCORT',
        ownerId: input.escortId,
        type: input.type,
        url: uploadResult.url,
        visibility: input.visibility,
        price: input.price,
        pos: input.position,
        likeCount: 0,
        reactCount: 0
      }
    })

    return { id: media.id }
  }

  async updateVisibility(id: string, visibility: MediaVisibility, price?: number): Promise<void> {
    await prisma.media.update({
      where: { id },
      data: { 
        visibility,
        price: visibility === 'REQUESTABLE' ? price : null
      }
    })
  }

  async delete(id: string): Promise<void> {
    const media = await prisma.media.findUnique({
      where: { id }
    })

    if (media?.url) {
      // Optionnel : supprimer aussi de Cloudflare R2
      try {
        // await mediaStorage.delete(media.url)
      } catch (e) {
        console.warn('Erreur suppression fichier R2:', e)
      }
    }

    await prisma.media.delete({
      where: { id }
    })
  }

  // Ajout de la méthode manquante
  async remove(id: string): Promise<void> {
    return this.delete(id)
  }

  async getById(id: string): Promise<MediaItem | null> {
    const media = await prisma.media.findUnique({
      where: { id }
    })

    if (!media) return null

    // Récupérer les infos de l'escorte
    const escort = await prisma.escortProfile.findUnique({
      where: { id: media.ownerId },
      select: { id: true, stageName: true, profilePhoto: true }
    })

    return {
      id: media.id,
      type: media.type as MediaType,
      url: media.url,
      thumb: media.thumbUrl || undefined,
      visibility: media.visibility as MediaVisibility,
      price: media.price || undefined,
      position: media.pos || undefined,
      createdAt: media.createdAt.toISOString(),
      author: {
        id: media.ownerId,
        handle: `@${escort?.stageName || 'unknown'}`,
        name: escort?.stageName || 'Unknown',
        avatar: escort?.profilePhoto || undefined
      }
    }
  }
}