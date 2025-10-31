import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/admin/kyc/update { id, status: 'PENDING'|'APPROVED'|'REJECTED', notes? }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    const role = (session as any)?.user?.role
    if (role !== 'ADMIN') return NextResponse.json({ error: 'not_authorized' }, { status: 403 })

    const body = await req.json().catch(() => ({}))
    const id = String(body?.id || '')
    const status = String(body?.status || '') as 'PENDING'|'APPROVED'|'REJECTED'
    const notes = typeof body?.notes === 'string' ? body.notes : undefined
    if (!id || !['PENDING','APPROVED','REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'invalid_params' }, { status: 400 })
    }

    // Récupérer la soumission pour avoir le userId et le role
    const submission = await prisma.kycSubmission.findUnique({
      where: { id },
      select: { userId: true, role: true }
    })

    if (!submission) {
      return NextResponse.json({ error: 'submission_not_found' }, { status: 404 })
    }

    // Mettre à jour le statut KYC
    const updated = await prisma.kycSubmission.update({
      where: { id },
      data: {
        status: status as any,
        notes: notes ?? undefined,
        reviewerId: (session as any)?.user?.id,
        reviewedAt: new Date()
      }
    })

    // Si approuvé, attribuer le badge de vérification au profil
    if (status === 'APPROVED') {
      if (submission.role === 'ESCORT') {
        // Mettre à jour le profil escort avec le badge
        await prisma.escortProfile.updateMany({
          where: { userId: submission.userId },
          data: { isVerifiedBadge: true }
        })
      } else if (submission.role === 'CLUB') {
        // Mettre à jour le profil club avec le badge
        await prisma.clubProfileV2.updateMany({
          where: { userId: submission.userId },
          data: { verified: true }
        })
      }
    }

    // Si rejeté, retirer le badge
    if (status === 'REJECTED') {
      if (submission.role === 'ESCORT') {
        await prisma.escortProfile.updateMany({
          where: { userId: submission.userId },
          data: { isVerifiedBadge: false }
        })
      } else if (submission.role === 'CLUB') {
        await prisma.clubProfileV2.updateMany({
          where: { userId: submission.userId },
          data: { verified: false }
        })
      }
    }

    return NextResponse.json({ ok: true, status: updated.status })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 })
  }
}

