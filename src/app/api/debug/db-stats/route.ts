import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdmin } from '@/lib/serverAuth'
import { logger } from '@/lib/logger'

export const GET = withAdmin(async (request: NextRequest) => {
  try {
    logger.security('Admin accessing DB stats', {
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    })

    // Compter les utilisateurs par rôle
    const [users, escorts, salons, clubs] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ESCORT' } }),
      prisma.user.count({ where: { role: 'CLUB' } }),
      prisma.user.count({ where: { role: 'SALON' } })
    ])

    // Détails des variables d'environnement (sécurisé)
    const dbUrl = process.env.DATABASE_URL ? 'Configurée' : 'Manquante'
    const prismaUrl = process.env.PRISMA_DATABASE_URL ? 'Configurée' : 'Manquante'

    // Derniers utilisateurs créés (SANS EMAILS pour sécurité)
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        role: true,
        createdAt: true,
        name: true
      }
    })

    return NextResponse.json({
      users,
      escorts,
      salons,
      clubs,
      dbUrl,
      prismaUrl,
      recentUsers,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Debug DB error', error)
    return NextResponse.json({
      error: 'Erreur accès base de données',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})
