'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Download, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { motion } from 'framer-motion'
import { MESSAGING_CONSTANTS, MEDIA_CONSTANTS } from '@/constants/messaging'
import BodyPortal from '@/components/BodyPortal'

interface AttachmentPreviewProps {
  file: File
  onRemove: () => void
  onSend: (file: File, options?: { viewMode?: 'once' | 'unlimited', downloadable?: boolean }) => void
  onCancel: () => void
}

export default function AttachmentPreview({ file, onRemove, onSend, onCancel }: AttachmentPreviewProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [viewMode, setViewMode] = useState<'once' | 'unlimited'>('unlimited')
  const [downloadable, setDownloadable] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const isImage = MEDIA_CONSTANTS.SUPPORTED_IMAGE_TYPES.includes(file.type as any)
  const isVideo = MEDIA_CONSTANTS.SUPPORTED_VIDEO_TYPES.includes(file.type as any)
  const isAudio = MEDIA_CONSTANTS.SUPPORTED_AUDIO_TYPES.includes(file.type as any)

  useEffect(() => {
    if (isImage || isVideo) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [file, isImage, isVideo])

  useEffect(() => {
    if (isVideo && videoRef.current) {
      const video = videoRef.current
      const handleLoadedMetadata = () => {
        setDuration(video.duration)
      }
      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime)
      }
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      video.addEventListener('timeupdate', handleTimeUpdate)
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        video.removeEventListener('timeupdate', handleTimeUpdate)
      }
    }
  }, [isVideo])

  const handlePlayPause = () => {
    if (isVideo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    } else if (isAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleMuteToggle = () => {
    if (isVideo && videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    } else if (isAudio && audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isFileTooLarge = file.size > MESSAGING_CONSTANTS.MAX_FILE_SIZE

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
          className="fixed top-[30%] -translate-y-1/2 left-0 right-0 mx-auto w-[90%] max-w-xs sm:max-w-lg md:max-w-2xl bg-gray-900 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden max-h-[75vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-2 sm:p-3 md:p-4 border-b border-white/10">
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 min-w-0 flex-1">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">Aperçu</h3>
              <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap hidden sm:inline">{formatFileSize(file.size)}</span>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md sm:rounded-lg transition-colors flex-shrink-0"
            >
              <X size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </button>
          </div>

            {/* Content */}
            <div className="flex-1 p-2 sm:p-3 md:p-4 overflow-y-auto overscroll-contain touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
            {isFileTooLarge && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">
                  Fichier trop volumineux. Taille maximale: {formatFileSize(MESSAGING_CONSTANTS.MAX_FILE_SIZE)}
                </p>
              </div>
            )}

            {isImage && preview && (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-auto max-h-[25vh] sm:max-h-[30vh] md:max-h-[35vh] object-contain rounded-md sm:rounded-lg"
                />
              </div>
            )}

            {isVideo && preview && (
              <div className="relative">
                <video
                  ref={videoRef}
                  src={preview}
                  className="w-full h-auto max-h-[25vh] sm:max-h-[30vh] md:max-h-[35vh] object-contain rounded-md sm:rounded-lg"
                  controls={false}
                  muted={isMuted}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1 sm:p-1.5 md:p-2">
                  <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                    <button
                      onClick={handlePlayPause}
                      className="p-1 sm:p-1.5 md:p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                      {isPlaying ? <Pause size={12} className="sm:w-3 sm:h-3 md:w-4 md:h-4" /> : <Play size={12} className="sm:w-3 sm:h-3 md:w-4 md:h-4" />}
                    </button>
                    <button
                      onClick={handleMuteToggle}
                      className="p-1 sm:p-1.5 md:p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                      {isMuted ? <VolumeX size={12} className="sm:w-3 sm:h-3 md:w-4 md:h-4" /> : <Volume2 size={12} className="sm:w-3 sm:h-3 md:w-4 md:h-4" />}
                    </button>
                    <div className="flex-1 text-white text-xs sm:text-sm min-w-0">
                      <span className="truncate">{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isAudio && (
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Volume2 size={20} className="sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                </div>
                <audio
                  ref={audioRef}
                  src={URL.createObjectURL(file)}
                  className="w-full max-w-xs sm:max-w-sm mx-auto"
                  controls
                />
              </div>
            )}

            {!isImage && !isVideo && !isAudio && (
              <div className="text-center py-4 sm:py-6 md:py-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 sm:mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                  <Download size={18} className="sm:w-6 sm:h-6 md:w-8 md:h-8 text-gray-400" />
                </div>
                <p className="text-gray-400 text-xs sm:text-sm md:text-base break-words px-2 sm:px-4">{file.name}</p>
              </div>
            )}

            {/* File info */}
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-white/5 rounded-md sm:rounded-lg">
              <p className="text-xs sm:text-sm text-gray-300 break-words">
                <strong>Nom:</strong> {file.name}
              </p>
              <p className="text-xs sm:text-sm text-gray-300">
                <strong>Taille:</strong> {formatFileSize(file.size)}
              </p>
              <p className="text-xs sm:text-sm text-gray-300 break-words">
                <strong>Type:</strong> {file.type}
              </p>
            </div>
          </div>

          {/* Options média */}
          {(isImage || isVideo) && (
            <div className="px-2 sm:px-3 md:px-4 py-3 border-t border-white/10 space-y-3">
              <div>
                <label className="text-xs sm:text-sm text-gray-300 mb-2 block">👁️ Visionnage</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('unlimited')}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm transition-all ${
                      viewMode === 'unlimited' 
                        ? 'bg-pink-500/20 border-2 border-pink-500 text-white' 
                        : 'bg-white/5 border border-white/10 text-gray-400'
                    }`}
                  >
                    Illimité
                  </button>
                  <button
                    onClick={() => setViewMode('once')}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm transition-all ${
                      viewMode === 'once' 
                        ? 'bg-pink-500/20 border-2 border-pink-500 text-white' 
                        : 'bg-white/5 border border-white/10 text-gray-400'
                    }`}
                  >
                    Une fois
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm text-gray-300">📥 Téléchargement</label>
                <button
                  onClick={() => setDownloadable(!downloadable)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    downloadable ? 'bg-pink-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    downloadable ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 border-t border-white/10 flex-shrink-0">
            <button
              onClick={onCancel}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md sm:rounded-lg transition-colors text-xs sm:text-sm md:text-base"
            >
              Annuler
            </button>
            <button
              onClick={() => onSend(file, { viewMode, downloadable })}
              disabled={isFileTooLarge}
              className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md sm:rounded-lg font-medium transition-all text-xs sm:text-sm md:text-base ${
                isFileTooLarge
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-pink-500 text-white hover:bg-pink-600 hover:scale-105'
              }`}
            >
              <span className="hidden sm:inline">Envoyer</span>
              <span className="sm:hidden">OK</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </BodyPortal>
  )
}
