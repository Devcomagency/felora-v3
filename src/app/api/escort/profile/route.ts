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
    // IMPORTANT: On exclut rate15Min et rate30Min car ils n'existent pas en production
    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        // Tous les champs SAUF rate15Min et rate30Min
        id: true,
        userId: true,
        firstName: true,
        stageName: true,
        dateOfBirth: true,
        nationality: true,
        languages: true,
        city: true,
        workingArea: true,
        description: true,
        canton: true,
        codePostal: true,
        ville: true,
        rue: true,
        numero: true,
        addressVisible: true,
        latitude: true,
        longitude: true,
        services: true,
        rates: true,
        availability: true,
        profilePhoto: true,
        galleryPhotos: true,
        videos: true,
        status: true,
        verificationData: true,
        isVerifiedBadge: true,
        profileCompleted: true,
        photosCount: true,
        videosCount: true,
        hasProfilePhoto: true,
        views: true,
        likes: true,
        rating: true,
        reviewCount: true,
        telegramChatId: true,
        telegramUsername: true,
        telegramConnected: true,
        telegramEnabled: true,
        messagingPreference: true,
        height: true,
        bodyType: true,
        hairColor: true,
        eyeColor: true,
        ethnicity: true,
        bustSize: true,
        tattoos: true,
        piercings: true,
        // rate15Min: true,  // TEMPORAIREMENT EXCLU
        // rate30Min: true,  // TEMPORAIREMENT EXCLU
        rate1H: true,
        rate2H: true,
        rateHalfDay: true,
        rateFullDay: true,
        rateOvernight: true,
        currency: true,
        paymentMethods: true,
        minimumDuration: true,
        practices: true,
        orientation: true,
        acceptedClients: true,
        outcall: true,
        incall: true,
        timeSlots: true,
        availableNow: true,
        weekendAvailable: true,
        hasPrivatePhotos: true,
        hasPrivateVideos: true,
        hasWebcamLive: true,
        acceptsGifts: true,
        isActive: true,
        totalLikes: true,
        totalReacts: true,
        createdAt: true,
        updatedAt: true,
        acceptsCouples: true,
        acceptsHandicapped: true,
        acceptsSeniors: true,
        acceptsWomen: true,
        breastType: true,
        pubicHair: true,
        smoker: true,
        phoneVisibility: true,
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
    console.log('- galleryPhotos length:', escortProfile.galleryPhotos?.length || 0)
    console.log('- videos length:', escortProfile.videos?.length || 0)
    console.log('- galleryPhotos preview:', escortProfile.galleryPhotos?.substring(0, 100) + '...')

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