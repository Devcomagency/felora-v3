import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { url, type } = await request.json()

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL de la photo requise' },
        { status: 400 }
      )
    }

    try {
      // Extraire le chemin du fichier depuis l'URL
      // URL format: /uploads/escorts/public/filename.jpg
      const filePath = join(process.cwd(), 'public', url)
      
      // Supprimer le fichier
      await unlink(filePath)
      
      return NextResponse.json({
        success: true,
        message: 'Photo supprimée avec succès'
      })
      
    } catch (fsError) {
      console.error('Erreur suppression fichier:', fsError)
      // Le fichier n'existe peut-être pas, on retourne quand même success
      return NextResponse.json({
        success: true,
        message: 'Photo supprimée'
      })
    }

  } catch (error) {
    console.error('Erreur suppression:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}