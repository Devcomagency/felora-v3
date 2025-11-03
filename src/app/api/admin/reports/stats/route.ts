import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

/**
 * GET /api/admin/reports/stats
 * Statistiques des signalements
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth()
  if (authError) return authError

  try {
    // Compter les signalements par statut
    const [total, pending, reviewing, resolved, dismissed, escalated] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.report.count({ where: { status: 'REVIEWING' } }),
      prisma.report.count({ where: { status: 'RESOLVED' } }),
      prisma.report.count({ where: { status: 'DISMISSED' } }),
      prisma.report.count({ where: { status: 'ESCALATED' } })
    ])

    const stats = {
      total,
      pending,
      reviewing,
      resolved,
      dismissed,
      escalated
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('[ADMIN REPORTS STATS] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
