import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Validation du type de fichier
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Le fichier doit être une image' },
        { status: 400 }
      )
    }

    // Validation de la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Le fichier est trop volumineux (5MB maximum)' },
        { status: 400 }
      )
    }

    // Créer le nom de fichier unique
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    
    // Définir le dossier selon le type
    let folder = 'escorts'
    if (type === 'avatar') folder = 'escorts/avatars'
    else if (type === 'public') folder = 'escorts/public'
    else if (type === 'private') folder = 'escorts/private'

    // Créer le chemin complet
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder)
    const filePath = join(uploadDir, fileName)

    try {
      // Créer le dossier s'il n'existe pas
      await mkdir(uploadDir, { recursive: true })
      
      // Convertir le fichier en buffer et l'écrire
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Retourner l'URL publique
      const publicUrl = `/uploads/${folder}/${fileName}`
      
      return NextResponse.json({
        success: true,
        url: publicUrl,
        message: 'Photo uploadée avec succès'
      })
      
    } catch (fsError) {
      console.error('Erreur écriture fichier:', fsError)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la sauvegarde du fichier' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erreur upload:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}