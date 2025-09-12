import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

const R2_ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT
const R2_ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY
const R2_SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_KEY
const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET

// Client R2 pour récupérer les fichiers
const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: R2_ACCESS_KEY || '',
    secretAccessKey: R2_SECRET_KEY || ''
  }
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const filePath = path.join('/')
    console.log('🔍 Demande fichier:', filePath)
    
    // Vérifier si c'est un fichier local (fallback)
    if (filePath.startsWith('local/')) {
      console.log('💾 Récupération fichier local:', filePath)
      
      try {
        const { readFile } = await import('fs/promises')
        const { join } = await import('path')
        
        const fileName = filePath.replace('local/', '')
        const localFilePath = join('/tmp', fileName)
        
        const buffer = await readFile(localFilePath)
        
        // Déterminer le type de contenu
        let contentType = 'application/octet-stream'
        if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) contentType = 'image/jpeg'
        else if (fileName.endsWith('.png')) contentType = 'image/png'
        else if (fileName.endsWith('.gif')) contentType = 'image/gif'
        else if (fileName.endsWith('.webp')) contentType = 'image/webp'
        
        return new Response(buffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Length': buffer.length.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable'
          }
        })
        
      } catch (localError) {
        console.error('💥 Erreur lecture fichier local:', localError)
        return new NextResponse('Fichier local non trouvé', { status: 404 })
      }
    }
    
    // Sinon, essayer R2
    const useR2 = R2_ENDPOINT && R2_ACCESS_KEY && R2_SECRET_KEY && R2_BUCKET
    if (!useR2) {
      console.error('❌ Configuration R2 manquante et pas de fichier local')
      return new NextResponse('Configuration de stockage manquante', { status: 500 })
    }

    console.log('🔍 Récupération fichier R2:', filePath)

    // Récupérer le fichier depuis R2
    const getCommand = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: filePath
    })

    const response = await r2Client.send(getCommand)
    
    if (!response.Body) {
      return new NextResponse('Fichier non trouvé', { status: 404 })
    }

    // Convertir le stream en buffer
    const chunks = []
    const reader = response.Body.transformToWebStream().getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    
    const buffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)))

    // Retourner le fichier avec les bons headers
    return new Response(buffer, {
      headers: {
        'Content-Type': response.ContentType || 'application/octet-stream',
        'Content-Length': response.ContentLength?.toString() || buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })

  } catch (error) {
    console.error('💥 Erreur récupération fichier:', error)
    return new NextResponse('Erreur serveur', { status: 500 })
  }
}
