import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
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

    // Récupérer le profil club V2 avec ses détails
    const club = await prisma.clubProfileV2.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            email: true,
            phoneE164: true,
            name: true
          }
        }
      }
    })

    if (!club) {
      return NextResponse.json(
        { success: false, error: 'Profil club non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer les détails du club séparément
    const details = await prisma.clubDetails.findUnique({
      where: { clubId: club.id }
    })

    // Récupérer les services du club séparément
    const services = await prisma.clubServices.findUnique({
      where: { clubId: club.id }
    })

    // Construire une réponse combinée avec les données du profil et des détails
    const response = {
      id: club.id,
      handle: club.handle,
      companyName: club.companyName,
      managerName: club.managerName,
      verified: club.verified,
      kycStatus: club.kycStatus,

      // Données depuis ClubDetails
      name: details?.name || club.companyName,
      description: details?.description || '',
      address: details?.address || '',
      city: details?.city || '',
      postalCode: details?.postalCode || '',
      country: details?.country || 'CH',
      openingHours: details?.openingHours || '',
      websiteUrl: details?.websiteUrl || '',
      email: details?.email || club.user?.email || '',
      phone: details?.phone || club.user?.phoneE164 || '',
      avatarUrl: details?.avatarUrl || '',
      coverUrl: details?.coverUrl || '',
      isActive: details?.isActive || false,
      capacity: details?.capacity || null,
      latitude: details?.latitude || null,
      longitude: details?.longitude || null,
      establishmentType: details?.establishmentType || 'club',

      // Données utilisateur
      user: club.user,

      // Données des services
      services: {
        languages: services?.languages || [],
        paymentMethods: services?.paymentMethods || [],
        services: services?.services || [],
        equipments: services?.equipments || [],
        isOpen24_7: services?.isOpen24_7 || false,
        openingHours: services?.openingHours || ''
      },

      createdAt: club.createdAt,
      updatedAt: club.updatedAt
    }

    return NextResponse.json({
      success: true,
      club: response
    })

  } catch (error) {
    console.error('Erreur récupération profil club:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}