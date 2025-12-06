import ClientFeedPage from './client-page'
import { prisma } from '@/lib/prisma'

// Types locaux pour le feed
interface MediaAuthor {
  id: string
  handle: string
  name: string
  avatar: string
}

interface MediaItem {
  id: string
  type: 'IMAGE' | 'VIDEO'
  url: string
  thumb: string
  visibility: string
  author: MediaAuthor
  likeCount: number
  reactCount: number
  createdAt: string
}

export default async function HomePage() {
  let items: MediaItem[] = []
  
  try {
    // Récupérer tous les profils escorts avec leurs médias
    const escortProfiles = await prisma.escortProfile.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    console.log('🔍 Profils trouvés pour le feed:', escortProfiles.length)

    // Transformer les médias en items de feed
    for (const profile of escortProfiles) {
      if (profile.galleryPhotos) {
        try {
          const galleryParsed = JSON.parse(profile.galleryPhotos)
          console.log(`📸 Médias trouvés pour ${profile.stageName}:`, galleryParsed.length)
          
          // Créer un item uniquement pour les médias autorisés dans le feed:
          // - médias OBLIGATOIRES (slots 0..5) toujours
          // - médias PUBLICS (isPrivate !== true)
          for (const media of galleryParsed) {
            const url: string = String(media?.url || '')
            if (!url) continue
            const slot = Number(media?.slot)
            const isMandatory = Number.isFinite(slot) && slot >= 0 && slot <= 5
            const isPublic = media?.isPrivate !== true
            if (!isMandatory && !isPublic) continue

            items.push({
              id: `${profile.id}-${url.split('/').pop()}`,
              type: media?.type === 'video' ? 'VIDEO' : 'IMAGE',
              url,
              thumb: url,
              visibility: isMandatory ? 'MANDATORY' : 'PUBLIC',
              author: {
                id: profile.id,
                handle: `@${profile.stageName?.toLowerCase().replace(/\s+/g, '_') || 'escort'}`,
                name: profile.stageName || profile.firstName || 'Escort',
                avatar: profile.profilePhoto || '/placeholder-avatar.jpg'
              },
              likeCount: Math.floor(Math.random() * 2000) + 100,
              reactCount: Math.floor(Math.random() * 300) + 50,
              createdAt: profile.createdAt?.toISOString() || new Date().toISOString()
            })
          }
        } catch (parseError) {
          console.error('❌ Erreur parsing galleryPhotos pour', profile.stageName, parseError)
        }
      }
    }

    console.log('✅ Items de feed créés:', items.length)

  } catch (error) {
    console.error('❌ Erreur récupération feed:', error)
    
    // Fallback avec quelques données mock si erreur
    items = [
      {
        id: 'fallback-1',
        type: 'IMAGE',
        url: 'https://picsum.photos/400/600?random=1',
        thumb: 'https://picsum.photos/400/600?random=1',
        visibility: 'PUBLIC',
        author: {
          id: 'fallback-user',
          handle: '@felora_demo',
          name: 'Demo Account',
          avatar: 'https://picsum.photos/100/100?random=10'
        },
        likeCount: 123,
        reactCount: 45,
        createdAt: new Date().toISOString()
      }
    ]
  }

  // Mélanger les items pour un feed plus dynamique
  const shuffledItems = items.sort(() => Math.random() - 0.5)
  const nextCursor = 'db-cursor-1'

  return <ClientFeedPage initialItems={shuffledItems} initialCursor={nextCursor} />
}
