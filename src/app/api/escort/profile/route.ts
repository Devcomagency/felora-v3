import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id },
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

    if (!escortProfile) {
      // Créer un profil vide s'il n'existe pas
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