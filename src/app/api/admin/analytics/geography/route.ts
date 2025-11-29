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
    const allEscorts = await prisma.escortProfile.findMany({
      where: { status: 'ACTIVE' },
      select: { canton: true, city: true }
    })

    const cantonCounts = allEscorts
      .filter(e => e.canton)
      .reduce((acc: Record<string, number>, e) => {
        acc[e.canton!] = (acc[e.canton!] || 0) + 1
        return acc
      }, {})

    const escortsByCanton = Object.entries(cantonCounts)
      .map(([canton, count]) => ({ canton, _count: { id: count } }))
      .sort((a, b) => b._count.id - a._count.id)

    // 2. Escortes par ville
    const cityCounts = allEscorts
      .filter(e => e.city)
      .reduce((acc: Record<string, number>, e) => {
        acc[e.city!] = (acc[e.city!] || 0) + 1
        return acc
      }, {})

    const escortsByCity = Object.entries(cityCounts)
      .map(([city, count]) => ({ city, _count: { id: count } }))
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, 20)

    // 3. Croissance par canton (30 derniers jours)
    const cantonGrowth = []
    for (const canton of escortsByCanton.slice(0, 10)) {
      const currentCount = canton._count.id

      const previousCount = await prisma.escortProfile.count({
        where: {
          canton: canton.canton as string,
          status: 'ACTIVE',
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
    const escortsWithViews = await prisma.escortProfile.findMany({
      where: { status: 'ACTIVE' },
      select: { city: true, views: true }
    })

    const cityViews = escortsWithViews
      .filter(e => e.city)
      .reduce((acc: Record<string, { count: number; views: number }>, e) => {
        if (!acc[e.city!]) acc[e.city!] = { count: 0, views: 0 }
        acc[e.city!].count++
        acc[e.city!].views += e.views || 0
        return acc
      }, {})

    const citiesFormatted = Object.entries(cityViews)
      .map(([city, data]) => ({
        city,
        escorts: data.count,
        totalViews: data.views,
        avgViewsPerEscort: data.count > 0 ? (data.views / data.count).toFixed(1) : '0'
      }))
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 15)

    // 5. Catégories par ville (top 5 villes)
    const topCities = escortsByCity.slice(0, 5)
    const categoriesByCity = []

    for (const cityData of topCities) {
      const escorts = await prisma.escortProfile.findMany({
        where: {
          city: cityData.city as string,
          status: 'ACTIVE'
        },
        select: { category: true }
      })

      const categoryCounts = escorts.reduce((acc: Record<string, number>, e) => {
        acc[e.category] = (acc[e.category] || 0) + 1
        return acc
      }, {})

      categoriesByCity.push({
        city: cityData.city,
        categories: Object.entries(categoryCounts).map(([category, count]) => ({
          category,
          count
        }))
      })
    }

    // 6. Nouveaux profils par canton (30j)
    const newEscorts = await prisma.escortProfile.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: 'ACTIVE'
      },
      select: { canton: true }
    })

    const newCantonCounts = newEscorts
      .filter(e => e.canton)
      .reduce((acc: Record<string, number>, e) => {
        acc[e.canton!] = (acc[e.canton!] || 0) + 1
        return acc
      }, {})

    const newEscortsByCanton = Object.entries(newCantonCounts).map(([canton, count]) => ({
      canton,
      _count: { id: count }
    }))

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
