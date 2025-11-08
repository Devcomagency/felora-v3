'use client'

import { Camera, Video, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface CameraProProps {
  onCapture?: (file: File) => void
  onClose?: () => void
  mode?: 'photo' | 'video' | 'upload'
}

/**
 * Composant de capture média via caméra native
 * Si mode fourni : ouvre DIRECTEMENT la caméra (pas d'écran Studio visible)
 * Si pas de mode : affiche l'écran Studio avec choix Photo/Vidéo/Upload
 */
export default function CameraCapturePro({ onCapture, onClose, mode }: CameraProProps) {
  const autoTriggered = useRef(false)
  const [showStudio, setShowStudio] = useState(!mode) // Cacher Studio si mode fourni

  // Auto-trigger caméra si mode fourni depuis le footer
  useEffect(() => {
    if (mode && onCapture && !autoTriggered.current) {
      autoTriggered.current = true
      console.log('🎬 Auto-trigger upload/camera mode:', mode)

      const input = document.createElement('input')
      input.type = 'file'

      // Définir le type de fichier accepté
      if (mode === 'video') {
        // 🎬 VIDÉO : Toujours passer par upload galerie (pas capture directe)
        // Raison: Compatibilité formats (HEVC/H.265 → H.264)
        input.accept = 'video/*'
        // PAS de capture="environment" pour vidéo
      } else if (mode === 'photo') {
        input.accept = 'image/*'
        input.capture = 'environment' // Caméra directe OK pour photos
      } else if (mode === 'upload') {
        input.accept = 'image/*,video/*'
        // NE PAS ajouter d'attribut capture
        // Ça force l'ouverture de la galerie uniquement
      }

      input.onchange = (e: any) => {
        const file = e.target.files?.[0]
        console.log('📁 Fichier sélectionné:', file?.name, file?.type, file?.size)
        if (file) {
          onCapture(file)
        } else {
          console.log('❌ Aucun fichier sélectionné, retour en arrière')
          // Si aucun fichier sélectionné, retourner à la page précédente
          window.history.back()
        }
      }

      // Gérer l'annulation (fermeture du picker sans sélection)
      input.oncancel = () => {
        console.log('❌ Upload annulé par l\'utilisateur')
        window.history.back()
      }

      // Déclencher l'ouverture automatiquement
      setTimeout(() => input.click(), 100)
    }
  }, [mode, onCapture])

  // Si mode fourni (depuis footer), ne rien afficher - juste un écran noir transparent
  if (mode) {
    return (
      <div className="fixed inset-0 z-50 bg-black/0">
        {/* Interface invisible - la caméra native s'ouvre automatiquement */}
      </div>
    )
  }

  // Sinon, afficher l'interface Studio complète
  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header avec bouton fermer */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="w-10" /> {/* Spacer */}
        <h2 className="text-lg font-semibold text-white">Studio</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <X className="text-white" size={20} />
          </button>
        )}
      </div>

      {/* Zone centrale - placeholder caméra */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white/60">
          <p className="text-sm">Sélectionnez une option ci-dessous</p>
        </div>
      </div>

      {/* Boutons en bas style réseaux sociaux */}
      <div className="absolute bottom-0 left-0 right-0 pb-8 pt-4 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="flex items-center justify-center gap-6 px-4">
          {/* Bouton Vidéo */}
          <button
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'video/*'
              input.capture = 'environment'
              input.onchange = (e: any) => {
                const file = e.target.files?.[0]
                if (file && onCapture) {
                  onCapture(file)
                }
              }
              input.click()
            }}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Video className="text-white" size={28} />
            </div>
            <span className="text-xs text-white font-medium">Vidéo</span>
          </button>

          {/* Bouton Photo */}
          <button
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/*'
              input.capture = 'environment'
              input.onchange = (e: any) => {
                const file = e.target.files?.[0]
                if (file && onCapture) {
                  onCapture(file)
                }
              }
              input.click()
            }}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="text-white" size={28} />
            </div>
            <span className="text-xs text-white font-medium">Photo</span>
          </button>

          {/* Bouton Upload */}
          <button
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/*,video/*'
              input.onchange = (e: any) => {
                const file = e.target.files?.[0]
                if (file && onCapture) {
                  onCapture(file)
                }
              }
              input.click()
            }}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="text-white" size={28} />
            </div>
            <span className="text-xs text-white font-medium">Upload</span>
          </button>
        </div>
      </div>
    </div>
  )
}
