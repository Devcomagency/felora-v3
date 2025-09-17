// Point d'entrée de compatibilité: ré-exporte l'API et expose un proxy mediaService
export * from './media/index'
export * from './media/MediaService'

// Fournit un objet mediaService rétrocompatible qui délègue vers getMediaService()
import type { MediaService } from './media/MediaService'
import { getMediaService } from './media/index'

type AwaitedReturn<T> = T extends Promise<infer U> ? U : T

export const mediaService: {
  listPublic: (...args: Parameters<MediaService['listPublic']>) => ReturnType<MediaService['listPublic']>
  listByEscort: (...args: Parameters<MediaService['listByEscort']>) => ReturnType<MediaService['listByEscort']>
  create: (...args: Parameters<MediaService['create']>) => ReturnType<MediaService['create']>
  updateVisibility: (...args: Parameters<MediaService['updateVisibility']>) => ReturnType<MediaService['updateVisibility']>
  remove: (...args: Parameters<MediaService['remove']>) => ReturnType<MediaService['remove']>
} = {
  listPublic: async (...args) => (await getMediaService()).listPublic(...args),
  listByEscort: async (...args) => (await getMediaService()).listByEscort(...args),
  create: async (...args) => (await getMediaService()).create(...args),
  updateVisibility: async (...args) => (await getMediaService()).updateVisibility(...args),
  remove: async (...args) => (await getMediaService()).remove(...args),
}
