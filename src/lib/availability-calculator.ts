// Calculateur de disponibilité en temps réel basé sur l'agenda

export interface TimeSlot {
  start: string // "09:00"
  end: string   // "18:00"
}

export interface WeeklySchedule {
  weekday: number // 0=Lundi, 1=Mardi, etc.
  enabled: boolean // Champ normalisé (prend en charge enabled/available/isOpen)
  start?: string // "09:00" - directement dans l'objet
  end?: string   // "18:00" - directement dans l'objet
}

export interface PauseSchedule {
  start: string // "2025-01-15"
  end: string   // "2025-01-20"
}

export interface AbsenceSchedule {
  id: string
  start: string // "2025-01-15"
  end: string   // "2025-01-16"
}

export interface ScheduleData {
  weekly?: WeeklySchedule[]
  pause?: PauseSchedule | null
  absences?: AbsenceSchedule[]
}

type RawScheduleInput = string | ScheduleData | null | undefined

/**
 * Uniformise les données d'agenda quel que soit le format historique
 */
export function normalizeScheduleData(input: RawScheduleInput): ScheduleData | null {
  if (!input) return null

  let raw: any
  try {
    raw = typeof input === 'string' ? JSON.parse(input) : input
  } catch (error) {
    console.warn('[AVAILABILITY] Failed to parse schedule data', error)
    return null
  }

  const toBoolean = (value: any) => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value !== 0
    if (typeof value === 'string') {
      const lowered = value.toLowerCase().trim()
      if (['true', '1', 'yes', 'oui'].includes(lowered)) return true
      if (['false', '0', 'no', 'non', ''].includes(lowered)) return false
    }
    return Boolean(value)
  }

  const weekly: WeeklySchedule[] = Array.isArray(raw?.weekly)
    ? raw.weekly.map((entry: any, index: number) => {
        const weekdayRaw = entry?.weekday
        const weekday = Number.isInteger(weekdayRaw)
          ? weekdayRaw
          : Number.parseInt(weekdayRaw, 10)

        const timeSource = entry?.timeSlot || entry?.hours || entry
        const start = timeSource?.start ?? timeSource?.from ?? entry?.start ?? null
        const end = timeSource?.end ?? timeSource?.to ?? entry?.end ?? null

        const enabledValue = entry?.enabled ?? entry?.available ?? entry?.isAvailable ?? entry?.isOpen ?? entry?.open

        return {
          weekday: Number.isInteger(weekday) ? weekday : index,
          enabled: toBoolean(enabledValue),
          start: start != null ? String(start) : undefined,
          end: end != null ? String(end) : undefined
        }
      })
    : []

  const pause = raw?.pause?.start && raw?.pause?.end
    ? {
        start: String(raw.pause.start),
        end: String(raw.pause.end)
      }
    : null

  const absences: AbsenceSchedule[] = Array.isArray(raw?.absences)
    ? raw.absences
        .filter((absence: any) => absence?.start && absence?.end)
        .map((absence: any, idx: number) => ({
          id: String(absence.id ?? idx),
          start: String(absence.start),
          end: String(absence.end)
        }))
    : []

  return { weekly, pause, absences }
}

export interface AvailabilityStatus {
  isAvailable: boolean
  status: 'available' | 'unavailable' | 'paused' | 'absent'
  message: string
  nextAvailable?: {
    date: string
    time: string
    timestamp: number
  }
}

/**
 * Calcule la disponibilité actuelle d'une escorte basée sur son agenda
 */
