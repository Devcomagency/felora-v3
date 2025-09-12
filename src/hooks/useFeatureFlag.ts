'use client'

import { useState, useEffect } from 'react'

/**
 * Hook pour gérer les feature flags
 * Supporte les variables d'environnement et les cookies canary
 */
export function useFeatureFlag(flagName: string): boolean {
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    // Vérifier les variables d'environnement côté client
    const envValue = process.env[`NEXT_PUBLIC_${flagName}`]
    if (envValue === 'true') {
      setIsEnabled(true)
      return
    }

    // Vérifier le cookie canary pour les tests
    if (typeof window !== 'undefined') {
      const canaryCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('canary='))
        ?.split('=')[1]
      
      if (canaryCookie === '1') {
        setIsEnabled(true)
        return
      }
    }

    // Vérifier les cookies spécifiques au flag
    if (typeof window !== 'undefined') {
      const flagCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${flagName.toLowerCase()}=`))
        ?.split('=')[1]
      
      if (flagCookie === 'true') {
        setIsEnabled(true)
        return
      }
    }

    setIsEnabled(false)
  }, [flagName])

  return isEnabled
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
