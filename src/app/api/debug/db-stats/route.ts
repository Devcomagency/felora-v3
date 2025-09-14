import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Compter les utilisateurs par rôle
    const [users, escorts, salons, clubs] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ESCORT' } }),
      prisma.user.count({ where: { role: 'CLUB' } }),
      prisma.user.count({ where: { role: 'CLUB' } })
    ])

    // Détails des variables d'environnement
    const dbUrl = process.env.DATABASE_URL ? 'Configurée' : 'Manquante'
    const prismaUrl = process.env.PRISMA_DATABASE_URL ? 'Configurée' : 'Manquante'

    // Derniers utilisateurs créés
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
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
    console.error('Debug DB error:', error)
    return NextResponse.json({
      error: 'Erreur accès base de données',
      details: error instanceof Error ? error.message : 'Unknown error',
      dbUrl: process.env.DATABASE_URL ? 'Configurée' : 'Manquante',
      prismaUrl: process.env.PRISMA_DATABASE_URL ? 'Configurée' : 'Manquante'
    }, { status: 500 })
  }
}
