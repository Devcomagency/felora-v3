'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// import { useSession } from 'next-auth/react' // Désactivé temporairement
import { useRouter } from 'next/navigation'
import { Camera, Video, Image, X, Upload, Loader } from 'lucide-react'
import { useNotification } from './providers/NotificationProvider'

interface MediaUploadButtonProps {
  className?: string
}

export default function MediaUploadButton({ className }: MediaUploadButtonProps) {
  // const { data: session, status } = useSession() // Désactivé temporairement
  const router = useRouter()
  const { success, error } = useNotification()
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Mock values for testing
  const isAuthenticated = true
  const isEscort = true

  // Toujours afficher pour les tests
  // if (!isAuthenticated || !isEscort) {
  //   return null
  // }

  const handleFileUpload = async (file: File, type: 'image' | 'video') => {
    if (!file) return

    // Vérifications de base
    const maxSize = type === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024 // 100MB vidéo, 10MB image
    if (file.size > maxSize) {
      error('Fichier trop volumineux', `La taille maximale est de ${type === 'video' ? '100MB' : '10MB'}`)
      return
    }

    // Vérifier le type de fichier
    const allowedTypes = type === 'video' 
      ? ['video/mp4', 'video/webm', 'video/quicktime']
      : ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    
    if (!allowedTypes.includes(file.type)) {
      error('Format non supporté', `Formats acceptés: ${allowedTypes.join(', ')}`)
      return
    }

    setIsUploading(true)
    setIsOpen(false)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/escort/media/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        success('Média téléchargé', 'Votre fichier a été ajouté avec succès')
        // Optionnel: rafraîchir la page ou rediriger
        setTimeout(() => {
          router.refresh()
        }, 1000)
      } else {
        throw new Error(data.message || 'Erreur de téléchargement')
      }
    } catch (err) {
      console.error('Erreur upload:', err)
      error('Erreur de téléchargement', 'Impossible de télécharger le fichier')
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file, 'image')
    }
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file, 'video')
    }
  }

  const uploadOptions = [
    {
      id: 'image',
      label: 'Photo',
      icon: Image,
      color: 'from-blue-500 to-cyan-500',
      description: 'JPG, PNG, WebP',
      onClick: () => fileInputRef.current?.click()
    },
    {
      id: 'video',
      label: 'Vidéo',
      icon: Video,
      color: 'from-purple-500 to-pink-500',
      description: 'MP4, WebM, MOV',
      onClick: () => videoInputRef.current?.click()
    },
    {
      id: 'camera',
      label: 'Caméra',
      icon: Camera,
      color: 'from-emerald-500 to-teal-500',
      description: 'Prendre une photo',
      onClick: () => {
        // TODO: Implémenter la capture caméra
        error('Fonctionnalité à venir', 'La capture caméra sera bientôt disponible')
      }
    }
  ]

  return (
    <>
      {/* Bouton principal flottant */}
      <motion.button
        onClick={() => setIsOpen(true)}
        disabled={isUploading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          fixed bottom-20 right-4 w-14 h-14 rounded-full
          bg-gradient-to-r from-[#FF6B9D] to-[#B794F6]
          text-white shadow-lg shadow-pink-500/25
          flex items-center justify-center
          z-40 transition-all duration-200
          hover:shadow-xl hover:shadow-pink-500/40
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          ${className || ''}
        `}
      >
        {isUploading ? (
          <Loader className="w-6 h-6 animate-spin" />
        ) : (
          <Upload className="w-6 h-6" />
        )}
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

      {/* Inputs cachés pour les fichiers */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleImageSelect}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={handleVideoSelect}
        className="hidden"
      />

      {/* Indicateur de téléchargement */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 right-4 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 z-40"
          >
            <div className="flex items-center gap-3">
              <Loader className="w-4 h-4 animate-spin text-[#FF6B9D]" />
              <span className="text-white text-sm font-medium">
                Téléchargement en cours...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}