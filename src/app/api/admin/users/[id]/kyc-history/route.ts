import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await context.params

    // Récupérer toutes les soumissions KYC de l'utilisateur
    const submissions = await prisma.kycSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        docFrontUrl: true,
        docBackUrl: true,
        selfieSignUrl: true,
        livenessVideoUrl: true,
        notes: true,
        rejectionReason: true,
        reviewerId: true,
        reviewedAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      submissions
    })
  } catch (error) {
    console.error('Erreur récupération historique KYC:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération de l\'historique',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
