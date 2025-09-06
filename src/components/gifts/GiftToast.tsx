'use client'

import { useEffect, useState } from 'react'
import { StaticGiftPlayer } from './StaticGiftPlayer'
import { motion, AnimatePresence } from 'framer-motion'

// Mapping des codes de cadeaux vers les types
const getGiftType = (giftCode: string): 'heart' | 'diamond' | 'rose' | 'fireworks' | 'crown' => {
  const mapping: Record<string, 'heart' | 'diamond' | 'rose' | 'fireworks' | 'crown'> = {
    'heart': 'heart', 'coeur': 'heart', 'HEART': 'heart', 'COEUR': 'heart',
    'diamond': 'diamond', 'diamant': 'diamond', 'DIAMOND': 'diamond', 'DIAMANT': 'diamond',
    'rose': 'rose', 'ROSE': 'rose',
    'fireworks': 'fireworks', 'feux': 'fireworks', 'FIREWORKS': 'fireworks', 'FEUX': 'fireworks',
    'crown': 'crown', 'couronne': 'crown', 'CROWN': 'crown', 'COURONNE': 'crown'
  }
  return mapping[giftCode] || 'heart'
}

interface GiftToastProps {
  gift: {
    code: string
    name: string
    lottieUrl: string
    quantity: number
    senderName?: string
  }
  isVisible: boolean
  onComplete: () => void
}

export function GiftToast({ gift, isVisible, onComplete }: GiftToastProps) {
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShowToast(true)
      // Auto-hide après 3 secondes
      const timer = setTimeout(() => {
        setShowToast(false)
        setTimeout(onComplete, 300) // Attendre fin animation sortie
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onComplete])

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            damping: 15, 
            stiffness: 200,
            duration: 0.3 
          }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-none"
        >
          <div className="bg-gradient-to-r from-felora-aurora/90 to-felora-plasma/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-4 min-w-[300px]">
            <div className="flex items-center space-x-4">
              {/* Animation Lottie */}
              <div className="flex-shrink-0">
                <StaticGiftPlayer 
                  giftType={getGiftType(gift.code)}
                  className="w-16 h-16"
                />
              </div>

              {/* Texte du cadeau */}
              <div className="flex-1 text-white">
                <div className="font-semibold text-lg">
                  {gift.senderName ? `${gift.senderName} vous a envoyé` : 'Cadeau reçu'}
                </div>
                <div className="text-felora-silver/90 text-sm">
                  {gift.quantity > 1 ? `${gift.quantity}x ` : ''}{gift.name}
                </div>
              </div>

              {/* Sparkles effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-felora-neon/20 to-felora-quantum/20 rounded-2xl blur-lg animate-pulse" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}