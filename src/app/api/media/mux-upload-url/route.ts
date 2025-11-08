import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createMuxDirectUpload } from '@/lib/mux'

/**
 * API pour obtenir une URL d'upload direct Mux
 * Le client uploade directement vers Mux (rapide)
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Créer une URL d'upload direct Mux
    const muxUpload = await createMuxDirectUpload()

    return NextResponse.json({
      success: true,
      uploadUrl: muxUpload.uploadUrl,
      uploadId: muxUpload.uploadId,
      assetId: muxUpload.assetId,
    })
  } catch (error: any) {
    console.error('❌ Erreur création URL Mux:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur création URL upload'
    }, { status: 500 })
  }
}
