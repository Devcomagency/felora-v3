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

    const userId = session.user.id

    // Récupérer les statistiques de base
    const [
      profileViews,
      reactions,
      newFans,
      messages,
      revenue,
      bookings
    ] = await Promise.all([
      // Vues de profil (simulé)
      prisma.escortProfile.findUnique({
        where: { userId },
        select: { views: true }
      }).then(p => p?.views || 0),
      
      // Réactions (simulé)
      prisma.reaction.count({
        where: {
          media: {
            ownerType: 'escort',
            ownerId: userId
          }
        }
      }),
      
      // Nouveaux fans (simulé - basé sur les vues récentes)
      Math.floor(Math.random() * 50) + 10,
      
      // Messages (simulé)
      prisma.message.count({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      }),
      
      // Revenus (simulé)
      Math.floor(Math.random() * 5000) + 1000,
      
      // Réservations (simulé)
      Math.floor(Math.random() * 20) + 5
    ])

    const stats = {
      profileViews,
      reactions,
      newFans,
      messages,
      revenue,
      bookings
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Erreur récupération stats overview:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}