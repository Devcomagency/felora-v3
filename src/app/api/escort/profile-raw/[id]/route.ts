import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Use raw SQL to bypass potential schema issues
    const result = await prisma.$queryRaw`
      SELECT * FROM escort_profiles WHERE id = ${id} LIMIT 1
    `

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Profil escorte non trouvé' },
        { status: 404 }
      )
    }

    const escortProfile = Array.isArray(result) ? result[0] : result

    return NextResponse.json({
      success: true,
      data: escortProfile
    })

  } catch (error) {
    console.error('Erreur récupération profil par ID (raw):', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur', details: error.message },
      { status: 500 }
    )
  }
}