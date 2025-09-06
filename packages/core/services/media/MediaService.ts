export type MediaVisibility = 'PUBLIC' | 'PRIVATE' | 'REQUESTABLE'
export type MediaType = 'IMAGE' | 'VIDEO'

export interface MediaItem {
  id: string
  type: MediaType
  url: string
  thumb?: string
  visibility: MediaVisibility
  price?: number
  position?: number
  author: { 
    id: string
    handle: string
    name?: string
    avatar?: string 
  }
  createdAt: string
}

export interface MediaService {
  listPublic(cursor?: string, limit?: number): Promise<{ items: MediaItem[]; nextCursor?: string }>
  listByEscort(escortId: string, visibility?: MediaVisibility): Promise<MediaItem[]>
  create(input: { 
    escortId: string
    type: MediaType
    file: File
    visibility: MediaVisibility
    price?: number
    position?: number 
  }): Promise<{ id: string }>
  updateVisibility(id: string, visibility: MediaVisibility, price?: number): Promise<void>
  remove(id: string): Promise<void>
}
