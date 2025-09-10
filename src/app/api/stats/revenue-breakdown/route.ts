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

    // Récupérer la répartition réelle des revenus
    const [privateOrders, mediaSales, gifts] = await Promise.all([
      // Commandes privées
      prisma.diamondTransaction.aggregate({
        where: {
          toUserId: userId,
          status: 'COMPLETED',
          type: 'TRANSFER'
        },
        _sum: { amount: true }
      }),
      
      // Médias payants
      prisma.diamondTransaction.aggregate({
        where: {
          toUserId: userId,
          status: 'COMPLETED',
          type: 'PURCHASE'
        },
        _sum: { amount: true }
      }),
      
      // Cadeaux
      prisma.diamondTransaction.aggregate({
        where: {
          toUserId: userId,
          status: 'COMPLETED',
          type: 'GIFT'
        },
        _sum: { amount: true }
      })
    ])

    const totalRevenue = (privateOrders._sum.amount || 0) + (mediaSales._sum.amount || 0) + (gifts._sum.amount || 0)
    
    const revenueBreakdown = [
      {
        source: 'Commandes privées',
        amount: privateOrders._sum.amount || 0,
        percentage: totalRevenue > 0 ? Math.round(((privateOrders._sum.amount || 0) / totalRevenue) * 100) : 0,
        color: '#8B5CF6'
      },
      {
        source: 'Médias payants',
        amount: mediaSales._sum.amount || 0,
        percentage: totalRevenue > 0 ? Math.round(((mediaSales._sum.amount || 0) / totalRevenue) * 100) : 0,
        color: '#06B6D4'
      },
      {
        source: 'Cadeaux',
        amount: gifts._sum.amount || 0,
        percentage: totalRevenue > 0 ? Math.round(((gifts._sum.amount || 0) / totalRevenue) * 100) : 0,
        color: '#10B981'
      }
    ]

    return NextResponse.json({
      success: true,
      revenueBreakdown
    })

  } catch (error) {
    console.error('Erreur récupération revenue breakdown:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}