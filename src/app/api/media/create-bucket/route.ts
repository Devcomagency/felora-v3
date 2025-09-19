import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// API pour créer le bucket R2 automatiquement
export async function POST(request: NextRequest) {
  console.log('🪣 [CREATE BUCKET] Starting bucket creation')

  try {
    const r2Config = {
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      accessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY,
      secretKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
      bucket: process.env.CLOUDFLARE_R2_BUCKET
    }

    if (!r2Config.endpoint || !r2Config.accessKey || !r2Config.secretKey || !r2Config.bucket) {
      return NextResponse.json({
        success: false,
        error: 'Configuration R2 incomplète'
      })
    }

    const { S3Client, CreateBucketCommand, HeadBucketCommand } = await import('@aws-sdk/client-s3')

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

    // Vérifier si le bucket existe déjà
    try {
      await s3.send(new HeadBucketCommand({
        Bucket: r2Config.bucket
      }))

      console.log('✅ [CREATE BUCKET] Bucket existe déjà')
      return NextResponse.json({
        success: true,
        message: `Bucket ${r2Config.bucket} existe déjà`,
        bucket: r2Config.bucket
      })
    } catch (headError: any) {
      if (headError.name === 'NotFound') {
        // Le bucket n'existe pas, on le crée
        console.log('🪣 [CREATE BUCKET] Bucket non trouvé, création...')

        try {
          await s3.send(new CreateBucketCommand({
            Bucket: r2Config.bucket
          }))

          console.log('✅ [CREATE BUCKET] Bucket créé avec succès')
          return NextResponse.json({
            success: true,
            message: `Bucket ${r2Config.bucket} créé avec succès`,
            bucket: r2Config.bucket
          })
        } catch (createError: any) {
          console.error('❌ [CREATE BUCKET] Erreur création:', createError)
          return NextResponse.json({
            success: false,
            error: 'Erreur lors de la création du bucket',
            details: createError.message
          })
        }
      } else {
        console.error('❌ [CREATE BUCKET] Erreur vérification:', headError)
        return NextResponse.json({
          success: false,
          error: 'Erreur lors de la vérification du bucket',
          details: headError.message
        })
      }
    }

  } catch (error: any) {
    console.error('❌ [CREATE BUCKET] Erreur générale:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API création bucket R2 active',
    bucket: process.env.CLOUDFLARE_R2_BUCKET
  })
}