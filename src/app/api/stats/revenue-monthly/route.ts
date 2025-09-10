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

    // Récupérer les revenus réels des 12 derniers mois
    const now = new Date()
    const monthlyRevenue = []
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now)
      date.setMonth(date.getMonth() - i)
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      // Compter les revenus de ce mois
      const monthlyRevenueData = await prisma.diamondTransaction.aggregate({
        where: {
          toUserId: userId,
          status: 'COMPLETED',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _sum: {
          amount: true
        }
      })
      
      monthlyRevenue.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short' }),
        revenue: monthlyRevenueData._sum.amount || 0
      })
    }

    return NextResponse.json({
      success: true,
      monthlyRevenue
    })

  } catch (error) {
    console.error('Erreur récupération revenue monthly:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}