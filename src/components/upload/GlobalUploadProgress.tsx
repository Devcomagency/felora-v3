'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useUploadStore } from '@/stores/uploadStore'
import { CheckCircle2, XCircle, X } from 'lucide-react'

/**
 * Barre de progression globale fine en haut de l'écran
 * Style Instagram/TikTok - minimaliste et professionnel
 */
export default function GlobalUploadProgress() {
  const { isUploading, progress, status, message, clearUpload } = useUploadStore()

  const handleCancel = () => {
    if (status === 'uploading') {
      const confirmed = confirm('Voulez-vous vraiment annuler l\'upload ?')
      if (confirmed) {
        clearUpload()
      }
    } else {
      clearUpload()
    }
  }

  return (
    <AnimatePresence>
      {isUploading && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[9999] bg-black/90 backdrop-blur-lg border-b border-white/10"
        >
          {/* Barre de progression */}
          <div className="h-1 bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-[#FF6B9D] via-[#B794F6] to-[#4FD1C7]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>

          {/* Message et pourcentage */}
          <div className="px-4 py-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {status === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : status === 'error' ? (
                <XCircle className="w-4 h-4 text-red-400" />
              ) : (
                <div className="w-4 h-4 border-2 border-[#FF6B9D] border-t-transparent rounded-full animate-spin" />
              )}
              <span className="text-white font-medium">
                {message || 'Publication en cours...'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-white/60 font-mono tabular-nums">
                {progress}%
              </span>

              {/* Bouton annuler */}
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-white/10 rounded-full transition-colors group"
                title="Fermer / Annuler"
              >
                <X className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
