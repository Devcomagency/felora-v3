'use client'

// Mode production simple: toutes les nouvelles UIs sont activées par défaut.
// Ce hook retourne toujours true afin d'éviter toute dépendance aux cookies/env.
// On rétablira un vrai pilotage par flags si besoin plus tard.
export function useFeatureFlag(_flagName: string): boolean {
  return true
}

/**
 * Hook pour activer/désactiver un feature flag via cookie
 * Utile pour les tests en développement
 */
export function useFeatureFlagToggle(flagName: string) {
  const isEnabled = useFeatureFlag(flagName)

  const toggle = (enabled?: boolean) => {
    if (typeof window === 'undefined') return

    const newValue = enabled !== undefined ? enabled : !isEnabled
    const cookieValue = newValue ? 'true' : 'false'
    
    document.cookie = `${flagName.toLowerCase()}=${cookieValue}; path=/; max-age=31536000`
    
    // Déclencher un re-render
    window.dispatchEvent(new CustomEvent('featureFlagChanged', { 
      detail: { flagName, enabled: newValue } 
    }))
  }

  return { isEnabled, toggle }
}

/**
 * Hook pour vérifier si l'utilisateur est en mode canary
 */
export function useCanaryMode(): boolean {
  return useFeatureFlag('CANARY_MODE')
}
