/**
 * @fileoverview Indicateur de connexion réseau
 * Affiche une bannière sticky en haut si l'utilisateur est hors ligne
 */
'use client'

import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function NetworkIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    // État initial
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowReconnected(true)
      setTimeout(() => setShowReconnected(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowReconnected(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-3 shadow-lg"
        >
          <div className="container mx-auto flex items-center justify-center gap-3">
            <WifiOff className="w-5 h-5 animate-pulse" />
            <span className="font-medium">
              Pas de connexion Internet - Les modifications seront sauvegardées une fois reconnecté
            </span>
          </div>
        </motion.div>
      )}

      {showReconnected && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-3 shadow-lg"
        >
          <div className="container mx-auto flex items-center justify-center gap-3">
            <Wifi className="w-5 h-5" />
            <span className="font-medium">
              Connexion rétablie ✓
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
