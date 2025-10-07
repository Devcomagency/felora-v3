/**
 * Hook pour debouncer une valeur
 * Retarde la mise à jour d'une valeur jusqu'à ce qu'un certain temps se soit écoulé
 */

import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Planifier la mise à jour de la valeur debouncée
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Nettoyer le timer si la valeur change avant la fin du délai
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook pour debouncer une callback
 * Retarde l'exécution d'une fonction jusqu'à ce qu'un certain temps se soit écoulé
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>()

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args)
    }, delay)

    setTimeoutId(newTimeoutId)
  }
}
