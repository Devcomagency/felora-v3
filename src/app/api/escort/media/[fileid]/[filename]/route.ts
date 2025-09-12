import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params
    
    // Décoder l'URL au cas où il y aurait des caractères encodés
    const decodedFilename = decodeURIComponent(filename)
    
    // Chemin vers le fichier uploadé (dans le dossier profiles)
    const filePath = join(process.cwd(), 'uploads', 'profiles', decodedFilename)
    
    try {
      const fileBuffer = await readFile(filePath)
      
      // Déterminer le type MIME
      const extension = filename.split('.').pop()?.toLowerCase()
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
      }
      
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000',
        },
      })
    } catch (error) {
      // Fallback vers image placeholder si fichier pas trouvé
      return NextResponse.redirect(
        `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=400&h=400&fit=crop&crop=face`
      )
    }
  } catch (error) {
    console.error('Erreur récupération fichier:', error)
    return NextResponse.json(
      { error: 'Fichier non trouvé' },
      { status: 404 }
    )
  }
}
