/**
 * Vérifie si un club est ouvert maintenant en fonction de ses horaires
 */
export function isClubOpenNow(openingHours: string | null, isOpen24_7: boolean): boolean {
  // Si ouvert 24/7
  if (isOpen24_7) return true

  // Si pas d'horaires définis, on considère fermé
  if (!openingHours) return false

  try {
    const schedule = JSON.parse(openingHours)
    const now = new Date()
    const currentDay = now.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase()
    const currentTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })

    console.log('🕐 [isClubOpenNow] Current day:', currentDay, '| Current time:', currentTime)
    console.log('🕐 [isClubOpenNow] Schedule:', JSON.stringify(schedule, null, 2))

    const daySchedule = schedule[currentDay]
    console.log('🕐 [isClubOpenNow] Today schedule:', daySchedule)

    // Si le jour n'existe pas dans le planning ou est fermé
    if (!daySchedule || daySchedule.closed) {
      console.log('🕐 [isClubOpenNow] Day not found or closed')
      return false
    }

    const openTime = daySchedule.open
    const closeTime = daySchedule.close
    console.log('🕐 [isClubOpenNow] Open:', openTime, '| Close:', closeTime)

    // Cas où l'heure de fermeture est après minuit (ex: 18:00 - 05:00)
    if (closeTime < openTime) {
      const isOpen = currentTime >= openTime || currentTime <= closeTime
      console.log('🕐 [isClubOpenNow] Overnight hours | Is open:', isOpen)
      return isOpen
    }

    // Cas normal (ex: 09:00 - 18:00)
    const isOpen = currentTime >= openTime && currentTime <= closeTime
    console.log('🕐 [isClubOpenNow] Normal hours | Is open:', isOpen)
    return isOpen
  } catch (error) {
    console.error('Erreur lors du parsing des horaires:', error)
    return false
  }
}

/**
 * Obtient le label lisible pour le type d'établissement
 */
export function getEstablishmentTypeLabel(type: string): string {
  switch (type) {
    case 'salon_erotique': return 'Salon'
    case 'institut_massage': return 'Institut'
    case 'agence_escorte': return 'Agence'
    case 'club': return 'Club'
    default: return 'Club'
  }
}
