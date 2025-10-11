'use client'

import { useState, useRef } from 'react'
import { X, Play, Pause, Volume2, VolumeX, Download, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import BodyPortal from '@/components/BodyPortal'

interface FullscreenMediaViewerProps {
  mediaUrl: string
  mediaType: string // 'image' | 'video' | 'audio'
  onClose: () => void
  isOnceView?: boolean
  downloadable?: boolean
}

export default function FullscreenMediaViewer({ mediaUrl, mediaType, onClose, isOnceView = false, downloadable = true }: FullscreenMediaViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <BodyPortal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-black flex items-center justify-center"
        onClick={onClose}
      >
        {/* Boutons en haut à droite */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {/* Bouton télécharger (si autorisé et pas vue unique) */}
          {downloadable && !isOnceView && (
            <a
              href={mediaUrl}
              download
              className="p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
              title="Télécharger"
            >
              <Download size={24} />
            </a>
          )}
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenu */}
        <div className="w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          {mediaType === 'image' && (
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={mediaUrl}
              alt="Média"
              className="max-w-full max-h-full object-contain"
            />
          )}

          {mediaType === 'video' && (
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.video
                ref={videoRef}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={mediaUrl}
                className="max-w-full max-h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={togglePlay}
              />
              
              {/* Contrôles vidéo */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                <button
                  onClick={togglePlay}
                  className="p-4 bg-black/70 hover:bg-black/90 rounded-full text-white transition-all"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button
                  onClick={toggleMute}
                  className="p-4 bg-black/70 hover:bg-black/90 rounded-full text-white transition-all"
                >
                  {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
              </div>
            </div>
          )}

          {mediaType === 'audio' && (
            <div className="w-full max-w-2xl">
              <motion.audio
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={mediaUrl}
                controls
                autoPlay
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Message d'avertissement pour vue unique */}
        {isOnceView && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-purple-500/20 border border-purple-500/30 rounded-full backdrop-blur-sm">
            <p className="text-white text-sm font-medium flex items-center gap-2">
              <Eye size={16} />
              <span>Ce contenu disparaîtra après fermeture</span>
            </p>
          </div>
        )}
      </motion.div>
    </BodyPortal>
  )
}

