// Shared in-memory registry for SSE fan-out (dev/demo)
// Ensure singleton across hot reloads/modules by storing on globalThis
const g = globalThis as any
if (!g.__felora_e2ee_streams) {
  g.__felora_e2ee_streams = new Map<string, Set<(data: any) => void>>()
}
const streams: Map<string, Set<(data: any) => void>> = g.__felora_e2ee_streams

export function registerStream(conversationId: string, send: (data: any) => void) {
  if (!streams.has(conversationId)) streams.set(conversationId, new Set())
  streams.get(conversationId)!.add(send)
}

export function unregisterStream(conversationId: string, send: (data: any) => void) {
  streams.get(conversationId)?.delete(send)
}

export function pushSSE(conversationId: string, payload: any) {
  const set = streams.get(conversationId)
  if (!set) return
  for (const send of set) {
    try {
      send(payload)
    } catch {}
  }
}
