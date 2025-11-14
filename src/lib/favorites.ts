export const FAVORITES_STORAGE_KEY = 'felora-favorites'
export const FAVORITES_EVENT = 'felora-favorites-updated'

const isBrowser = typeof window !== 'undefined'

export function readFavoriteIds(): string[] {
  if (!isBrowser) return []
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeFavoriteIds(ids: string[]) {
  if (!isBrowser) return
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids))
  window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: ids }))
}

export function addFavoriteId(id: string): string[] {
  const favorites = readFavoriteIds()
  if (favorites.includes(id)) {
    return favorites
  }
  const updated = [...favorites, id]
  writeFavoriteIds(updated)
  return updated
}

export function removeFavoriteId(id: string): string[] {
  const favorites = readFavoriteIds()
  const updated = favorites.filter(fav => fav !== id)
  writeFavoriteIds(updated)
  return updated
}

