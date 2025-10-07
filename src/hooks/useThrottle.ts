/**
 * Hook pour throttler une fonction
 * Limite le nombre d'exécutions d'une fonction dans un intervalle de temps donné
 */

import { useRef, useCallback } from 'react'

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 200
): (...args: Parameters<T>) => void {
  const lastRun = useRef<number>(Date.now())
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      const timeSinceLastRun = now - lastRun.current

      if (timeSinceLastRun >= delay) {
        // Exécuter immédiatement si le délai est écoulé
        callback(...args)
        lastRun.current = now
      } else {
        // Planifier l'exécution pour plus tard
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          callback(...args)
          lastRun.current = Date.now()
        }, delay - timeSinceLastRun)
      }
    },
    [callback, delay]
  )
}
