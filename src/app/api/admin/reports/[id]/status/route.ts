import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

/**
 * PATCH /api/admin/reports/[id]/status
 * Mettre à jour le statut d'un signalement
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdminAuth()
  if (authError) return authError

  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }

    // Mettre à jour le signalement
    const report = await prisma.report.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        // TODO: Ajouter reviewedBy avec l'ID de l'admin connecté
      }
    })

    console.log(`[REPORTS] Report ${id} status updated to ${status}`)

    return NextResponse.json({
      success: true,
      report
    })
  } catch (error) {
    console.error('[REPORTS] Error updating status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update status' },
      { status: 500 }
    )
  }
}
