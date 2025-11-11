import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createBunnyDirectUpload } from '@/lib/bunny'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type UploadType = 'image' | 'video'

function isImage(mime: string) {
  return mime.startsWith('image/')
}

function isVideo(mime: string) {
  return mime.startsWith('video/')
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const {
      type,
      fileName,
      fileType,
      fileSize,
      visibility,
    }: {
      type: UploadType
      fileName?: string
      fileType: string
      fileSize?: number
      visibility?: 'public' | 'private' | 'premium'
    } = body || {}

    if (!type || !fileType) {
      return NextResponse.json({ success: false, error: 'type et fileType requis' }, { status: 400 })
    }

    // Route intelligente
    if (type === 'image' || (fileType && isImage(fileType))) {
      // Presigned URL R2
      if (!fileName) {
        return NextResponse.json({ success: false, error: 'fileName requis pour image' }, { status: 400 })
      }

      const s3Client = new S3Client({
        region: 'auto',
        endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
        credentials: {
          accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY || '',
          secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY || '',
        },
      })

      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = fileName.split('.').pop() || 'jpg'
      const sanitizedFileName = `${timestamp}-${randomString}.${extension}`
      const key = `profiles/${session.user.id}/${sanitizedFileName}`

      const command = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: key,
        ContentType: fileType,
      })

      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

      const baseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || 'https://media.felora.ch'
      if (!baseUrl || baseUrl === 'undefined' || baseUrl.includes('undefined')) {
        console.error('❌ ERREUR CRITIQUE: baseUrl invalide:', baseUrl)
        throw new Error('Configuration CDN invalide - baseUrl undefined')
      }
      const publicUrl = `${baseUrl}/${key}`

      return NextResponse.json({
        success: true,
        provider: 'r2',
        uploadUrl: presignedUrl,
        publicUrl,
        key,
        nextStep: 'client_put_then_confirm', // PUT direct puis POST /api/media/confirm-upload
        visibility: visibility || 'public',
      })
    }

    if (type === 'video' || (fileType && isVideo(fileType))) {
      // Upload direct Bunny
      const bunnyUpload = await createBunnyDirectUpload()
      return NextResponse.json({
        success: true,
        provider: 'bunny',
        uploadUrl: bunnyUpload.uploadUrl,
        videoId: bunnyUpload.videoId,
        collectionId: bunnyUpload.collectionId,
        libraryId: bunnyUpload.libraryId,
        apiKey: process.env.BUNNY_STREAM_API_KEY,
        nextStep: 'client_put_then_bunny_confirm', // PUT direct puis POST /api/media/bunny-confirm
        visibility: visibility || 'public',
      })
    }

    return NextResponse.json({ success: false, error: 'Type non supporté' }, { status: 400 })
  } catch (error: any) {
    console.error('❌ Erreur upload-unifié:', error)
    return NextResponse.json({
      success: false,
      error: error?.message || 'Erreur serveur',
    }, { status: 500 })
  }
}


