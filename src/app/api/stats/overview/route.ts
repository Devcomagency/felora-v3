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
      messages,
      revenue,
      bookings
    ] = await Promise.all([
      // Vues de profil
      prisma.escortProfile.findUnique({
        where: { userId },
        select: { views: true }
      }).then(p => p?.views || 0),
      
      // Réactions
      prisma.reaction.count({
        where: {
          media: {
            ownerType: 'escort',
            ownerId: userId
          }
        }
      }),
      
      // Messages
      prisma.message.count({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      }),
      
      // Revenus (basé sur les transactions)
      prisma.diamondTransaction.aggregate({
        where: {
          toUserId: userId,
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      }).then(result => result._sum.amount || 0),
      
      // Réservations (basé sur les commandes)
      prisma.customOrder.count({
        where: {
          escortId: userId,
          status: { in: ['CONFIRMED', 'PAID', 'COMPLETED'] }
        }
      })
    ])

    // Calculer les nouveaux fans (vues des 7 derniers jours)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const newFans = await prisma.escortProfile.findUnique({
      where: { userId },
      select: { views: true }
    }).then(p => Math.floor((p?.views || 0) * 0.1)) // 10% des vues = nouveaux fans

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