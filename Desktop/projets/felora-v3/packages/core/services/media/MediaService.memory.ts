import type { MediaService, MediaItem, MediaVisibility, MediaType } from './MediaService'
import { Buffer } from 'buffer'

let mem: MediaItem[] = [] // Mémoire vide - nettoyée complètement

function nowIso() {
  return new Date().toISOString()
}

export class MediaServiceMemory implements MediaService {
  async listPublic(cursor?: string, limit = 10): Promise<{ items: MediaItem[]; nextCursor?: string }> {
    const start = parseInt(cursor || '0', 10) || 0
    const items = mem.filter(m => m.visibility !== 'PRIVATE').slice(start, start + limit)
    const nextCursor = start + limit < mem.length ? String(start + limit) : undefined
    return { items, nextCursor }
  }

  async listByEscort(escortId: string, visibility?: MediaVisibility): Promise<MediaItem[]> {
    return mem
      .filter(m => m.author.id === escortId)
      .filter(m => (visibility ? m.visibility === visibility : true))
      .sort((a, b) => (a.position || 999) - (b.position || 999) || a.createdAt.localeCompare(b.createdAt))
  }

  async create(input: { escortId: string; type: MediaType; file: File; visibility: MediaVisibility; price?: number; position?: number }): Promise<{ id: string }> {
    const id = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    // Dev-only preview URL
    // Important: Avoid converting large videos to base64 to prevent memory spikes.
    let url = ''
    const isVideo = (input.type as any) === 'VIDEO' || (input.file.type || '').startsWith('video/')
    if (!isVideo) {
      try {
        const ab = await input.file.arrayBuffer()
        const b64 = Buffer.from(ab).toString('base64')
        url = `data:${input.file.type};base64,${b64}`
      } catch {
        url = ''
      }
    } else {
      // Keep empty URL for videos in memory provider; clients show local preview immediately after upload.
      url = ''
    }
    mem.push({
      id,
      type: input.type,
      url,
      visibility: input.visibility,
      price: input.price,
      position: input.position,
      author: { id: input.escortId, handle: input.escortId },
      createdAt: nowIso(),
    })
    return { id }
  }

  async updateVisibility(id: string, visibility: MediaVisibility, price?: number): Promise<void> {
    mem = mem.map(m => (m.id === id ? { ...m, visibility, price } : m))
  }

  async remove(id: string): Promise<void> {
    mem = mem.filter(m => m.id !== id)
  }
}
