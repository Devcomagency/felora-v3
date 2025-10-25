import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

/**
 * POST /api/upload/direct
 * Génère une URL présignée pour upload direct vers Cloudflare R2
 * Compatible avec Vercel serverless (pas besoin de filesystem)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, fileType, fileSize } = body

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'fileName et fileType requis' },
        { status: 400 }
      )
    }

    // Limite de taille
    const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (max ${MAX_FILE_SIZE / (1024 * 1024)}MB)` },
        { status: 413 }
      )
    }

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
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const key = `uploads/${timestamp}-${randomString}-${sanitizedFileName}`

    // Créer la commande PutObject
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: key,
      ContentType: fileType,
    })

    // Générer l'URL présignée (valide 1 heure)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    // URL publique du fichier après upload - CORRECTION CRITIQUE
    const baseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || 'https://media.felora.ch'
    
    // VALIDATION CRITIQUE - Empêcher les URLs undefined
    if (!baseUrl || baseUrl === 'undefined' || baseUrl.includes('undefined')) {
      console.error('❌ ERREUR CRITIQUE upload/direct: baseUrl invalide:', baseUrl)
      throw new Error('Configuration CDN invalide - baseUrl undefined')
    }
    
    const publicUrl = `${baseUrl}/${key}`

    if (publicUrl.includes('undefined')) {
      console.error('❌ ERREUR CRITIQUE upload/direct: publicUrl contient undefined:', publicUrl)
      throw new Error('URL publique invalide générée')
    }

    console.log('🔍 DEBUG upload/direct URL génération:', {
      CLOUDFLARE_R2_PUBLIC_URL: process.env.CLOUDFLARE_R2_PUBLIC_URL,
      NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL,
      baseUrl,
      key,
      publicUrl,
      isValid: !publicUrl.includes('undefined')
    })

    console.log('✅ URL présignée générée:', {
      fileName: sanitizedFileName,
      key,
      fileSize: fileSize ? `${(fileSize / (1024 * 1024)).toFixed(2)}MB` : 'unknown'
    })

    return NextResponse.json({
      success: true,
      uploadUrl,
      publicUrl,
      key,
      expiresIn: 3600,
    })

  } catch (error: any) {
    console.error('❌ Erreur génération URL présignée:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors de la génération de l\'URL d\'upload',
        details: error.message
      },
      { status: 500 }
    )
  }
}
