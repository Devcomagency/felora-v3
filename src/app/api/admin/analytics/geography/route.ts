import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'

import { prisma } from '@/lib/prisma'
import { subDays, startOfDay } from 'date-fns'

export async function GET() {
  try {
    // ✅ Vérification admin avec dev bypass
    const authError = await requireAdminAuth()
    if (authError) return authError

    const now = new Date()
    const today = startOfDay(now)
    const thirtyDaysAgo = subDays(today, 30)

    // 1. Escortes par canton
    const escortsByCanton = await prisma.escortProfile.groupBy({
      by: ['canton'],
      _count: { id: true },
      where: {
        isActive: true,
        canton: { not: null }
      },
      orderBy: {
        _count: { id: 'desc' }
      }
    })

    // 2. Escortes par ville
    const escortsByCity = await prisma.escortProfile.groupBy({
      by: ['city'],
      _count: { id: true },
      where: {
        isActive: true,
        city: { not: null }
      },
      orderBy: {
        _count: { id: 'desc' }
      },
      take: 20
    })

    // 3. Croissance par canton (30 derniers jours)
    const cantonGrowth = []
    for (const canton of escortsByCanton.slice(0, 10)) {
      const currentCount = canton._count.id

      const previousCount = await prisma.escortProfile.count({
        where: {
          canton: canton.canton,
          isActive: true,
          createdAt: { lt: thirtyDaysAgo }
        }
      })

      const growth = previousCount > 0
        ? ((currentCount - previousCount) / previousCount) * 100
        : 0

      cantonGrowth.push({
        canton: canton.canton,
        current: currentCount,
        previous: previousCount,
        growth: growth.toFixed(1)
      })
    }

    // 4. Villes avec le plus de vues
    const citiesWithMostViews = await prisma.escortProfile.groupBy({
      by: ['city'],
      _sum: { views: true },
      _count: { id: true },
      where: {
        isActive: true,
        city: { not: null }
      },
      orderBy: {
        _sum: { views: 'desc' }
      },
      take: 15
    })

    const citiesFormatted = citiesWithMostViews.map(c => ({
      city: c.city,
      escorts: c._count.id,
      totalViews: c._sum.views || 0,
      avgViewsPerEscort: c._count.id > 0 ? ((c._sum.views || 0) / c._count.id).toFixed(1) : '0'
    }))

    // 5. Catégories par ville (top 5 villes)
    const topCities = escortsByCity.slice(0, 5)
    const categoriesByCity = []

    for (const city of topCities) {
      const categories = await prisma.escortProfile.groupBy({
        by: ['category'],
        _count: { id: true },
        where: {
          city: city.city,
          isActive: true
        }
      })

      categoriesByCity.push({
        city: city.city,
        categories: categories.map(c => ({
          category: c.category,
          count: c._count.id
        }))
      })
    }

    // 6. Nouveaux profils par canton (30j)
    const newEscortsByCanton = await prisma.escortProfile.groupBy({
      by: ['canton'],
      _count: { id: true },
      where: {
        createdAt: { gte: thirtyDaysAgo },
        canton: { not: null }
      }
    })

    // 7. Calcul opportunités (demand/supply ratio estimé)
    // On estime la demande par les vues moyennes
    const opportunities = citiesFormatted.map(c => {
      const demandSupplyRatio = parseFloat(c.avgViewsPerEscort)
      let opportunityLevel = 'LOW'

      if (demandSupplyRatio > 100) opportunityLevel = 'HIGH'
      else if (demandSupplyRatio > 50) opportunityLevel = 'MEDIUM'

      return {
        city: c.city,
        escorts: c.escorts,
        avgViews: c.avgViewsPerEscort,
        opportunityLevel,
        reason: demandSupplyRatio > 100
          ? 'Forte demande, offre limitée'
          : demandSupplyRatio > 50
            ? 'Demande modérée'
            : 'Marché saturé'
      }
    }).filter(o => o.opportunityLevel !== 'LOW')

    // 8. Statistiques globales
    const totalCantons = escortsByCanton.length
    const totalCities = escortsByCity.length

    const topCanton = escortsByCanton[0]
    const fastestGrowingCanton = cantonGrowth.reduce((max, c) =>
      parseFloat(c.growth) > parseFloat(max.growth) ? c : max
      , cantonGrowth[0])

    return NextResponse.json({
      overview: {
        totalCantons,
        totalCities,
        topCanton: topCanton ? {
          name: topCanton.canton,
          count: topCanton._count.id
        } : null,
        fastestGrowing: fastestGrowingCanton ? {
          name: fastestGrowingCanton.canton,
          growth: fastestGrowingCanton.growth
        } : null
      },
      byState: escortsByCanton.map(c => ({
        canton: c.canton,
        count: c._count.id
      })),
      byCity: citiesFormatted,
      growth: cantonGrowth,
      newProfiles: newEscortsByCanton.map(c => ({
        canton: c.canton,
        count: c._count.id
      })),
      categoriesByCity,
      opportunities: opportunities.sort((a, b) =>
        parseFloat(b.avgViews) - parseFloat(a.avgViews)
      )
    })

  } catch (error) {
    console.error('Geography analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch geography analytics' },
      { status: 500 }
    )
  }
}
