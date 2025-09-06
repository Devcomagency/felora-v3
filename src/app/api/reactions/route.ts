import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    return NextResponse.json({ success:true, ...data })
  } catch (e:any) {
    return NextResponse.json({ success:false, error: e?.message || 'server_error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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

    if (type === 'LIKE') {
      const existing = await prisma.reaction.findFirst({ where: { mediaId, userId, type: 'LIKE' as any } })
      if (existing) {
        await prisma.reaction.delete({ where: { id: existing.id } })
      } else {
        await prisma.reaction.create({ data: { mediaId, userId, type: 'LIKE' as any } })
      }
    } else {
      const existingSame = await prisma.reaction.findFirst({ where: { mediaId, userId, type: type as any } })
      if (!existingSame) {
        // Remplacer toute autre réaction non-LIKE par celle-ci (idempotent)
        await prisma.reaction.deleteMany({ where: { mediaId, userId, NOT: { type: 'LIKE' as any } } })
        await prisma.reaction.create({ data: { mediaId, userId, type: type as any } })
      }
    }

    const data = await getStats(mediaId, userId)
    return NextResponse.json({ success:true, ...data })
  } catch (e:any) {
    return NextResponse.json({ success:false, error: e?.message || 'server_error' }, { status: 500 })
  }
}