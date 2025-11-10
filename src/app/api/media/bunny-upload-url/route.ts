import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createBunnyDirectUpload } from '@/lib/bunny'

/**
 * API pour créer une URL d'upload direct vers Bunny Stream
 *
 * Flow:
 * 1. Client appelle cette API
 * 2. On crée une vidéo sur Bunny
 * 3. On retourne l'URL d'upload + videoId
 * 4. Client upload directement vers Bunny (bypasse Vercel)
 * 5. Client appelle /api/media/bunny-confirm pour sauvegarder en DB
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    console.log('🎬 Création URL upload Bunny pour user:', session.user.id)

    // Créer la vidéo sur Bunny et obtenir l'URL d'upload
    const bunnyUpload = await createBunnyDirectUpload()

    console.log('✅ URL upload Bunny créée:', {
      videoId: bunnyUpload.videoId,
      libraryId: bunnyUpload.libraryId
    })

    // Retourner aussi l'API key pour l'upload (sécurisé car endpoint requiert auth)
    return NextResponse.json({
      uploadUrl: bunnyUpload.uploadUrl,
      videoId: bunnyUpload.videoId,
      collectionId: bunnyUpload.collectionId,
      libraryId: bunnyUpload.libraryId,
      apiKey: process.env.BUNNY_STREAM_API_KEY, // Nécessaire pour l'upload client
      message: 'Upload direct vers Bunny depuis le client'
    })
  } catch (error: any) {
    console.error('❌ Erreur création URL upload Bunny:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur création URL upload'
    }, { status: 500 })
  }
}
