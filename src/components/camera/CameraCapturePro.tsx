'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, Video, Upload, X, Smartphone } from 'lucide-react'

interface CameraProProps {
  onCapture?: (file: File) => void
  onClose?: () => void
  mode?: 'photo' | 'video'
}

export default function CameraCapturePro({ onCapture, onClose, mode = 'video' }: CameraProProps) {
  const [captureMethod, setCaptureMethod] = useState<'native' | 'webapp' | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const nativeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Détecter si on est sur mobile
    const checkMobile = () => {
      const ua = navigator.userAgent.toLowerCase()
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
      setIsMobile(mobile)
    }
    checkMobile()
  }, [])

  // Méthode 1 : Capture Native (meilleure qualité)
  const handleNativeCapture = () => {
    nativeInputRef.current?.click()
  }

  const handleNativeFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onCapture) {
      onCapture(file)
    }
  }

  // Méthode 2 : WebApp getUserMedia
  const handleWebAppCapture = () => {
    setCaptureMethod('webapp')
    // On utilisera le composant CameraScreenTest existant
  }

  if (captureMethod === 'webapp') {
    // Import dynamique du composant existant
    const CameraScreenTest = require('./CameraScreenTest').default
    return <CameraScreenTest onClose={onClose} onCapture={onCapture} />
  }

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
