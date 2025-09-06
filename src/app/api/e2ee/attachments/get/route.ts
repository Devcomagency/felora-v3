import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { promises as fs } from 'fs'
import path from 'path'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    // Rate limit: 60 req / 60s per IP (downloads)
    const { rateLimit, rateKey } = await import('@/lib/rate-limit')
    const key = rateKey(req as any, 'e2ee-download')
    const rl = rateLimit({ key, limit: 60, windowMs: 60_000 })
    if (!rl.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    const url = new URL(req.url)
    const relPath = url.searchParams.get('path') || ''
    const conversationId = url.searchParams.get('conversationId') || ''
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id || ''

    if (!relPath || !conversationId || !userId) {
      return NextResponse.json({ error: 'missing_params' }, { status: 400 })
    }

    // Authorize access: user must be in conversation participants
    const conv = await prisma.e2EEConversation.findUnique({ where: { id: conversationId } })
    if (!conv) return NextResponse.json({ error: 'conversation_not_found' }, { status: 404 })
    const participants: string[] = Array.isArray(conv.participants) ? (conv.participants as any) : []
    if (!participants.includes(userId)) return NextResponse.json({ error: 'not_authorized' }, { status: 403 })

    // Sanitize path (prevent traversal) and serve from public/uploads/e2ee
    const safe = path.basename(relPath)
    const abs = path.join(process.cwd(), 'uploads', 'e2ee', safe)
    const bin = await fs.readFile(abs)
    return new Response(bin, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'private, max-age=60',
      }
    })
  } catch (e) {
    console.error('attachments/get error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
