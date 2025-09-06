import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    const userId = session.user.id
    const existing = await prisma.escortProfile.findUnique({ where: { userId } })
    if (existing) return NextResponse.json({ ok: true, escortId: existing.id })

    const created = await prisma.escortProfile.create({
      data: {
        userId,
        firstName: '',
        stageName: 'Nouveau profil',
        dateOfBirth: new Date('1990-01-01T00:00:00Z'),
        nationality: 'CH',
        languages: '[]',
        city: '',
        workingArea: '',
        description: '',
        canton: '',
        codePostal: '',
        ville: '',
        rue: '',
        numero: '',
        addressVisible: false,
        latitude: null,
        longitude: null,
        services: '[]',
        rates: '{}',
        availability: '{}',
        profilePhoto: null,
        galleryPhotos: '[]',
        videos: '[]',
      },
      select: { id: true }
    })

    return NextResponse.json({ ok: true, escortId: created.id })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'init_failed' }, { status: 500 })
  }
}

