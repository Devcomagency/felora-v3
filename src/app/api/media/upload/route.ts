import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getMediaService } from '../../../../../packages/core/services/media/index'
import type { MediaType, MediaVisibility } from '../../../../../packages/core/services/media/MediaService'

export async function GET() {
  return NextResponse.json({ 
    message: 'API Media Upload',
    endpoints: {
      'POST /api/media/upload': 'Upload média (FormData avec file, type, visibility, price)',
      'POST /api/media/[id]/visibility': 'Changer visibilité',
      'DELETE /api/media/[id]/delete': 'Supprimer média'
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 15 req / 60s per IP
    const { rateLimit, rateKey } = await import('@/lib/rate-limit')
    const key = rateKey(request as any, 'media-upload')
    const rl = rateLimit({ key, limit: 15, windowMs: 60_000 })
    if (!rl.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    // 1) Récupérer session.user.id
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // 2) Mapper vers escortId
    const escort = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, isActive: true },
    })

    // 4) Bloquer si pas de profil escort créé
    if (!escort) {
      return NextResponse.json({ 
        error: 'Profil escort requis',
        message: 'Tu dois compléter ton profil escort avant d\'uploader des médias.',
        redirectTo: '/escort/profile'
      }, { status: 409 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as MediaType
    const visibility = formData.get('visibility') as MediaVisibility
    const price = formData.get('price') ? Number(formData.get('price')) : undefined
    const position = formData.get('position') ? Number(formData.get('position')) : undefined
    
    console.log(`🔍 API Upload - Données reçues:`, {
      fileName: file?.name,
      fileSize: file?.size,
      type,
      visibility,
      price,
      position
    })

    // Validation
    if (!file) {
      return NextResponse.json({ error: 'Fichier requis' }, { status: 400 })
    }

    if (!type || !['IMAGE', 'VIDEO'].includes(type)) {
      return NextResponse.json({ error: 'Type de média invalide' }, { status: 400 })
    }

    if (!visibility || !['PUBLIC', 'PRIVATE', 'REQUESTABLE'].includes(visibility)) {
      return NextResponse.json({ error: 'Visibilité invalide' }, { status: 400 })
    }

    if (visibility === 'REQUESTABLE' && (!price || price <= 0)) {
      return NextResponse.json({ error: 'Prix requis pour les médias payants' }, { status: 400 })
    }

    // File validation - Limite Vercel 4MB
    const maxSize = 4 * 1024 * 1024 // 4MB (limite Vercel)
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 4MB). Veuillez compresser votre vidéo.' }, { status: 400 })
    }

    const allowedTypes = type === 'IMAGE' 
      ? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
      : ['video/mp4', 'video/webm', 'video/mov', 'video/quicktime', 'video/3gpp', 'video/3gpp2']

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Type de fichier non supporté. Types acceptés: ${allowedTypes.join(', ')}` 
      }, { status: 400 })
    }

    // 3) Créer media avec escortId mappé
    const mediaService = await getMediaService()
    const result = await mediaService.create({
      escortId: escort.id, // Maintenant on utilise l'escortId mappé, pas session.user.id
      type,
      file,
      visibility,
      price,
      position
    })
    
    console.log(`✅ Média créé avec visibilité: ${visibility}, ID: ${result.id}`)

    // 4) Synchroniser avec galleryPhotos du profil pour affichage public
    try {
      // Récupérer les médias existants
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

      // Récupérer l'URL du média créé via le service
      const allMedias = await mediaService.listByEscort(escort.id)
      const newMedia = allMedias.find(m => m.id === result.id)

      if (newMedia && newMedia.url) {
        // Ajouter le nouveau média à la galerie
        const galleryItem = {
          type: type.toLowerCase(),
          url: newMedia.url,
          isPrivate: visibility === 'PRIVATE'
        }

        galleryPhotos.push(galleryItem)

        // Sauvegarder dans la base
        await prisma.escortProfile.update({
          where: { id: escort.id },
          data: { 
            galleryPhotos: JSON.stringify(galleryPhotos)
          }
        })
      }
    } catch (syncError) {
      console.log('Erreur synchronisation galleryPhotos:', syncError)
      // Ne pas faire échouer l'upload si la sync échoue
    }

    return NextResponse.json({ 
      success: true, 
      mediaId: result.id 
    })

  } catch (error) {
    console.error('Erreur upload média:', error)
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 })
  }
}
