import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SLOT_DEFAULT_TYPES: Record<number, 'image'|'video'> = {
  0: 'image',
  1: 'video',
  2: 'image',
  3: 'video',
  4: 'image',
  5: 'image',
}

/**
 * Étape 1: Générer presigned URL pour upload direct escort
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id },
      select: { userId: true }
    })
    if (!escortProfile) {
      return NextResponse.json({ success: false, error: 'Profil escorte non trouvé' }, { status: 404 })
    }

    const body = await request.json()
    const { fileName, fileType, fileSize, slot } = body

    // Validation
    if (!fileName || !fileType) {
      return NextResponse.json({ success: false, error: 'fileName et fileType requis' }, { status: 400 })
    }

    const slotNum = Number(slot)
    if (!Number.isFinite(slotNum) || slotNum < 0 || slotNum > 5) {
      return NextResponse.json({ success: false, error: 'Paramètre slot invalide (0..5 requis)' }, { status: 400 })
    }

    // Limite de taille : 500MB max
    const MAX_FILE_SIZE = 500 * 1024 * 1024
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `Fichier trop volumineux. Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }, { status: 400 })
    }

    console.log('🔐 [ESCORT] Génération presigned URL:', {
      userId: session.user.id,
      fileName,
      fileType,
      slot: slotNum,
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
    const sanitizedFileName = `slot${slotNum}_${timestamp}-${randomString}.${extension}`
    const key = `profiles/${session.user.id}/${sanitizedFileName}`

    // Créer la commande PUT
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: key,
      ContentType: fileType,
    })

    // Générer l'URL pré-signée (valide 1 heure)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    // URL publique du fichier (après upload)
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`

    console.log('✅ [ESCORT] Presigned URL générée:', { key, publicUrl })

    return NextResponse.json({
      success: true,
      presignedUrl,
      publicUrl,
      key,
      slot: slotNum,
      expiresIn: 3600
    })

  } catch (error: any) {
    console.error('❌ [ESCORT] Erreur génération presigned URL:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la génération de l\'URL',
      details: error.message
    }, { status: 500 })
  }
}
