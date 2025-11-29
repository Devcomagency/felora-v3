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
    const ninetyDaysAgo = subDays(today, 90)

    // 1. Total utilisateurs par rôle
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    })

    const totalUsers = usersByRole.reduce((sum, r) => sum + r._count.id, 0)

    // 2. Nouveaux utilisateurs (7j, 30j, 90j)
    const newUsers7d = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    })

    const newUsers30d = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    })

    const newUsers90d = await prisma.user.count({
      where: { createdAt: { gte: ninetyDaysAgo } }
    })

    // 3. Escortes par statut
    const escortsByStatus = await prisma.escortProfile.groupBy({
      by: ['status'],
      _count: { id: true }
    })

    const activeEscorts = await prisma.escortProfile.count({
      where: { isActive: true }
    })

    const verifiedEscorts = await prisma.escortProfile.count({
      where: { isVerifiedBadge: true }
    })

    // 4. Croissance quotidienne (30 derniers jours)
    const dailyGrowth = []
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i)
      const nextDate = subDays(today, i - 1)

      const escorts = await prisma.escortProfile.count({
        where: { createdAt: { lt: nextDate } }
      })

      const clients = await prisma.user.count({
        where: {
          role: 'CLIENT',
          createdAt: { lt: nextDate }
        }
      })

      const clubs = await prisma.user.count({
        where: {
          role: 'CLUB',
          createdAt: { lt: nextDate }
        }
      })

      dailyGrowth.push({
        date: format(date, 'yyyy-MM-dd'),
        escorts,
        clients,
        clubs,
        total: escorts + clients + clubs
      })
    }

    // 5. Vérification KYC
    const kycStats = await prisma.kycSubmission.groupBy({
      by: ['status'],
      _count: { id: true }
    })

    const totalKyc = kycStats.reduce((sum, k) => sum + k._count.id, 0)

    // 6. Utilisateurs suspendus/bannis
    const suspendedUsers = await prisma.user.count({
      where: {
        suspendedUntil: { gt: now }
      }
    })

    const bannedUsers = await prisma.user.count({
      where: {
        bannedAt: { not: null }
      }
    })

    // 7. Activité récente (users avec lastLoginAt récent)
    const activeToday = await prisma.user.count({
      where: {
        lastLoginAt: { gte: today }
      }
    })

    const active7d = await prisma.user.count({
      where: {
        lastLoginAt: { gte: sevenDaysAgo }
      }
    })

    const active30d = await prisma.user.count({
      where: {
        lastLoginAt: { gte: thirtyDaysAgo }
      }
    })

    // 8. Calcul taux de rétention (estimation)
    const retentionDay7 = totalUsers > 0 ? (active7d / totalUsers) * 100 : 0
    const retentionDay30 = totalUsers > 0 ? (active30d / totalUsers) * 100 : 0

    // 9. Croissance en %
    const prevMonthUsers = await prisma.user.count({
      where: { createdAt: { lt: thirtyDaysAgo } }
    })

    const growthRate = prevMonthUsers > 0
      ? ((totalUsers - prevMonthUsers) / prevMonthUsers) * 100
      : 0

    return NextResponse.json({
      overview: {
        totalUsers,
        newUsers7d,
        newUsers30d,
        newUsers90d,
        growthRate: growthRate.toFixed(1),
        activeToday,
        active7d,
        active30d
      },
      byRole: usersByRole.map(r => ({
        role: r.role,
        count: r._count.id,
        percentage: ((r._count.id / totalUsers) * 100).toFixed(1)
      })),
      escorts: {
        total: usersByRole.find(r => r.role === 'ESCORT')?._count.id || 0,
        active: activeEscorts,
        verified: verifiedEscorts,
        byStatus: escortsByStatus.map(s => ({
          status: s.status,
          count: s._count.id
        }))
      },
      kyc: {
        total: totalKyc,
        byStatus: kycStats.map(k => ({
          status: k.status,
          count: k._count.id,
          percentage: totalKyc > 0 ? ((k._count.id / totalKyc) * 100).toFixed(1) : '0'
        }))
      },
      moderation: {
        suspended: suspendedUsers,
        banned: bannedUsers
      },
      retention: {
        day7: retentionDay7.toFixed(1),
        day30: retentionDay30.toFixed(1)
      },
      dailyGrowth
    })

  } catch (error) {
    console.error('Users analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users analytics' },
      { status: 500 }
    )
  }
}
