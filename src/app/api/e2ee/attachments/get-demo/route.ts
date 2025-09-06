import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

// Demo endpoint (no auth) for /messages-test to fetch ciphertext blobs
export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  try {
    const url = new URL(req.url)
    const relPath = url.searchParams.get('path') || ''
    if (!relPath) return NextResponse.json({ error: 'missing_path' }, { status: 400 })

    const safe = path.basename(relPath)
    const abs = path.join(process.cwd(), 'uploads', 'e2ee', safe)
    const bin = await fs.readFile(abs)
    return new Response(bin, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'no-cache',
      }
    })
  } catch (e) {
    console.error('attachments/get-demo error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
