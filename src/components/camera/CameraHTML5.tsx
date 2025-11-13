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

      chunksRef.current = []

      // Créer le MediaRecorder avec haute qualité
      let mimeType = ''
      let videoBitsPerSecond = 8000000 // 8 Mbps par défaut
      let hasAudio = false

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

      // Tenter d'obtenir le stream audio seulement si le codec le supporte
      // VP8 sur Firefox ne supporte pas l'audio, donc on enregistre vidéo seule
      let recordingStream = streamRef.current

      if (!mimeType.includes('vp8')) {
        // Essayer d'ajouter l'audio seulement si ce n'est pas vp8
        if (!streamRef.current.getAudioTracks().length) {
          try {
            console.log('🎤 Demande autorisation audio...')
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
            audioStream.getAudioTracks().forEach(track => {
              streamRef.current?.addTrack(track)
            })
            hasAudio = true
            console.log('✅ Audio autorisé')
          } catch (audioErr) {
            console.warn('⚠️ Audio non disponible, enregistrement vidéo seule:', audioErr)
          }
        } else {
          hasAudio = true
        }
      } else {
        // VP8: créer un nouveau stream avec vidéo uniquement
        console.log('⚠️ VP8 détecté: enregistrement vidéo seule (pas d\'audio)')
        const videoTrack = streamRef.current.getVideoTracks()[0]
        if (videoTrack) {
          recordingStream = new MediaStream([videoTrack])
        }
      }

      const recorderOptions: MediaRecorderOptions = {
        mimeType,
        videoBitsPerSecond
      }

      // Ajouter audioBitsPerSecond seulement si on a de l'audio
      if (hasAudio) {
        recorderOptions.audioBitsPerSecond = 128000
      }

      console.log('🎬 MediaRecorder config:', recorderOptions, 'hasAudio:', hasAudio)

      const mediaRecorder = new MediaRecorder(recordingStream, recorderOptions)

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
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden">
      {/* Video stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay subtil pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Overlay avec contrôles */}
      <div className="absolute inset-0 flex flex-col">
        {/* Header - Design ultra épuré */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="p-6"
        >
          <div className="flex items-center justify-between">
            {/* Bouton Fermer - Premium Glassmorphism */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-11 h-11 rounded-2xl flex items-center justify-center relative group overflow-hidden"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(30px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
              title="Fermer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <X className="text-white/90 relative z-10" size={20} strokeWidth={2.5} />
            </motion.button>

            {/* Timer d'enregistrement - Design premium */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="flex items-center gap-3 px-5 py-2.5 rounded-2xl relative overflow-hidden"
                  style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(30px) saturate(180%)',
                    border: '1px solid rgba(255, 107, 157, 0.3)',
                    boxShadow: '0 8px 32px rgba(255, 107, 157, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B9D]/20 via-[#B794F6]/20 to-[#FF6B9D]/20 animate-pulse" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-2.5 h-2.5 bg-white rounded-full shadow-lg shadow-white/50 relative z-10"
                  />
                  <span className="text-white font-mono font-bold text-sm tracking-wider relative z-10">
                    {formatTime(recordingTime)}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Spacer invisible pour centrer le timer */}
            <div className="w-11" />
          </div>
        </motion.div>

        {/* Espace central */}
        <div className="flex-1" />

        {/* Contrôles en bas - Design premium */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 20, delay: 0.1 }}
          className="p-8 pb-safe"
        >
          {/* Loading ou Error - Style moderne */}
          <AnimatePresence>
            {(isLoading || error) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center mb-8"
              >
                {isLoading && (
                  <div className="flex items-center justify-center gap-3 px-6 py-3 rounded-2xl mx-auto max-w-xs"
                    style={{
                      background: 'rgba(0, 0, 0, 0.5)',
                      backdropFilter: 'blur(30px) saturate(180%)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <Loader className="w-5 h-5 text-white animate-spin" />
                    <span className="text-white/90 text-sm font-medium">Initialisation...</span>
                  </div>
                )}
                {error && (
                  <div className="px-6 py-4 rounded-2xl mx-auto max-w-sm"
                    style={{
                      background: 'rgba(220, 38, 38, 0.15)',
                      backdropFilter: 'blur(30px) saturate(180%)',
                      border: '1px solid rgba(220, 38, 38, 0.3)',
                      boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)',
                    }}
                  >
                    <p className="text-red-200 text-sm font-medium">{error}</p>
                    <p className="text-red-200/70 text-xs mt-2">
                      Vérifiez les permissions ou utilisez "Galerie"
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Layout avec 3 colonnes : Flip | Photo/Video + Capture | Upload */}
          <div className="flex items-end justify-between gap-6">
            {/* Colonne gauche : Bouton Flip Camera */}
            {!isRecording ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={switchCamera}
                className="w-14 h-14 rounded-2xl flex items-center justify-center relative group overflow-hidden"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(30px) saturate(180%)',
                  border: '1px solid rgba(79, 209, 199, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                }}
                title="Retourner la caméra"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#4FD1C7]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <RotateCw className="text-white/90 group-hover:text-[#4FD1C7] transition-colors relative z-10" size={22} strokeWidth={2.5} />
              </motion.button>
            ) : (
              <div className="w-14" />
            )}

            {/* Colonne centre : Sélecteur mode + Bouton capture */}
            <div className="flex flex-col items-center gap-5 flex-1">
              {/* Sélecteur mode Photo/Vidéo - Design premium */}
              {!isRecording && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 p-1.5 rounded-2xl"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(30px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMode('photo')}
                    className="px-6 py-2.5 rounded-xl font-semibold text-sm relative overflow-hidden transition-all"
                    style={mode === 'photo' ? {
                      background: 'linear-gradient(135deg, #FF6B9D, #B794F6)',
                      boxShadow: '0 4px 16px rgba(255, 107, 157, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    } : {
                      background: 'transparent',
                    }}
                  >
                    <span className={mode === 'photo' ? 'text-white' : 'text-white/60'}>Photo</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMode('video')}
                    className="px-6 py-2.5 rounded-xl font-semibold text-sm relative overflow-hidden transition-all"
                    style={mode === 'video' ? {
                      background: 'linear-gradient(135deg, #FF6B9D, #B794F6)',
                      boxShadow: '0 4px 16px rgba(255, 107, 157, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    } : {
                      background: 'transparent',
                    }}
                  >
                    <span className={mode === 'video' ? 'text-white' : 'text-white/60'}>Vidéo</span>
                  </motion.button>
                </motion.div>
              )}

              {/* Bouton capture - Design premium avec effet néon */}
              <div className="flex items-center justify-center">
                {mode === 'photo' ? (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={takePhoto}
                    disabled={isLoading || !!error || !isVideoReady}
                    className="w-20 h-20 rounded-full flex items-center justify-center relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #FFFFFF, #F0F0F0)',
                      boxShadow: '0 0 0 4px rgba(255, 255, 255, 0.2), 0 8px 32px rgba(255, 107, 157, 0.3)',
                    }}
                  >
                    <Camera className="text-black" size={32} strokeWidth={2.5} />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isLoading || !!error || (!isRecording && !isVideoReady)}
                    className="w-20 h-20 rounded-full flex items-center justify-center relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    style={isRecording ? {
                      background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                      boxShadow: '0 0 0 4px rgba(255, 255, 255, 0.2), 0 8px 32px rgba(239, 68, 68, 0.5)',
                    } : {
                      background: 'linear-gradient(135deg, #FFFFFF, #F0F0F0)',
                      boxShadow: '0 0 0 4px rgba(255, 255, 255, 0.2), 0 8px 32px rgba(255, 107, 157, 0.3)',
                    }}
                  >
                    {isRecording ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="w-7 h-7 bg-white rounded-md"
                      />
                    ) : (
                      <Video className="text-black" size={32} strokeWidth={2.5} />
                    )}
                  </motion.button>
                )}
              </div>

              {/* Message d'enregistrement */}
              <AnimatePresence>
                {isRecording && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center text-white/70 text-sm font-medium"
                  >
                    Touchez pour arrêter
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Colonne droite : Bouton Upload/Galerie */}
            {!isRecording ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="w-14 h-14 rounded-2xl flex items-center justify-center relative group overflow-hidden"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(30px) saturate(180%)',
                  border: '1px solid rgba(183, 148, 246, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                }}
                title="Importer depuis la galerie"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#B794F6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Upload className="text-white/90 group-hover:text-[#B794F6] transition-colors relative z-10" size={22} strokeWidth={2.5} />
              </motion.button>
            ) : (
              <div className="w-14" />
            )}
          </div>
        </motion.div>

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
