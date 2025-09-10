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

    // Générer des données simulées pour les revenus mensuels
    const now = new Date()
    const monthlyRevenue = []
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now)
      date.setMonth(date.getMonth() - i)
      
      monthlyRevenue.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short' }),
        revenue: Math.floor(Math.random() * 3000) + 1000
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