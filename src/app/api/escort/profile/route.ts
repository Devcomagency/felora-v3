import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * @deprecated Cette API est remplacée par /api/profile/unified/me
 * Utilisez l'API unifiée pour une meilleure cohérence
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer le profil escort complet avec les données utilisateur
    // UTILISATION D'UN SELECT MINIMAL POUR ÉVITER LES ERREURS DE COLONNES MANQUANTES
    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        // CHAMPS ESSENTIELS SEULEMENT (pour éviter les erreurs de colonnes)
        id: true,
        userId: true,
        stageName: true,
        description: true,
        city: true,
        canton: true,
        languages: true,
        services: true,
        galleryPhotos: true,
        videos: true,
        profilePhoto: true,
        timeSlots: true,
        status: true,
        rate1H: true,
        rate2H: true,
        rateOvernight: true,
        height: true,
        bodyType: true,
        hairColor: true,
        eyeColor: true,
        ethnicity: true,
        bustSize: true,
        tattoos: true,
        piercings: true,
        outcall: true,
        incall: true,
        acceptsCouples: true,
        acceptsHandicapped: true,
        acceptsSeniors: true,
        acceptsWomen: true,
        breastType: true,
        pubicHair: true,
        smoker: true,
        paymentMethods: true,
        venueOptions: true,
        acceptedCurrencies: true,
        phoneDisplayType: true,
        originDetails: true,
        ageVerified: true,
        phoneVisibility: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            email: true,
            phone: true,
            name: true
          }
        }
      }
    })

    if (!escortProfile) {
      // Créer un profil vide s'il n'existe pas (auto-création pour cohérence V2)
      try {
        const newProfile = await prisma.escortProfile.create({
          data: {
            userId: session.user.id,
            firstName: session.user.name || '',
            stageName: '',
            dateOfBirth: new Date('2000-01-01'), // Date par défaut
            nationality: '',
            languages: '',
            city: '',
            workingArea: '',
            description: '',
            services: '',
            rates: '',
            availability: '',
            galleryPhotos: '',
            videos: '',
            status: 'PENDING'
          },
          include: {
            user: {
              select: {
                email: true,
                phone: true,
                name: true
              }
            }
          }
        })
        
        console.log('✅ Nouveau profil créé pour l\'utilisateur:', session.user.id)
        
        return NextResponse.json({
          success: true,
          profile: newProfile
        })
        
      } catch (createError) {
        console.error('Erreur création profil:', createError)
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la création du profil' },
          { status: 500 }
        )
      }
    }

    // Appliquer la même transformation que l'API unifiée pour la cohérence
    const transformedProfile = transformDashboardProfileData(escortProfile)

    console.log('📡 API GET PROFILE - Données envoyées:')
    console.log('- ID utilisateur:', session.user.id)
    console.log('- galleryPhotos type:', typeof escortProfile.galleryPhotos)
    console.log('- galleryPhotos length:', escortProfile.galleryPhotos?.length || 0)
    console.log('- galleryPhotos content:', escortProfile.galleryPhotos)
    console.log('- videos length:', escortProfile.videos?.length || 0)
    console.log('- profilePhoto:', escortProfile.profilePhoto)

    return NextResponse.json({
      success: true,
      profile: transformedProfile
    })

  } catch (error) {
    console.error('Erreur récupération profil:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * Fonction de transformation pour séparer catégories et services (même logique que l'API unifiée)
 */
function transformDashboardProfileData(rawProfile: any) {
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
      const categorized = categorizeServicesForDashboard(servicesArray)

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
    services: JSON.stringify(services), // Reconvertir en JSON pour le dashboard
    category: extractedCategory || rawProfile.category || '' // Utiliser la catégorie extraite ou celle en BDD
  }
}

/**
 * Fonction de tri automatique des services pour séparer catégories et services (copie de l'API unifiée)
 */
function categorizeServicesForDashboard(services: string[]): {
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
      } else if (cleanService === 'masseuse_erotique') {
        result.category = 'masseuse_erotique'
      } else if (cleanService === 'dominatrice_bdsm') {
        result.category = 'dominatrice_bdsm'
      } else if (cleanService === 'transsexuel') {
        result.category = 'transsexuel'
      } else if (cleanService === 'escort') {
        result.category = 'escort'
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