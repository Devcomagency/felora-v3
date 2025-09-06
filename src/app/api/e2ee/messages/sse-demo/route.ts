import { prisma } from '@/lib/prisma'
import { registerStream, unregisterStream } from '@/app/api/e2ee/messages/stream'

// Demo SSE endpoint (no auth) to keep /messages-test working
export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not Found', { status: 404 })
  }
  const { searchParams } = new URL(req.url)
  const conversationId = searchParams.get('conversationId') || ''
  if (!conversationId) {
    return new Response(JSON.stringify({ error: 'missing_params' }), { status: 400 })
  }
  const conv = await prisma.e2EEConversation.findUnique({ where: { id: conversationId } })
  if (!conv) return new Response(JSON.stringify({ error: 'conversation_not_found' }), { status: 404 })

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      const send = (payload: any) => {
        const data = `data: ${JSON.stringify(payload)}\n\n`
        controller.enqueue(encoder.encode(data))
      }
      registerStream(conversationId, send)
      controller.enqueue(encoder.encode(': connected\n\n'))
      const keepAlive = setInterval(() => controller.enqueue(encoder.encode(': keep-alive\n\n')), 25000)
      ;(controller as any)._cleanup = () => { clearInterval(keepAlive); unregisterStream(conversationId, send) }
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
