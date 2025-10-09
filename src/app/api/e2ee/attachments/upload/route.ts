import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { jwtVerify } from 'jose'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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

    // Sauvegarder le fichier chiffré localement dans /tmp/e2ee-attachments/
    const uploadDir = join(process.cwd(), 'tmp', 'e2ee-attachments')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filename = `${Date.now()}-${crypto.randomUUID()}.bin`
    const filepath = join(uploadDir, filename)

    // Écrire le fichier chiffré
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filepath, buffer)

    console.log('[UPLOAD API] Fichier chiffré sauvegardé:', filename, 'Size:', buffer.length, 'bytes')

    // Retourner l'URL relative
    const url = `/e2ee-attachments/${filename}`

    return NextResponse.json({
      url,
      success: true
    })

  } catch (error) {
    console.error('Erreur lors de l\'upload de la pièce jointe:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}