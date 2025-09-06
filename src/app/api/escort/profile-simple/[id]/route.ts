import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Simple query without any potential problematic fields
    const escortProfile = await prisma.escortProfile.findUnique({
      where: { id: id },
      select: {
        id: true,
        firstName: true,
        stageName: true,
        dateOfBirth: true,
        nationality: true,
        languages: true,
        city: true,
        workingArea: true,
        description: true,
        latitude: true,
        longitude: true,
        services: true,
        rates: true,
        availability: true,
        profilePhoto: true,
        galleryPhotos: true,
        videos: true,
        status: true,
        isVerifiedBadge: true,
        profileCompleted: true,
        photosCount: true,
        videosCount: true,
        hasProfilePhoto: true,
        views: true,
        likes: true,
        rating: true,
        reviewCount: true,
        height: true,
        bodyType: true,
        hairColor: true,
        eyeColor: true,
        ethnicity: true,
        bustSize: true,
        tattoos: true,
        piercings: true,
        rate1H: true,
        rate2H: true,
        rateHalfDay: true,
        rateFullDay: true,
        rateOvernight: true,
        currency: true,
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
        totalLikes: true,
        totalReacts: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!escortProfile) {
      return NextResponse.json(
        { success: false, error: 'Profil escorte non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(escortProfile)

  } catch (error) {
    console.error('Erreur récupération profil par ID:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}