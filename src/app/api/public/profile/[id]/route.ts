import { NextRequest, NextResponse } from 'next/server'

// Mock data pour tester
const mockProfile = {
  id: 'test',
  name: 'Sofia Deluxe',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
  bio: 'Escort premium à Genève. Disponible pour rendez-vous sur mesure.',
  age: 25,
  location: 'Genève',
  views: 1250,
  followers: 890,
  totalLikes: 2340,
  media: [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
      type: 'image' as const,
      position: 1 // Photo de profil - SEULEMENT dans avatar
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop',
      type: 'image' as const,
      position: 2 // Post 1 - SEULEMENT dans grille
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=400&h=400&fit=crop',
      type: 'image' as const,
      position: 3 // Post 2 - SEULEMENT dans grille
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1485875437342-9b39470b3d95?w=400&h=400&fit=crop',
      type: 'image' as const,
      position: 4 // Post 3 - SEULEMENT dans grille
    }
  ]
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Simule un délai d'API
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json(mockProfile)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Profil non trouvé' },
      { status: 404 }
    )
  }
}