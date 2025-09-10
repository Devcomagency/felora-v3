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

    // Générer des données simulées pour l'évolution des vues
    const now = new Date()
    const viewsData = []
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now)
      date.setMonth(date.getMonth() - i)
      
      viewsData.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short' }),
        views: Math.floor(Math.random() * 200) + 50
      })
    }

    return NextResponse.json({
      success: true,
      viewsData
    })

  } catch (error) {
    console.error('Erreur récupération profile views:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}