import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reactionRateLimit } from '@/lib/rate-limiter'

const TYPES = ['LIKE','LOVE','FIRE','WOW','SMILE'] as const
type ReactionType = typeof TYPES[number]

async function getStats(mediaId: string, userId?: string|null) {
  const counts = await prisma.reaction.groupBy({
    by: ['type'],
    where: { mediaId },
    _count: { _all: true }
  })

  const reactions: Record<string, number> = { LIKE:0, LOVE:0, FIRE:0, WOW:0, SMILE:0 }
  for (const row of counts) {
    reactions[row.type] = (row as any)._count?._all ?? (row as any)._count ?? 0
  }
  const total = Object.values(reactions).reduce((a,b)=>a+b,0)

  let userHasLiked = false
  let userReactions: string[] = []
  if (userId) {
    const [like, nonLikes] = await Promise.all([
      prisma.reaction.findFirst({ where: { mediaId, userId, type: 'LIKE' as any } }),
      prisma.reaction.findMany({ where: { mediaId, userId, NOT: { type: 'LIKE' as any } }, select: { type: true } })
    ])
    userHasLiked = !!like
    userReactions = nonLikes.map(r => r.type)
  }

  return { stats: { reactions, total }, userHasLiked, userReactions }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mediaId = searchParams.get('mediaId') || ''
  const userId = searchParams.get('userId')
  if (!mediaId) return NextResponse.json({ success:false, error:'mediaId_required' }, { status: 400 })

  try {
    const data = await getStats(mediaId, userId)
    console.log(`[REACTIONS GET] mediaId=${mediaId}, total=${data.stats.total}, reactions=${JSON.stringify(data.stats.reactions)}`)
    return NextResponse.json({ success:true, ...data })
  } catch (e:any) {
    return NextResponse.json({ success:false, error: e?.message || 'server_error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  // Vérifier le rate limiting
  const rateLimitResult = reactionRateLimit(req)
  if (!rateLimitResult.allowed) {
    console.log('🚫 [REACTIONS] Rate limit dépassé')
    return NextResponse.json(
      {
        success: false,
        error: 'Trop de réactions, veuillez ralentir',
        code: 'RATE_LIMIT_EXCEEDED'
      },
      {
        status: 429,
        headers: rateLimitResult.headers
      }
    )
  }

  const body = await req.json().catch(() => ({}))
  const mediaId: string = String(body.mediaId || '')
  const userId: string = String(body.userId || '')
  const typeRaw: string = String(body.type || '')
  const type = typeRaw.toUpperCase() as ReactionType
  if (!mediaId || !userId || !TYPES.includes(type)) {
    return NextResponse.json({ success:false, error:'invalid_params' }, { status: 400 })
  }

  // Optional metadata to satisfy FK on Media when using our schema
  const meta = body.meta || {}

  try {
    // Ensure Media exists to satisfy FK (best-effort, minimal fields)
    try {
      await prisma.media.upsert({
        where: { id: mediaId },
        update: {},
        create: {
          id: mediaId,
          ownerType: String(meta.ownerType || 'ESCORT'),
          ownerId: String(meta.ownerId || 'unknown'),
          type: String(meta.type || 'IMAGE'),
          url: String(meta.url || `media:${mediaId}`),
          visibility: 'PUBLIC'
        }
      })
    } catch { /* ignore if schema differs or FK disabled */ }

    // Logique originale : LIKE et RÉACTION sont séparés
    // - 1 LIKE max par média/user (toggle on/off)
    // - 1 RÉACTION max par média/user (mais peut changer de type : LOVE → FIRE)

    if (type === 'LIKE') {
      // Gérer le LIKE (toggle)
      const existing = await prisma.reaction.findFirst({ where: { mediaId, userId, type: 'LIKE' as any } })
      if (existing) {
        console.log(`[REACTIONS] Toggle off LIKE by user ${userId} on media ${mediaId}`)
        await prisma.reaction.delete({ where: { id: existing.id } })
      } else {
        console.log(`[REACTIONS] Create LIKE by user ${userId} on media ${mediaId}`)
        await prisma.reaction.create({ data: { mediaId, userId, type: 'LIKE' as any } })
      }
    } else {
      // Gérer la RÉACTION (remplacer si différente, toggle si même type)
      const existingSame = await prisma.reaction.findFirst({ where: { mediaId, userId, type: type as any } })
      if (existingSame) {
        // Toggle : Si la même réaction existe, on la supprime
        console.log(`[REACTIONS] Toggle off ${type} by user ${userId} on media ${mediaId}`)
        await prisma.reaction.delete({ where: { id: existingSame.id } })
      } else {
        // Remplacer toute autre réaction non-LIKE par celle-ci
        console.log(`[REACTIONS] Replace reaction with ${type} by user ${userId} on media ${mediaId}`)
        await prisma.reaction.deleteMany({ where: { mediaId, userId, NOT: { type: 'LIKE' as any } } })
        await prisma.reaction.create({ data: { mediaId, userId, type: type as any } })
      }
    }

    // 🔥 Synchroniser les compteurs dans la table media
    try {
      const [likeCount, reactCount] = await Promise.all([
        prisma.reaction.count({ where: { mediaId, type: 'LIKE' as any } }),
        prisma.reaction.count({ where: { mediaId, NOT: { type: 'LIKE' as any } } })
      ])

      console.log(`[REACTIONS SYNC] mediaId: ${mediaId}, likeCount: ${likeCount}, reactCount: ${reactCount}`)

      await prisma.media.update({
        where: { id: mediaId },
        data: { likeCount, reactCount }
      })

      console.log(`[REACTIONS SYNC] ✅ Media updated successfully`)
    } catch (syncError) {
      console.error('[REACTIONS] Failed to sync media counts:', syncError)
      // Non-blocking - continuer même si la synchro échoue
    }

    // 🔥 NOUVEAU : Synchroniser les compteurs globaux du profil escort
    try {
      // Récupérer le média pour connaître le propriétaire
      let media = await prisma.media.findUnique({
        where: { id: mediaId },
        select: { ownerId: true, ownerType: true }
      })

      // Si le média n'est pas trouvé (mediaId peut être un hash), essayer de le trouver via la réaction qu'on vient de créer/modifier
      if (!media) {
        console.log(`[REACTIONS SYNC] Media not found by ID, trying to find via reaction...`)
        const reactionWithMedia = await prisma.reaction.findFirst({
          where: { mediaId },
          select: {
            media: {
              select: { ownerId: true, ownerType: true }
            }
          }
        })
        media = reactionWithMedia?.media || null
      }

      if (media && media.ownerType === 'ESCORT') {
        console.log(`[REACTIONS SYNC] Updating global counters for user ID: ${media.ownerId}`)

        // 🔥 IMPORTANT : media.ownerId peut être un User.id OU directement un EscortProfile.id
        // Il faut essayer les deux cas
        let escortProfile = await prisma.escortProfile.findUnique({
          where: { userId: media.ownerId },
          select: { id: true }
        })

        // Si pas trouvé avec userId, essayer avec l'id direct
        if (!escortProfile) {
          escortProfile = await prisma.escortProfile.findUnique({
            where: { id: media.ownerId },
            select: { id: true }
          }).catch(() => null)
        }

        if (!escortProfile) {
          console.log(`[REACTIONS SYNC] ⚠️ No escort profile found for owner ${media.ownerId}`)
          // Continuer sans faire d'erreur
        } else {
          console.log(`[REACTIONS SYNC] Found escort profile: ${escortProfile.id} for owner ${media.ownerId}`)

          // Compter TOUTES les réactions de TOUS les médias de cet escort
          const [totalLikes, totalReacts] = await Promise.all([
            prisma.reaction.count({
              where: {
                media: {
                  ownerId: media.ownerId,
                  ownerType: 'ESCORT',
                  deletedAt: null
                },
                type: 'LIKE' as any
              }
            }),
            prisma.reaction.count({
              where: {
                media: {
                  ownerId: media.ownerId,
                  ownerType: 'ESCORT',
                  deletedAt: null
                },
                NOT: { type: 'LIKE' as any }
              }
            })
          ])

          console.log(`[REACTIONS SYNC] Global counters for escort ${escortProfile.id}: ${totalLikes} likes, ${totalReacts} reactions`)

          // Mettre à jour le profil escort
          await prisma.escortProfile.update({
            where: { id: escortProfile.id },
            data: { totalLikes, totalReacts }
          })

          console.log(`[REACTIONS SYNC] ✅ Escort profile ${escortProfile.id} global counters updated`)
        }
      } else if (media && media.ownerType === 'CLUB') {
        console.log(`[REACTIONS SYNC] Updating global counters for club ID: ${media.ownerId}`)

        // Pour les clubs, on peut mettre à jour directement
        const [totalLikes, totalReacts] = await Promise.all([
          prisma.reaction.count({
            where: {
              media: {
                ownerId: media.ownerId,
                ownerType: 'CLUB',
                deletedAt: null
              },
              type: 'LIKE' as any
            }
          }),
          prisma.reaction.count({
            where: {
              media: {
                ownerId: media.ownerId,
                ownerType: 'CLUB',
                deletedAt: null
              },
              NOT: { type: 'LIKE' as any }
            }
          })
        ])

        console.log(`[REACTIONS SYNC] Global counters for club ${media.ownerId}: ${totalLikes} likes, ${totalReacts} reactions`)

        // Mettre à jour le profil club
        await prisma.clubProfileV2.update({
          where: { id: media.ownerId },
          data: { totalLikes, totalReacts }
        }).catch((err) => {
          console.error(`[REACTIONS SYNC] Failed to update club profile: ${err.message}`)
        })

        console.log(`[REACTIONS SYNC] ✅ Club profile ${media.ownerId} global counters updated`)
      } else {
        console.log(`[REACTIONS SYNC] ⚠️ Media not found or unknown owner type, skipping profile sync`)
      }
    } catch (profileSyncError) {
      console.error('[REACTIONS] Failed to sync escort profile counters:', profileSyncError)
      // Non-blocking - continuer même si la synchro échoue
    }

    const data = await getStats(mediaId, userId)
    return NextResponse.json({ success:true, ...data }, {
      headers: rateLimitResult.headers
    })
  } catch (e:any) {
    return NextResponse.json({ success:false, error: e?.message || 'server_error' }, { status: 500 })
  }
}