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

      // Si mobile, proposer directement la caméra native
      if (mobile) {
        console.log('📱 Mobile détecté, proposition caméra native')
      }
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
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <h2 className="text-xl font-bold text-white">Choisir la méthode de capture</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <X className="text-white" size={20} />
          </button>
        )}
      </div>

      {/* Options de capture */}
      <div className="max-w-md w-full space-y-4 mt-16">
        {/* Option 1 : Caméra Native (Recommandé) */}
        <button
          onClick={handleNativeCapture}
          className="w-full p-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-200 group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              {mode === 'video' ? <Video className="text-white" size={24} /> : <Camera className="text-white" size={24} />}
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white">Caméra Native</h3>
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium">
                  Recommandé
                </span>
              </div>
              <p className="text-sm text-gray-400">
                {isMobile
                  ? "Ouvre l'app Caméra de votre téléphone. Meilleure qualité (4K, HDR, stabilisation)."
                  : "Sur mobile : ouvre l'app Caméra. Sur desktop : permet de sélectionner un fichier."
                }
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {isMobile ? (
                  <>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/70 flex items-center gap-1">
                      <Smartphone size={12} /> Mobile
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/70">4K/8K</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/70">HDR</span>
                  </>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">💻 Desktop: sélection fichier</span>
                )}
              </div>
            </div>
          </div>
        </button>

        {/* Option 2 : WebApp */}
        <button
          onClick={handleWebAppCapture}
          className="w-full p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-200"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <Upload className="text-white" size={24} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold text-white mb-1">Caméra In-App</h3>
              <p className="text-sm text-gray-400">
                Capture directement dans l'application. Filtres et effets en temps réel.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/70">Filtres live</span>
                <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/70">Stickers</span>
                <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/70">Effets</span>
              </div>
            </div>
          </div>
        </button>

        {/* Info qualité */}
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-xs text-yellow-200/80 flex items-start gap-2">
            <span className="text-base">💡</span>
            <span>
              Pour la meilleure qualité possible, utilisez la <strong>Caméra Native</strong>.
              Elle exploite tout le potentiel de votre téléphone (processeur image, IA, etc.).
            </span>
          </p>
        </div>
      </div>

      {/* Input caché pour capture native */}
      <input
        ref={nativeInputRef}
        type="file"
        accept={mode === 'video' ? 'video/*' : 'image/*'}
        capture="environment"
        onChange={handleNativeFileSelected}
        className="hidden"
      />
    </div>
  )
}
