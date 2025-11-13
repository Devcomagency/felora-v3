'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Camera, Video, Image, X, Upload } from 'lucide-react'

interface MediaUploadButtonProps {
  className?: string
}

export default function MediaUploadButton({ className }: MediaUploadButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const uploadOptions = [
    {
      id: 'photo',
      label: 'Photo',
      icon: Camera,
      color: 'from-blue-500 to-cyan-500',
      description: 'Prendre une photo',
      onClick: () => router.push('/camera?mode=photo')
    },
    {
      id: 'video',
      label: 'Vidéo',
      icon: Video,
      color: 'from-purple-500 to-pink-500',
      description: 'Filmer une vidéo',
      onClick: () => router.push('/camera?mode=video')
    },
    {
      id: 'upload',
      label: 'Fichier',
      icon: Image,
      color: 'from-emerald-500 to-teal-500',
      description: 'Depuis galerie',
      onClick: () => router.push('/camera?mode=upload')
    }
  ]

  return (
    <>
      {/* Bouton principal flottant */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          fixed bottom-20 right-4 w-14 h-14 rounded-full
          bg-gradient-to-r from-[#FF6B9D] to-[#B794F6]
          text-white shadow-lg shadow-pink-500/25
          flex items-center justify-center
          z-40 transition-all duration-200
          hover:shadow-xl hover:shadow-pink-500/40
          ${className || ''}
        `}
      >
        <Upload className="w-6 h-6" />
      </motion.button>

      {/* Overlay et modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-white text-lg font-semibold">
                      Ajouter un média
                    </h3>
                    <p className="text-white/60 text-sm">
                      Téléchargez une photo ou vidéo
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Options de téléchargement */}
                <div className="grid gap-3">
                  {uploadOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={option.onClick}
                        className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 text-left"
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">
                            {option.label}
                          </h4>
                          <p className="text-white/60 text-sm">
                            {option.description}
                          </p>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Note */}
                <div className="mt-6 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-blue-300 text-xs">
                    💡 Vos médias seront visibles dans votre profil et le feed après validation.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}