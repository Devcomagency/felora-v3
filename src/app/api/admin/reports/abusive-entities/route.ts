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

    // Récupérer les entités ignorées
    const ignoredEntities = await prisma.ignoredReportEntity.findMany()
    const ignoredSet = new Set(ignoredEntities.map(e => `${e.identifier}:${e.type}`))

    // Compter les signalements par email (exclure les ignorés)
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

    // Compter les signalements par IP (exclure les ignorés)
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

    // Récupérer les détails des signalements pour chaque entité
    const entities = await Promise.all([
      ...emailCounts
        .filter(e => !ignoredSet.has(`${e.reporterEmail}:email`))
        .map(async e => {
          const reports = await prisma.report.findMany({
            where: { reporterEmail: e.reporterEmail! },
            orderBy: { createdAt: 'desc' },
            take: 10
          })

          // Récupérer l'utilisateur lié à cet email
          const relatedUser = e.reporterEmail ? await prisma.user.findUnique({
            where: { email: e.reporterEmail },
            select: {
              id: true,
              name: true,
              email: true,
              bannedAt: true
            }
          }) : null

          return {
            identifier: e.reporterEmail!,
            type: 'email' as const,
            count: e._count.id,
            reports: reports.map(r => ({
              id: r.id,
              targetType: r.targetType,
              targetId: r.targetId,
              reason: r.reason,
              status: r.status,
              createdAt: r.createdAt.toISOString()
            })),
            relatedUser
          }
        }),
      ...ipCounts
        .filter(ip => !ignoredSet.has(`${ip.reporterIp}:ip`))
        .map(async ip => {
          const reports = await prisma.report.findMany({
            where: { reporterIp: ip.reporterIp! },
            orderBy: { createdAt: 'desc' },
            take: 10
          })

          // Trouver les comptes associés à cette IP via reporterId
          const relatedUsers = reports.length > 0 ? await prisma.user.findMany({
            where: {
              id: {
                in: reports
                  .map(r => r.reporterId)
                  .filter((id): id is string => id !== null)
              }
            },
            select: {
              id: true,
              name: true,
              email: true,
              bannedAt: true
            }
          }) : []

          return {
            identifier: ip.reporterIp!,
            type: 'ip' as const,
            count: ip._count.id,
            reports: reports.map(r => ({
              id: r.id,
              targetType: r.targetType,
              targetId: r.targetId,
              reason: r.reason,
              status: r.status,
              createdAt: r.createdAt.toISOString()
            })),
            relatedUsers
          }
        })
    ])

    const resolvedEntities = await Promise.all(entities)
    const sortedEntities = resolvedEntities.sort((a, b) => b.count - a.count)

    return NextResponse.json({
      success: true,
      entities: sortedEntities
    })
  } catch (error) {
    console.error('[ADMIN REPORTS ABUSIVE] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch abusive entities' },
      { status: 500 }
    )
  }
}
