import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Récupérer le profil escort par ID
    const escortProfile = await prisma.escortProfile.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            createdAt: true
          }
        }
      }
    })

    if (!escortProfile) {
      return NextResponse.json(
        { success: false, error: 'Profil escorte non trouvé' },
        { status: 404 }
      )
    }

    // Appliquer la même transformation que les autres APIs pour la cohérence
    const transformedProfile = transformPublicProfileData(escortProfile)

    return NextResponse.json(transformedProfile)

  } catch (error) {
    console.error('Erreur récupération profil par ID:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * Fonction de transformation pour modal public (même logique que l'API unifiée)
 */
function transformPublicProfileData(rawProfile: any) {
  // Parse et tri automatique des services pour séparer catégorie et services
  const { services, extractedCategory } = (() => {
    try {
      const raw = String(rawProfile.services || '')
      if (!raw) return { services: [], extractedCategory: null }

      let servicesArray: string[] = []
      if (raw.trim().startsWith('[')) {
        const S = JSON.parse(raw)
        servicesArray = Array.isArray(S) ? S : []
      } else {
        servicesArray = raw.split(',').map((x: string) => x.trim()).filter(Boolean)
      }

      // Appliquer le tri automatique pour séparer catégorie et services
      const categorized = categorizeServicesForPublic(servicesArray)

      return {
        services: categorized.cleanedServices,
        extractedCategory: categorized.category
      }
    } catch {
      return { services: [], extractedCategory: null }
    }
  })()

  // Retourner le profil avec les services nettoyés et la catégorie extraite
  return {
    ...rawProfile,
    services: JSON.stringify(services), // Reconvertir en JSON pour compatibilité
    category: extractedCategory || rawProfile.category || '' // Utiliser la catégorie extraite ou celle en BDD
  }
}

/**
 * Fonction de tri automatique des services pour séparer catégories et services
 */
function categorizeServicesForPublic(services: string[]): {
  category: string | null,
  cleanedServices: string[]
} {
  const result = { category: null as string | null, cleanedServices: [] as string[] }

  // Définition des catégories principales
  const mainCategories = [
    'escort', 'masseuse_erotique', 'dominatrice_bdsm', 'transsexuel',
    'masseuse', 'dominatrice', 'BDSM', 'massage'
  ]

  services.forEach(service => {
    // Nettoyer le service (enlever préfixes srv:, opt:)
    let cleanService = service.replace(/^(srv:|opt:)/, '').trim()

    // D'abord vérifier si c'est une catégorie principale
    if (mainCategories.includes(cleanService)) {
      // Si c'est une catégorie principale, l'assigner
      if (cleanService === 'masseuse' || cleanService === 'massage') {
        result.category = 'masseuse_erotique'
      } else if (cleanService === 'dominatrice' || cleanService === 'BDSM') {
        result.category = 'dominatrice_bdsm'
      } else {
        result.category = cleanService
      }
    } else {
      // Sinon, c'est un vrai service
      result.cleanedServices.push(cleanService)
    }
  })

  return result
}