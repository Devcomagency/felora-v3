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
      capacity: z.number().int().positive().optional(),
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
    let club = await prisma.clubProfile.findUnique({ where: { userId } })
    
    if (!club) {
      // Créer un club si il n'existe pas
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } })
      const baseName = user?.name?.split(' ')?.[0] || 'Mon Club'
      
      club = await prisma.clubProfile.create({
        data: {
          userId,
          handle: `club-${Date.now()}`, // Handle unique
          name: baseName,
          description: '',
          address: '',
          openingHours: '',
          isActive: false
        }
      })
    }

    // Construire les données à mettre à jour
    const dataToUpdate: any = {}
    if (typeof input.name === 'string') dataToUpdate.name = input.name
    if (typeof input.description === 'string') dataToUpdate.description = input.description
    if (typeof input.address === 'string') dataToUpdate.address = input.address
    if (typeof input.city === 'string') dataToUpdate.city = input.city
    if (typeof input.postalCode === 'string') dataToUpdate.postalCode = input.postalCode
    if (typeof input.country === 'string') dataToUpdate.country = input.country
    if (typeof input.openingHours === 'string') dataToUpdate.openingHours = input.openingHours
    if (typeof input.websiteUrl === 'string') dataToUpdate.websiteUrl = input.websiteUrl || null
    if (typeof input.email === 'string') dataToUpdate.email = input.email || null
    if (typeof input.phone === 'string') dataToUpdate.phone = input.phone
    if (typeof input.capacity === 'number') dataToUpdate.capacity = input.capacity
    if (Array.isArray(input.languages)) dataToUpdate.languages = input.languages
    if (Array.isArray(input.paymentMethods)) dataToUpdate.paymentMethods = input.paymentMethods
    if (Array.isArray(input.services)) dataToUpdate.services = input.services
    if (typeof input.avatarUrl === 'string') dataToUpdate.avatarUrl = input.avatarUrl || null
    if (typeof input.coverUrl === 'string') dataToUpdate.coverUrl = input.coverUrl || null
    if (typeof input.isActive === 'boolean') dataToUpdate.isActive = input.isActive

    console.log('🏢 Club update data:', JSON.stringify(dataToUpdate, null, 2))
    
    // Mettre à jour le club
    await prisma.clubProfile.update({
      where: { id: club.id },
      data: dataToUpdate
    })

    return NextResponse.json({ ok: true, message: 'Profil club mis à jour' })
    
  } catch (e: any) {
    console.error('❌ /api/clubs/profile/update error:', e.message)
    console.error('❌ Full error:', e)
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}