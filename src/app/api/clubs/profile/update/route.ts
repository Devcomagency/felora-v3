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
      name: z.string().max(100).optional(),
      description: z.string().max(5000).optional(),
      address: z.string().max(200).optional(),
      city: z.string().max(100).optional(),
      postalCode: z.string().max(20).optional(),
      country: z.string().max(100).optional(),
      openingHours: z.string().max(200).optional(),
      websiteUrl: z.string().url().optional().or(z.literal('')),
      email: z.string().email().optional().or(z.literal('')),
      phone: z.string().max(50).optional(),
      capacity: z.number().int().positive().optional().nullable(),
      latitude: z.number().nullable().optional(),
      longitude: z.number().nullable().optional(),
      languages: z.array(z.string()).optional(),
      paymentMethods: z.array(z.string()).optional(),
      services: z.array(z.string()).optional(),
      avatarUrl: z.string().url().optional().or(z.literal('')),
      coverUrl: z.string().url().optional().or(z.literal('')),
      isActive: z.boolean().optional()
    })
    
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'invalid_payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const input = parsed.data

    // Vérifier que l'utilisateur a un club
    let club = await prisma.clubProfileV2.findUnique({ where: { userId } })

    if (!club) {
      // Créer un club si il n'existe pas
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } })
      const baseName = user?.name?.split(' ')?.[0] || 'Mon Club'

      club = await prisma.clubProfileV2.create({
        data: {
          userId,
          handle: `club-${Date.now()}`, // Handle unique
          companyName: input.name || baseName || 'Mon Club',
          managerName: input.name || baseName || ''
        }
      })
    }

    // Mettre à jour ClubProfileV2 si nécessaire
    const profileDataToUpdate: any = {}
    if (typeof input.name === 'string') profileDataToUpdate.companyName = input.name

    if (Object.keys(profileDataToUpdate).length > 0) {
      await prisma.clubProfileV2.update({
        where: { id: club.id },
        data: profileDataToUpdate
      })
    }

    // Préparer les données pour ClubDetails
    const detailsData: any = {}
    if (typeof input.name === 'string') detailsData.name = input.name
    if (typeof input.description === 'string') detailsData.description = input.description
    if (typeof input.address === 'string') detailsData.address = input.address
    if (typeof input.city === 'string') detailsData.city = input.city
    if (typeof input.postalCode === 'string') detailsData.postalCode = input.postalCode
    if (typeof input.country === 'string') detailsData.country = input.country
    if (typeof input.openingHours === 'string') detailsData.openingHours = input.openingHours
    if (typeof input.websiteUrl === 'string') detailsData.websiteUrl = input.websiteUrl || null
    if (typeof input.email === 'string') detailsData.email = input.email || null
    if (typeof input.phone === 'string') detailsData.phone = input.phone
    if (typeof input.capacity === 'number') detailsData.capacity = input.capacity
    if (typeof input.latitude === 'number') detailsData.latitude = input.latitude
    if (typeof input.longitude === 'number') detailsData.longitude = input.longitude
    if (typeof input.avatarUrl === 'string') detailsData.avatarUrl = input.avatarUrl || null
    if (typeof input.coverUrl === 'string') detailsData.coverUrl = input.coverUrl || null
    if (typeof input.isActive === 'boolean') detailsData.isActive = input.isActive

    // Créer ou mettre à jour ClubDetails
    if (Object.keys(detailsData).length > 0) {
      await prisma.clubDetails.upsert({
        where: { clubId: club.id },
        create: {
          clubId: club.id,
          ...detailsData
        },
        update: detailsData
      })
    }

    console.log('✅ Club mis à jour:', {
      profile: profileDataToUpdate,
      details: detailsData
    })

    return NextResponse.json({ ok: true, message: 'Profil club mis à jour' })
    
  } catch (e: any) {
    console.error('❌ /api/clubs/profile/update error:', e.message)
    console.error('❌ Full error:', e)
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}