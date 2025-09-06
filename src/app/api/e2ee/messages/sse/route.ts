import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { registerStream, unregisterStream } from '@/app/api/e2ee/messages/stream'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const conversationId = searchParams.get('conversationId') || ''
  const after = searchParams.get('after')
  const session = await getServerSession(authOptions)
  const userId = (session as any)?.user?.id || ''

  if (!conversationId || !userId) {
    return NextResponse.json({ error: 'missing_params' }, { status: 400 })
  }

  const conv = await prisma.e2EEConversation.findUnique({ where: { id: conversationId } })
  if (!conv) return NextResponse.json({ error: 'conversation_not_found' }, { status: 404 })
  if (!conv.participants.includes(userId)) return NextResponse.json({ error: 'not_authorized' }, { status: 403 })

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      const send = (payload: any) => {
        const data = `data: ${JSON.stringify(payload)}\n\n`
        controller.enqueue(encoder.encode(data))
      }
      // Optional catch-up: send messages after a given timestamp before live registration
      if (after) {
        const ts = Number(after)
        if (!Number.isNaN(ts) && ts > 0) {
          // Fire and forget; we can't await in start; wrap in promise
          ;(async () => {
            try {
              const since = new Date(ts)
              const missed = await prisma.e2EEMessageEnvelope.findMany({
                where: { conversationId, createdAt: { gt: since } },
                orderBy: { createdAt: 'asc' },
                take: 200
              })
              for (const m of missed) {
                send(m)
              }
            } catch {}
          })()
        }
      }
      registerStream(conversationId, send)
      // Initial comment to open the stream
      controller.enqueue(encoder.encode(': connected\n\n'))

      const keepAlive = setInterval(() => {
        try {
          if (controller.desiredSize !== null) {
            controller.enqueue(encoder.encode(': keep-alive\n\n'))
          }
        } catch (error) {
          // Controller fermé, ne rien faire
          clearInterval(keepAlive)
        }
      }, 25000)

      ;(controller as any)._cleanup = () => {
        clearInterval(keepAlive)
        unregisterStream(conversationId, send)
      }
    },
    cancel() {
      // @ts-ignore
      this._cleanup?.()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  })
}
