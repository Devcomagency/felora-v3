'use client'

import { useRef, useState, useEffect } from 'react'
import { Camera, Video, X, RotateCw, Loader } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CameraHTML5Props {
  onClose: () => void
  onCapture: (file: File) => void
  initialMode?: 'photo' | 'video'
}

/**
 * Composant caméra HTML5 utilisant getUserMedia
 * Permet de capturer photo/vidéo directement dans le navigateur
 * sans passer par les menus natifs du système
 */
export default function CameraHTML5({ onClose, onCapture, initialMode = 'photo' }: CameraHTML5Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const [mode, setMode] = useState<'photo' | 'video'>(initialMode)
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [recordingTime, setRecordingTime] = useState(0)

  // Timer pour l'enregistrement vidéo
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  // Initialiser la caméra
  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [facingMode])

  const startCamera = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Demander l'accès à la caméra
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: mode === 'video' // Audio uniquement en mode vidéo
      })

      streamRef.current = stream

      // Attacher le stream à la vidéo
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      setIsLoading(false)
    } catch (err: any) {
      console.error('❌ Erreur accès caméra:', err)
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.')
      setIsLoading(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
  }

  // Prendre une photo
  const takePhoto = () => {
    if (!videoRef.current) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Dessiner l'image de la vidéo sur le canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convertir en Blob puis File
    canvas.toBlob((blob) => {
      if (!blob) return

      const file = new File([blob], `photo_${Date.now()}.jpg`, {
        type: 'image/jpeg'
      })

      stopCamera()
      onCapture(file)
    }, 'image/jpeg', 0.95)
  }

  // Démarrer l'enregistrement vidéo
  const startRecording = async () => {
    if (!streamRef.current) return

    try {
      // Obtenir le stream audio si pas déjà présent
      if (!streamRef.current.getAudioTracks().length) {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioStream.getAudioTracks().forEach(track => {
          streamRef.current?.addTrack(track)
        })
      }

      chunksRef.current = []

      // Créer le MediaRecorder
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9'
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const file = new File([blob], `video_${Date.now()}.webm`, {
          type: 'video/webm'
        })

        stopCamera()
        onCapture(file)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error('❌ Erreur enregistrement:', err)
      setError('Impossible d\'enregistrer la vidéo')
    }
  }

  // Arrêter l'enregistrement vidéo
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Changer de caméra (avant/arrière)
  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  // Formater le temps d'enregistrement
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Video stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay avec contrôles */}
      <div className="absolute inset-0 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="text-white" size={24} />
            </button>

            {/* Timer d'enregistrement */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2 bg-red-500/90 backdrop-blur-sm px-4 py-2 rounded-full"
                >
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  <span className="text-white font-mono font-bold">
                    {formatTime(recordingTime)}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={switchCamera}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <RotateCw className="text-white" size={20} />
            </button>
          </div>
        </div>

        {/* Espace central */}
        <div className="flex-1" />

        {/* Contrôles en bas */}
        <div className="p-8 bg-gradient-to-t from-black/60 to-transparent">
          {/* Loading ou Error */}
          {(isLoading || error) && (
            <div className="text-center mb-6">
              {isLoading && (
                <div className="flex items-center justify-center gap-3">
                  <Loader className="w-5 h-5 text-white animate-spin" />
                  <span className="text-white">Chargement de la caméra...</span>
                </div>
              )}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Sélecteur mode Photo/Vidéo */}
          {!isRecording && (
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => setMode('photo')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  mode === 'photo'
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Photo
              </button>
              <button
                onClick={() => setMode('video')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  mode === 'video'
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Vidéo
              </button>
            </div>
          )}

          {/* Bouton capture */}
          <div className="flex items-center justify-center">
            {mode === 'photo' ? (
              <button
                onClick={takePhoto}
                disabled={isLoading || !!error}
                className="w-20 h-20 rounded-full bg-white border-4 border-white/30 hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Camera className="text-black" size={32} />
              </button>
            ) : (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading || !!error}
                className={`w-20 h-20 rounded-full border-4 border-white/30 hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                  isRecording ? 'bg-red-500' : 'bg-white'
                }`}
              >
                {isRecording ? (
                  <div className="w-6 h-6 bg-white rounded-sm" />
                ) : (
                  <Video className="text-black" size={32} />
                )}
              </button>
            )}
          </div>

          {isRecording && (
            <p className="text-center text-white/60 text-sm mt-4">
              Appuyez pour arrêter l'enregistrement
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
