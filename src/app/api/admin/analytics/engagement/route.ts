import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'

import { prisma } from '@/lib/prisma'
import { subDays, startOfDay, format } from 'date-fns'

export async function GET() {
  try {
    // ✅ Vérification admin avec dev bypass
    const authError = await requireAdminAuth()
    if (authError) return authError

    const now = new Date()
    const today = startOfDay(now)
    const sevenDaysAgo = subDays(today, 7)
    const thirtyDaysAgo = subDays(today, 30)

    // 1. Vues de profils (somme de tous les profils actifs)
    const viewsData = await prisma.escortProfile.aggregate({
      _sum: { views: true },
      _avg: { views: true },
      where: { status: 'ACTIVE' }
    })

    const totalViews = viewsData._sum.views || 0
    const avgViews = viewsData._avg.views || 0

    // 2. Likes & Réactions
    const likesData = await prisma.escortProfile.aggregate({
      _sum: { likes: true, totalLikes: true, totalReacts: true },
      where: { status: 'ACTIVE' }
    })

    const totalLikes = (likesData._sum.likes || 0) + (likesData._sum.totalLikes || 0)
    const totalReacts = likesData._sum.totalReacts || 0

    // 3. Messages (total + récents)
    const totalMessages = await prisma.message.count()
    const messages7d = await prisma.message.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    })
    const messages30d = await prisma.message.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    })

    // 4. Conversations actives
    const totalConversations = await prisma.conversation.count()
    const activeConversations = await prisma.conversation.count({
      where: {
        updatedAt: { gte: sevenDaysAgo }
      }
    })

    // 5. Custom Orders (contacts/conversions)
    const totalOrders = await prisma.customOrder.count()
    const orders7d = await prisma.customOrder.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    })
    const orders30d = await prisma.customOrder.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    })

    const paidOrders = await prisma.customOrder.count({
      where: { status: { in: ['PAID', 'IN_PROGRESS', 'COMPLETED'] } }
    })

    // 6. Taux de conversion estimé (messages + orders vs vues)
    const totalContacts = messages30d + orders30d
    const conversionRate = totalViews > 0 ? (totalContacts / totalViews) * 100 : 0

    // 7. Engagement par jour (30 derniers jours)
    const dailyEngagement = []
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i)
      const nextDate = subDays(today, i - 1)

      const messages = await prisma.message.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      })

      const orders = await prisma.customOrder.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      })

      dailyEngagement.push({
        date: format(date, 'yyyy-MM-dd'),
        messages,
        orders,
        total: messages + orders
      })
    }

    // 8. Réactions médias
    const mediaReactions = await prisma.media.aggregate({
      _sum: { likeCount: true, reactCount: true },
      where: { deletedAt: null }
    })

    const totalMediaLikes = mediaReactions._sum.likeCount || 0
    const totalMediaReacts = mediaReactions._sum.reactCount || 0

    // 9. Types de messages
    const messagesByType = await prisma.message.groupBy({
      by: ['type'],
      _count: { id: true },
      where: { createdAt: { gte: thirtyDaysAgo } }
    })

    // 10. Top escorts par engagement (vues + likes combinés)
    const topEscorts = await prisma.escortProfile.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        stageName: true,
        views: true,
        likes: true,
        totalLikes: true,
        totalReacts: true,
        city: true,
        category: true
      },
      orderBy: [
        { views: 'desc' }
      ],
      take: 10
    })

    const topEscortsFormatted = topEscorts.map(e => ({
      id: e.id,
      name: e.stageName,
      views: e.views,
      likes: (e.likes || 0) + (e.totalLikes || 0),
      reacts: e.totalReacts || 0,
      engagementScore: (e.views || 0) + ((e.likes || 0) * 10) + ((e.totalReacts || 0) * 5),
      city: e.city,
      category: e.category
    }))

    return NextResponse.json({
      overview: {
        totalViews,
        avgViewsPerProfile: avgViews.toFixed(1),
        totalLikes,
        totalReacts,
        totalMessages,
        totalConversations,
        conversionRate: conversionRate.toFixed(2)
      },
      recent: {
        messages7d,
        messages30d,
        orders7d,
        orders30d,
        contacts30d: totalContacts
      },
      conversations: {
        total: totalConversations,
        active: activeConversations,
        activeRate: totalConversations > 0 ? ((activeConversations / totalConversations) * 100).toFixed(1) : '0'
      },
      orders: {
        total: totalOrders,
        paid: paidOrders,
        conversionRate: totalOrders > 0 ? ((paidOrders / totalOrders) * 100).toFixed(1) : '0'
      },
      media: {
        totalLikes: totalMediaLikes,
        totalReacts: totalMediaReacts
      },
      messageTypes: messagesByType.map(m => ({
        type: m.type,
        count: m._count.id
      })),
      topEscorts: topEscortsFormatted,
      dailyEngagement
    })

  } catch (error) {
    console.error('Engagement analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch engagement analytics' },
      { status: 500 }
    )
  }
}
