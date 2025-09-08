import type { MediaService } from './MediaService'

// Export types only
export type { MediaService, MediaItem, MediaVisibility, MediaType } from './MediaService'

// Lazy singleton getter (dynamic import to avoid evaluating provider module at import time)
let _instance: MediaService | null = null
export async function getMediaService(): Promise<MediaService> {
  if (_instance) return _instance
  
  // Priorité : Prisma > Sanity > Memory
  const hasPrisma = true // Toujours utiliser Prisma pour la persistance
  const hasSanity = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && !!process.env.SANITY_API_TOKEN
  
  if (hasPrisma) {
    const mod = await import('./MediaService.prisma')
    const MediaServicePrisma = mod.MediaServicePrisma
    _instance = new MediaServicePrisma()
  } else if (hasSanity) {
    const mod = await import('./MediaService.sanity')
    const MediaServiceSanity = mod.MediaServiceSanity
    _instance = new MediaServiceSanity()
  } else {
    const mod = await import('./MediaService.memory')
    const MediaServiceMemory = mod.MediaServiceMemory
    _instance = new MediaServiceMemory()
  }
  return _instance
}