export function calculateAvailability(
  timeSlots: string | ScheduleData | null,
  availableNow?: boolean
): AvailabilityStatus {
  const now = new Date()
  const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1 // Convertir Dimanche=0 vers notre format Lundi=0
  const currentTime = now.getHours() * 60 + now.getMinutes() // Minutes depuis minuit
  const currentDateStr = now.toISOString().split('T')[0] // "2025-01-15"

  console.log(`[AVAILABILITY] Input timeSlots:`, timeSlots)
  console.log(`[AVAILABILITY] Input availableNow:`, availableNow)
  console.log(`[AVAILABILITY] Current time: ${now.toISOString()}, Day: ${currentDay}, Time: ${currentTime}`)

  const scheduleData = normalizeScheduleData(timeSlots)

  // Fallback si pas d'agenda défini - plus permissif pour les tests
  if (!scheduleData) {
    console.log(`[AVAILABILITY] No timeSlots, using fallback - availableNow:`, availableNow)
    return {
      isAvailable: !!availableNow,
      status: availableNow ? 'available' : 'unavailable',
      message: availableNow ? 'Disponible maintenant' : 'Horaires non définis - merci de configurer votre agenda'
    }
  }

  console.log(`[AVAILABILITY] Parsed scheduleData:`, scheduleData)

  // 1. Vérifier si en pause générale
  if (scheduleData.pause) {
    const pauseStart = new Date(scheduleData.pause.start)
    const pauseEnd = new Date(scheduleData.pause.end)
    if (now >= pauseStart && now <= pauseEnd) {
      return {
        isAvailable: false,
        status: 'paused',
        message: `En pause jusqu'au ${pauseEnd.toLocaleDateString('fr-CH')}`,
        nextAvailable: {
          date: pauseEnd.toLocaleDateString('fr-CH'),
          time: '09:00',
          timestamp: pauseEnd.getTime()
        }
      }
    }
  }

  // 2. Vérifier les absences spécifiques
  if (scheduleData.absences) {
    for (const absence of scheduleData.absences) {
      const absenceStart = new Date(absence.start)
      const absenceEnd = new Date(absence.end)
      if (now >= absenceStart && now <= absenceEnd) {
        const nextDay = new Date(absenceEnd)
        nextDay.setDate(nextDay.getDate() + 1)

        return {
          isAvailable: false,
          status: 'absent',
          message: `Absente jusqu'au ${absenceEnd.toLocaleDateString('fr-CH')}`,
          nextAvailable: {
            date: nextDay.toLocaleDateString('fr-CH'),
            time: '09:00',
            timestamp: nextDay.getTime()
          }
        }
      }
    }
  }

  // 3. Vérifier le planning hebdomadaire
  console.log(`🚨🚨🚨 [PLANNING] scheduleData.weekly:`, scheduleData.weekly)
  console.log(`🚨🚨🚨 [PLANNING] currentDay (calculé):`, currentDay)
  console.log(`🚨🚨🚨 [PLANNING] Date complète:`, new Date().toLocaleDateString('fr-CH'), new Date().toLocaleString('fr-CH'))

  if (!scheduleData.weekly || !Array.isArray(scheduleData.weekly) || scheduleData.weekly.length === 0) {
    console.log(`🚨🚨🚨 [PLANNING] PAS DE PLANNING HEBDOMADAIRE - utilise availableNow:`, availableNow)
    return {
      isAvailable: !!availableNow,
      status: availableNow ? 'available' : 'unavailable',
      message: availableNow ? 'Disponible maintenant' : 'Planning non défini'
    }
  }

  const weekly = scheduleData.weekly
  const todaySchedule = weekly.find(day => day.weekday === currentDay)
  console.log(`🚨🚨🚨 [PLANNING] todaySchedule trouvé:`, todaySchedule)

  if (!todaySchedule || !todaySchedule.enabled) {
    console.log(`🚨🚨🚨 [PLANNING] PAS DE PLANNING AUJOURD'HUI ou enabled=false`)
    console.log(`🚨🚨🚨 [PLANNING] todaySchedule:`, todaySchedule)
    // Pas disponible aujourd'hui, chercher le prochain jour disponible
    const nextAvailable = findNextAvailableDay(weekly, currentDay)

    return {
      isAvailable: false,
      status: 'unavailable',
      message: 'Indisponible aujourd\'hui',
      nextAvailable
    }
  }

  // 4. Vérifier les heures de disponibilité (format dashboard direct)
  const startStr = todaySchedule.start
  const endStr = todaySchedule.end
  console.log(`🚨🚨🚨 [HORAIRES] todaySchedule.start:`, startStr, `todaySchedule.end:`, endStr)
  if (startStr && endStr) {
    let startTime = parseTime(startStr)
    let endTime = parseTime(endStr)
    console.log(`🚨🚨🚨 [HORAIRES] startTime:`, startTime, `endTime:`, endTime, `currentTime:`, currentTime)

    // Support des horaires qui dépassent minuit (ex: 20:00 - 02:00)
    if (endTime <= startTime) {
      const inSameDayRange = currentTime >= startTime
      const inAfterMidnightRange = currentTime < endTime

      if (inSameDayRange || inAfterMidnightRange) {
        return {
          isAvailable: true,
          status: 'available',
          message: `Disponible jusqu'à ${endStr}`
        }
      }

      if (currentTime < startTime) {
        return {
          isAvailable: false,
          status: 'unavailable',
          message: `Disponible dès ${startStr}`
        }
      }

      const nextAvailable = findNextAvailableDay(weekly, currentDay)

      return {
        isAvailable: false,
        status: 'unavailable',
        message: 'Fermé pour aujourd\'hui',
        nextAvailable
      }
    }

    if (currentTime >= startTime && currentTime <= endTime) {
      return {
        isAvailable: true,
        status: 'available',
        message: `Disponible jusqu'à ${endStr}`
      }
    } else if (currentTime < startTime) {
      return {
        isAvailable: false,
        status: 'unavailable',
        message: `Disponible dès ${startStr}`
      }
    } else {
      // Après les heures, chercher la prochaine disponibilité
      const nextAvailable = findNextAvailableDay(weekly, currentDay)

      return {
        isAvailable: false,
        status: 'unavailable',
        message: 'Fermé pour aujourd\'hui',
        nextAvailable
      }
    }
  }

  // Disponible toute la journée
  return {
    isAvailable: true,
    status: 'available',
    message: 'Disponible toute la journée'
  }
}

