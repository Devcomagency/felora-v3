import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { trackUploadEvent } from '@/lib/sentry-events'
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'

interface ConfirmRequest {
  uploadId: string
  key: string
  actualSize?: number
}

export async function POST(request: NextRequest) {
  try {
    // Feature flag bypass: upload activé par défaut en production

    // Rate limiting
    const { rateLimit, rateKey } = await import('@/lib/rate-limit')
    const rlKey = rateKey(request as any, 'upload-confirm')
    const rl = rateLimit({ key: rlKey, limit: 15, windowMs: 60_000 })
    if (!rl.ok) {
      return NextResponse.json({ error: 'Rate limite dépassée' }, { status: 429 })
    }

    // Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Parse request
    const { uploadId, key, actualSize }: ConfirmRequest = await request.json()

    if (!uploadId || !key) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    // Get upload session
    const uploadSessionRecord = await prisma.uploadSession.findUnique({
      where: { uploadId }
    })

    if (!uploadSessionRecord) {
      return NextResponse.json({
        error: 'Session upload expirée ou introuvable',
        code: 'UPLOAD_EXPIRED'
      }, { status: 404 })
    }

    const uploadSession = JSON.parse(uploadSessionRecord.data)

    // Verify session ownership
    if (uploadSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Check expiration
    if (Date.now() > uploadSession.expiresAt) {
      // Cleanup expired session
      await prisma.uploadSession.delete({ where: { uploadId } })
      return NextResponse.json({
        error: 'Session upload expirée',
        code: 'UPLOAD_EXPIRED'
      }, { status: 410 })
    }

    // Verify key matches
    if (uploadSession.key !== key) {
      return NextResponse.json({
        error: 'Clé upload invalide',
        code: 'INVALID_KEY'
      }, { status: 400 })
    }

    // Check R2 configuration
    const {
      CLOUDFLARE_R2_ENDPOINT,
      CLOUDFLARE_R2_ACCESS_KEY,
      CLOUDFLARE_R2_SECRET_KEY,
      CLOUDFLARE_R2_BUCKET
    } = process.env

    if (!CLOUDFLARE_R2_ENDPOINT || !CLOUDFLARE_R2_ACCESS_KEY || !CLOUDFLARE_R2_SECRET_KEY || !CLOUDFLARE_R2_BUCKET) {
      return NextResponse.json({
        error: 'Configuration R2 manquante'
      }, { status: 503 })
    }

    // Verify object exists in R2
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: CLOUDFLARE_R2_ACCESS_KEY,
        secretAccessKey: CLOUDFLARE_R2_SECRET_KEY
      }
    })

    let objectExists = false
    let objectSize = 0

    try {
      const headCommand = new HeadObjectCommand({
        Bucket: CLOUDFLARE_R2_BUCKET,
        Key: key
      })

      const headResult = await s3Client.send(headCommand)
      objectExists = true
      objectSize = headResult.ContentLength || 0

      // Verify size if provided
      if (actualSize && Math.abs(objectSize - actualSize) > objectSize * 0.05) {
        console.warn(`Size mismatch: expected ${actualSize}, got ${objectSize}`)
      }

    } catch (error: any) {
      console.error('R2 head object failed:', error)
      
      trackUploadEvent({
        fileSize: uploadSession.size,
        fileType: uploadSession.contentType,
        provider: 'cloudflare-r2',
        success: false,
        step: 'verify',
        error: 'Object not found in R2'
      })

      return NextResponse.json({
        error: 'Fichier non trouvé dans le stockage',
        code: 'FILE_NOT_FOUND'
      }, { status: 404 })
    }

    // Create media record in database
    const mediaType = uploadSession.contentType.startsWith('video/') ? 'VIDEO' : 'IMAGE'
    const publicUrl = `${CLOUDFLARE_R2_ENDPOINT}/${CLOUDFLARE_R2_BUCKET}/${key}`

    const media = await prisma.media.create({
      data: {
        ownerType: 'ESCORT',
        ownerId: uploadSession.escortId,
        type: mediaType,
        url: publicUrl,
        visibility: uploadSession.visibility,
        price: uploadSession.price || null,
        likeCount: 0,
        reactCount: 0,
        metadata: {
          filename: key.split('/').pop(),
          contentType: uploadSession.contentType,
          size: objectSize,
          uploadMethod: 'presign',
          r2Key: key
        }
      }
    })

    // Cleanup upload session
    await prisma.uploadSession.delete({ where: { uploadId } })

    // Sync with galleryPhotos if needed (keep existing logic)
    try {
      const currentProfile = await prisma.escortProfile.findUnique({
        where: { id: uploadSession.escortId },
        select: { galleryPhotos: true }
      })

      let galleryPhotos = []
      try {
        galleryPhotos = currentProfile?.galleryPhotos ? JSON.parse(currentProfile.galleryPhotos) : []
      } catch {
        galleryPhotos = []
      }

      const galleryItem = {
        type: mediaType.toLowerCase(),
        url: publicUrl,
        isPrivate: uploadSession.visibility === 'PRIVATE'
      }

      galleryPhotos.push(galleryItem)

      await prisma.escortProfile.update({
        where: { id: uploadSession.escortId },
        data: { 
          galleryPhotos: JSON.stringify(galleryPhotos)
        }
      })
    } catch (syncError) {
      console.warn('Gallery sync failed:', syncError)
      // Don't fail the upload if gallery sync fails
    }

    // Track success
    trackUploadEvent({
      fileSize: objectSize,
      fileType: uploadSession.contentType,
      provider: 'cloudflare-r2',
      success: true,
      step: 'confirm'
    })

    return NextResponse.json({
      success: true,
      mediaId: media.id,
      url: publicUrl,
      type: mediaType,
      size: objectSize
    })

  } catch (error: any) {
    console.error('Confirm upload error:', error)
    
    trackUploadEvent({
      fileSize: 0,
      fileType: 'unknown',
      provider: 'cloudflare-r2',
      success: false,
      step: 'confirm',
      error: error.message
    })

    return NextResponse.json({
      error: 'Erreur confirmation upload'
    }, { status: 500 })
  }
}
