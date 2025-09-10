import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profileId = params.id
    
    if (!profileId) {
      return NextResponse.json(
        { success: false, error: 'ID de profil requis' },
        { status: 400 }
      )
    }

    console.log('🔍 API Profiles - Recherche du profil:', profileId)

    // Récupérer le profil escort avec les informations de base de l'utilisateur
    const escortProfile = await prisma.escortProfile.findFirst({
      where: { 
        id: profileId,
        status: 'ACTIVE' // Seulement les profils actifs
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: false // Ne pas exposer l'email
          }
        }
      }
    })

    if (!escortProfile) {
      console.log('❌ API Profiles - Profil non trouvé ou inactif:', profileId)
      return NextResponse.json(
        { success: false, error: 'Profil non trouvé' },
        { status: 404 }
      )
    }

    console.log('✅ API Profiles - Profil trouvé:', escortProfile.stageName)

    // Calculer l'âge depuis dateOfBirth
    const age = escortProfile.dateOfBirth ? 
      new Date().getFullYear() - new Date(escortProfile.dateOfBirth).getFullYear() : null

    // Parser les données CSV
    const parseCSV = (csv: string) => csv ? csv.split(',').map(s => s.trim()).filter(Boolean) : []

    // Formatter les données pour l'affichage public
    const publicProfile = {
      id: escortProfile.id,
      stageName: escortProfile.stageName,
      age: age,
      description: escortProfile.description,
      city: escortProfile.city,
      canton: escortProfile.canton,
      height: escortProfile.height,
      languages: parseCSV(escortProfile.languages || ''),
      services: parseCSV(escortProfile.services || ''),
      rate1H: parseInt(escortProfile.rates) || 0, // À améliorer selon le format des rates
      profilePhoto: escortProfile.profilePhoto,
      galleryPhotos: escortProfile.galleryPhotos || '',
      isActive: escortProfile.status === 'ACTIVE',
      status: escortProfile.status
    }

    return NextResponse.json({
      success: true,
      profile: publicProfile
    })

  } catch (error) {
    console.error('💥 API Profiles - Erreur:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}