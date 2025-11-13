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
    console.log('🎥 Initialisation caméra - facingMode:', facingMode, 'mode:', mode)
    startCamera()
    return () => {
      console.log('🛑 Arrêt caméra')
      stopCamera()
    }
  }, [facingMode, mode])

  useEffect(() => {
    console.log('📱 Mode changé:', initialMode)
    setMode(initialMode)
  }, [initialMode])

  const startCamera = async () => {
    console.log('▶️ startCamera appelé')
    setIsLoading(true)
    setError(null)

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia non supporté sur ce navigateur')
      }

      console.log('📹 Demande accès caméra avec qualité HD...')

      // Demander l'accès à la caméra avec contraintes HD
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 30, min: 24 }
        },
        audio: mode === 'video' ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      })

      console.log('✅ Stream obtenu:', stream)
      streamRef.current = stream

      // Attacher le stream à la vidéo
      if (videoRef.current) {
        console.log('📺 Attachement du stream à la vidéo')
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        console.log('▶️ Vidéo en lecture')
      } else {
        console.error('❌ videoRef.current est null')
      }

      setIsLoading(false)
    } catch (err: any) {
      console.error('❌ Erreur accès caméra:', err)
      console.error('Code erreur:', err.name)
      console.error('Message:', err.message)
      setError(`Erreur: ${err.name} - ${err.message}`)
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
    console.log('📸 takePhoto appelé')
    alert('📸 Prise de photo en cours...') // DEBUG MOBILE

    if (!videoRef.current) {
      console.error('❌ videoRef.current est null')
      alert('❌ Erreur: videoRef null') // DEBUG MOBILE
      return
    }

    const video = videoRef.current
    console.log('📹 Dimensions vidéo:', video.videoWidth, 'x', video.videoHeight)

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('❌ Impossible de créer le contexte canvas')
      return
    }

    // Dessiner l'image de la vidéo sur le canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    console.log('✅ Image dessinée sur canvas')

    // Convertir en Blob puis File
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('❌ Blob est null')
        return
      }

      console.log('✅ Blob créé:', blob.size, 'bytes')
      const file = new File([blob], `photo_${Date.now()}.jpg`, {
        type: 'image/jpeg'
      })
      console.log('✅ File créé:', file.name, file.size, 'bytes')

      console.log('🛑 Arrêt caméra')
      stopCamera()

      console.log('📤 Appel onCapture avec le fichier')
      alert('✅ Photo capturée ! Redirection...') // DEBUG MOBILE
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

      // Créer le MediaRecorder avec haute qualité
      let mimeType = ''
      let videoBitsPerSecond = 8000000 // 8 Mbps par défaut

      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9'
        videoBitsPerSecond = 10000000 // 10 Mbps pour VP9
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        mimeType = 'video/webm;codecs=vp8'
        videoBitsPerSecond = 8000000 // 8 Mbps pour VP8
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4'
        videoBitsPerSecond = 8000000 // 8 Mbps pour MP4
      } else {
        mimeType = 'video/webm'
      }

      console.log('🎬 MediaRecorder config:', { mimeType, videoBitsPerSecond })

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType,
        videoBitsPerSecond,
        audioBitsPerSecond: 128000 // 128 kbps audio
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blobType = mediaRecorderRef.current?.mimeType || 'video/webm'
        const extension = blobType.includes('mp4') ? 'mp4' : 'webm'
        const blob = new Blob(chunksRef.current, { type: blobType })
        const file = new File([blob], `video_${Date.now()}.${extension}`, {
          type: blobType
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
                  <p className="text-red-200 text-xs mt-2">
                    Vérifiez les permissions dans les réglages du navigateur ou utilisez l’option “Galerie”.
                  </p>
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
