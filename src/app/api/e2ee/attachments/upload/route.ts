import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const MAX_BYTES = 50 * 1024 * 1024 // 50 MB
const ALLOWED_MIME = new Set([
  'image/jpeg','image/png','image/webp',
  'video/mp4','video/webm','video/quicktime',
  'audio/mpeg','audio/ogg','audio/webm',
  'application/pdf','text/plain'
])

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    // Require auth
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'invalid_content_type' }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const meta = formData.get('meta')
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

    const buffer = Buffer.from(await file.arrayBuffer())
    // Save into public/ so files are statically served at /uploads/e2ee/...
    const uploadsDir = path.join(process.cwd(), 'uploads', 'e2ee')
    await fs.mkdir(uploadsDir, { recursive: true })

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.bin`
    const dest = path.join(uploadsDir, filename)
    await fs.writeFile(dest, buffer)

    const url = `/uploads/e2ee/${filename}`
    return NextResponse.json({ success: true, url, meta: meta ? JSON.parse(String(meta)) : null })
  } catch (e) {
    console.error('attachments/upload error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
