import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    console.log('🔍 API: Recherche profil avec ID:', id)

    // Récupérer le profil escort depuis la base
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
      console.log('❌ API: Profil non trouvé pour ID:', id)
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    console.log('✅ API: Profil trouvé:', escortProfile.stageName || escortProfile.firstName)

    // Transformer les données pour le format TikTok
    const profileData = {
      id: escortProfile.id,
      name: escortProfile.stageName || escortProfile.firstName || 'Escort',
      avatar: escortProfile.profilePhoto,
      bio: escortProfile.description,
      age: escortProfile.dateOfBirth ?
        new Date().getFullYear() - new Date(escortProfile.dateOfBirth).getFullYear() : undefined,
      location: escortProfile.city,
      views: escortProfile.views || 0,
      followers: 289, // Mock pour l'instant
      totalLikes: 0, // Mock pour l'instant
      media: (() => {
        // Parse gallery photos
        const galleryPhotos = escortProfile.galleryPhotos ?
          (() => { try { return JSON.parse(escortProfile.galleryPhotos) } catch { return [] } })() : []

        const media = []

        // Photo de profil (position 1)
        if (escortProfile.profilePhoto) {
          media.push({
            id: 'profile',
            url: escortProfile.profilePhoto,
            type: 'image' as const,
            position: 1
          })
        }

        // Médias de la galerie (positions 2+)
        galleryPhotos.forEach((photo: any, index: number) => {
          if (photo.url) {
            media.push({
              id: `gallery_${index}`,
              url: photo.url,
              type: (photo.type || 'image') as 'image' | 'video',
              position: index + 2
            })
          }
        })

        return media
      })()
    }

    return NextResponse.json(profileData)

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}