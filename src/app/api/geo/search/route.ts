import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const bboxParam = url.searchParams.get('bbox')
    const servicesParam = url.searchParams.get('services')
    const languagesParam = url.searchParams.get('languages')
    
    // Bbox format: "minLng,minLat,maxLng,maxLat"
    if (!bboxParam) {
      return NextResponse.json({ escorts: [], clubs: [] }, { status: 200 })
    }

    const bbox = bboxParam.split(',').map(Number)
    if (bbox.length !== 4) {
      return NextResponse.json({ escorts: [], clubs: [] }, { status: 200 })
    }

    const [minLng, minLat, maxLng, maxLat] = bbox

    // Construire les filtres
    const whereConditions: any = {
      latitude: { not: null, gte: minLat, lte: maxLat },
      longitude: { not: null, gte: minLng, lte: maxLng },
      // Afficher vite: ACTIVE ou PENDING (si coordonnées présentes)
      status: { in: ['ACTIVE', 'PENDING'] }
    }

    // Filtrage par services (si spécifié)
    if (servicesParam) {
      const services = servicesParam.split(',').map(s => s.trim()).filter(Boolean)
      if (services.length > 0) {
        // Match simple sur le champ string 'services'
        whereConditions.OR = [
          ...(whereConditions.OR || []),
          ...services.map(service => ({
            services: { contains: service, mode: 'insensitive' as const },
          })),
        ]
      }
    }

    // Filtrage par langues (si spécifié)
    if (languagesParam) {
      const languages = languagesParam.split(',').map(l => l.trim()).filter(Boolean)
      if (languages.length > 0) {
        // Match simple sur la string 'languages'
        whereConditions.OR = [
          ...(whereConditions.OR || []),
          ...languages.map(lang => ({
            languages: { contains: lang, mode: 'insensitive' as const },
          })),
        ]
      }
    }

    // Récupérer les escorts avec tous les filtres
    const escortsRaw = await prisma.escortProfile.findMany({
      where: whereConditions,
      select: {
        id: true,
        stageName: true,
        latitude: true,
        longitude: true,
        city: true,
        services: true,
        languages: true,
        status: true,
        profilePhoto: true
      },
      take: 100 // Augmenté la limite
    })

    // Map DB rows to MapTest expectations: { id, name, lat, lng, avatar, city, services, languages, verified, isActive }
    const escorts = escortsRaw
      .filter(e => typeof e.latitude === 'number' && typeof e.longitude === 'number')
      .map(e => ({
        id: e.id,
        name: e.stageName || 'Escort',
        lat: e.latitude as number,
        lng: e.longitude as number,
        avatar: e.profilePhoto || '/default-avatar.svg',
        city: e.city || '',
        services: safeParseArray(e.services),
        languages: safeParseArray(e.languages),
        verified: false,
        isActive: e.status === 'ACTIVE'
      }))

    console.log(`🔍 Geo search: ${escorts.length} escorts trouvés avec filtres:`, {
      bbox: bboxParam,
      services: servicesParam,
      languages: languagesParam
    })

    return NextResponse.json({ escorts, clubs: [] }, { status: 200 })
  } catch (error) {
    console.error('Geo search error:', error)
    return NextResponse.json({ escorts: [], clubs: [] }, { status: 200 })
  }
}

function safeParseArray(input: any): string[] {
  try {
    if (!input) return []
    if (Array.isArray(input)) return input
    const parsed = JSON.parse(String(input))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
