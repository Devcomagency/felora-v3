'use client'

import { useState, useEffect } from 'react'
import { CameraPreview } from '@capacitor-community/camera-preview'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { X, Camera, Video, Upload, Image as ImageIcon } from 'lucide-react'

interface CapacitorCameraProps {
  onCapture: (file: File) => void
  onClose: () => void
}

export default function CapacitorCamera({ onCapture, onClose }: CapacitorCameraProps) {
  const [mode, setMode] = useState<'video' | 'photo'>('video')
  const [isRecording, setIsRecording] = useState(false)
  const [isCameraStarted, setIsCameraStarted] = useState(false)

  // Démarrer la caméra native
  useEffect(() => {
    async function startCamera() {
      try {
        await CameraPreview.start({
          position: 'rear',
          width: window.innerWidth,
          height: window.innerHeight,
          x: 0,
          y: 0,
          toBack: true, // Caméra en arrière-plan, UI web par-dessus
          enableZoom: true,
          enableOpacity: true,
        })
        setIsCameraStarted(true)
        console.log('📹 Caméra native démarrée')
      } catch (error) {
        console.error('Erreur démarrage caméra:', error)
      }
    }

    startCamera()

    return () => {
      // Arrêter la caméra au démontage
      CameraPreview.stop().catch(console.error)
    }
  }, [])

  // Prendre une photo
  const handleTakePhoto = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium })

      const result = await CameraPreview.capture({ quality: 90 })

      // Convertir base64 en File
      const base64Response = await fetch(`data:image/jpeg;base64,${result.value}`)
      const blob = await base64Response.blob()
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })

      await CameraPreview.stop()
      onCapture(file)
    } catch (error) {
      console.error('Erreur capture photo:', error)
    }
  }

  // Démarrer/arrêter enregistrement vidéo
  const handleRecordVideo = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy })

      if (!isRecording) {
        await CameraPreview.startRecordVideo()
        setIsRecording(true)
      } else {
        const result = await CameraPreview.stopRecordVideo()
        setIsRecording(false)

        // Convertir base64 en File
        const base64Response = await fetch(`data:video/mp4;base64,${result.videoFilePath}`)
        const blob = await base64Response.blob()
        const file = new File([blob], `video-${Date.now()}.mp4`, { type: 'video/mp4' })

        await CameraPreview.stop()
        onCapture(file)
      }
    } catch (error) {
      console.error('Erreur enregistrement vidéo:', error)
      setIsRecording(false)
    }
  }

  // Upload depuis galerie
  const handleUpload = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light })
      await CameraPreview.stop()

      // Ouvrir le sélecteur de fichiers
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*,video/*'
      input.onchange = (e: any) => {
        const file = e.target.files?.[0]
        if (file) {
          onCapture(file)
        }
      }
      input.click()
    } catch (error) {
      console.error('Erreur upload:', error)
    }
  }

  // Swipe pour changer de mode
  const [touchStart, setTouchStart] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = async (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd

    // Swipe à droite = Photo
    if (diff < -80 && mode === 'video') {
      await Haptics.impact({ style: ImpactStyle.Light })
      setMode('photo')
    }
    // Swipe à gauche = Vidéo
    else if (diff > 80 && mode === 'photo') {
      await Haptics.impact({ style: ImpactStyle.Light })
      setMode('video')
    }
  }

  const handleClose = async () => {
    await CameraPreview.stop()
    onClose()
  }

  if (!isCameraStarted) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Démarrage de la caméra...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-10">
        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
        >
          <X className="text-white" size={24} />
        </button>

        {/* Indicateur de mode */}
        <div className="flex gap-2">
          <span className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            mode === 'video' ? 'bg-red-500 text-white' : 'text-white/60'
          }`}>
            🎥 Vidéo
          </span>
          <span className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            mode === 'photo' ? 'bg-blue-500 text-white' : 'text-white/60'
          }`}>
            📷 Photo
          </span>
        </div>

        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Indicateur d'enregistrement */}
      {isRecording && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
          <div className="px-4 py-2 bg-red-500 rounded-full flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white font-medium text-sm">REC</span>
          </div>
        </div>
      )}

      {/* Contrôles en bas */}
      <div className="absolute bottom-0 left-0 right-0 pb-8 pt-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
        <div className="flex items-center justify-center gap-8 px-4">
          {/* Bouton principal capture */}
          <button
            onClick={mode === 'video' ? handleRecordVideo : handleTakePhoto}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-red-500 scale-110 ring-4 ring-red-500/50'
                : mode === 'video'
                ? 'bg-red-500/80 hover:bg-red-500'
                : 'bg-white hover:bg-white/90'
            }`}
          >
            {mode === 'video' ? (
              isRecording ? (
                <div className="w-6 h-6 bg-white rounded-sm" />
              ) : (
                <Video className="text-white" size={32} />
              )
            ) : (
              <Camera className="text-black" size={32} />
            )}
          </button>

          {/* Bouton Upload */}
          <button
            onClick={handleUpload}
            className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <ImageIcon className="text-white" size={24} />
          </button>
        </div>

        {/* Indicateur swipe */}
        <p className="text-center text-white/60 text-xs mt-4">
          Swipez pour {mode === 'video' ? 'Photo →' : '← Vidéo'}
        </p>
      </div>
    </div>
  )
}
