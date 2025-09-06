export interface ValidationResult {
  isComplete: boolean
  percentage: number
  missing: string[]
  canActivate: boolean
}

export interface ProfileData {
  stageName?: string
  bio?: string
  age?: number
  height?: number
  weight?: number
  hairColor?: string
  eyeColor?: string
  nationality?: string
  languages?: string[]
  services?: string[]
  rates?: Record<string, number>
  availability?: string[]
  address?: string
  phone?: string
  email?: string
  photos?: any[]
}

const REQUIRED_FIELDS = [
  { field: 'stageName', label: 'Nom de scène', weight: 15 },
  { field: 'bio', label: 'Description', weight: 15, minLength: 50 },
  { field: 'age', label: 'Âge', weight: 10 },
  { field: 'nationality', label: 'Nationalité', weight: 10 },
  { field: 'languages', label: 'Langues parlées', weight: 10 },
  { field: 'services', label: 'Services proposés', weight: 15 },
  { field: 'rates', label: 'Tarifs', weight: 15 },
  { field: 'phone', label: 'Numéro de téléphone', weight: 5 },
  { field: 'photos', label: 'Photos de profil', weight: 5, minCount: 3 }
]

export function validateProfile(data: ProfileData): ValidationResult {
  const missing: string[] = []
  let totalWeight = 0
  let completedWeight = 0

  REQUIRED_FIELDS.forEach(({ field, label, weight, minLength, minCount }) => {
    totalWeight += weight
    const value = data[field as keyof ProfileData]

    if (!value || (Array.isArray(value) && value.length === 0)) {
      missing.push(label)
    } else if (minLength && typeof value === 'string' && value.length < minLength) {
      missing.push(`${label} (minimum ${minLength} caractères)`)
    } else if (minCount && Array.isArray(value) && value.length < minCount) {
      missing.push(`${label} (minimum ${minCount} éléments)`)
    } else {
      completedWeight += weight
    }
  })

  const percentage = Math.round((completedWeight / totalWeight) * 100)
  const isComplete = missing.length === 0
  const canActivate = percentage >= 80 // Permet l'activation à 80%

  return {
    isComplete,
    percentage,
    missing,
    canActivate
  }
}

export const PROFILE_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  VERIFIED: 'VERIFIED',
  SUSPENDED: 'SUSPENDED'
} as const

export type ProfileStatus = keyof typeof PROFILE_STATUS

// Server-side helper used by /api/escort/profile/status
// Takes a raw escortProfile row (Prisma) and computes completion
export function checkProfileCompletion(escortProfile: any) {
  try {
    const missing: string[] = []
    let score = 0
    let total = 100

    // Basic fields
    if (escortProfile?.stageName) score += 10; else missing.push('Nom d\'artiste')
    if (escortProfile?.description && escortProfile.description.length >= 50) score += 15; else missing.push('Description (≥ 50 car.)')
    if (escortProfile?.city) score += 5; else missing.push('Ville principale')
    if (escortProfile?.canton) score += 5; else missing.push('Canton')

    // Languages/services are stored as strings (JSON)
    const langs = safeParseArray(escortProfile?.languages)
    if (langs.length > 0) score += 10; else missing.push('Langues')

    const services = safeParseArray(escortProfile?.services)
    if (services.length > 0) score += 10; else missing.push('Catégorie/Services')

    // Media hints if present in counters
    const photosCount = Number(escortProfile?.photosCount || 0)
    const videosCount = Number(escortProfile?.videosCount || 0)
    const hasProfilePhoto = Boolean(escortProfile?.hasProfilePhoto)
    if (hasProfilePhoto) score += 10; else missing.push('Photo de profil')
    if (photosCount >= 3) score += 10; else missing.push('≥ 3 photos')
    if (videosCount >= 1) score += 10; else missing.push('≥ 1 vidéo')

    // Rates (at least 1h)
    if (escortProfile?.rate1H) score += 10; else missing.push('Tarif 1h')

    // Disponibilités: optionnel (ne bloque pas la complétion)
    // On n'ajoute pas de manquant si aucun créneau n'est défini

    const percentage = Math.max(0, Math.min(100, Math.round(score)))
    const isComplete = missing.length === 0

    return {
      isComplete,
      percentage,
      missing,
      missingRequirements: missing,
      photosCount,
      videosCount,
      hasProfilePhoto
    }
  } catch {
    return {
      isComplete: false,
      percentage: 0,
      missing: ['Profil incomplet'],
      missingRequirements: ['Profil incomplet'],
      photosCount: 0,
      videosCount: 0,
      hasProfilePhoto: false
    }
  }
}

function safeParseArray(input: any): any[] {
  try {
    if (!input) return []
    if (Array.isArray(input)) return input
    const parsed = JSON.parse(String(input))
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function safeParseObject(input: any): any {
  try {
    if (!input) return null
    if (typeof input === 'object') return input
    return JSON.parse(String(input))
  } catch { return null }
}
