import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Configuration tus
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'temp')
const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

// Créer le dossier uploads si nécessaire
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

// Handler pour tus protocol
export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir()

    const uploadLength = request.headers.get('upload-length')
    const uploadMetadata = request.headers.get('upload-metadata')

    if (!uploadLength) {
      return new NextResponse('Missing Upload-Length header', { status: 400 })
    }

    const fileSize = parseInt(uploadLength)
    if (fileSize > MAX_FILE_SIZE) {
      return new NextResponse('File too large', { status: 413 })
    }

    // Créer un ID unique pour l'upload
    const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const uploadPath = path.join(UPLOAD_DIR, uploadId)

    // Créer le fichier vide
    await writeFile(uploadPath, '')

    // Retourner les headers tus
    return new NextResponse(null, {
      status: 201,
      headers: {
        'Location': `/api/upload/tus/${uploadId}`,
        'Upload-Offset': '0',
        'Tus-Resumable': '1.0.0',
        'Access-Control-Expose-Headers': 'Location, Upload-Offset, Tus-Resumable'
      }
    })

  } catch (error) {
    console.error('Upload creation error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// OPTIONS pour CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Tus-Resumable': '1.0.0',
      'Tus-Version': '1.0.0',
      'Tus-Max-Size': MAX_FILE_SIZE.toString(),
      'Access-Control-Allow-Methods': 'POST, HEAD, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Upload-Length, Upload-Metadata, Upload-Offset, Tus-Resumable, Content-Type',
      'Access-Control-Expose-Headers': 'Upload-Offset, Location, Tus-Resumable'
    }
  })
}
