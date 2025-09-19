import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// API PUBLIQUE temporaire pour tester R2 en production (SANS AUTH)
export async function POST(request: NextRequest) {
  console.log('🚀 [PUBLIC R2] Upload API called')

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file || !(file instanceof File)) {
      return NextResponse.json({
        success: false,
        error: 'Aucun fichier fourni'
      }, { status: 400 })
    }

    if (!file.type?.startsWith('image/') && !file.type?.startsWith('video/')) {
      return NextResponse.json({
        success: false,
        error: 'Type de fichier non supporté (image/* ou video/*)'
      }, { status: 400 })
    }

    // Limite Vercel
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: 'Fichier trop volumineux (>4MB)'
      }, { status: 400 })
    }

    // Configuration R2
    const r2Config = {
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      accessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY,
      secretKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
      bucket: process.env.CLOUDFLARE_R2_BUCKET
    }

    console.log('🚀 [PUBLIC R2] Config check:', {
      endpoint: r2Config.endpoint ? 'SET' : 'MISSING',
      accessKey: r2Config.accessKey ? 'SET' : 'MISSING',
      secretKey: r2Config.secretKey ? 'SET' : 'MISSING',
      bucket: r2Config.bucket ? 'SET' : 'MISSING'
    })

    if (!r2Config.endpoint || !r2Config.accessKey || !r2Config.secretKey || !r2Config.bucket) {
      return NextResponse.json({
        success: false,
        error: 'Configuration R2 incomplète',
        config: {
          endpoint: r2Config.endpoint ? 'SET' : 'MISSING',
          accessKey: r2Config.accessKey ? 'SET' : 'MISSING',
          secretKey: r2Config.secretKey ? 'SET' : 'MISSING',
          bucket: r2Config.bucket ? 'SET' : 'MISSING'
        }
      })
    }

    // Upload vers R2
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')

    let endpoint = r2Config.endpoint
    if (!endpoint.startsWith('https://')) {
      endpoint = `https://${endpoint}`
    }

    const s3 = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: r2Config.accessKey,
        secretAccessKey: r2Config.secretKey
      },
      forcePathStyle: true
    })

    // Préparer le fichier
    const bytes = await file.arrayBuffer()
    const ext = (() => {
      const n = file.name || ''
      const dot = n.lastIndexOf('.')
      if (dot > -1) return n.slice(dot + 1).toLowerCase()
      const t = file.type || ''
      if (t.includes('/')) return t.split('/')[1]
      return 'bin'
    })()

    const key = `test-uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // Upload
    await s3.send(new PutObjectCommand({
      Bucket: r2Config.bucket,
      Key: key,
      Body: Buffer.from(bytes),
      ContentType: file.type || 'application/octet-stream'
    }))

    // Générer URL signée (7 jours)
    const { GetObjectCommand } = await import('@aws-sdk/client-s3')
    const signedUrl = await getSignedUrl(s3 as any, new GetObjectCommand({
      Bucket: r2Config.bucket,
      Key: key
    }) as any, { expiresIn: 60 * 60 * 24 * 7 })

    console.log('✅ [PUBLIC R2] Upload réussi:', key)

    return NextResponse.json({
      success: true,
      message: 'Upload R2 réussi',
      url: signedUrl,
      key,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    })

  } catch (error: any) {
    console.error('❌ [PUBLIC R2] Erreur upload:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur upload R2',
      details: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API publique upload R2 active',
    timestamp: new Date().toISOString()
  })
}