import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * API UNIFIÉE PROFIL - Dashboard ET Modal
 *
 * IMPORTANT: Cette API NE GÈRE PAS les médias (galleryPhotos, videos, profilePhoto)
 * Les médias restent sur leurs APIs dédiées pour éviter la complexité.
 *
 * Usage:
 * - Dashboard: GET /api/profile/unified/me
 * - Modal: GET /api/profile/unified/[publicId]
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    console.log('🔄 [API UNIFIED PROFILE] Called with ID:', id)

    // Mode dashboard (profil privé de l'utilisateur connecté)
    if (id === 'me') {
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
      }

      // Récupérer le profil escort de l'utilisateur connecté
      const profile = await prisma.escortProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          // Identité de base
          id: true,
          userId: true,
          stageName: true,
          description: true,
          dateOfBirth: true,

          // Localisation
          city: true,
          canton: true,
          latitude: true,
          longitude: true,
          workingArea: true, // Adresse legacy

          // Contact
          phoneVisibility: true,

          // Langues et services
          languages: true,
          services: true,
          practices: true,

          // Tarifs
          rate1H: true,
          rate2H: true,
          rateOvernight: true,
          currency: true,

          // Physique
          height: true,
          bodyType: true,
          hairColor: true,
          eyeColor: true,
          ethnicity: true,
          bustSize: true,
          breastType: true,
          tattoos: true,
          piercings: true,
          pubicHair: true,
          smoker: true,

          // Services et clientèle
          outcall: true,
          incall: true,
          acceptsCouples: true,
          acceptsWomen: true,
          acceptsHandicapped: true,
          acceptsSeniors: true,

          // Nouveaux champs ajoutés
          paymentMethods: true,
          venueOptions: true,
          acceptedCurrencies: true,

          // Agenda
          timeSlots: true,
          availableNow: true,
          weekendAvailable: true,

          // Méta
          status: true,
          createdAt: true,
          updatedAt: true,

          // User data
          user: {
            select: {
              email: true,
              phone: true,
              name: true
            }
          }
        }
      })

      if (!profile) {
        return NextResponse.json({ error: 'profile_not_found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        mode: 'dashboard',
        profile: transformProfileData(profile, 'dashboard')
      })
    }

    // Mode modal (profil public)
    else {
      const profile = await prisma.escortProfile.findUnique({
        where: { id },
        select: {
          // Identité publique
          id: true,
          stageName: true,
          description: true,
          dateOfBirth: true,

          // Localisation publique
          city: true,
          canton: true,

          // Langues et services publics
          languages: true,
          services: true,
          practices: true,

          // Tarifs publics
          rate1H: true,
          rate2H: true,
          rateOvernight: true,
          currency: true,

          // Physique public
          height: true,
          bodyType: true,
          hairColor: true,
          eyeColor: true,
          ethnicity: true,
          bustSize: true,
          breastType: true,
          tattoos: true,
          piercings: true,
          pubicHair: true,
          smoker: true,

          // Services publics
          outcall: true,
          incall: true,
          acceptsCouples: true,
          acceptsWomen: true,
          acceptsHandicapped: true,
          acceptsSeniors: true,

          // Options publiques
          paymentMethods: true,
          venueOptions: true,
          acceptedCurrencies: true,

          // Disponibilité publique
          availableNow: true,
          weekendAvailable: true,

          // Statut
          status: true,
          updatedAt: true,
        }
      })

      if (!profile || profile.status !== 'ACTIVE') {
        return NextResponse.json({ error: 'profile_not_found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        mode: 'public',
        profile: transformProfileData(profile, 'public')
      })
    }

  } catch (error) {
    console.error('❌ [API UNIFIED PROFILE] Error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

/**
 * Transforme les données brutes de la BDD en format unifié
 * Centralise toute la logique de transformation (âge, parsing, etc.)
 */
function transformProfileData(rawProfile: any, mode: 'dashboard' | 'public') {
  // Calcul précis de l'âge (logique centralisée)
  const age = (() => {
    try {
      if (!rawProfile.dateOfBirth) return undefined
      const today = new Date()
      const birthDate = new Date(rawProfile.dateOfBirth)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    } catch {
      return undefined
    }
  })()

  // Parse des langues (logique centralisée)
  const languages = (() => {
    try {
      const raw = String(rawProfile.languages || '')
      if (!raw) return []
      if (raw.trim().startsWith('[')) {
        const L = JSON.parse(raw)
        return Array.isArray(L) ? L : []
      }
      return raw.split(',').map((x: string) => x.trim()).filter(Boolean)
    } catch {
      return []
    }
  })()

  // Parse des services (logique centralisée)
  const services = (() => {
    try {
      const raw = String(rawProfile.services || '')
      if (!raw) return []
      if (raw.trim().startsWith('[')) {
        const S = JSON.parse(raw)
        return Array.isArray(S) ? S : []
      }
      return raw.split(',').map((x: string) => x.trim()).filter(Boolean)
    } catch {
      return []
    }
  })()

  // Parse des pratiques
  const practices = (() => {
    try {
      const raw = String(rawProfile.practices || '')
      if (!raw) return []
      if (raw.trim().startsWith('[')) {
        const P = JSON.parse(raw)
        return Array.isArray(P) ? P : []
      }
      return raw.split(',').map((x: string) => x.trim()).filter(Boolean)
    } catch {
      return []
    }
  })()

  // Parse des nouvelles options
  const paymentMethods = parseStringArray(rawProfile.paymentMethods)
  const venueOptions = parseStringArray(rawProfile.venueOptions)
  const acceptedCurrencies = parseStringArray(rawProfile.acceptedCurrencies)

  // Données communes
  const commonData = {
    id: rawProfile.id,
    stageName: rawProfile.stageName || '',
    description: rawProfile.description || '',
    age,

    // Localisation
    city: rawProfile.city || '',
    canton: rawProfile.canton || '',

    // Langues et services
    languages,
    services,
    practices,

    // Tarifs
    rates: {
      oneHour: rawProfile.rate1H || undefined,
      twoHours: rawProfile.rate2H || undefined,
      overnight: rawProfile.rateOvernight || undefined,
      currency: rawProfile.currency || 'CHF'
    },

    // Physique
    physical: {
      height: rawProfile.height || undefined,
      bodyType: rawProfile.bodyType || undefined,
      hairColor: rawProfile.hairColor || undefined,
      eyeColor: rawProfile.eyeColor || undefined,
      ethnicity: rawProfile.ethnicity || undefined,
      bustSize: rawProfile.bustSize || undefined,
      breastType: rawProfile.breastType || undefined,
      tattoos: rawProfile.tattoos === 'true' ? true : (rawProfile.tattoos === 'false' ? false : undefined),
      piercings: rawProfile.piercings === 'true' ? true : (rawProfile.piercings === 'false' ? false : undefined),
      pubicHair: rawProfile.pubicHair || undefined,
      smoker: rawProfile.smoker || undefined
    },

    // Services
    availability: {
      outcall: !!rawProfile.outcall,
      incall: !!rawProfile.incall,
      availableNow: !!rawProfile.availableNow,
      weekendAvailable: !!rawProfile.weekendAvailable
    },

    // Clientèle
    clientele: {
      acceptsCouples: !!rawProfile.acceptsCouples,
      acceptsWomen: !!rawProfile.acceptsWomen,
      acceptsHandicapped: !!rawProfile.acceptsHandicapped,
      acceptsSeniors: !!rawProfile.acceptsSeniors
    },

    // Options nouvelles
    options: {
      paymentMethods,
      venueOptions,
      acceptedCurrencies
    },

    updatedAt: rawProfile.updatedAt
  }

  // Données spécifiques au mode dashboard
  if (mode === 'dashboard') {
    return {
      ...commonData,
      userId: rawProfile.userId,
      address: rawProfile.workingArea || '', // Legacy
      coordinates: rawProfile.latitude && rawProfile.longitude ? {
        lat: rawProfile.latitude,
        lng: rawProfile.longitude
      } : undefined,
      phoneVisibility: rawProfile.phoneVisibility || 'hidden',
      status: rawProfile.status,
      user: rawProfile.user,
      createdAt: rawProfile.createdAt
    }
  }

  // Données publiques pour le modal
  return commonData
}

/**
 * Helper pour parser les arrays JSON ou CSV
 */
function parseStringArray(value: any): string[] {
  try {
    if (!value) return []
    const str = String(value)
    if (str.trim().startsWith('[')) {
      const parsed = JSON.parse(str)
      return Array.isArray(parsed) ? parsed : []
    }
    return str.split(',').map((x: string) => x.trim()).filter(Boolean)
  } catch {
    return []
  }
}