'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Play, Pause, Trash2, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import BodyPortal from '@/components/BodyPortal'
import { MESSAGING_CONSTANTS } from '@/constants/messaging'

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob) => void
  onCancel: () => void
}

export default function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioBlobUrlRef = useRef<string | null>(null)

  // Cleanup complet quand le composant se démonte
  useEffect(() => {
    return () => {
      // Arrêter l'intervalle
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Arrêter le MediaRecorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }

      // Libérer le stream audio
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      // Révoquer l'URL du blob audio
      if (audioBlobUrlRef.current) {
        URL.revokeObjectURL(audioBlobUrlRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      setError(null)
      setIsInitializing(true)

      // Libérer le stream précédent s'il existe
      if (streamRef.current) {
        console.log('[VoiceRecorder] Libération du stream précédent')
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      // Attendre un peu pour être sûr que tout est libéré
      await new Promise(resolve => setTimeout(resolve, 100))

      console.log('[VoiceRecorder] Demande accès microphone...')
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      streamRef.current = stream
      console.log('[VoiceRecorder] Microphone OK, tracks:', stream.getTracks().map(t => t.kind))

      setIsInitializing(false)

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        console.log('[VoiceRecorder] MediaRecorder stopped, chunks:', audioChunksRef.current.length)
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setRecordedAudio(audioBlob)

        // Le stream est déjà libéré dans stopRecording()
        // On remet juste la ref à null
        streamRef.current = null
        mediaRecorderRef.current = null
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        setError('Erreur lors de l\'enregistrement')
        setIsRecording(false)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)

      // Mettre à jour la durée toutes les 100ms
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 0.1)
      }, 100)

    } catch (err) {
      console.error('Erreur lors de l\'accès au microphone:', err)
      setError('Impossible d\'accéder au microphone')
      setIsInitializing(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Arrêter l'enregistrement
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)

      // Arrêter l'intervalle
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      // Libérer immédiatement le stream (ne pas attendre onstop)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop()
          console.log('[VoiceRecorder] Track arrêté:', track.kind, track.id)
        })
      }
    }
  }

  const playRecording = () => {
    if (recordedAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const deleteRecording = () => {
    // Révoquer l'URL du blob précédent
    if (audioBlobUrlRef.current) {
      URL.revokeObjectURL(audioBlobUrlRef.current)
      audioBlobUrlRef.current = null
    }

    setRecordedAudio(null)
    setDuration(0)
    setCurrentTime(0)
    setIsPlaying(false)
  }

  const sendRecording = () => {
    if (recordedAudio) {
      onSend(recordedAudio)

      // Cleanup après envoi
      if (audioBlobUrlRef.current) {
        URL.revokeObjectURL(audioBlobUrlRef.current)
        audioBlobUrlRef.current = null
      }
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const isRecordingTooLong = duration > MESSAGING_CONSTANTS.MAX_VOICE_MESSAGE_DURATION

  return (
    <BodyPortal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="fixed top-1/2 -translate-y-1/2 left-0 right-0 mx-auto w-[90%] max-w-xs sm:max-w-sm md:max-w-md bg-gray-900 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-2 sm:p-3 md:p-4 border-b border-white/10">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">Message vocal</h3>
            <button
              onClick={onCancel}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md sm:rounded-lg transition-colors flex-shrink-0"
            >
              <span className="text-base sm:text-lg md:text-xl">×</span>
            </button>
          </div>

            {/* Content */}
            <div className="p-2 sm:p-3 md:p-4 overflow-y-auto overscroll-contain touch-pan-y max-h-[calc(85vh-120px)]" style={{ WebkitOverflowScrolling: 'touch' }}>
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {!recordedAudio ? (
              <div className="text-center">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto mb-3 sm:mb-4 md:mb-6">
                  <div className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-300 ${
                    isRecording 
                      ? 'bg-red-500 animate-pulse' 
                      : 'bg-gradient-to-br from-pink-500 to-purple-600'
                  }`}>
                    <Mic size={24} className="sm:w-8 sm:h-8 md:w-12 md:h-12 text-white" />
                  </div>
                  
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full border-2 sm:border-3 md:border-4 border-red-300 animate-ping" />
                  )}
                </div>

                <div className="mb-3 sm:mb-4 md:mb-6">
                  <p className="text-white text-sm sm:text-base md:text-lg font-medium">
                    {isRecording ? 'Enregistrement...' : 'Appuyez pour enregistrer'}
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    {isRecording ? formatTime(duration) : 'Maintenez le bouton enfoncé'}
                  </p>
                </div>

                {isRecordingTooLong && (
                  <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-300 text-sm">
                      Enregistrement trop long (max 5 minutes)
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
                  {!isRecording ? (
                    <button
                      onMouseDown={startRecording}
                      onMouseUp={stopRecording}
                      onMouseLeave={stopRecording}
                      onTouchStart={startRecording}
                      onTouchEnd={stopRecording}
                      disabled={isInitializing}
                      className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg sm:rounded-xl font-medium hover:scale-105 transition-all duration-200 active:scale-95 text-xs sm:text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Mic size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6 mr-1 sm:mr-2 inline" />
                      <span className="hidden sm:inline">{isInitializing ? 'Initialisation...' : 'Enregistrer'}</span>
                      <span className="sm:hidden">{isInitializing ? '...' : 'Rec'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 bg-red-500 text-white rounded-lg sm:rounded-xl font-medium hover:bg-red-600 transition-all duration-200 text-xs sm:text-sm md:text-base"
                    >
                      <Square size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6 mr-1 sm:mr-2 inline" />
                      <span className="hidden sm:inline">Arrêter</span>
                      <span className="sm:hidden">Stop</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 sm:mb-4 md:mb-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Play size={20} className="sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </div>

                <div className="mb-3 sm:mb-4 md:mb-6">
                  <p className="text-white text-sm sm:text-base md:text-lg font-medium">Message enregistré</p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    Durée: {formatTime(duration)}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                  <button
                    onClick={playRecording}
                    className="p-1.5 sm:p-2 md:p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  >
                    {isPlaying ? <Pause size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" /> : <Play size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />}
                  </button>
                  
                  <button
                    onClick={deleteRecording}
                    className="p-1.5 sm:p-2 md:p-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-full transition-colors"
                  >
                    <Trash2 size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  </button>
                </div>

                <audio
                  ref={audioRef}
                  src={(() => {
                    if (recordedAudio) {
                      // Révoquer l'ancienne URL si elle existe
                      if (audioBlobUrlRef.current) {
                        URL.revokeObjectURL(audioBlobUrlRef.current)
                      }
                      // Créer et stocker la nouvelle URL
                      audioBlobUrlRef.current = URL.createObjectURL(recordedAudio)
                      return audioBlobUrlRef.current
                    }
                    return undefined
                  })()}
                  onEnded={() => setIsPlaying(false)}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                />

                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <button
                    onClick={onCancel}
                    className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-md sm:rounded-lg transition-colors text-xs sm:text-sm md:text-base"
                  >
                    Annuler
                  </button>
                  
                  <button
                    onClick={sendRecording}
                    className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-md sm:rounded-lg font-medium hover:scale-105 transition-all duration-200 text-xs sm:text-sm md:text-base"
                  >
                    <Send size={12} className="sm:w-3 sm:h-3 md:w-4 md:h-4 mr-1 sm:mr-1.5 md:mr-2 inline" />
                    <span className="hidden sm:inline">Envoyer</span>
                    <span className="sm:hidden">OK</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </BodyPortal>
  )
}
