import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    const role = (session as any)?.user?.role
    if (role !== 'ADMIN') return NextResponse.json({ error: 'not_authorized' }, { status: 403 })

    const body = await req.json().catch(() => ({}))
    const key = typeof body?.key === 'string' ? body.key : undefined
    const expiresIn = Math.max(60, Math.min(60 * 60 * 24 * 7, Number(body?.expiresInSeconds || 3600)))

    const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT
    const bucket = process.env.CLOUDFLARE_R2_BUCKET
    const accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY
    const secretKey = process.env.CLOUDFLARE_R2_SECRET_KEY

    if (!key) return NextResponse.json({ error: 'missing_key' }, { status: 400 })

    // Local/dev fallback
    if (!endpoint || !bucket || !accessKey || !secretKey) {
      return NextResponse.json({ url: `/api/kyc-v2/file/${encodeURIComponent(key)}` })
    }

    const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3')
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
    const s3 = new S3Client({ region: 'auto', endpoint, credentials: { accessKeyId: accessKey!, secretAccessKey: secretKey! }, forcePathStyle: true })
    const url = await getSignedUrl(s3 as any, new GetObjectCommand({ Bucket: bucket, Key: key }) as any, { expiresIn })
    return NextResponse.json({ url })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 })
  }
}

