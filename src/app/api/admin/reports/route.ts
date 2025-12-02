import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * GET /api/admin/reports
 * Liste tous les signalements avec filtres
 */
export async function GET(request: NextRequest) {
  // 🔐 SÉCURITÉ : Vérifier que l'utilisateur est admin
  const auth = await requireAdmin(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where: any = {}
    if (status && status !== 'ALL') {
      where.status = status
    }
    if (type && type !== 'ALL') {
      where.reportType = type
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: [
        { status: 'asc' }, // PENDING en premier
        { createdAt: 'desc' }
      ],
      take: 1000 // Limite raisonnable
    })

    return NextResponse.json({
      success: true,
      reports
    })
  } catch (error) {
    console.error('[ADMIN REPORTS] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/reports
 * Créer un nouveau signalement
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportType, targetType, targetId, reason, description, reporterId, reporterEmail } = body

    // Validation
    if (!reportType || !targetType || !targetId || !reason) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Récupérer l'IP du signaleur
    const reporterIp = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown'

    // Créer le signalement
    const report = await prisma.report.create({
      data: {
        reportType,
        targetType,
        targetId,
        reason,
        description,
        reporterId,
        reporterEmail,
        reporterIp,
        status: 'PENDING'
      }
    })

    console.log('[REPORTS] New report created:', report.id)

    return NextResponse.json({
      success: true,
      report
    })
  } catch (error) {
    console.error('[REPORTS] Error creating report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    )
  }
}
