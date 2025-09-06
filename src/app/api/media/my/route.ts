import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getMediaService } from '../../../../../packages/core/services/media/index'
import type { MediaVisibility } from '../../../../../packages/core/services/media/MediaService'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ items: [] })
    const url = new URL(req.url)
    const visibility = (url.searchParams.get('visibility') || undefined) as MediaVisibility | undefined
    const escort = await prisma.escortProfile.findUnique({ where: { userId }, select: { id: true } })
    if (!escort) return NextResponse.json({ items: [] })
    const service = await getMediaService()
    const items = await service.listByEscort(escort.id, visibility)
    return NextResponse.json({ items })
  } catch (e:any) {
    return NextResponse.json({ items: [], error: e?.message || 'server_error' }, { status: 200 })
  }
}

