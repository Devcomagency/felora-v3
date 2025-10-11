import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { jwtVerify } from 'jose'
import { mediaStorage } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
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
          console.error('[UPLOAD API] Error decoding JWT:', jwtError)
        }
      }
    }

    if (!user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Générer un nom de fichier unique
    const filename = `${Date.now()}-${crypto.randomUUID()}.bin`

    // Convertir le fichier en buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Uploader vers R2 (prod) ou local (dev)
    const result = await mediaStorage.uploadE2EEAttachment(buffer, filename)

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Échec de l\'upload' 
      }, { status: 500 })
    }

    return NextResponse.json({
      url: result.url,
      success: true,
      key: result.key
    })

  } catch (error) {
    console.error('Erreur lors de l\'upload de la pièce jointe:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}