/**
 * Parse une heure au format "HH:MM" en minutes depuis minuit
 */
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Trouve le prochain jour disponible dans la semaine
 */
function findNextAvailableDay(
  weekly: WeeklySchedule[],
  currentDay: number
): { date: string; time: string; timestamp: number } | undefined {
  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

  // Chercher dans les 7 prochains jours
  for (let i = 1; i <= 7; i++) {
    const checkDay = (currentDay + i) % 7
    const daySchedule = weekly.find(day => day.weekday === checkDay)

    if (daySchedule?.enabled) {
      const nextDate = new Date()
      nextDate.setDate(nextDate.getDate() + i)

      const time = daySchedule.start || '09:00'

      return {
        date: nextDate.toLocaleDateString('fr-CH'),
        time,
        timestamp: nextDate.getTime()
      }
    }
  }

  return undefined
}

/**
 * Formatage des statuts pour l'affichage
 */
export function formatAvailabilityDisplay(status: AvailabilityStatus) {
  const baseClasses = "px-3 py-1.5 rounded-full text-xs font-medium transition-all"

  switch (status.status) {
    case 'available':
      return {
        className: `${baseClasses} bg-green-500/20 border border-green-500/30 text-green-300`,
        icon: '🟢',
        text: status.message
      }

    case 'unavailable':
      return {
        className: `${baseClasses} bg-red-500/20 border border-red-500/30 text-red-300`,
        icon: '🔴',
        text: status.message
      }

    case 'paused':
      return {
        className: `${baseClasses} bg-orange-500/20 border border-orange-500/30 text-orange-300`,
        icon: '⏸️',
        text: status.message
      }

    case 'absent':
      return {
        className: `${baseClasses} bg-gray-500/20 border border-gray-500/30 text-gray-300`,
        icon: '📅',
        text: status.message
      }

    default:
      return {
        className: `${baseClasses} bg-gray-500/20 border border-gray-500/30 text-gray-300`,
        icon: '❓',
        text: 'Statut inconnu'
      }
  }
}
