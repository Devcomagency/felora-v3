import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { mediaStorage } from '@/lib/storage'
import { initSentryServerOnce, captureServerException } from '@/lib/sentry-server'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME = new Set(['image/jpeg','image/jpg','image/png','image/webp'])

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    initSentryServerOnce()
    // Basic rate limit: 10 requests / 60s per IP
    const { rateLimit, rateKey } = await import('@/lib/rate-limit')
    const key = rateKey(req, 'kyc-upload')
    const rl = rateLimit({ key, limit: 10, windowMs: 60_000 })
    if (!rl.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'invalid_content_type' }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'missing_file' }, { status: 400 })

    // Security checks
    const mime = file.type || ''
    const size = (file as any).size as number | undefined
    if (!ALLOWED_MIME.has(mime)) {
      return NextResponse.json({ error: 'unsupported_type' }, { status: 415 })
    }
    if (typeof size === 'number' && size > MAX_BYTES) {
      return NextResponse.json({ error: 'file_too_large', maxBytes: MAX_BYTES }, { status: 413 })
    }

    if (process.env.CLOUDFLARE_R2_ENDPOINT || process.env.AWS_S3_BUCKET) {
      const res = await mediaStorage.upload(file, 'kyc')
      if (!res.success || !res.url) return NextResponse.json({ error: res.error || 'upload_failed' }, { status: 500 })
      return NextResponse.json({ url: res.url, key: res.key })
    } else {
      const buffer = Buffer.from(await file.arrayBuffer())
      const uploadsDir = path.join(process.cwd(), 'uploads', 'kyc')
      await fs.mkdir(uploadsDir, { recursive: true })
      const extFromName = (() => {
        const n = (file as any).name ? String((file as any).name) : ''
        const dot = n.lastIndexOf('.')
        if (dot > -1) return n.slice(dot + 1).toLowerCase()
        // fallback from mime
        const t = file.type || ''
        if (t.startsWith('image/')) return t.split('/')[1]
        return 'bin'
      })()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extFromName}`
      const dest = path.join(uploadsDir, filename)
      await fs.writeFile(dest, buffer)
      const url = `/api/kyc-v2/file/${filename}`
      return NextResponse.json({ url, key: filename })
    }
  } catch (e) {
    console.error('kyc-v2/upload error', e)
    try { captureServerException(e) } catch {}
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
