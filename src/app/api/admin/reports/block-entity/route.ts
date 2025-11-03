import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

/**
 * POST /api/admin/reports/block-entity
 * Bloquer un email ou une IP
 */
export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth()
  if (authError) return authError

  try {
    const body = await request.json()
    const { identifier, type } = body

    if (!identifier || !type) {
      return NextResponse.json(
        { success: false, error: 'Identifier and type are required' },
        { status: 400 }
      )
    }

    // TODO: Implémenter le blocage dans une table dédiée
    // Pour l'instant, on peut marquer tous les signalements de cette entité comme "DISMISSED"
    if (type === 'email') {
      await prisma.report.updateMany({
        where: {
          reporterEmail: identifier,
          status: 'PENDING'
        },
        data: {
          status: 'DISMISSED',
          reviewNotes: 'Auto-dismissed: Email blocked by admin'
        }
      })
    } else if (type === 'ip') {
      await prisma.report.updateMany({
        where: {
          reporterIp: identifier,
          status: 'PENDING'
        },
        data: {
          status: 'DISMISSED',
          reviewNotes: 'Auto-dismissed: IP blocked by admin'
        }
      })
    }

    console.log(`[REPORTS] Blocked ${type}: ${identifier}`)

    return NextResponse.json({
      success: true,
      message: `${type === 'email' ? 'Email' : 'IP'} blocked successfully`
    })
  } catch (error) {
    console.error('[REPORTS] Error blocking entity:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to block entity' },
      { status: 500 }
    )
  }
}
