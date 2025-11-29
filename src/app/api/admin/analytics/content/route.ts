import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { subDays, startOfDay, format } from 'date-fns'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const today = startOfDay(now)
    const sevenDaysAgo = subDays(today, 7)
    const thirtyDaysAgo = subDays(today, 30)

    // 1. Total médias par type
    const mediaByType = await prisma.media.groupBy({
      by: ['type'],
      _count: { id: true },
      where: { deletedAt: null }
    })

    const totalMedias = mediaByType.reduce((sum, m) => sum + m._count.id, 0)

    // 2. Médias par visibilité
    const mediaByVisibility = await prisma.media.groupBy({
      by: ['visibility'],
      _count: { id: true },
      where: { deletedAt: null }
    })

    // 3. Uploads récents
    const uploads7d = await prisma.media.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
        deletedAt: null
      }
    })

    const uploads30d = await prisma.media.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        deletedAt: null
      }
    })

    // 4. Modération
    const reportedMedia = await prisma.media.count({
      where: {
        reportCount: { gt: 0 },
        deletedAt: null
      }
    })

    const deletedMedia = await prisma.media.count({
      where: { deletedAt: { not: null } }
    })

    // 5. Top médias par engagement
    const topMedias = await prisma.media.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        type: true,
        visibility: true,
        likeCount: true,
        reactCount: true,
        reportCount: true,
        ownerType: true,
        ownerId: true,
        createdAt: true
      },
      orderBy: [
        { likeCount: 'desc' }
      ],
      take: 20
    })

    const topMediasFormatted = topMedias.map(m => ({
      id: m.id,
      type: m.type,
      visibility: m.visibility,
      likes: m.likeCount,
      reacts: m.reactCount,
      reports: m.reportCount,
      engagementScore: (m.likeCount * 10) + (m.reactCount * 5),
      ownerType: m.ownerType,
      ownerId: m.ownerId,
      createdAt: m.createdAt
    }))

    // 6. Uploads par jour (30 derniers jours)
    const dailyUploads = []
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i)
      const nextDate = subDays(today, i - 1)

      const images = await prisma.media.count({
        where: {
          type: 'IMAGE',
          createdAt: { gte: date, lt: nextDate },
          deletedAt: null
        }
      })

      const videos = await prisma.media.count({
        where: {
          type: 'VIDEO',
          createdAt: { gte: date, lt: nextDate },
          deletedAt: null
        }
      })

      dailyUploads.push({
        date: format(date, 'yyyy-MM-dd'),
        images,
        videos,
        total: images + videos
      })
    }

    // 7. Réactions totales
    const reactionsData = await prisma.media.aggregate({
      _sum: { likeCount: true, reactCount: true },
      where: { deletedAt: null }
    })

    const totalLikes = reactionsData._sum.likeCount || 0
    const totalReacts = reactionsData._sum.reactCount || 0

    // 8. Médias par owner type
    const mediaByOwner = await prisma.media.groupBy({
      by: ['ownerType'],
      _count: { id: true },
      where: { deletedAt: null }
    })

    // 9. Signalements récents
    const recentReports = await prisma.report.count({
      where: {
        targetType: 'media',
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    // 10. Taux de modération
    const totalProcessedReports = await prisma.report.count({
      where: {
        targetType: 'media',
        status: { in: ['RESOLVED', 'DISMISSED'] }
      }
    })

    const totalReports = await prisma.report.count({
      where: { targetType: 'media' }
    })

    const moderationRate = totalReports > 0 ? (totalProcessedReports / totalReports) * 100 : 100

    return NextResponse.json({
      overview: {
        totalMedias,
        uploads7d,
        uploads30d,
        reportedMedia,
        deletedMedia,
        moderationRate: moderationRate.toFixed(1)
      },
      byType: mediaByType.map(m => ({
        type: m.type,
        count: m._count.id,
        percentage: totalMedias > 0 ? ((m._count.id / totalMedias) * 100).toFixed(1) : '0'
      })),
      byVisibility: mediaByVisibility.map(m => ({
        visibility: m.visibility,
        count: m._count.id,
        percentage: totalMedias > 0 ? ((m._count.id / totalMedias) * 100).toFixed(1) : '0'
      })),
      byOwner: mediaByOwner.map(m => ({
        ownerType: m.ownerType,
        count: m._count.id
      })),
      engagement: {
        totalLikes,
        totalReacts,
        avgLikesPerMedia: totalMedias > 0 ? (totalLikes / totalMedias).toFixed(1) : '0',
        avgReactsPerMedia: totalMedias > 0 ? (totalReacts / totalMedias).toFixed(1) : '0'
      },
      reports: {
        total: totalReports,
        recent: recentReports,
        processed: totalProcessedReports,
        pending: totalReports - totalProcessedReports
      },
      topMedias: topMediasFormatted,
      dailyUploads
    })

  } catch (error) {
    console.error('Content analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content analytics' },
      { status: 500 }
    )
  }
}
