// Calculateur de disponibilité en temps réel basé sur l'agenda

export interface TimeSlot {
  start: string // "09:00"
  end: string   // "18:00"
}

export interface WeeklySchedule {
  weekday: number // 0=Lundi, 1=Mardi, etc.
  available: boolean
  timeSlot?: TimeSlot
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

  // Fallback si pas d'agenda défini
  if (!timeSlots) {
    return {
      isAvailable: !!availableNow,
      status: availableNow ? 'available' : 'unavailable',
      message: availableNow ? 'Disponible maintenant' : 'Horaires non définis'
    }
  }

  // Parser les données d'agenda
  let scheduleData: ScheduleData
  try {
    scheduleData = typeof timeSlots === 'string' ? JSON.parse(timeSlots) : timeSlots
  } catch {
    return {
      isAvailable: !!availableNow,
      status: availableNow ? 'available' : 'unavailable',
      message: availableNow ? 'Disponible maintenant' : 'Agenda invalide'
    }
  }

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
  if (!scheduleData.weekly || !Array.isArray(scheduleData.weekly)) {
    return {
      isAvailable: !!availableNow,
      status: availableNow ? 'available' : 'unavailable',
      message: availableNow ? 'Disponible maintenant' : 'Planning non défini'
    }
  }

  const todaySchedule = scheduleData.weekly.find(day => day.weekday === currentDay)

  if (!todaySchedule || !todaySchedule.available) {
    // Pas disponible aujourd'hui, chercher le prochain jour disponible
    const nextAvailable = findNextAvailableDay(scheduleData.weekly, currentDay)

    return {
      isAvailable: false,
      status: 'unavailable',
      message: 'Indisponible aujourd\'hui',
      nextAvailable
    }
  }

  // 4. Vérifier les heures de disponibilité
  if (todaySchedule.timeSlot) {
    const startTime = parseTime(todaySchedule.timeSlot.start)
    const endTime = parseTime(todaySchedule.timeSlot.end)

    if (currentTime >= startTime && currentTime <= endTime) {
      return {
        isAvailable: true,
        status: 'available',
        message: `Disponible jusqu'à ${todaySchedule.timeSlot.end}`
      }
    } else if (currentTime < startTime) {
      return {
        isAvailable: false,
        status: 'unavailable',
        message: `Disponible dès ${todaySchedule.timeSlot.start}`
      }
    } else {
      // Après les heures, chercher la prochaine disponibilité
      const nextAvailable = findNextAvailableDay(scheduleData.weekly, currentDay)

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

    if (daySchedule?.available) {
      const nextDate = new Date()
      nextDate.setDate(nextDate.getDate() + i)

      const time = daySchedule.timeSlot?.start || '09:00'

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