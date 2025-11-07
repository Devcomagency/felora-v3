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
    // Debug: Vérifier les variables AVANT tout
    console.log('🔍 DEBUG: MUX_TOKEN_ID =', process.env.MUX_TOKEN_ID ? 'EXISTS' : 'MISSING')
    console.log('🔍 DEBUG: MUX_TOKEN_SECRET =', process.env.MUX_TOKEN_SECRET ? 'EXISTS' : 'MISSING')

    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      return NextResponse.json({
        error: 'Variables Mux manquantes sur Vercel',
        debug: {
          hasTokenId: !!process.env.MUX_TOKEN_ID,
          hasTokenSecret: !!process.env.MUX_TOKEN_SECRET
        }
      }, { status: 500 })
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    console.log('🎬 Création URL upload Mux pour user:', session.user.id)

    // Créer une URL d'upload direct Mux
    const muxUpload = await createMuxDirectUpload()

    console.log('✅ URL Mux créée:', muxUpload.uploadId)

    return NextResponse.json({
      success: true,
      uploadUrl: muxUpload.uploadUrl,
      uploadId: muxUpload.uploadId,
      assetId: muxUpload.assetId,
    })
  } catch (error: any) {
    console.error('❌ Erreur création URL Mux:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur création URL upload'
    }, { status: 500 })
  }
}
