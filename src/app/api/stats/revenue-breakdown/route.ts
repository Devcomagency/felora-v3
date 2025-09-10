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

    // Générer des données simulées pour la répartition des revenus
    const revenueBreakdown = [
      {
        source: 'Commandes privées',
        amount: 2080,
        percentage: 54,
        color: '#8B5CF6'
      },
      {
        source: 'Médias payants',
        amount: 1115,
        percentage: 29,
        color: '#06B6D4'
      },
      {
        source: 'Cadeaux',
        amount: 652,
        percentage: 17,
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