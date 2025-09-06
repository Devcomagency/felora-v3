import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    const uid = (session as any)?.user?.id as string | undefined
    if (!uid) return NextResponse.json([], { status: 401 })
    const { searchParams } = new URL(req.url)
    const limit = Math.min(10, parseInt(searchParams.get('limit') || '5', 10) || 5)
    const items = Array.from({ length: limit }).map((_, i) => ({
      id: `m_${i+1}`,
      rank: i+1,
      type: i % 3 === 0 ? 'video' : 'image',
      title: `Media ${i+1}`,
      publishedAgo: `${(i+1)*3} j`,
      likes: 50 + i * 7,
      views: 200 + i * 25,
      score: 80 - i,
      thumb: `https://picsum.photos/seed/felora-${i+1}/160/160`,
    }))
    return NextResponse.json(items)
  } catch (e:any) {
    return NextResponse.json([], { status: 500 })
  }
}

