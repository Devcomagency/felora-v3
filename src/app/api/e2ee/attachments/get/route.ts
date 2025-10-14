import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { jwtVerify } from 'jose'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const conversationId = searchParams.get('conversationId')
    
    if (!path || !conversationId) {
      return NextResponse.json({ error: 'Paramètres requis manquants' }, { status: 400 })
    }

    // Authentification
    let session = await getServerSession(authOptions)
    let user = null
    
    if (session?.user?.id) {
      user = session.user
    } else {
      // Fallback : décoder le JWT directement
      const cookieHeader = request.headers.get('cookie')
      const sessionToken = cookieHeader?.match(/next-auth\.session-token=([^;]+)/)?.[1]
      
      if (sessionToken) {
        try {
          const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
          const { payload } = await jwtVerify(sessionToken, secret)
          
          if (payload.sub) {
            user = {
              id: payload.sub,
              email: payload.email as string,
              name: payload.name as string,
              role: (payload as any).role as string,
            }
          }
        } catch (jwtError) {
          console.error('[GET API] Error decoding JWT:', jwtError)
        }
      }
    }
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Si c'est une URL complète (R2/CDN), fetch depuis R2
    if (path.startsWith('http://') || path.startsWith('https://')) {
      console.log('[E2EE GET] Fetching from R2:', path.substring(0, 80))
      try {
        const response = await fetch(path)
        if (!response.ok) {
          console.error('[E2EE GET] R2 fetch failed:', response.status, response.statusText)
          return NextResponse.json({ 
            error: `Fichier introuvable sur R2 (${response.status})` 
          }, { status: 404 })
        }
        
        const buffer = await response.arrayBuffer()
        console.log('[E2EE GET] ✅ Fichier récupéré depuis R2:', buffer.byteLength, 'bytes')
        
        return new Response(buffer, {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Length': buffer.byteLength.toString(),
            'Cache-Control': 'public, max-age=31536000', // 1 an pour les fichiers chiffrés
          }
        })
      } catch (error) {
        console.error('[E2EE GET] Erreur fetch R2:', error)
        return NextResponse.json({ 
          error: `Erreur lors du fetch R2: ${error instanceof Error ? error.message : 'Unknown'}` 
        }, { status: 500 })
      }
    }

    // Sinon, c'est un fichier local (développement)
    const filename = path.split('/').pop()
    if (!filename) {
      return NextResponse.json({ error: 'Nom de fichier invalide' }, { status: 400 })
    }

    console.log('[E2EE GET] Lecture locale:', filename)
    const uploadDir = join(process.cwd(), 'tmp', 'e2ee-attachments')
    const filepath = join(uploadDir, filename)

    if (!existsSync(filepath)) {
      return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
    }

    const buffer = await readFile(filepath)

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de la pièce jointe:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}