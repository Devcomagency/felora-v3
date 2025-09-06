import { createClient } from 'next-sanity'
import type { MediaService, MediaItem, MediaVisibility, MediaType } from './MediaService'

let _client: ReturnType<typeof createClient> | null = null
function getClient() {
  if (_client) return _client
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'
  // Créer le client seulement à l'usage; l'upload nécessite un token, les reads peuvent utiliser CDN
  _client = createClient({
    projectId: projectId as any,
    dataset: 'production',
    apiVersion,
    useCdn: !process.env.SANITY_API_TOKEN,
    token: process.env.SANITY_API_TOKEN,
    ignoreBrowserTokenWarning: true,
  })
  return _client
}

export class MediaServiceSanity implements MediaService {
  async listPublic(cursor?: string, limit = 10): Promise<{ items: MediaItem[]; nextCursor?: string }> {
    const query = `*[_type == "post" && visibility in ["PUBLIC", "REQUESTABLE"]] | order(_createdAt desc) [${cursor || '0'}...${(cursor ? parseInt(cursor) : 0) + limit}] {
      _id,
      caption,
      visibility,
      price,
      video{
        asset->{
          _id,
          url
        }
      },
      userId,
      postedBy->{
        _id,
        userName,
        image,
        "handle": userName
      },
      _createdAt,
      position,
      "type": "VIDEO"
    }`

    const client = getClient()
    const items = await client.fetch(query)
    
    const mappedItems: MediaItem[] = items.map((item: any) => ({
      id: item._id,
      type: item.type as MediaType,
      url: item.video?.asset?.url || '',
      visibility: item.visibility as MediaVisibility,
      price: item.price,
      position: item.position,
      author: {
        id: item.postedBy._id,
        handle: item.postedBy.handle || item.postedBy.userName,
        name: item.postedBy.userName,
        avatar: item.postedBy.image
      },
      createdAt: item._createdAt
    }))

    const nextCursor = items.length === limit ? String((cursor ? parseInt(cursor) : 0) + limit) : undefined

    return { items: mappedItems, nextCursor }
  }

  async listByEscort(escortId: string, visibility?: MediaVisibility): Promise<MediaItem[]> {
    const visibilityFilter = visibility ? `&& visibility == "${visibility}"` : ''
    const query = `*[_type == "post" && userId == "${escortId}" ${visibilityFilter}] | order(position asc, _createdAt asc) {
      _id,
      caption,
      visibility,
      price,
      position,
      video{
        asset->{
          _id,
          url
        }
      },
      userId,
      postedBy->{
        _id,
        userName,
        image,
        "handle": userName
      },
      _createdAt,
      "type": "VIDEO"
    }`

    const client = getClient()
    const items = await client.fetch(query)
    
    return items.map((item: any) => ({
      id: item._id,
      type: item.type as MediaType,
      url: item.video?.asset?.url || '',
      visibility: item.visibility as MediaVisibility,
      price: item.price,
      position: item.position,
      author: {
        id: item.postedBy._id,
        handle: item.postedBy.handle || item.postedBy.userName,
        name: item.postedBy.userName,
        avatar: item.postedBy.image
      },
      createdAt: item._createdAt
    }))
  }

  async create(input: { 
    escortId: string
    type: MediaType
    file: File
    visibility: MediaVisibility
    price?: number
    position?: number 
  }): Promise<{ id: string }> {
    // Upload asset
    const client = getClient()
    const asset = await client.assets.upload('file', input.file, {
      filename: input.file.name,
    })

    // Create post document
    const doc: any = {
      _type: 'post',
      userId: input.escortId,
      caption: '',
      visibility: input.visibility,
      price: input.price,
      position: input.position,
      video: {
        _type: 'file',
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
      },
      postedBy: {
        _type: 'reference',
        _ref: input.escortId,
      },
      likes: [],
      comments: [],
      _createdAt: new Date().toISOString(),
    }

    const result = await client.create(doc)
    return { id: result._id }
  }

  async updateVisibility(id: string, visibility: MediaVisibility, price?: number): Promise<void> {
    const patch: any = { visibility }
    if (price !== undefined) {
      patch.price = price
    }

    const client = getClient()
    await client.patch(id).set(patch).commit()
  }

  async remove(id: string): Promise<void> {
    const client = getClient()
    await client.delete(id)
  }
}
