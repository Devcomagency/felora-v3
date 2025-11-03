import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/webhooks/livepeer
 * Webhook pour recevoir les événements Livepeer
 *
 * Événements supportés:
 * - asset.created
 * - asset.updated
 * - asset.ready (transcodage terminé)
 * - asset.failed
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier la signature du webhook (sécurité)
    const headersList = headers()
    const signature = headersList.get('livepeer-signature')

    // TODO: Vérifier la signature avec le secret webhook Livepeer
    // const isValid = verifySignature(signature, body, process.env.LIVEPEER_WEBHOOK_SECRET)
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    // 2. Récupérer le payload
    const payload = await request.json()
    const { event, payload: eventPayload } = payload

    console.log('🎬 Webhook Livepeer reçu:', {
      event,
      assetId: eventPayload?.id,
      status: eventPayload?.status?.phase
    })

    // 3. Traiter les différents événements
    switch (event) {
      case 'asset.created':
        await handleAssetCreated(eventPayload)
        break

      case 'asset.updated':
        await handleAssetUpdated(eventPayload)
        break

      case 'asset.ready':
        await handleAssetReady(eventPayload)
        break

      case 'asset.failed':
        await handleAssetFailed(eventPayload)
        break

      default:
        console.log('ℹ️ Événement non géré:', event)
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('❌ Erreur webhook Livepeer:', error)
    return NextResponse.json(
      { error: 'Erreur traitement webhook', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Asset créé (début du transcodage)
 */
async function handleAssetCreated(asset: any) {
  console.log('✅ Asset créé:', asset.id)

  // Mettre à jour la base de données
  await prisma.media.updateMany({
    where: { livepeerAssetId: asset.id },
    data: {
      status: 'processing',
      metadata: {
        livepeer: {
          assetId: asset.id,
          status: asset.status?.phase,
          createdAt: asset.createdAt,
        }
      }
    }
  })
}

/**
 * Asset mis à jour (progression du transcodage)
 */
async function handleAssetUpdated(asset: any) {
  const progress = asset.status?.progress || 0
  console.log(`📊 Asset mis à jour: ${asset.id} (${Math.round(progress * 100)}%)`)

  await prisma.media.updateMany({
    where: { livepeerAssetId: asset.id },
    data: {
      metadata: {
        livepeer: {
          assetId: asset.id,
          status: asset.status?.phase,
          progress,
          updatedAt: new Date().toISOString(),
        }
      }
    }
  })
}

/**
 * Asset prêt (transcodage terminé avec succès)
 */
async function handleAssetReady(asset: any) {
  console.log('🎉 Asset prêt:', asset.id)

  // Construire l'URL de lecture HLS
  const playbackUrl = asset.playbackId
    ? `https://lvpr.tv/?v=${asset.playbackId}`
    : null

  const hlsUrl = asset.playbackId
    ? `https://livepeercdn.studio/hls/${asset.playbackId}/index.m3u8`
    : null

  // Mettre à jour en base
  await prisma.media.updateMany({
    where: { livepeerAssetId: asset.id },
    data: {
      status: 'ready',
      hlsUrl,
      playbackUrl,
      duration: asset.videoSpec?.duration,
      metadata: {
        livepeer: {
          assetId: asset.id,
          playbackId: asset.playbackId,
          status: 'ready',
          hlsUrl,
          playbackUrl,
          downloadUrl: asset.downloadUrl,
          duration: asset.videoSpec?.duration,
          resolution: `${asset.videoSpec?.width}x${asset.videoSpec?.height}`,
          completedAt: new Date().toISOString(),
        }
      }
    }
  })

  console.log('✅ Base de données mise à jour avec URL HLS:', hlsUrl)
}

/**
 * Asset échoué (erreur pendant le transcodage)
 */
async function handleAssetFailed(asset: any) {
  console.error('❌ Asset échoué:', asset.id, asset.status?.errorMessage)

  await prisma.media.updateMany({
    where: { livepeerAssetId: asset.id },
    data: {
      status: 'failed',
      metadata: {
        livepeer: {
          assetId: asset.id,
          status: 'failed',
          error: asset.status?.errorMessage,
          failedAt: new Date().toISOString(),
        }
      }
    }
  })
}

/**
 * GET - Pour vérifier que le webhook est configuré
 */
export async function GET() {
  return NextResponse.json({
    service: 'Livepeer Webhook Handler',
    status: 'active',
    supportedEvents: [
      'asset.created',
      'asset.updated',
      'asset.ready',
      'asset.failed'
    ]
  })
}
