import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
        languageLevels: true,
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

    console.log('📡 API GET PROFILE - Données envoyées:')
    console.log('- ID utilisateur:', session.user.id)
    console.log('- galleryPhotos type:', typeof escortProfile.galleryPhotos)
    console.log('- galleryPhotos length:', escortProfile.galleryPhotos?.length || 0)
    console.log('- galleryPhotos content:', escortProfile.galleryPhotos)
    console.log('- videos length:', escortProfile.videos?.length || 0)
    console.log('- profilePhoto:', escortProfile.profilePhoto)

    return NextResponse.json({
      success: true,
      profile: escortProfile
    })

  } catch (error) {
    console.error('Erreur récupération profil:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}