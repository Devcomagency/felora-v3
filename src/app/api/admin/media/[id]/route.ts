import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ Vérification d'authentification admin
  const authError = await requireAdminAuth()
  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()
    const { reason, details } = body

    if (!reason) {
      return NextResponse.json(
        { success: false, error: 'Reason is required' },
        { status: 400 }
      )
    }

    // Get media info before deletion
    const media = await prisma.media.findUnique({
      where: { id },
      select: {
        ownerId: true,
        ownerType: true,
        type: true,
        description: true,
        url: true
      }
    })

    if (!media) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      )
    }

    // Get owner user ID
    let userId: string | null = null

    if (media.ownerType === 'ESCORT') {
      const escort = await prisma.escortProfile.findUnique({
        where: { id: media.ownerId },
        select: { userId: true }
      })
      userId = escort?.userId || null
    } else if (media.ownerType === 'CLUB') {
      const club = await prisma.clubProfile.findUnique({
        where: { id: media.ownerId },
        select: { userId: true }
      })
      userId = club?.userId || null
    }

    // Soft delete the media
    await prisma.media.update({
      where: { id },
      data: {
        deletedBy: 'admin', // You can get actual admin ID from session
        deletedAt: new Date(),
        deletionReason: `${reason}${details ? ` - ${details}` : ''}`
      }
    })

    // Send notification to owner
    if (userId) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'SYSTEM_ALERT',
          title: '🗑️ Média supprimé',
          message: `Votre média a été supprimé pour modération. Raison : ${reason}${details ? `. Détails : ${details}` : ''}`,
          metadata: JSON.stringify({
            mediaId: id,
            reason,
            details,
            deletedAt: new Date().toISOString()
          })
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Media deleted and notification sent'
    })
  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete media' },
      { status: 500 }
    )
  }
}
