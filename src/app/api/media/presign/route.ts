import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { trackUploadEvent } from '@/lib/sentry-events'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/mov', 'video/quicktime']
const MAX_IMAGE_SIZE = 4 * 1024 * 1024  // 4MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024 // 10MB

interface PresignRequest {
  filename: string
  contentType: string
  size: number
  visibility: 'PUBLIC' | 'PRIVATE' | 'REQUESTABLE'
  price?: number
}

export async function POST(request: NextRequest) {
  try {
    // Feature flag bypass: upload activé par défaut en production

    // Rate limiting
    const { rateLimit, rateKey } = await import('@/lib/rate-limit')
    const rlKey = rateKey(request as any, 'upload-presign')
    const rl = rateLimit({ key: rlKey, limit: 20, windowMs: 60_000 })
    if (!rl.ok) {
      return NextResponse.json({ error: 'Rate limite dépassée' }, { status: 429 })
    }

    // Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Get escort profile
    const escort = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, isActive: true }
    })

    if (!escort) {
      return NextResponse.json({
        error: 'Profil escort requis',
        redirectTo: '/escort/profile'
      }, { status: 409 })
    }

    // Parse request
    const { filename, contentType, size, visibility, price }: PresignRequest = await request.json()

    // Validation
    if (!filename || !contentType || !size || !visibility) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    if (!['PUBLIC', 'PRIVATE', 'REQUESTABLE'].includes(visibility)) {
      return NextResponse.json({ error: 'Visibilité invalide' }, { status: 400 })
    }

    if (visibility === 'REQUESTABLE' && (!price || price <= 0)) {
      return NextResponse.json({ error: 'Prix requis pour médias payants' }, { status: 400 })
    }

    // File type validation
    const isImage = ALLOWED_IMAGE_TYPES.includes(contentType)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(contentType)

    if (!isImage && !isVideo) {
      return NextResponse.json({
        error: `Type de fichier non supporté: ${contentType}`
      }, { status: 400 })
    }

    // Size validation
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
    if (size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      return NextResponse.json({
        error: `Fichier trop volumineux. Max: ${maxSizeMB}MB`,
        fallbackToBase64: size <= MAX_IMAGE_SIZE
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
      // Fallback to base64 if R2 not configured
      return NextResponse.json({
        error: 'Upload R2 non configuré',
        fallbackToBase64: true
      }, { status: 503 })
    }

    // Create R2 client
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: CLOUDFLARE_R2_ACCESS_KEY,
        secretAccessKey: CLOUDFLARE_R2_SECRET_KEY
      }
    })

    // Generate unique key
    const ext = filename.split('.').pop()?.toLowerCase() || 'bin'
    const key = `media/${escort.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).slice(2)}`

    // Generate presigned URL for PUT
    const putCommand = new PutObjectCommand({
      Bucket: CLOUDFLARE_R2_BUCKET,
      Key: key,
      ContentType: contentType,
      ContentLength: size
    })

    const presignedUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 300, // 5 minutes
    })

    // Store upload session (in production, use Redis)
    const uploadSession = {
      key,
      size,
      contentType,
      userId: session.user.id,
      escortId: escort.id,
      visibility,
      price,
      expiresAt: Date.now() + 300_000
    }

    // For now, store in database (in production, use Redis)
    await prisma.uploadSession.upsert({
      where: { uploadId },
      create: {
        uploadId,
        data: JSON.stringify(uploadSession)
      },
      update: {
        data: JSON.stringify(uploadSession)
      }
    })

    // Track event
    trackUploadEvent({
      fileSize: size,
      fileType: contentType,
      provider: 'cloudflare-r2',
      success: true,
      step: 'presign'
    })

    return NextResponse.json({
      success: true,
      presignedUrl,
      key,
      uploadId,
      expiresAt: new Date(Date.now() + 300_000).toISOString()
    })

  } catch (error: any) {
    console.error('Presign error:', error)
    
    trackUploadEvent({
      fileSize: 0,
      fileType: 'unknown',
      provider: 'cloudflare-r2',
      success: false,
      step: 'presign',
      error: error.message
    })

    return NextResponse.json({
      error: 'Erreur génération presign',
      fallbackToBase64: true
    }, { status: 500 })
  }
}
