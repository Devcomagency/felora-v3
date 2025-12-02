/**
 * Gestion centralisée des IDs pour les utilisateurs invités (non connectés)
 * Utilise localStorage pour persister l'ID entre les sessions
 */

const GUEST_ID_KEY = 'felora_guest_id'

/**
 * Récupère ou génère un ID guest unique pour cet appareil
 * Format: guest_{timestamp}_{random}
 */
export function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') {
    // SSR: retourner un ID temporaire
    return `guest_ssr_${Math.random().toString(36).slice(2, 11)}`
  }

  try {
    // Vérifier si un ID existe déjà
    let guestId = localStorage.getItem(GUEST_ID_KEY)

    if (!guestId) {
      // Générer un nouvel ID
      const timestamp = Date.now()
      const random = Math.random().toString(36).slice(2, 11)
      guestId = `guest_${timestamp}_${random}`

      // Sauvegarder dans localStorage
      localStorage.setItem(GUEST_ID_KEY, guestId)

      console.log('[GUEST ID] Nouvel ID créé:', guestId)
    }

    return guestId
  } catch (error) {
    // Fallback si localStorage n'est pas disponible
    console.warn('[GUEST ID] localStorage non disponible, utilisation d\'un ID temporaire')
    return `guest_temp_${Math.random().toString(36).slice(2, 11)}`
  }
}

/**
 * Vérifie si un userId est un guest ID
 */
export function isGuestId(userId: string | null | undefined): boolean {
  return !!userId && userId.startsWith('guest_')
}

/**
 * Retourne le userId effectif (guest ou authentifié)
 */
export function getEffectiveUserId(authenticatedUserId?: string | null): string {
  return authenticatedUserId || getOrCreateGuestId()
}
