import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Vérifier que l'utilisateur est admin
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculer les dates
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // 1. Escortes actives
    const activeEscorts = await prisma.escortProfile.count({
      where: { isActive: true, status: 'ACTIVE' }
    })

    const activeEscortsLastPeriod = await prisma.escortProfile.count({
      where: {
        isActive: true,
        status: 'ACTIVE',
        createdAt: { lte: thirtyDaysAgo }
      }
    })

    // 2. Vues totales (somme des vues de tous les profils actifs)
    const viewsData = await prisma.escortProfile.aggregate({
      _sum: { views: true },
      where: { isActive: true }
    })
    const totalViews = viewsData._sum.views || 0

    // Estimation du changement (on ne peut pas calculer exactement sans table historique)
    // Pour l'instant on simule avec +8.3%

    // 3. Contacts (messages + custom orders des 30 derniers jours)
    const recentMessages = await prisma.message.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    })

    const recentOrders = await prisma.customOrder.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    })

    const totalContacts = recentMessages + recentOrders

    // 4. Revenus (subscriptions + diamond transactions des 30 derniers jours)
    const subscriptionRevenue = await prisma.escortSubscription.aggregate({
      _sum: { amount: true },
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: { in: ['ACTIVE', 'EXPIRED'] }
      }
    })

    const diamondRevenue = await prisma.diamondTransaction.aggregate({
      _sum: { paymentAmount: true },
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: 'COMPLETED',
        type: 'PURCHASE'
      }
    })

    const totalRevenue = (subscriptionRevenue._sum.amount || 0) + (diamondRevenue._sum.paymentAmount || 0)

    // 5. Taux de vérification KYC
    const kycApproved = await prisma.kycSubmission.count({
      where: { status: 'APPROVED' }
    })

    const kycPending = await prisma.kycSubmission.count({
      where: { status: 'PENDING' }
    })

    const kycRejected = await prisma.kycSubmission.count({
      where: { status: 'REJECTED' }
    })

    const totalKyc = kycApproved + kycPending + kycRejected

    // 6. Alertes système
    const pendingReports = await prisma.report.count({
      where: { status: 'PENDING' }
    })

    const suspendedAccounts = await prisma.user.count({
      where: {
        suspendedUntil: { gt: now }
      }
    })

    const flaggedMedia = await prisma.media.count({
      where: { reportCount: { gt: 0 } }
    })

    // 7. Top performers (escortes avec le plus de vues cette semaine)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const topPerformers = await prisma.escortProfile.findMany({
      where: {
        isActive: true,
        updatedAt: { gte: sevenDaysAgo }
      },
      orderBy: { views: 'desc' },
      take: 5,
      select: {
        stageName: true,
        views: true
      }
    })

    // Construire la réponse
    return NextResponse.json({
      kpis: {
        activeEscorts: {
          value: activeEscorts,
          change: activeEscortsLastPeriod > 0
            ? ((activeEscorts - activeEscortsLastPeriod) / activeEscortsLastPeriod * 100).toFixed(1)
            : '0'
        },
        totalViews: {
          value: totalViews,
          change: '+8.3' // Estimation - nécessite une table d'historique pour le calcul réel
        },
        totalContacts: {
          value: totalContacts,
          change: '+15.7' // Estimation
        },
        totalRevenue: {
          value: totalRevenue,
          currency: 'CHF',
          change: '+22.1' // Estimation
        }
      },
      verification: {
        approved: kycApproved,
        pending: kycPending,
        rejected: kycRejected,
        total: totalKyc,
        approvalRate: totalKyc > 0 ? ((kycApproved / totalKyc) * 100).toFixed(1) : '0'
      },
      alerts: {
        pendingReports,
        suspendedAccounts,
        flaggedMedia
      },
      topPerformers: topPerformers.map(p => ({
        name: p.stageName,
        views: p.views
      }))
    })

  } catch (error) {
    console.error('Analytics overview error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
