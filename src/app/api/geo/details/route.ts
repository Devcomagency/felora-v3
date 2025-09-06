import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    // Récupérer les vraies données depuis la base
    const escortProfile = await prisma.escortProfile.findUnique({
      where: { id },
      include: {
        user: true // Inclure les données utilisateur
      }
    })

    if (escortProfile) {
      // Formater les données pour l'interface
      const details = {
        id: escortProfile.id,
        displayName: escortProfile.stageName || escortProfile.firstName || 'Escort',
        handle: `@${escortProfile.stageName?.toLowerCase().replace(/\s+/g, '_') || escortProfile.firstName?.toLowerCase() || 'escort'}`,
        avatar: `https://picsum.photos/seed/${escortProfile.id}/200/200`,
        city: escortProfile.city || '—',
        description: escortProfile.description || 'Profil d\'escort professionnel',
        verified: true, // Pour l'instant tous vérifiés
        age: null, // Age pas encore dans le schéma
        media: [
          // Utiliser des photos demo avec seed pour cohérence
          { type: 'image', url: `https://picsum.photos/seed/${escortProfile.id}1/400/600` },
          { type: 'image', url: `https://picsum.photos/seed/${escortProfile.id}2/400/600` },
          { type: 'image', url: `https://picsum.photos/seed/${escortProfile.id}3/400/600` }
        ],
        services: escortProfile.services ? escortProfile.services.split(',').map((s: string) => s.trim()) : [],
        languages: escortProfile.languages ? escortProfile.languages.split(',').map((l: string) => l.trim()) : ['Français'],
        practices: [
          // Services de base basés sur les informations disponibles
          'Escort',
          ...(escortProfile.services ? escortProfile.services.split(',').map((s: string) => s.trim()) : []),
          'Compagnie',
          'Soirée'
        ].slice(0, 5), // Limiter à 5 pratiques
        rating: 4.5 + (Math.random() * 0.5), // Note aléatoire entre 4.5 et 5
        reviews: Math.floor(Math.random() * 200) + 50, // Entre 50 et 250 avis
        priceRange: undefined // Pas encore dans le schéma
      }

      return NextResponse.json(details)
    }

    // Fallback avec les données de démo si pas trouvé en base
    const demoData: Record<string, any> = {
      'luna-geneve-id': {
        id: 'luna-geneve-id',
        displayName: 'Luna Genève',
        handle: '@luna_genève',
        avatar: 'https://picsum.photos/seed/luna/200/200',
        city: 'Genève',
        description: 'Escort de charme à Genève',
        verified: true,
        age: 25,
        media: [
          { type: 'image', url: 'https://picsum.photos/seed/luna1/800/600' },
          { type: 'image', url: 'https://picsum.photos/seed/luna2/800/600' },
          { type: 'image', url: 'https://picsum.photos/seed/luna3/800/600' }
        ],
        services: ['Escort', 'Compagnie'],
        languages: ['Français', 'Anglais'],
        practices: ['Escort', 'Compagnie', 'Soirée'],
        rating: 4.9,
        reviews: 127
      },
      'maya-lausanne-id': {
        id: 'maya-lausanne-id',
        displayName: 'Maya Lausanne',
        handle: '@maya_lausanne',
        avatar: 'https://picsum.photos/seed/maya/200/200',
        city: 'Lausanne',
        description: 'Escort raffinée à Lausanne',
        verified: false,
        age: 23,
        media: [
          { type: 'image', url: 'https://picsum.photos/seed/maya1/800/600' },
          { type: 'image', url: 'https://picsum.photos/seed/maya2/800/600' }
        ],
        services: ['Escort', 'Compagnie'],
        languages: ['Français', 'Anglais'],
        practices: ['Escort', 'Massage'],
        rating: 4.7,
        reviews: 89
      },
      'sophie-bern-id': {
        id: 'sophie-bern-id',
        displayName: 'Sophie Bern',
        handle: '@sophie_bern',
        avatar: 'https://picsum.photos/seed/sophie/200/200',
        city: 'Bern',
        description: 'Escort élégante à Bern',
        verified: true,
        age: 27,
        media: [
          { type: 'image', url: 'https://picsum.photos/seed/sophie1/800/600' },
          { type: 'image', url: 'https://picsum.photos/seed/sophie2/800/600' },
          { type: 'image', url: 'https://picsum.photos/seed/sophie3/800/600' },
          { type: 'image', url: 'https://picsum.photos/seed/sophie4/800/600' }
        ],
        services: ['Escort', 'Compagnie'],
        languages: ['Français', 'Allemand', 'Anglais'],
        practices: ['Escort', 'Compagnie', 'Dîner'],
        rating: 4.8,
        reviews: 156
      }
    }

    const details = demoData[id] || {
      id: 'demo-fallback',
      displayName: 'Profil DEMO',
      handle: '@demo',
      avatar: 'https://picsum.photos/seed/fallback/200/200',
      city: '—',
      verified: false,
      media: [{ type: 'image', url: 'https://picsum.photos/seed/fallback1/800/600' }],
      services: [],
      languages: [],
      practices: [],
    }

    return NextResponse.json(details)
  } catch (error: any) {
    console.error('Geo details error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}