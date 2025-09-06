import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    // Simplified version without session dependency for Vercel build
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const items = Array.from({ length: 8 }).map((_, i) => ({
      type: ['view','like','message','reservation','reaction'][i % 5],
      text: `Événement #${(page-1)*8 + i + 1}`,
      at: Date.now() - (i+1) * 3600_000,
    }))
    return NextResponse.json({ items, page, hasMore: page < 5 })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 })
  }
}

