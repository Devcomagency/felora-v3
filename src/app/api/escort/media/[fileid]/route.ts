import { NextRequest, NextResponse } from 'next/server'
import { join, basename } from 'path'
import { readFile } from 'fs/promises'

function contentTypeFor(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'jpg':
    case 'jpeg': return 'image/jpeg'
    case 'png': return 'image/png'
    case 'webp': return 'image/webp'
    case 'heic':
    case 'heif': return 'image/heif'
    case 'mp4': return 'video/mp4'
    case 'mov':
    case 'quicktime': return 'video/quicktime'
    case 'webm': return 'video/webm'
    case '3gp':
    case '3gpp': return 'video/3gpp'
    case '3g2':
    case '3gpp2': return 'video/3gpp2'
    default: return 'application/octet-stream'
  }
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ fileid: string }> }
) {
  try {
    const { fileid: file } = await ctx.params
    // Prevent path traversal
    const safe = basename(file)
    const path = join(process.cwd(), 'uploads', 'profiles', safe)
    const buf = await readFile(path)
    return new NextResponse(buf, {
      headers: {
        'Content-Type': contentTypeFor(safe),
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (e) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

