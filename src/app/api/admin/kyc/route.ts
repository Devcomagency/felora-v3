import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  // 🔐 SÉCURITÉ CRITIQUE : Vérifier que l'utilisateur est admin avant d'exposer les données KYC
  const auth = await requireAdmin(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    // Récupérer toutes les soumissions KYC
    const submissions = await prisma.kycSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        role: true,
        status: true,
        docFrontUrl: true,
        docBackUrl: true,
        selfieSignUrl: true,
        livenessVideoUrl: true,
        notes: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      submissions: submissions.map(sub => ({
        ...sub,
        createdAt: sub.createdAt.toISOString(),
        updatedAt: sub.updatedAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Error fetching KYC submissions:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch KYC submissions' 
    }, { status: 500 })
  }
}
