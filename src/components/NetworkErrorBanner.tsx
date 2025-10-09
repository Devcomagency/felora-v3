'use client'

import { useState } from 'react'
import { AlertTriangle, RefreshCw, X, Wifi, WifiOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { NetworkError } from '@/hooks/useNetworkError'

interface NetworkErrorBannerProps {
  error: NetworkError
  isRetrying: boolean
  retryCount: number
  onRetry: () => void
  onDismiss: () => void
}

export default function NetworkErrorBanner({
  error,
  isRetrying,
  retryCount,
  onRetry,
  onDismiss
}: NetworkErrorBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss()
  }

  const getErrorIcon = () => {
    if (error.message.includes('Connexion') || error.message.includes('réseau')) {
      return <WifiOff size={20} />
    }
    return <AlertTriangle size={20} />
  }

  const getErrorColor = () => {
    if (error.message.includes('Authentification') || error.message.includes('Accès')) {
      return 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30'
    }
    if (error.message.includes('serveur') || error.message.includes('500')) {
      return 'text-red-300 bg-red-500/20 border-red-500/30'
    }
    return 'text-orange-300 bg-orange-500/20 border-orange-500/30'
  }

  if (isDismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-0 left-0 right-0 z-50 p-4"
      >
        <div className={`max-w-4xl mx-auto rounded-xl border p-4 ${getErrorColor()}`}>
          <div className="flex items-center gap-3">
            {getErrorIcon()}
            
            <div className="flex-1">
              <h3 className="font-semibold text-sm">
                {error.message}
              </h3>
              {retryCount > 0 && (
                <p className="text-xs opacity-75 mt-1">
                  Tentative {retryCount}/3
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {error.retryable && (
                <button
                  onClick={onRetry}
                  disabled={isRetrying}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Réessayer"
                >
                  <RefreshCw 
                    size={16} 
                    className={isRetrying ? 'animate-spin' : ''} 
                  />
                </button>
              )}
              
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Fermer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {isRetrying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3"
            >
              <div className="flex items-center gap-2 text-xs">
                <Wifi size={14} className="animate-pulse" />
                <span>Reconnexion en cours...</span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
