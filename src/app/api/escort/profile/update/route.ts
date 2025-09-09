import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// POST /api/escort/profile/update
// Body: subset of fields { description?, city?, canton?, coordinates?: { lat, lng }, address?, phone?, languages?, services?, rates? }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const Schema = z.object({
      // Basics
      stageName: z.string().max(100).optional(),
      age: z.number().optional(),
      description: z.string().max(5000).optional(),
      city: z.string().max(100).optional(),
      canton: z.string().max(100).optional(),
      address: z.string().max(200).optional(),
      coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      // Arrays (JSON strings client-side)
      languages: z.string().optional(),
      services: z.string().optional(),
      practices: z.string().optional(),
      // Toggles
      incall: z.boolean().optional(),
      outcall: z.boolean().optional(),
      // Rates
      rate1H: z.number().optional(),
      rate2H: z.number().optional(),
      rateOvernight: z.number().optional(),
      // Physical
      height: z.number().optional(),
      bodyType: z.string().optional(),
      hairColor: z.string().optional(),
      eyeColor: z.string().optional(),
      ethnicity: z.string().optional(),
      bustSize: z.string().optional(),
      tattoos: z.string().optional(),
      piercings: z.string().optional(),
      // Agenda
      timeSlots: z.any().optional(),
      // Contact
      phone: z.string().optional(),
      phoneVisibility: z.enum(['visible', 'hidden', 'none']).optional(),
      // Préférences physiques
      breastType: z.enum(['naturelle', 'siliconee']).optional(),
      pubicHair: z.enum(['naturel', 'rase', 'partiel']).optional(),
      smoker: z.boolean().optional(),
      // Préférences clients
      acceptsCouples: z.boolean().optional(),
      acceptsWomen: z.boolean().optional(),
      acceptsHandicapped: z.boolean().optional(),
      acceptsSeniors: z.boolean().optional(),
    })
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'invalid_payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const input = parsed.data

    // Ensure profile exists
    const existing = await prisma.escortProfile.findUnique({ where: { userId }, select: { id: true } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'profile_not_found' }, { status: 200 })
    }

    const data: any = {}
    if (typeof input.stageName === 'string') data.stageName = input.stageName
    // Persist age as dateOfBirth approximation (year-based)
    if (typeof input.age === 'number' && isFinite(input.age)) {
      const a = Math.round(input.age)
      if (a >= 18 && a <= 80) {
        const today = new Date()
        const dobYear = today.getFullYear() - a
        // Choose mid-year to avoid birthday off-by-one
        const dob = new Date(dobYear, 5, 15)
        data.dateOfBirth = dob
      }
    }
    if (typeof input.description === 'string') data.description = input.description
    if (typeof input.city === 'string' && input.city.trim()) data.city = input.city.trim()
    if (typeof input.canton === 'string' && input.canton.trim()) data.canton = input.canton.trim()
    if (input.coordinates && typeof input.coordinates.lat === 'number' && typeof input.coordinates.lng === 'number') {
      data.latitude = input.coordinates.lat
      data.longitude = input.coordinates.lng
    }
    if (typeof input.latitude === 'number' && typeof input.longitude === 'number') {
      data.latitude = input.latitude
      data.longitude = input.longitude
    }
    // Optional: map address to workingArea for now
    if (typeof input.address === 'string' && input.address.trim()) {
      data.workingArea = input.address.trim()
    }
    // JSON fields
    if (typeof input.languages === 'string') data.languages = input.languages
    if (typeof input.services === 'string') data.services = input.services
    if (typeof input.practices === 'string') data.practices = input.practices
    // toggles
    if (typeof input.incall === 'boolean') data.incall = input.incall
    if (typeof input.outcall === 'boolean') data.outcall = input.outcall
    // rates
    if (typeof input.rate1H === 'number') data.rate1H = input.rate1H
    if (typeof input.rate2H === 'number') data.rate2H = input.rate2H
    if (typeof input.rateOvernight === 'number') data.rateOvernight = input.rateOvernight
    // physical
    if (typeof input.height === 'number') data.height = input.height
    if (typeof input.bodyType === 'string') data.bodyType = input.bodyType
    if (typeof input.hairColor === 'string') data.hairColor = input.hairColor
    if (typeof input.eyeColor === 'string') data.eyeColor = input.eyeColor
    if (typeof input.ethnicity === 'string') data.ethnicity = input.ethnicity
    if (typeof input.bustSize === 'string') data.bustSize = input.bustSize
    if (typeof input.tattoos === 'string') data.tattoos = input.tattoos
    if (typeof input.piercings === 'string') data.piercings = input.piercings
    if (input.timeSlots !== undefined) data.timeSlots = typeof input.timeSlots === 'string' ? input.timeSlots : JSON.stringify(input.timeSlots)
    // Contact - Le téléphone est mis à jour dans la table User, pas EscortProfile
    if (typeof input.phone === 'string') {
      await prisma.user.update({ 
        where: { id: userId }, 
        data: { phone: input.phone } 
      })
    }
    if (input.phoneVisibility) data.phoneVisibility = input.phoneVisibility
    // Préférences physiques
    if (input.breastType) data.breastType = input.breastType
    if (input.pubicHair) data.pubicHair = input.pubicHair
    if (typeof input.smoker === 'boolean') data.smoker = input.smoker
    // Préférences clients
    if (typeof input.acceptsCouples === 'boolean') data.acceptsCouples = input.acceptsCouples
    if (typeof input.acceptsWomen === 'boolean') data.acceptsWomen = input.acceptsWomen
    if (typeof input.acceptsHandicapped === 'boolean') data.acceptsHandicapped = input.acceptsHandicapped
    if (typeof input.acceptsSeniors === 'boolean') data.acceptsSeniors = input.acceptsSeniors

    // Persist minimal update
    await prisma.escortProfile.update({ where: { userId }, data })

    return NextResponse.json({ success: true, message: 'Modifications enregistrées' })
  } catch (e:any) {
    console.error('/api/escort/profile/update error:', e.message)
    return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 })
  }
}
