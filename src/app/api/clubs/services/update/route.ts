import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const Schema = z.object({
      languages: z.array(z.string()).optional(),
      paymentMethods: z.array(z.string()).optional(),
      services: z.array(z.string()).optional(),
      equipments: z.array(z.string()).optional(),
      isOpen24_7: z.boolean().optional(),
      openingHours: z.string().optional()
    })

    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'invalid_payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const input = parsed.data

    // Vérifier que l'utilisateur a un club
    const club = await prisma.clubProfileV2.findUnique({ where: { userId } })

    if (!club) {
      return NextResponse.json({ ok: false, error: 'Club non trouvé' }, { status: 404 })
    }

    console.log('🏢 Club services update data:', JSON.stringify(input, null, 2))

    // Préparer les données pour ClubServices
    const servicesData: any = {}
    if (Array.isArray(input.languages)) servicesData.languages = input.languages
    if (Array.isArray(input.paymentMethods)) servicesData.paymentMethods = input.paymentMethods
    if (Array.isArray(input.services)) servicesData.services = input.services
    if (Array.isArray(input.equipments)) servicesData.equipments = input.equipments
    if (typeof input.isOpen24_7 === 'boolean') servicesData.isOpen24_7 = input.isOpen24_7
    if (typeof input.openingHours === 'string') servicesData.openingHours = input.openingHours

    // Créer ou mettre à jour ClubServices
    await prisma.clubServices.upsert({
      where: { clubId: club.id },
      create: {
        clubId: club.id,
        ...servicesData
      },
      update: servicesData
    })

    console.log('✅ Services réellement sauvegardés pour club:', club.id)

    return NextResponse.json({ ok: true, message: 'Services mis à jour' })

  } catch (e: any) {
    console.error('❌ /api/clubs/services/update error:', e.message)
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}