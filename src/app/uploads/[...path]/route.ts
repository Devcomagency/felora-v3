import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const filePath = join(process.cwd(), 'uploads', ...path)
    
    // Vérifier que le fichier existe
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 })
    }
    
    // Lire le fichier
    const fileBuffer = await readFile(filePath)
    
    // Déterminer le type MIME basé sur l'extension
    const extension = filePath.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'webp':
        contentType = 'image/webp'
        break
      case 'mp4':
        contentType = 'video/mp4'
        break
      case 'webm':
        contentType = 'video/webm'
        break
      case 'mov':
        contentType = 'video/quicktime'
        break
      default:
        contentType = 'application/octet-stream'
    }
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache 1 an
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
