import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EscortStatus } from '@prisma/client'

// Fonction pour générer des profils de démonstration
function generateDemoProfiles(count: number) {
  const feedPhotos = [
    "https://picsum.photos/600/900?random=1",
    "https://picsum.photos/600/900?random=2", 
    "https://picsum.photos/600/900?random=3",
    "https://picsum.photos/600/900?random=4",
    "https://picsum.photos/600/900?random=5",
    "https://picsum.photos/600/900?random=6",
    "https://picsum.photos/600/900?random=7",
    "https://picsum.photos/600/900?random=8",
    "https://picsum.photos/600/900?random=9",
    "https://picsum.photos/600/900?random=10"
  ]
  
  const profilePhotos = [
    "https://picsum.photos/300/300?random=11",
    "https://picsum.photos/300/300?random=12", 
    "https://picsum.photos/300/300?random=13",
    "https://picsum.photos/300/300?random=14",
    "https://picsum.photos/300/300?random=15",
    "https://picsum.photos/300/300?random=16",
    "https://picsum.photos/300/300?random=17",
    "https://picsum.photos/300/300?random=18",
    "https://picsum.photos/300/300?random=19",
    "https://picsum.photos/300/300?random=20"
  ]

  const names = ["Sofia", "Isabella", "Emma", "Camila", "Victoria", "Natasha", "Valentina", "Aria", "Luna", "Zoe"]
  const cities = ["Genève", "Lausanne", "Zurich", "Berne", "Bâle", "Lucerne", "Montreux", "Neuchâtel"]
  const descriptions = [
    "✨ Élégance et raffinement suisse 💎 Moments inoubliables garantis",
    "🌟 Compagnie de luxe • Discrétion absolue • Expérience premium",
    "💫 Sophistication naturelle • Disponible pour gentlemen exigeants",
    "🌸 Beauté authentique • Service d'exception • Rencontres de qualité",
    "✨ Charme irrésistible • Moments magiques • Standards les plus élevés"
  ]

  return Array.from({ length: count }, (_, index) => {
    const photoIndex = index % feedPhotos.length
    const nameIndex = index % names.length
    const cityIndex = index % cities.length
    const descIndex = index % descriptions.length
    
    // Ajouter quelques profils en pause pour tester (indices 2 et 6)
    const isPaused = index === 2 || index === 6
    
    return {
      id: `demo-${Date.now()}-${index}`,
      name: names[nameIndex],
      username: `@${names[nameIndex].toLowerCase()}`,
      age: 22 + Math.floor(Math.random() * 8), // 22-30 ans
      location: cities[cityIndex],
      media: feedPhotos[photoIndex],
      profileImage: profilePhotos[photoIndex],
      image: profilePhotos[photoIndex],
      mediaType: "image",
      verified: true,
      premium: true,
      online: Math.random() > 0.4,
      description: descriptions[descIndex],
      likes: 150 + Math.floor(Math.random() * 500),
      followers: 50 + Math.floor(Math.random() * 200),
      following: Math.floor(Math.random() * 100),
      isLiked: false,
      isFollowing: false,
      rating: 4.2 + Math.random() * 0.8,
      reviews: 10 + Math.floor(Math.random() * 50),
      price: 400 + Math.floor(Math.random() * 300),
      height: 160 + Math.floor(Math.random() * 20),
      bodyType: ["Mince", "Athlétique", "Courbes"][Math.floor(Math.random() * 3)],
      breastSize: ["B", "C", "D"][Math.floor(Math.random() * 3)],
      hairColor: ["Blonde", "Brune", "Châtain"][Math.floor(Math.random() * 3)],
      eyeColor: ["Bleus", "Verts", "Marrons"][Math.floor(Math.random() * 3)],
      outcall: true,
      incall: true,
      acceptCards: true,
      languages: ["Français", "Anglais"],
      practices: ["Massage", "Companionship", "Dinner Date"],
      services: ["Massage", "Companionship", "Dinner Date"],
      gallery: [
        feedPhotos[photoIndex],
        feedPhotos[(photoIndex + 1) % feedPhotos.length],
        feedPhotos[(photoIndex + 2) % feedPhotos.length]
      ],
      status: isPaused ? ('PAUSED' as EscortStatus) : ('ACTIVE' as EscortStatus), // Statut pour tester les profils en pause
      views: 100 + Math.floor(Math.random() * 500),
      userId: `demo-user-${index}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '20')))
    const city = (searchParams.get('city') || '').trim()
    const q = (searchParams.get('search') || '').trim()

    // 1) Fetch real escorts from DB
    const where: any = {}
    // Show quickly: allow PENDING with minimal presence (hasProfilePhoto) or ACTIVE
    where.OR = [
      { status: 'ACTIVE' },
      { AND: [ { status: 'PENDING' }, { hasProfilePhoto: true } ] }
    ]
    if (city) where.city = { contains: city, mode: 'insensitive' as const }
    if (q) {
      where.OR = [
        ...(where.OR || []),
        { stageName: { contains: q, mode: 'insensitive' as const } },
        { description: { contains: q, mode: 'insensitive' as const } }
      ]
    }

    const dbEscorts = await prisma.escortProfile.findMany({
      where,
      select: {
        id: true,
        stageName: true,
        city: true,
        description: true,
        profilePhoto: true,
        galleryPhotos: true,
        status: true,
        languages: true,
        services: true,
        rate1H: true,
        dateOfBirth: true,
        isVerifiedBadge: true,
        createdAt: true,
        updatedAt: true,
      },
      take: limit,
      orderBy: { updatedAt: 'desc' }
    })

    const year = new Date().getFullYear()
    const transformedDb = dbEscorts.map((e, i) => {
      // best-effort fallback images
      const gallery = (() => { try { return JSON.parse(e.galleryPhotos || '[]') } catch { return [] } })()
      const firstImg = e.profilePhoto || gallery.find((m: any) => m?.type !== 'video')?.url || 'https://picsum.photos/600/900?random=' + (i+1)
      const age = (() => { try { return e.dateOfBirth ? (year - new Date(e.dateOfBirth).getFullYear()) : undefined } catch { return undefined } })()
      return {
        id: e.id,
        name: e.stageName || 'Escort',
        username: '@' + (e.stageName || 'escort').toLowerCase().replace(/\s+/g,'_'),
        age,
        location: e.city || '—',
        media: firstImg,
        profileImage: firstImg,
        image: firstImg,
        mediaType: 'image',
        verified: !!e.isVerifiedBadge,
        premium: true,
        online: e.status === 'ACTIVE',
        description: e.description || '',
        likes: 0,
        followers: 0,
        following: 0,
        isLiked: false,
        isFollowing: false,
        rating: 0,
        reviews: 0,
        price: e.rate1H || undefined,
        height: undefined,
        bodyType: undefined,
        breastSize: undefined,
        hairColor: undefined,
        eyeColor: undefined,
        outcall: false,
        incall: false,
        acceptCards: false,
        languages: (()=>{ try { const L = JSON.parse(String(e.languages||'[]')); return Array.isArray(L)?L:[] } catch { return [] } })(),
        practices: [],
        services: (()=>{ try { const S = JSON.parse(String(e.services||'[]')); return Array.isArray(S)?S:[] } catch { return [] } })(),
        gallery: gallery.map((m:any)=>m.url).slice(0,3),
        status: e.status as EscortStatus,
        views: 0,
        userId: undefined,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      }
    })

    // 2) Fallback demo if few results
    const demoNeeded = transformedDb.length < limit
    const demoProfiles = demoNeeded ? generateDemoProfiles(limit - transformedDb.length) : []
    const escorts = [...transformedDb, ...demoProfiles]

    return NextResponse.json({ success: true, escorts, total: escorts.length, hasMore: escorts.length >= limit })
  } catch (error) {
    console.error('Erreur récupération escorts:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
