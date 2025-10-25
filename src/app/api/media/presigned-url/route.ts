import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Configuration runtime
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Types MIME autorisés pour les uploads
const ALLOWED_MIME_TYPES = {
  images: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif'
  ],
  videos: [
    'video/mp4',
    'video/webm',
    'video/quicktime', // MOV
    'video/x-msvideo', // AVI
    'video/x-matroska', // MKV
    'video/mpeg'
  ]
}

const ALL_ALLOWED_TYPES = [...ALLOWED_MIME_TYPES.images, ...ALLOWED_MIME_TYPES.videos]

/**
 * Valide le type MIME d'un fichier
 * @param mimeType - Type MIME à valider
 * @returns true si autorisé, false sinon
 */
function isAllowedMimeType(mimeType: string): boolean {
  return ALL_ALLOWED_TYPES.includes(mimeType.toLowerCase())
}

/**
 * API pour générer une URL pré-signée pour upload direct vers R2
 * Évite la limite de 4.5MB de Vercel
 * Valide le type MIME pour empêcher l'upload de fichiers malveillants
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { fileName, fileType, fileSize } = body

    // Validation de base
    if (!fileName || !fileType) {
      return NextResponse.json({ success: false, error: 'fileName et fileType requis' }, { status: 400 })
    }

    // Validation MIME type - SÉCURITÉ
    if (!isAllowedMimeType(fileType)) {
      console.warn(`⚠️ Tentative d'upload type MIME non autorisé:`, {
        userId: session.user.id,
        fileName,
        fileType
      })
      return NextResponse.json({
        success: false,
        error: `Type de fichier non autorisé: ${fileType}. Formats acceptés : images (JPEG, PNG, WEBP, GIF, HEIC) et vidéos (MP4, MOV, WEBM)`
      }, { status: 400 })
    }

    // Limite de taille : 500MB max
    const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `Fichier trop volumineux. Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }, { status: 400 })
    }

    console.log('🔐 Génération presigned URL:', {
      userId: session.user.id,
      fileName,
      fileType,
      fileSize: fileSize ? `${(fileSize / 1024 / 1024).toFixed(2)}MB` : 'unknown'
    })

    // Configuration S3/R2
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY || '',
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY || '',
      },
    })

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = fileName.split('.').pop()
    const sanitizedFileName = `${timestamp}-${randomString}.${extension}`
    const key = `profiles/${session.user.id}/${sanitizedFileName}`

    // Créer la commande PUT
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: key,
      ContentType: fileType,
    })

    // Générer l'URL pré-signée (valide 1 heure)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    // URL publique du fichier (après upload) - Utiliser la variable serveur
    const baseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || 'https://media.felora.ch'
    const publicUrl = `${baseUrl}/${key}`

    console.log('✅ Presigned URL générée:', {
      key,
      expiresIn: '1 heure',
      publicUrl
    })

    return NextResponse.json({
      success: true,
      presignedUrl,
      publicUrl,
      key,
      expiresIn: 3600
    })

  } catch (error: any) {
    console.error('❌ Erreur génération presigned URL:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la génération de l\'URL',
      details: error.message
    }, { status: 500 })
  }
}
