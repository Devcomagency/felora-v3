import { NextRequest, NextResponse } from 'next/server'
import { Livepeer } from 'livepeer'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Initialiser le client Livepeer
const livepeer = new Livepeer({
  apiKey: process.env.LIVEPEER_API_KEY || '',
})

/**
 * POST /api/video/transcode
 * Déclenche le transcodage d'une vidéo via Livepeer
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

    console.log('🎬 Démarrage transcodage Livepeer:', {
      fileName,
      fileUrl: fileUrl.substring(0, 50) + '...',
      userId: session.user.id
    })

    // 3. Créer l'asset Livepeer (upload + transcodage)
    const asset = await livepeer.asset.create({
      name: fileName,
      url: fileUrl,
      // Options de transcodage
      storage: {
        ipfs: false, // On n'utilise pas IPFS pour l'instant
      },
      playbackPolicy: {
        type: 'public', // Vidéos publiques (ajuster si besoin authentification)
      },
      // Profils de qualité (HLS adaptatif)
      profiles: [
        {
          name: '480p',
          bitrate: 1000000, // 1 Mbps
          fps: 30,
          width: 854,
          height: 480,
        },
        {
          name: '720p',
          bitrate: 2500000, // 2.5 Mbps
          fps: 30,
          width: 1280,
          height: 720,
        },
        {
          name: '1080p',
          bitrate: 5000000, // 5 Mbps
          fps: 30,
          width: 1920,
          height: 1080,
        },
      ],
    })

    console.log('✅ Asset Livepeer créé:', asset.id)

    // 4. Retourner les infos de l'asset
    return NextResponse.json({
      success: true,
      asset: {
        id: asset.id,
        status: asset.status?.phase || 'processing',
        playbackId: asset.playbackId,
        playbackUrl: asset.playbackId
          ? `https://lvpr.tv/?v=${asset.playbackId}`
          : null,
        downloadUrl: asset.downloadUrl,
        createdAt: asset.createdAt,
      }
    })

  } catch (error: any) {
    console.error('❌ Erreur transcodage Livepeer:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors du transcodage',
        details: error.message
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

    // Récupérer l'asset Livepeer
    const asset = await livepeer.asset.get(assetId)

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
