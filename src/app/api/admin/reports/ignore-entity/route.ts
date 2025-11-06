import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

/**
 * POST /api/admin/reports/ignore-entity
 * Ignorer une entité suspecte (email ou IP)
 */
export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth()
  if (authError) return authError

  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { identifier, type, reason } = body

    if (!identifier || !type || !['email', 'ip'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters' },
        { status: 400 }
      )
    }

    // Vérifier si déjà ignoré
    const existing = await prisma.ignoredReportEntity.findUnique({
      where: {
        identifier_type: {
          identifier,
          type
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Entity already ignored' },
        { status: 400 }
      )
    }

    // Créer l'ignorance
    await prisma.ignoredReportEntity.create({
      data: {
        identifier,
        type,
        ignoredBy: session?.user?.id || 'unknown',
        reason: reason || null
      }
    })

    return NextResponse.json({
      success: true,
      message: `${type === 'email' ? 'Email' : 'IP'} ignoré avec succès`
    })
  } catch (error) {
    console.error('[ADMIN REPORTS IGNORE] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to ignore entity' },
      { status: 500 }
    )
  }
}
