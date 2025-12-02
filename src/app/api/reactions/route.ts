import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reactionRateLimit } from '@/lib/rate-limiter'

// Types de réactions disponibles
const REACTION_TYPES = ['LIKE', 'LOVE', 'FIRE', 'WOW', 'SMILE'] as const
type ReactionType = typeof REACTION_TYPES[number]

/**
 * 🎯 SYSTÈME DE RÉACTIONS UNIFIÉ - VERSION 2.0
 *
 * Fonctionne pour:
 * - Profils Escort
 * - Profils Club
 * - Feed
 * - Mode grille et fullscreen
 *
 * Gère:
 * - Utilisateurs authentifiés (vrai userId)
 * - Utilisateurs invités (guest_xxx)
 */

// ============================================
// GET - Récupérer les stats d'un média
// ============================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const mediaId = searchParams.get('mediaId')
    const userId = searchParams.get('userId')

    if (!mediaId) {
      return NextResponse.json(
        { success: false, error: 'mediaId requis' },
        { status: 400 }
      )
    }

    console.log(`[REACTIONS GET] mediaId=${mediaId}, userId=${userId}`)

    // Compter les réactions par type
    const reactions = await prisma.reaction.groupBy({
      by: ['type'],
      where: { mediaId },
      _count: { _all: true }
    })

    // Formater les stats
    const stats = {
      reactions: {
        LIKE: 0,
        LOVE: 0,
        FIRE: 0,
        WOW: 0,
        SMILE: 0
      },
      total: 0
    }

    reactions.forEach((r) => {
      const count = r._count._all
      stats.reactions[r.type as ReactionType] = count
      stats.total += count
    })

    // Si userId fourni, récupérer les réactions de cet user
    let userHasLiked = false
    let userReactions: string[] = []

    if (userId) {
      const userReactionsList = await prisma.reaction.findMany({
        where: { mediaId, userId },
        select: { type: true }
      })

      userReactionsList.forEach((r) => {
        if (r.type === 'LIKE') {
          userHasLiked = true
        } else {
          userReactions.push(r.type)
        }
      })
    }

    console.log(`[REACTIONS GET] Stats:`, { total: stats.total, userHasLiked, userReactions })

    return NextResponse.json({
      success: true,
      stats,
      userHasLiked,
      userReactions
    })

  } catch (error: any) {
    console.error('[REACTIONS GET] Erreur:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// ============================================
// POST - Toggle une réaction
// ============================================
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = reactionRateLimit(req)
    if (!rateLimitResult.allowed) {
      console.log('[REACTIONS POST] Rate limit dépassé')
      return NextResponse.json(
        { success: false, error: 'Trop de réactions, ralentissez' },
        { status: 429, headers: rateLimitResult.headers }
      )
    }

    // Parser le body
    const body = await req.json()
    const { mediaId, userId, type } = body

    // Validation
    if (!mediaId || !userId || !type) {
      return NextResponse.json(
        { success: false, error: 'mediaId, userId et type requis' },
        { status: 400 }
      )
    }

    if (!REACTION_TYPES.includes(type.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: 'Type de réaction invalide' },
        { status: 400 }
      )
    }

    const reactionType = type.toUpperCase() as ReactionType

    console.log(`[REACTIONS POST] userId=${userId}, mediaId=${mediaId}, type=${reactionType}`)

    // Créer le média si il n'existe pas (pour les médias sans ID en DB)
    await prisma.media.upsert({
      where: { id: mediaId },
      update: {},
      create: {
        id: mediaId,
        ownerType: body.meta?.ownerType || 'ESCORT',
        ownerId: body.meta?.ownerId || 'unknown',
        type: body.meta?.type || 'IMAGE',
        url: body.meta?.url || `media:${mediaId}`,
        visibility: 'PUBLIC'
      }
    }).catch(() => {
      // Ignore si le média existe déjà ou si la structure DB est différente
    })

    // 🎯 LOGIQUE DE TOGGLE
    if (reactionType === 'LIKE') {
      // LIKE : toggle simple on/off
      const existing = await prisma.reaction.findUnique({
        where: {
          mediaId_userId_type: { mediaId, userId, type: 'LIKE' }
        }
      })

      if (existing) {
        // Supprimer le like
        await prisma.reaction.delete({ where: { id: existing.id } })
        console.log(`[REACTIONS POST] ❤️ LIKE supprimé`)
      } else {
        // Ajouter le like
        await prisma.reaction.create({
          data: { mediaId, userId, type: 'LIKE' }
        })
        console.log(`[REACTIONS POST] ❤️ LIKE ajouté`)
      }

    } else {
      // RÉACTION (LOVE, FIRE, WOW, SMILE)
      // 1 seule réaction à la fois (pas le LIKE)

      const existingSameType = await prisma.reaction.findUnique({
        where: {
          mediaId_userId_type: { mediaId, userId, type: reactionType }
        }
      })

      if (existingSameType) {
        // Toggle OFF : supprimer cette réaction
        await prisma.reaction.delete({ where: { id: existingSameType.id } })
        console.log(`[REACTIONS POST] 🔥 ${reactionType} supprimée`)
      } else {
        // Supprimer toute autre réaction (sauf LIKE) de cet user
        await prisma.reaction.deleteMany({
          where: {
            mediaId,
            userId,
            type: { not: 'LIKE' }
          }
        })

        // Ajouter la nouvelle réaction
        await prisma.reaction.create({
          data: { mediaId, userId, type: reactionType }
        })
        console.log(`[REACTIONS POST] 🔥 ${reactionType} ajoutée`)
      }
    }

    // 📊 SYNCHRONISATION DES COMPTEURS
    await syncMediaCounters(mediaId)
    await syncProfileCounters(mediaId)

    // Retourner les nouvelles stats
    const { searchParams } = new URL(req.url)
    const getResponse = await GET(
      new NextRequest(new URL(`${req.url.split('?')[0]}?mediaId=${mediaId}&userId=${userId}`))
    )
    const data = await getResponse.json()

    return NextResponse.json(data, { headers: rateLimitResult.headers })

  } catch (error: any) {
    console.error('[REACTIONS POST] Erreur:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Synchronise les compteurs likeCount et reactCount dans la table Media
 */
async function syncMediaCounters(mediaId: string) {
  try {
    const [likeCount, reactCount] = await Promise.all([
      prisma.reaction.count({
        where: { mediaId, type: 'LIKE' }
      }),
      prisma.reaction.count({
        where: { mediaId, type: { not: 'LIKE' } }
      })
    ])

    await prisma.media.update({
      where: { id: mediaId },
      data: { likeCount, reactCount }
    })

    console.log(`[REACTIONS SYNC] Media ${mediaId}: ${likeCount} likes, ${reactCount} reacts`)
  } catch (error) {
    console.error('[REACTIONS SYNC] Erreur sync media:', error)
  }
}

/**
 * Synchronise les compteurs totalLikes et totalReacts dans le profil (Escort/Club)
 */
async function syncProfileCounters(mediaId: string) {
  try {
    // Récupérer le média pour connaître le owner
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      select: { ownerId: true, ownerType: true }
    })

    if (!media) return

    // Compter TOUTES les réactions de TOUS les médias de ce profil
    const [totalLikes, totalReacts] = await Promise.all([
      prisma.reaction.count({
        where: {
          media: {
            ownerId: media.ownerId,
            ownerType: media.ownerType,
            deletedAt: null
          },
          type: 'LIKE'
        }
      }),
      prisma.reaction.count({
        where: {
          media: {
            ownerId: media.ownerId,
            ownerType: media.ownerType,
            deletedAt: null
          },
          type: { not: 'LIKE' }
        }
      })
    ])

    console.log(`[REACTIONS SYNC] Profile ${media.ownerType}/${media.ownerId}: ${totalLikes} likes, ${totalReacts} reacts`)

    // Mettre à jour le profil
    if (media.ownerType === 'ESCORT') {
      await prisma.escortProfile.update({
        where: { id: media.ownerId },
        data: { totalLikes, totalReacts }
      }).catch((err) => {
        console.warn('[REACTIONS SYNC] Profil escort non trouvé:', media.ownerId)
      })
    } else if (media.ownerType === 'CLUB') {
      await prisma.clubProfileV2.update({
        where: { id: media.ownerId },
        data: { totalLikes, totalReacts }
      }).catch((err) => {
        console.warn('[REACTIONS SYNC] Profil club non trouvé:', media.ownerId)
      })
    }

  } catch (error) {
    console.error('[REACTIONS SYNC] Erreur sync profile:', error)
  }
}
