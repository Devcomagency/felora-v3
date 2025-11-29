import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET() {
  // ✅ Vérification d'authentification admin
  const authError = await requireAdminAuth()
  if (authError) return authError

  try {
    // ✅ FILTRER : Récupérer seulement les médias avec propriétaires VALIDES

    // 1. Récupérer tous les médias actifs
    const allMedia = await prisma.media.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        ownerType: true,
        ownerId: true,
        reportCount: true,
        visibility: true,
        createdAt: true
      }
    })

    // 2. Récupérer les IDs des escorts et clubs valides
    const escortIds = [...new Set(
      allMedia
        .filter(m => m.ownerType === 'ESCORT' && m.ownerId && m.ownerId !== 'unknown')
        .map(m => m.ownerId)
    )]

    const clubIds = [...new Set(
      allMedia
        .filter(m => m.ownerType === 'CLUB' && m.ownerId && m.ownerId !== 'unknown')
        .map(m => m.ownerId)
    )]

    const existingEscorts = escortIds.length > 0
      ? await prisma.escortProfile.findMany({
          where: { id: { in: escortIds } },
          select: { id: true }
        })
      : []

    const existingClubs = clubIds.length > 0
      ? await prisma.clubProfile.findMany({
          where: { id: { in: clubIds } },
          select: { id: true }
        })
      : []

    const validEscortIds = new Set(existingEscorts.map(e => e.id))
    const validClubIds = new Set(existingClubs.map(c => c.id))

    // 3. Filtrer pour ne garder que les médias avec propriétaires valides
    const validMedia = allMedia.filter(m => {
      if (m.ownerId === 'unknown') return false
      if (m.ownerType === 'ESCORT') return validEscortIds.has(m.ownerId)
      if (m.ownerType === 'CLUB') return validClubIds.has(m.ownerId)
      return false
    })

    // Total active media (with valid owners)
    const totalActive = validMedia.length

    console.log(`[MEDIA STATS] Total in DB: ${allMedia.length}, Valid: ${validMedia.length}, Filtered out: ${allMedia.length - validMedia.length}`)

    // Reported media (filtrés)
    const reported = validMedia.filter(m => m.reportCount > 0).length

    // Deleted this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const deletedThisWeek = await prisma.media.count({
      where: {
        deletedAt: { gte: oneWeekAgo }
      }
    })

    // Uploaded today (filtrés)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const uploadedToday = validMedia.filter(m =>
      new Date(m.createdAt) >= today
    ).length

    // Premium media (filtrés)
    const totalPremium = validMedia.filter(m =>
      m.visibility === 'PREMIUM' || m.visibility === 'PRIVATE'
    ).length

    return NextResponse.json({
      success: true,
      stats: {
        totalActive,
        reported,
        deletedThisWeek,
        uploadedToday,
        totalPremium
      }
    })
  } catch (error) {
    console.error('Error fetching media stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
