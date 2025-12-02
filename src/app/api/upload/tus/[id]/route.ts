import { NextRequest, NextResponse } from 'next/server'
import { stat, appendFile, rename } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'temp')
const FINAL_DIR = path.join(process.cwd(), 'uploads', 'final')

// HEAD - Vérifier l'offset actuel
export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const uploadPath = path.join(UPLOAD_DIR, id)

    if (!existsSync(uploadPath)) {
      return new NextResponse('Upload not found', { status: 404 })
    }

    const stats = await stat(uploadPath)

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Upload-Offset': stats.size.toString(),
        'Tus-Resumable': '1.0.0',
        'Cache-Control': 'no-store'
      }
    })

  } catch (error) {
    console.error('HEAD error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// PATCH - Ajouter un chunk
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const uploadPath = path.join(UPLOAD_DIR, id)

    if (!existsSync(uploadPath)) {
      return new NextResponse('Upload not found', { status: 404 })
    }

    const uploadOffset = request.headers.get('upload-offset')
    const currentStats = await stat(uploadPath)

    // Vérifier l'offset
    if (uploadOffset !== currentStats.size.toString()) {
      return new NextResponse('Offset mismatch', { status: 409 })
    }

    // Lire le chunk
    const chunk = await request.arrayBuffer()
    const buffer = Buffer.from(chunk)

    // Ajouter au fichier
    await appendFile(uploadPath, buffer)

    const newStats = await stat(uploadPath)
    const uploadLength = request.headers.get('upload-length')

    // Si upload complet, déplacer vers final
    if (uploadLength && newStats.size >= parseInt(uploadLength)) {
      const session = await getServerSession(authOptions)
      const userId = session?.user?.id || 'anonymous'

      const finalPath = path.join(FINAL_DIR, `${userId}-${Date.now()}-${id}`)
      await rename(uploadPath, finalPath)

      return new NextResponse(null, {
        status: 200,
        headers: {
          'Upload-Offset': newStats.size.toString(),
          'Tus-Resumable': '1.0.0',
          'Upload-Complete': 'true',
          'Upload-Path': finalPath
        }
      })
    }

    return new NextResponse(null, {
      status: 204,
      headers: {
        'Upload-Offset': newStats.size.toString(),
        'Tus-Resumable': '1.0.0'
      }
    })

  } catch (error) {
    console.error('PATCH error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
