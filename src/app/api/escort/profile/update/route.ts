import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// POST /api/escort/profile/update
// Body: subset of fields { description?, city?, canton?, coordinates?: { lat, lng }, address?, phone?, languages?, services?, rates? }
export async function POST(req: NextRequest) {
  let body: any = {}
  let input: any = {}
  let dataToSave: Record<string, any> = {}

  try {
    console.log('🔍 [API PROFILE UPDATE] Starting request...')
    const session = await getServerSession(authOptions)
    console.log('🔍 [API PROFILE UPDATE] Session:', session ? 'found' : 'null', session?.user?.id)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) {
      console.log('❌ [API PROFILE UPDATE] No userId, session:', JSON.stringify(session))
      return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })
    }

    body = await req.json().catch(() => ({}))
    console.log('🔍 [API PROFILE UPDATE] Request body keys:', Object.keys(body))
    const Schema = z.object({
      // Basics
      stageName: z.string().max(100).optional(),
      age: z.coerce.number().optional(),
      description: z.string().max(5000).optional(),
      city: z.string().max(100).optional(),
      canton: z.string().max(100).optional(),
      address: z.string().max(200).optional(),
      coordinates: z.object({ lat: z.coerce.number(), lng: z.coerce.number() }).optional(),
      latitude: z.coerce.number().optional(),
      longitude: z.coerce.number().optional(),
      // Arrays (JSON strings client-side)
      languages: z.union([z.string(), z.array(z.string())]).optional(),
      services: z.union([z.string(), z.array(z.string())]).optional(),
      practices: z.union([z.string(), z.array(z.string())]).optional(),
      // Toggles
      incall: z.coerce.boolean().optional(),
      outcall: z.coerce.boolean().optional(),
      // Rates
      rate1H: z.coerce.number().optional(),
      rate2H: z.coerce.number().optional(),
      rateOvernight: z.coerce.number().optional(),
      // Physical
      height: z.coerce.number().optional(),
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
      smoker: z.coerce.boolean().optional(),
      // Préférences clients
      acceptsCouples: z.coerce.boolean().optional(),
      acceptsWomen: z.coerce.boolean().optional(),
      acceptsHandicapped: z.coerce.boolean().optional(),
      acceptsSeniors: z.coerce.boolean().optional(),
    })
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'invalid_payload', details: parsed.error.flatten() }, { status: 400 })
    }
    input = parsed.data

    // Ensure profile exists
    let existing = await prisma.escortProfile.findUnique({ where: { userId }, select: { id: true } })
    if (!existing) {
      // Créer un profil minimal si absent pour permettre la 1ère sauvegarde
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } })
      const baseName = (user?.name?.split(' ')?.[0] || 'Escort').toString()
      const today = new Date()
      const dob = new Date(today.getFullYear() - 30, 0, 1) // âge par défaut ~30
      const created = await prisma.escortProfile.create({
        data: {
          userId,
          firstName: baseName,
          stageName: baseName,
          dateOfBirth: dob,
          nationality: 'CH',
          // Champs requis non nuls avec valeurs par défaut
          languages: '',
          city: '',
          workingArea: '',
          description: '',
          services: '',
          rates: '',
          availability: '',
          galleryPhotos: '[]',
          videos: '[]',
        }
      })
      existing = { id: created.id }
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
    // Optional: workingArea (legacy)
    if (typeof input.address === 'string' && input.address.trim()) {
      data.workingArea = input.address.trim()
    }
    
    // Helper functions according to patch pack
    function toCsv(v: any) {
      return Array.isArray(v) ? v.map((x:string)=>String(x).trim()).filter(Boolean).join(', ') : (typeof v === 'string' ? v.trim() : '')
    }
    
    function parseAddress(address?: string) {
      if (!address) return {}
      // "rue numero, codePostal ville" → parse components
      const m = address.match(/^(.*?)[,\s]+(\d{4,5})\s+(.+)$/)
      if (!m) return {}
      return { rue: m[1]?.trim(), codePostal: m[2], ville: m[3]?.trim() }
    }
    
    // Parse address components
    const addressParts = parseAddress(input.address)
    
    // Data mapping according to patch pack - dual city/ville support
    dataToSave = {}

    // City/Ville mapping without forcing nulls
    const maybeVille = (typeof input.city === 'string' && input.city.trim())
      ? input.city.trim()
      : (addressParts.ville || undefined)
    if (maybeVille) {
      dataToSave.ville = maybeVille
      // Legacy mirror for compatibility
      dataToSave.city = maybeVille
    }
    // workingArea legacy only if provided
    if (typeof input.address === 'string' && input.address.trim()) {
      dataToSave.workingArea = input.address.trim()
    }
    // Address components (optional fields)
    if (addressParts.rue) dataToSave.rue = addressParts.rue
    if (addressParts.codePostal) dataToSave.codePostal = addressParts.codePostal
    if (addressParts.ville) dataToSave.ville = addressParts.ville
    if (typeof (input as any).numero === 'string' && (input as any).numero.trim()) dataToSave.numero = (input as any).numero.trim()

    // Lists → CSV only if provided and not empty
    if (typeof input.languages !== 'undefined') {
      const csv = toCsv(input.languages)
      if (csv) dataToSave.languages = csv
    }
    if (typeof input.services !== 'undefined') {
      const csv = toCsv(input.services)
      // Ne pas sauvegarder une chaîne vide pour les services
      if (csv && csv.length > 0) dataToSave.services = csv
    }
    if (typeof input.practices !== 'undefined') {
      const csv = toCsv(input.practices)
      if (csv) dataToSave.practices = csv
    }
    
    // Add other fields to dataToSave
    if (typeof input.stageName === 'string') dataToSave.stageName = input.stageName
    if (typeof input.description === 'string') dataToSave.description = input.description
    if (typeof input.canton === 'string' && input.canton.trim()) dataToSave.canton = input.canton.trim()
    
    // Age handling
    if (typeof input.age === 'number' && isFinite(input.age)) {
      const a = Math.round(input.age)
      if (a >= 18 && a <= 80) {
        const today = new Date()
        const dobYear = today.getFullYear() - a
        const dob = new Date(dobYear, 5, 15)
        dataToSave.dateOfBirth = dob
      }
    }
    
    // Coordinates
    if (input.coordinates && typeof input.coordinates.lat === 'number' && typeof input.coordinates.lng === 'number') {
      dataToSave.latitude = input.coordinates.lat
      dataToSave.longitude = input.coordinates.lng
    }
    if (typeof input.latitude === 'number' && typeof input.longitude === 'number') {
      dataToSave.latitude = input.latitude
      dataToSave.longitude = input.longitude
    }
    
    // Toggles, rates, physical attributes  
    if (typeof input.incall === 'boolean') dataToSave.incall = input.incall
    if (typeof input.outcall === 'boolean') dataToSave.outcall = input.outcall
    if (typeof input.rate1H === 'number') dataToSave.rate1H = input.rate1H
    if (typeof input.rate2H === 'number') dataToSave.rate2H = input.rate2H
    if (typeof input.rateOvernight === 'number') dataToSave.rateOvernight = input.rateOvernight
    if (typeof input.height === 'number') dataToSave.height = input.height
    if (typeof input.bodyType === 'string') dataToSave.bodyType = input.bodyType
    if (typeof input.hairColor === 'string') dataToSave.hairColor = input.hairColor
    if (typeof input.eyeColor === 'string') dataToSave.eyeColor = input.eyeColor
    if (typeof input.ethnicity === 'string') dataToSave.ethnicity = input.ethnicity
    if (typeof input.bustSize === 'string') dataToSave.bustSize = input.bustSize
    if (typeof input.tattoos === 'string') dataToSave.tattoos = input.tattoos
    if (typeof input.piercings === 'string') dataToSave.piercings = input.piercings
    if (input.timeSlots !== undefined) {
      // Assurer que c'est une string pour Prisma
      dataToSave.timeSlots = typeof input.timeSlots === 'string' ? input.timeSlots : JSON.stringify(input.timeSlots)
      console.log('🔧 [AGENDA FIX] Type:', typeof input.timeSlots, 'Value:', input.timeSlots)
      console.log('🔧 [AGENDA FIX] Saving to DB:', dataToSave.timeSlots)
    }
    if (input.phoneVisibility) dataToSave.phoneVisibility = input.phoneVisibility
    if (input.breastType) dataToSave.breastType = input.breastType
    if (input.pubicHair) dataToSave.pubicHair = input.pubicHair
    if (typeof input.smoker === 'boolean') dataToSave.smoker = input.smoker
    if (typeof input.acceptsCouples === 'boolean') dataToSave.acceptsCouples = input.acceptsCouples
    if (typeof input.acceptsWomen === 'boolean') dataToSave.acceptsWomen = input.acceptsWomen
    if (typeof input.acceptsHandicapped === 'boolean') dataToSave.acceptsHandicapped = input.acceptsHandicapped
    if (typeof input.acceptsSeniors === 'boolean') dataToSave.acceptsSeniors = input.acceptsSeniors

    // Handle media updates (galleryPhotos, profilePhoto, videos)
    if (input.galleryPhotos !== undefined) {
      // Assurer que c'est une string pour Prisma
      dataToSave.galleryPhotos = typeof input.galleryPhotos === 'string' ? input.galleryPhotos : JSON.stringify(input.galleryPhotos)
      console.log('🔧 [MEDIA FIX] Gallery Type:', typeof input.galleryPhotos, 'Value:', input.galleryPhotos)
      console.log('🔧 [MEDIA FIX] Saving gallery to DB:', dataToSave.galleryPhotos)
    }
    if (input.profilePhoto !== undefined) {
      dataToSave.profilePhoto = typeof input.profilePhoto === 'string' ? input.profilePhoto : null
      console.log('🔧 [MEDIA FIX] Profile photo:', dataToSave.profilePhoto)
    }
    if (input.videos !== undefined) {
      // Assurer que c'est une string pour Prisma
      dataToSave.videos = typeof input.videos === 'string' ? input.videos : JSON.stringify(input.videos)
      console.log('🔧 [MEDIA FIX] Videos Type:', typeof input.videos, 'Value:', input.videos)
      console.log('🔧 [MEDIA FIX] Saving videos to DB:', dataToSave.videos)
    }

    // Update phone in User table separately
    if (typeof input.phone === 'string') {
      await prisma.user.update({ 
        where: { id: userId }, 
        data: { phone: input.phone } 
      })
    }

    // Debug logging
    console.log('🔧 Profile update data:', JSON.stringify(dataToSave, null, 2))

    // Persist unified update
    console.log('🔍 [API PROFILE UPDATE] About to update profile for userId:', userId)
    await prisma.escortProfile.update({ where: { userId }, data: dataToSave })
    console.log('✅ [API PROFILE UPDATE] Profile updated successfully')

    return NextResponse.json({ success: true, message: 'Modifications enregistrées' })
  } catch (e:any) {
    console.error('❌ /api/escort/profile/update error:', e.message)
    console.error('❌ Full error:', e)
    console.error('❌ Request body was:', body)
    console.error('❌ Parsed input was:', input)
    console.error('❌ Data to save was:', dataToSave)
    return NextResponse.json({
      success: false,
      error: 'server_error',
      details: e.message,
      debugInfo: process.env.NODE_ENV === 'development' ? { body, input, dataToSave } : undefined
    }, { status: 500 })
  }
}
