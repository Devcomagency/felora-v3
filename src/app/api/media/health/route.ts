import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const endpointRaw = process.env.CLOUDFLARE_R2_ENDPOINT || ''
    const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || ''
    const accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY || ''
    const secretKey = process.env.CLOUDFLARE_R2_SECRET_KEY || ''
    const bucket = process.env.CLOUDFLARE_R2_BUCKET || ''

    // Normaliser endpoint comme dans storage.ts
    let endpoint = endpointRaw
    if (!endpoint && accountId) {
      endpoint = `https://${accountId}.r2.cloudflarestorage.com`
    }
    if (endpoint && !endpoint.startsWith('https://')) {
      endpoint = `https://${endpoint.replace(/^https?:\/\//, '')}`
    }
    endpoint = endpoint.replace(/\/$/, '')
    if (endpoint.includes('/')) {
      const u = new URL(endpoint)
      endpoint = `${u.protocol}//${u.host}`
    }

    const cfg = {
      endpointConfigured: !!endpoint,
      accessKeyConfigured: !!accessKey,
      secretKeyConfigured: !!secretKey,
      bucketConfigured: !!bucket,
      endpoint,
    }

    if (!endpoint || !accessKey || !secretKey || !bucket) {
      return NextResponse.json({ ok: false, stage: 'config', cfg })
    }

    // Test TLS + auth via un PutObject de 1 octet
    try {
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
      const s3 = new S3Client({
        region: 'auto',
        endpoint,
        credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
        forcePathStyle: true,
      })
      const key = `healthcheck-${Date.now()}.txt`
      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from('ok'),
        ContentType: 'text/plain',
      }))
      return NextResponse.json({ ok: true, stage: 'put', cfg })
    } catch (e: any) {
      return NextResponse.json({ ok: false, stage: 'put', error: e?.message || String(e), cfg }, { status: 500 })
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, stage: 'unexpected', error: e?.message || String(e) }, { status: 500 })
  }
}

