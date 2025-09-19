import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// API publique pour tester Cloudflare R2 (SANS AUTHENTIFICATION)
export async function POST(request: NextRequest) {
  console.log('🧪 [TEST R2] API test-r2 called')

  try {
    // Test 1: Vérifier les variables d'environnement R2
    const r2Config = {
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
      accessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY,
      secretKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
      bucket: process.env.CLOUDFLARE_R2_BUCKET,
      provider: process.env.STORAGE_PROVIDER
    }

    console.log('🧪 [TEST R2] Config:', {
      endpoint: r2Config.endpoint ? 'SET' : 'MISSING',
      accountId: r2Config.accountId ? 'SET' : 'MISSING',
      accessKey: r2Config.accessKey ? 'SET' : 'MISSING',
      secretKey: r2Config.secretKey ? 'SET' : 'MISSING',
      bucket: r2Config.bucket ? 'SET' : 'MISSING',
      provider: r2Config.provider
    })

    // Test 2: Essayer d'uploader un fichier test avec R2
    if (r2Config.endpoint && r2Config.accessKey && r2Config.secretKey && r2Config.bucket) {
      try {
        const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')

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

        // Test avec un fichier factice
        const testData = Buffer.from('Test R2 Upload from Felora', 'utf8')
        const testKey = `test/${Date.now()}-test.txt`

        await s3.send(new PutObjectCommand({
          Bucket: r2Config.bucket,
          Key: testKey,
          Body: testData,
          ContentType: 'text/plain'
        }))

        console.log('✅ [TEST R2] Upload réussi!')

        return NextResponse.json({
          success: true,
          message: 'R2 fonctionne correctement',
          config: {
            endpoint: r2Config.endpoint ? 'SET' : 'MISSING',
            bucket: r2Config.bucket,
            testKey
          }
        })

      } catch (r2Error: any) {
        console.error('❌ [TEST R2] Erreur upload:', r2Error)
        return NextResponse.json({
          success: false,
          error: 'R2 upload failed',
          details: r2Error.message,
          config: {
            endpoint: r2Config.endpoint ? 'SET' : 'MISSING',
            bucket: r2Config.bucket ? 'SET' : 'MISSING'
          }
        })
      }
    }

    // Si config incomplète
    return NextResponse.json({
      success: false,
      error: 'Configuration R2 incomplète',
      config: {
        endpoint: r2Config.endpoint ? 'SET' : 'MISSING',
        accountId: r2Config.accountId ? 'SET' : 'MISSING',
        accessKey: r2Config.accessKey ? 'SET' : 'MISSING',
        secretKey: r2Config.secretKey ? 'SET' : 'MISSING',
        bucket: r2Config.bucket ? 'SET' : 'MISSING',
        provider: r2Config.provider
      }
    })

  } catch (error: any) {
    console.error('❌ [TEST R2] Erreur générales:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API test R2 active',
    timestamp: new Date().toISOString()
  })
}