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

    // Extraire le nom du fichier depuis le path (ex: /e2ee-attachments/1234567890-uuid.bin)
    const filename = path.split('/').pop()
    if (!filename) {
      return NextResponse.json({ error: 'Nom de fichier invalide' }, { status: 400 })
    }

    // Construire le chemin complet vers le fichier chiffré
    const uploadDir = join(process.cwd(), 'tmp', 'e2ee-attachments')
    const filepath = join(uploadDir, filename)

    // Vérifier que le fichier existe
    if (!existsSync(filepath)) {
      console.error('[GET API] Fichier introuvable:', filepath)
      return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
    }

    // Lire le fichier chiffré
    const buffer = await readFile(filepath)

    console.log('[GET API] Fichier chiffré récupéré:', filename, 'Size:', buffer.length, 'bytes')

    // Retourner le fichier chiffré en tant que Blob
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