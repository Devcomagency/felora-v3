import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET() {
  // ✅ Vérification d'authentification admin
  const authError = await requireAdminAuth()
  if (authError) return authError

  try {
    // Total active media (not deleted)
    const totalActive = await prisma.media.count({
      where: { deletedAt: null }
    })

    // Reported media
    const reported = await prisma.media.count({
      where: {
        deletedAt: null,
        reportCount: { gt: 0 }
      }
    })

    // Deleted this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const deletedThisWeek = await prisma.media.count({
      where: {
        deletedAt: { gte: oneWeekAgo }
      }
    })

    // Uploaded today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const uploadedToday = await prisma.media.count({
      where: {
        deletedAt: null,
        createdAt: { gte: today }
      }
    })

    // Premium media
    const totalPremium = await prisma.media.count({
      where: {
        deletedAt: null,
        visibility: { in: ['PREMIUM', 'PRIVATE'] }
      }
    })

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
