import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET() {
  const authError = await requireAdminAuth()
  if (authError) return authError

  try {
    // 1. Compter tous les médias par statut
    const totalMedia = await prisma.media.count({
      where: { deletedAt: null }
    })

    const mediaByOwnerType = await prisma.media.groupBy({
      by: ['ownerType'],
      where: { deletedAt: null },
      _count: { id: true }
    })

    // 2. Récupérer tous les médias avec leurs infos
    const allMedia = await prisma.media.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        ownerType: true,
        ownerId: true,
        url: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 500
    })

    // 3. Analyser les clubs
    const clubMediaIds = allMedia
      .filter(m => m.ownerType === 'CLUB')
      .map(m => m.ownerId)
      .filter(id => id !== 'unknown')

    const uniqueClubIds = [...new Set(clubMediaIds)]

    const existingClubs = await prisma.clubProfile.findMany({
      select: {
        id: true,
        name: true,
        handle: true,
        userId: true,
        createdAt: true,
        updatedAt: true
      }
    })

    const existingClubIds = new Set(existingClubs.map(c => c.id))
    const orphanedClubIds = uniqueClubIds.filter(id => !existingClubIds.has(id))

    // 4. Analyser les escorts
    const escortMediaIds = allMedia
      .filter(m => m.ownerType === 'ESCORT')
      .map(m => m.ownerId)
      .filter(id => id !== 'unknown')

    const uniqueEscortIds = [...new Set(escortMediaIds)]

    const existingEscorts = await prisma.escortProfile.findMany({
      select: {
        id: true,
        stageName: true,
        firstName: true,
        userId: true,
        createdAt: true,
        updatedAt: true
      }
    })

    const existingEscortIds = new Set(existingEscorts.map(e => e.id))
    const orphanedEscortIds = uniqueEscortIds.filter(id => !existingEscortIds.has(id))

    // 5. Détails des médias orphelins par club
    const orphanedClubsDetails = await Promise.all(
      orphanedClubIds.slice(0, 20).map(async (clubId) => {
        const mediaCount = allMedia.filter(m => m.ownerId === clubId).length
        const oldestMedia = allMedia
          .filter(m => m.ownerId === clubId)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0]
        const newestMedia = allMedia
          .filter(m => m.ownerId === clubId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

        // Chercher si le user existe encore
        const userExists = await prisma.user.findFirst({
          where: {
            clubProfile: { id: clubId }
          },
          select: {
            id: true,
            email: true,
            createdAt: true,
            updatedAt: true
          }
        })

        return {
          clubId,
          mediaCount,
          oldestMediaDate: oldestMedia?.createdAt,
          newestMediaDate: newestMedia?.createdAt,
          userStillExists: !!userExists,
          userInfo: userExists || null
        }
      })
    )

    // 6. Compter les médias avec "unknown"
    const unknownMediaCount = allMedia.filter(m => m.ownerId === 'unknown').length

    // 7. Statistiques résumées
    const stats = {
      total: {
        media: totalMedia,
        clubs: existingClubs.length,
        escorts: existingEscorts.length
      },
      mediaByType: mediaByOwnerType,
      orphaned: {
        clubs: {
          uniqueIds: orphanedClubIds.length,
          totalMedia: allMedia.filter(m =>
            m.ownerType === 'CLUB' &&
            orphanedClubIds.includes(m.ownerId)
          ).length,
          details: orphanedClubsDetails
        },
        escorts: {
          uniqueIds: orphanedEscortIds.length,
          totalMedia: allMedia.filter(m =>
            m.ownerType === 'ESCORT' &&
            orphanedEscortIds.includes(m.ownerId)
          ).length
        },
        unknown: unknownMediaCount
      },
      existing: {
        clubs: existingClubs,
        escorts: existingEscorts
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      analysis: {
        message: orphanedClubIds.length > 0
          ? `⚠️ ${orphanedClubIds.length} clubs ont été supprimés mais leurs ${stats.orphaned.clubs.totalMedia} médias sont restés.`
          : '✅ Tous les médias appartiennent à des comptes actifs.',
        recommendation: orphanedClubIds.length > 0
          ? 'Utilise le script cleanup-orphaned-media.sql pour nettoyer la base de données.'
          : null
      }
    }, { status: 200 })

  } catch (error) {
    console.error('[MEDIA ANALYZE] Error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
