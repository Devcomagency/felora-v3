import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'

import { prisma } from '@/lib/prisma'
import { subDays, startOfDay } from 'date-fns'

type InsightType = 'success' | 'warning' | 'opportunity' | 'info' | 'alert'

interface Insight {
  type: InsightType
  icon: string
  title: string
  message: string
  action?: string
  data?: any
  priority: number
}

export async function GET() {
  try {
    // ✅ Vérification admin avec dev bypass
    const authError = await requireAdminAuth()
    if (authError) return authError

    const insights: Insight[] = []
    const now = new Date()
    const today = startOfDay(now)
    const sevenDaysAgo = subDays(today, 7)
    const thirtyDaysAgo = subDays(today, 30)

    // 1. Vérifier la croissance des inscriptions
    const newEscorts7d = await prisma.escortProfile.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    })

    const prevWeekEscorts = await prisma.escortProfile.count({
      where: {
        createdAt: {
          gte: subDays(sevenDaysAgo, 7),
          lt: sevenDaysAgo
        }
      }
    })

    if (prevWeekEscorts > 0) {
      const growthRate = ((newEscorts7d - prevWeekEscorts) / prevWeekEscorts) * 100

      if (growthRate > 20) {
        insights.push({
          type: 'success',
          icon: 'TrendingUp',
          title: 'Forte croissance des inscriptions',
          message: `+${growthRate.toFixed(1)}% d'inscriptions vs semaine dernière (${newEscorts7d} nouveaux profils)`,
          action: 'Maintenir les efforts d\'acquisition',
          data: { current: newEscorts7d, previous: prevWeekEscorts, growth: growthRate },
          priority: 10
        })
      } else if (growthRate < -15) {
        insights.push({
          type: 'warning',
          icon: 'TrendingDown',
          title: 'Baisse des inscriptions',
          message: `${growthRate.toFixed(1)}% d'inscriptions vs semaine dernière`,
          action: 'Vérifier les campagnes marketing',
          data: { current: newEscorts7d, previous: prevWeekEscorts, growth: growthRate },
          priority: 9
        })
      }
    }

    // 2. Profils inactifs
    const dormantProfiles = await prisma.escortProfile.count({
      where: {
        isActive: true,
        updatedAt: { lt: subDays(now, 60) }
      }
    })

    if (dormantProfiles > 10) {
      insights.push({
        type: 'info',
        icon: 'AlertCircle',
        title: 'Profils inactifs',
        message: `${dormantProfiles} profils n'ont pas été mis à jour depuis 60+ jours`,
        action: 'Envoyer campagne de réactivation',
        data: { count: dormantProfiles },
        priority: 6
      })
    }

    // 3. Signalements en attente
    const pendingReports = await prisma.report.count({
      where: { status: 'PENDING' }
    })

    if (pendingReports > 5) {
      insights.push({
        type: 'alert',
        icon: 'AlertTriangle',
        title: 'Signalements en attente',
        message: `${pendingReports} signalements nécessitent une modération`,
        action: 'Traiter les signalements urgents',
        data: { count: pendingReports },
        priority: 10
      })
    }

    // 4. KYC en attente
    const pendingKyc = await prisma.kycSubmission.count({
      where: { status: 'PENDING' }
    })

    if (pendingKyc > 10) {
      insights.push({
        type: 'warning',
        icon: 'Shield',
        title: 'Vérifications KYC en attente',
        message: `${pendingKyc} demandes de vérification nécessitent une review`,
        action: 'Prioriser les vérifications KYC',
        data: { count: pendingKyc },
        priority: 8
      })
    }

    // 5. Opportunités géographiques
    const citiesData = await prisma.escortProfile.groupBy({
      by: ['city'],
      _count: { id: true },
      _sum: { views: true },
      where: {
        isActive: true,
        city: { not: null }
      },
      having: {
        views: { _sum: { gt: 0 } }
      }
    })

    const opportunities = citiesData
      .map(c => ({
        city: c.city,
        escorts: c._count.id,
        views: c._sum.views || 0,
        ratio: c._count.id > 0 ? (c._sum.views || 0) / c._count.id : 0
      }))
      .filter(c => c.ratio > 100 && c.escorts < 20)
      .sort((a, b) => b.ratio - a.ratio)

    if (opportunities.length > 0) {
      const top = opportunities[0]
      insights.push({
        type: 'opportunity',
        icon: 'MapPin',
        title: `${top.city} : Opportunité d'expansion`,
        message: `Forte demande (${top.views} vues) mais seulement ${top.escorts} escorts`,
        action: 'Lancer campagne acquisition ciblée',
        data: top,
        priority: 7
      })
    }

    // 6. Taux de conversion
    const totalViews = await prisma.escortProfile.aggregate({
      _sum: { views: true },
      where: { isActive: true }
    })

    const totalContacts = await prisma.message.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    }) + await prisma.customOrder.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    })

    const views = totalViews._sum.views || 0
    const conversionRate = views > 0 ? (totalContacts / views) * 100 : 0

    if (conversionRate < 1) {
      insights.push({
        type: 'warning',
        icon: 'BarChart3',
        title: 'Taux de conversion faible',
        message: `Seulement ${conversionRate.toFixed(2)}% de conversion (vues → contacts)`,
        action: 'Améliorer CTA et visibilité des contacts',
        data: { views, contacts: totalContacts, rate: conversionRate },
        priority: 8
      })
    } else if (conversionRate > 2) {
      insights.push({
        type: 'success',
        icon: 'Target',
        title: 'Excellent taux de conversion',
        message: `${conversionRate.toFixed(2)}% de conversion (au-dessus de la moyenne)`,
        data: { views, contacts: totalContacts, rate: conversionRate },
        priority: 5
      })
    }

    // 7. Médias signalés
    const flaggedMedia = await prisma.media.count({
      where: {
        reportCount: { gt: 2 },
        deletedAt: null
      }
    })

    if (flaggedMedia > 0) {
      insights.push({
        type: 'alert',
        icon: 'Flag',
        title: 'Médias fortement signalés',
        message: `${flaggedMedia} médias avec 3+ signalements nécessitent une action`,
        action: 'Vérifier et modérer les médias',
        data: { count: flaggedMedia },
        priority: 9
      })
    }

    // 8. Revenus
    const revenue30d = await prisma.diamondTransaction.aggregate({
      _sum: { paymentAmount: true },
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: 'COMPLETED',
        type: 'PURCHASE'
      }
    })

    const prevRevenue = await prisma.diamondTransaction.aggregate({
      _sum: { paymentAmount: true },
      where: {
        createdAt: {
          gte: subDays(thirtyDaysAgo, 30),
          lt: thirtyDaysAgo
        },
        status: 'COMPLETED',
        type: 'PURCHASE'
      }
    })

    const currentRev = revenue30d._sum.paymentAmount || 0
    const prevRev = prevRevenue._sum.paymentAmount || 0

    if (prevRev > 0) {
      const revenueGrowth = ((currentRev - prevRev) / prevRev) * 100

      if (revenueGrowth > 15) {
        insights.push({
          type: 'success',
          icon: 'DollarSign',
          title: 'Croissance des revenus',
          message: `+${revenueGrowth.toFixed(1)}% de revenus ce mois (CHF ${currentRev.toFixed(2)})`,
          data: { current: currentRev, previous: prevRev, growth: revenueGrowth },
          priority: 10
        })
      } else if (revenueGrowth < -10) {
        insights.push({
          type: 'warning',
          icon: 'TrendingDown',
          title: 'Baisse des revenus',
          message: `${revenueGrowth.toFixed(1)}% de revenus ce mois`,
          action: 'Analyser les causes et relancer les promotions',
          data: { current: currentRev, previous: prevRev, growth: revenueGrowth },
          priority: 9
        })
      }
    }

    // 9. Profils incomplets
    const incompleteProfiles = await prisma.escortProfile.count({
      where: {
        isActive: true,
        OR: [
          { profilePhoto: null },
          { description: { equals: '' } },
          { services: { equals: '' } }
        ]
      }
    })

    if (incompleteProfiles > 20) {
      insights.push({
        type: 'info',
        icon: 'User',
        title: 'Profils incomplets',
        message: `${incompleteProfiles} profils actifs sont incomplets (pas de photo ou description)`,
        action: 'Rappeler aux escorts de compléter leur profil',
        data: { count: incompleteProfiles },
        priority: 5
      })
    }

    // 10. Top performer
    const topEscort = await prisma.escortProfile.findFirst({
      where: {
        isActive: true,
        updatedAt: { gte: sevenDaysAgo }
      },
      orderBy: { views: 'desc' },
      select: {
        stageName: true,
        views: true,
        city: true
      }
    })

    if (topEscort && topEscort.views > 500) {
      insights.push({
        type: 'success',
        icon: 'Star',
        title: 'Profil star cette semaine',
        message: `${topEscort.stageName} (${topEscort.city}) génère ${topEscort.views} vues`,
        action: 'Proposer mise en avant premium',
        data: topEscort,
        priority: 4
      })
    }

    // Trier par priorité
    const sortedInsights = insights.sort((a, b) => b.priority - a.priority)

    return NextResponse.json({
      insights: sortedInsights,
      summary: {
        total: sortedInsights.length,
        alerts: sortedInsights.filter(i => i.type === 'alert').length,
        warnings: sortedInsights.filter(i => i.type === 'warning').length,
        opportunities: sortedInsights.filter(i => i.type === 'opportunity').length,
        success: sortedInsights.filter(i => i.type === 'success').length
      }
    })

  } catch (error) {
    console.error('Insights analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
