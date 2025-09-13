import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ fileid: string }> }
) {
  try {
    const { fileid: filename } = await context.params
    const decodedFilename = decodeURIComponent(filename)
    
    // Security: prevent path traversal
    if (decodedFilename.includes('..') || decodedFilename.includes('/') || decodedFilename.includes('\\')) {
      return NextResponse.json({ error: 'invalid_filename' }, { status: 400 })
    }
    
    const filePath = join(process.cwd(), 'uploads', 'kyc', decodedFilename)
    try {
      const fileBuffer = await readFile(filePath)
      const extension = decodedFilename.split('.').pop()?.toLowerCase()
      let contentType = 'application/octet-stream'
      switch (extension) {
        case 'jpg':
        case 'jpeg': contentType = 'image/jpeg'; break
        case 'png': contentType = 'image/png'; break
        case 'webp': contentType = 'image/webp'; break
        case 'mp4': contentType = 'video/mp4'; break
        case 'webm': contentType = 'video/webm'; break
        case 'mov':
        case 'quicktime': contentType = 'video/quicktime'; break
      }
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'private, max-age=3600, immutable',
          'X-Content-Type-Options': 'nosniff',
        },
      })
    } catch (e) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }
  } catch (e:any) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

