import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    console.log('🔍 API: Recherche profil avec ID:', id)

    // Récupérer le profil escort depuis la base
    const escortProfile = await prisma.escortProfile.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            createdAt: true
          }
        }
      }
    })

    if (!escortProfile) {
      console.log('❌ API: Profil non trouvé pour ID:', id)
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    console.log('✅ API: Profil trouvé:', escortProfile.stageName || escortProfile.firstName)
    
    return NextResponse.json({
      success: true,
      data: escortProfile
    })
    
  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}