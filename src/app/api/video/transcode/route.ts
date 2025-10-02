import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * POST /api/video/transcode
 * Déclenche le transcodage d'une vidéo via Livepeer API REST
 *
 * Body: { fileUrl: string, fileName: string }
 * Returns: { assetId: string, status: string, playbackUrl: string }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // 2. Récupérer les données
    const body = await request.json()
    const { fileUrl, fileName } = body

    if (!fileUrl || !fileName) {
      return NextResponse.json(
        { error: 'fileUrl et fileName requis' },
        { status: 400 }
      )
    }

    const apiKey = process.env.LIVEPEER_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'LIVEPEER_API_KEY non configurée' },
        { status: 500 }
      )
    }

    console.log('🎬 Démarrage transcodage Livepeer:', {
      fileName,
      fileUrl: fileUrl.substring(0, 50) + '...',
      userId: session.user.id
    })

    // 3. Appel API REST Livepeer pour créer l'asset
    const livepeerResponse = await fetch('https://livepeer.studio/api/asset/request-upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fileName,
        url: fileUrl,
      })
    })

    if (!livepeerResponse.ok) {
      const errorText = await livepeerResponse.text()
      console.error('❌ Erreur Livepeer API:', livepeerResponse.status, errorText)

      return NextResponse.json(
        {
          error: 'Erreur API Livepeer',
          details: errorText,
          status: livepeerResponse.status
        },
        { status: 500 }
      )
    }

    const asset = await livepeerResponse.json()

    console.log('✅ Asset Livepeer créé:', {
      id: asset.asset?.id,
      uploadUrl: asset.url ? 'URL présente' : 'Pas d\'URL',
      tusEndpoint: asset.tusEndpoint ? 'Endpoint présent' : 'Pas d\'endpoint'
    })

    // 4. Retourner les infos de l'asset
    return NextResponse.json({
      success: true,
      asset: {
        id: asset.asset?.id || asset.id,
        status: asset.asset?.status?.phase || 'uploading',
        playbackId: asset.asset?.playbackId,
        playbackUrl: asset.asset?.playbackId
          ? `https://lvpr.tv/?v=${asset.asset.playbackId}`
          : null,
        uploadUrl: asset.url,
        tusEndpoint: asset.tusEndpoint,
        createdAt: asset.asset?.createdAt || new Date().toISOString(),
      }
    })

  } catch (error: any) {
    console.error('❌ Erreur transcodage Livepeer:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors du transcodage',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/video/transcode?assetId=xxx
 * Récupère le statut d'un transcodage en cours
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')

    if (!assetId) {
      return NextResponse.json(
        { error: 'assetId requis' },
        { status: 400 }
      )
    }

    const apiKey = process.env.LIVEPEER_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'LIVEPEER_API_KEY non configurée' },
        { status: 500 }
      )
    }

    // Récupérer l'asset via API REST
    const livepeerResponse = await fetch(`https://livepeer.studio/api/asset/${assetId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    })

    if (!livepeerResponse.ok) {
      const errorText = await livepeerResponse.text()
      console.error('❌ Erreur récupération asset:', livepeerResponse.status, errorText)

      return NextResponse.json(
        {
          error: 'Erreur API Livepeer',
          details: errorText
        },
        { status: 500 }
      )
    }

    const asset = await livepeerResponse.json()

    return NextResponse.json({
      success: true,
      asset: {
        id: asset.id,
        status: asset.status?.phase || 'unknown',
        progress: asset.status?.progress || 0,
        playbackId: asset.playbackId,
        playbackUrl: asset.playbackId
          ? `https://lvpr.tv/?v=${asset.playbackId}`
          : null,
        downloadUrl: asset.downloadUrl,
        duration: asset.videoSpec?.duration,
        size: asset.size,
      }
    })

  } catch (error: any) {
    console.error('❌ Erreur récupération asset:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération',
        details: error.message
      },
      { status: 500 }
    )
  }
}
