import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const mediaIds: string[] = Array.isArray(body.mediaIds) ? body.mediaIds.map(String) : []
  if (!mediaIds.length) return NextResponse.json({ success:false, error:'mediaIds_required' }, { status: 400 })

  try {
    const grouped = await prisma.reaction.groupBy({
      by: ['type','mediaId'],
      where: { mediaId: { in: mediaIds } },
      _count: { _all: true }
    })

    const totals: Record<string, number> = {}
    const byType: Record<string, Record<string, number>> = {}
    for (const g of grouped) {
      const id = (g as any).mediaId as string
      const type = (g as any).type as string
      const c = (g as any)._count?._all ?? (g as any)._count ?? 0
      byType[id] = byType[id] || { LIKE:0, LOVE:0, FIRE:0, WOW:0, SMILE:0 }
      byType[id][type] = (byType[id][type] || 0) + c
    }
    for (const id of mediaIds) {
      const r = byType[id] || { LIKE:0, LOVE:0, FIRE:0, WOW:0, SMILE:0 }
      totals[id] = (r.LIKE || 0) + (r.LOVE || 0) + (r.FIRE || 0) + (r.WOW || 0) + (r.SMILE || 0)
    }

    return NextResponse.json({ success:true, totals, byType })
  } catch (e:any) {
    return NextResponse.json({ success:false, error: e?.message || 'server_error' }, { status: 500 })
  }
}