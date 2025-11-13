'use client'

import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Upload } from 'lucide-react'

interface MediaUploadButtonProps {
  className?: string
}

export default function MediaUploadButton({ className }: MediaUploadButtonProps) {
  const router = useRouter()
  const mediaInputRef = useRef<HTMLInputElement>(null)

  // Handler pour traiter le fichier sélectionné
  const handleFileSelected = (file: File) => {
    if (!file) return

    // Stocker le fichier dans une variable globale temporaire
    (window as any).__pendingFile = file

    // Rediriger vers /camera
    router.push('/camera?fromUpload=true')
  }

  return (
    <>
      {/* Bouton principal flottant - Clic direct ouvre le picker */}
      <motion.button
        onClick={() => mediaInputRef.current?.click()}
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

      {/* Input caché - Accepte photos ET vidéos */}
      <input
        ref={mediaInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileSelected(file)
          // Reset input pour permettre de sélectionner le même fichier deux fois
          e.target.value = ''
        }}
      />
    </>
  )
}