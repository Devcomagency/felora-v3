'use client'

import { useRef, useState, useEffect } from 'react'
import { Camera, Video, X, RotateCw, Loader, Upload } from 'lucide-react'
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<'photo' | 'video'>(initialMode)
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [recordingTime, setRecordingTime] = useState(0)
  const [isVideoReady, setIsVideoReady] = useState(false)

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

    // Cacher la navbar pendant l'utilisation de la caméra
    document.body.setAttribute('data-camera-active', 'true')

    return () => {
      console.log('🛑 Arrêt caméra')
      stopCamera()
      // Réafficher la navbar
      document.body.removeAttribute('data-camera-active')
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

        // Attendre que la vidéo soit prête (métadonnées chargées)
        videoRef.current.onloadedmetadata = () => {
          console.log('✅ Métadonnées vidéo chargées')
          setIsVideoReady(true)
        }

        await videoRef.current.play()
        console.log('▶️ Vidéo en lecture')
      } else {
        console.error('❌ videoRef.current est null')
      }

      setIsLoading(false)
    } catch (err: any) {
      // Ignorer les AbortError (navigation rapide pendant chargement)
      if (err.name === 'AbortError') {
        console.log('⚠️ Chargement caméra interrompu (normal en dev)')
        return
      }

      console.error('❌ Erreur caméra:', err.name, err.message)
      setError(`Impossible d'accéder à la caméra`)
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

    if (!videoRef.current) {
      console.error('❌ videoRef.current est null')
      
      return
    }

    const video = videoRef.current
    console.log('📹 Dimensions vidéo:', video.videoWidth, 'x', video.videoHeight)

    // VÉRIFICATION CRITIQUE: Dimensions valides
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('❌ Vidéo pas prête! Dimensions:', video.videoWidth, 'x', video.videoHeight)
      
      return
    }

    

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
      
      onCapture(file)
    }, 'image/jpeg', 0.95)
  }

  // Démarrer l'enregistrement vidéo
  const startRecording = async () => {
    if (!streamRef.current) return

    try {
      console.log('🎥 Démarrage enregistrement vidéo...')

      // Obtenir le stream audio si pas déjà présent
      if (!streamRef.current.getAudioTracks().length) {
        try {
          console.log('🎤 Demande autorisation audio...')
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          audioStream.getAudioTracks().forEach(track => {
            streamRef.current?.addTrack(track)
          })
          console.log('✅ Audio autorisé')
        } catch (audioErr) {
          console.warn('⚠️ Audio non disponible, enregistrement vidéo seule:', audioErr)
          // Continuer sans audio
        }
      }

      chunksRef.current = []

      // Créer le MediaRecorder avec haute qualité
      let mimeType = ''
      let videoBitsPerSecond = 8000000 // 8 Mbps par défaut

      // Tester les codecs dans l'ordre de préférence
      const codecs = [
        { type: 'video/webm;codecs=vp9', bitrate: 10000000 },
        { type: 'video/webm;codecs=vp8', bitrate: 8000000 },
        { type: 'video/webm;codecs=h264', bitrate: 8000000 },
        { type: 'video/mp4;codecs=h264', bitrate: 8000000 },
        { type: 'video/webm', bitrate: 8000000 },
        { type: 'video/mp4', bitrate: 8000000 }
      ]

      for (const codec of codecs) {
        if (MediaRecorder.isTypeSupported(codec.type)) {
          mimeType = codec.type
          videoBitsPerSecond = codec.bitrate
          console.log('✅ Codec supporté:', codec.type)
          break
        }
      }

      if (!mimeType) {
        throw new Error('Aucun codec vidéo supporté')
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
          console.log('📦 Chunk reçu:', event.data.size, 'bytes')
        }
      }

      mediaRecorder.onstop = () => {
        console.log('⏹️ Enregistrement arrêté, chunks:', chunksRef.current.length)
        const blobType = mediaRecorderRef.current?.mimeType || 'video/webm'
        const extension = blobType.includes('mp4') ? 'mp4' : 'webm'
        const blob = new Blob(chunksRef.current, { type: blobType })
        const file = new File([blob], `video_${Date.now()}.${extension}`, {
          type: blobType
        })

        console.log('✅ Vidéo créée:', file.name, file.size, 'bytes')
        stopCamera()
        onCapture(file)
      }

      mediaRecorder.onerror = (event: any) => {
        console.error('❌ MediaRecorder error:', event.error)
        setError('Erreur lors de l\'enregistrement')
        setIsRecording(false)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000) // Chunk toutes les 1s
      setIsRecording(true)
      console.log('▶️ Enregistrement démarré')
    } catch (err: any) {
      console.error('❌ Erreur enregistrement:', err)
      console.error('Type:', err.name, 'Message:', err.message)
      setError(`Impossible d'enregistrer: ${err.message}`)
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
        <div className="p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            {/* Bouton Fermer - Style Felora Glassmorphism */}
            <button
              onClick={onClose}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 group"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              title="Fermer"
            >
              <X className="text-white group-hover:text-[#FF6B9D] transition-colors" size={24} />
            </button>

            {/* Timer d'enregistrement */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.9), rgba(183, 148, 246, 0.9))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  <span className="text-white font-mono font-bold">
                    {formatTime(recordingTime)}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bouton Retourner caméra - Style Felora Glassmorphism */}
            <button
              onClick={switchCamera}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 group"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              title="Retourner la caméra"
            >
              <RotateCw className="text-white group-hover:text-[#4FD1C7] transition-colors" size={24} />
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

          {/* Layout avec 3 colonnes : Flip | Photo/Video + Capture | Upload */}
          <div className="flex items-end justify-between gap-4">
            {/* Colonne gauche : Bouton Flip Camera */}
            {!isRecording && (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={switchCamera}
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 group"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  title="Retourner la caméra"
                >
                  <RotateCw className="text-white group-hover:text-[#4FD1C7] transition-colors" size={24} />
                </button>
              </div>
            )}
            {isRecording && <div className="w-14" />}

            {/* Colonne centre : Sélecteur mode + Bouton capture */}
            <div className="flex flex-col items-center gap-4 flex-1">
              {/* Sélecteur mode Photo/Vidéo */}
              {!isRecording && (
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setMode('photo')}
                    className="px-6 py-2 rounded-full font-medium transition-all active:scale-95"
                    style={mode === 'photo' ? {
                      background: 'linear-gradient(135deg, #FF6B9D, #B794F6)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    } : {
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <span className="text-white">Photo</span>
                  </button>
                  <button
                    onClick={() => setMode('video')}
                    className="px-6 py-2 rounded-full font-medium transition-all active:scale-95"
                    style={mode === 'video' ? {
                      background: 'linear-gradient(135deg, #FF6B9D, #B794F6)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    } : {
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <span className="text-white">Vidéo</span>
                  </button>
                </div>
              )}

              {/* Bouton capture */}
              <div className="flex items-center justify-center">
            {mode === 'photo' ? (
              <button
                onClick={takePhoto}
                disabled={isLoading || !!error || !isVideoReady}
                className="w-20 h-20 rounded-full bg-white border-4 border-white/30 hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Camera className="text-black" size={32} />
              </button>
            ) : (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading || !!error || (!isRecording && !isVideoReady)}
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
                <p className="text-center text-white/60 text-sm mt-2">
                  Appuyez pour arrêter l'enregistrement
                </p>
              )}
            </div>

            {/* Colonne droite : Bouton Upload/Galerie */}
            {!isRecording && (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 group"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  title="Importer depuis la galerie"
                >
                  <Upload className="text-white group-hover:text-[#B794F6] transition-colors" size={24} />
                </button>
              </div>
            )}
            {isRecording && <div className="w-14" />}
          </div>
        </div>

        {/* Input file caché pour upload galerie */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              stopCamera()
              onCapture(file)
            }
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
