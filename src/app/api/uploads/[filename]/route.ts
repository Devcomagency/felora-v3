import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

// API endpoint pour servir les fichiers uploadés depuis /tmp en production
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    
    if (!filename) {
      return new NextResponse('Nom de fichier requis', { status: 400 })
    }

    // Sécurité: vérifier que le nom de fichier ne contient pas de chemins dangereux
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return new NextResponse('Nom de fichier invalide', { status: 400 })
    }

    const filePath = join('/tmp', filename)
    
    console.log('📁 API Uploads - Lecture du fichier:', filePath)

    try {
      const fileBuffer = await readFile(filePath)
      
      // Déterminer le type MIME basé sur l'extension
    const extension = filename.split('.').pop()?.toLowerCase()
      let contentType = 'image/jpeg' // défaut
      
      switch (extension) {
        case 'png':
          contentType = 'image/png'
          break
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg'
          break
        case 'gif':
          contentType = 'image/gif'
          break
        case 'webp':
          contentType = 'image/webp'
          break
      }
      
      console.log('✅ API Uploads - Fichier trouvé, type:', contentType, 'taille:', fileBuffer.length)

      return new Response(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400', // Cache 24h
          'Content-Length': fileBuffer.length.toString()
        }
      })
      
    } catch (readError) {
      console.error('❌ API Uploads - Fichier non trouvé:', filePath, readError)
      return new NextResponse('Fichier non trouvé', { status: 404 })
    }

  } catch (error) {
    console.error('💥 API Uploads - Erreur:', error)
    return new NextResponse('Erreur serveur', { status: 500 })
  }
}
