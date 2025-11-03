import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

/**
 * GET /api/admin/reports/abusive-entities
 * Détecter les comportements suspects (emails/IPs avec plusieurs signalements)
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth()
  if (authError) return authError

  try {
    const threshold = 3 // Seuil pour considérer un comportement suspect

    // Compter les signalements par email
    const emailCounts = await prisma.report.groupBy({
      by: ['reporterEmail'],
      _count: {
        id: true
      },
      where: {
        reporterEmail: {
          not: null
        }
      },
      having: {
        id: {
          _count: {
            gte: threshold
          }
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // Compter les signalements par IP
    const ipCounts = await prisma.report.groupBy({
      by: ['reporterIp'],
      _count: {
        id: true
      },
      where: {
        reporterIp: {
          not: null,
          not: 'unknown'
        }
      },
      having: {
        id: {
          _count: {
            gte: threshold
          }
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // Formater les résultats
    const entities = [
      ...emailCounts.map(e => ({
        identifier: e.reporterEmail!,
        type: 'email' as const,
        count: e._count.id
      })),
      ...ipCounts.map(ip => ({
        identifier: ip.reporterIp!,
        type: 'ip' as const,
        count: ip._count.id
      }))
    ].sort((a, b) => b.count - a.count)

    return NextResponse.json({
      success: true,
      entities
    })
  } catch (error) {
    console.error('[ADMIN REPORTS ABUSIVE] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch abusive entities' },
      { status: 500 }
    )
  }
}
