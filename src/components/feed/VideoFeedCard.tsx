'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Heart, Crown, Diamond, Flame, VolumeX, Volume2, Play, Pause, BadgeCheck } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { InView } from 'react-intersection-observer'
// import { useFeedActions } from '../../hooks/useFeedActions'
import { useVideoIntersection } from '../../hooks/useVideoIntersection'
import { useFeedStore } from '../../stores/feedStore'
import useReactions from '@/hooks/useReactions'
import { stableMediaId } from '@/lib/reactions/stableMediaId'
import type { MediaItem as CoreMediaItem } from '../../../packages/core/services/media/MediaService'
import type { TIntersectingVideo } from '../../stores/feedStore'

// Étend le type de base pour supporter les champs UI (stats, counts, verified)
type UIMediaItem = CoreMediaItem & {
  stats?: { likes?: number; comments?: number; reactions?: number }
  likeCount?: number
  reactCount?: number
  author: CoreMediaItem['author'] & { verified?: boolean }
}

interface VideoFeedCardProps {
  item: UIMediaItem
  initialTotal?: number
}

// Utilitaire pour gérer les clics simples/doubles
function useClickHandler(
  onSingleClick: () => void,
  onDoubleClick: (e: React.MouseEvent) => void
) {
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null)

  return useCallback((e: React.MouseEvent) => {
    e.preventDefault()

    if (clickTimeout) {
      // Double-click détecté
      clearTimeout(clickTimeout)
      setClickTimeout(null)
      onDoubleClick(e)
    } else {
      // Attendre pour voir s'il y a un double-click
      const timeout = setTimeout(() => {
        onSingleClick()
        setClickTimeout(null)
      }, 250)
      setClickTimeout(timeout)
    }
  }, [clickTimeout, onSingleClick, onDoubleClick])
}

// Composant pour l'animation des coeurs
function HeartAnimation({ 
  show, 
  position, 
  onComplete 
}: { 
  show: boolean
  position: { x: number, y: number }
  onComplete: () => void
}) {
  if (!show) return null

  return (
    <motion.div
      className="pointer-events-none absolute text-6xl text-[#FF6B9D] z-20"
      style={{ left: position.x - 30, top: position.y - 30 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        opacity: [0.8, 1, 0],
        scale: [1, 1.5, 1],
        rotate: [0, -15, 15, 0],
      }}
      transition={{ duration: 0.8 }}
      onAnimationComplete={onComplete}
    >
      <Heart className="fill-current" />
    </motion.div>
  )
}

// Composant pour l'animation play/pause
function PlayPauseAnimation({ 
  show, 
  icon, 
  onComplete 
}: { 
  show: boolean
  icon: React.ReactNode
  onComplete: () => void
}) {
  if (!show) return null

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 flex h-16 w-16 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white z-20"
      initial={{
        scale: 0,
        opacity: 0,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        opacity: [0, 1, 0],
        scale: [1, 1.3, 0],
      }}
      transition={{ duration: 0.6 }}
      onAnimationComplete={onComplete}
    >
      {icon}
    </motion.div>
  )
}

export default function VideoFeedCard({ item, initialTotal }: VideoFeedCardProps) {
  // Refs et états
  const videoRef = useRef<HTMLVideoElement>(null)
  const trackedRef = useRef(false)
  const [showHeart, setShowHeart] = useState(false)
  const [heartPosition, setHeartPosition] = useState({ x: 0, y: 0 })
  const [showPlayIcon, setShowPlayIcon] = useState(false)
  const [showPauseIcon, setShowPauseIcon] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [radialOpen, setRadialOpen] = useState(false)
  const [explosionEmojis, setExplosionEmojis] = useState<{id: number; emoji: string}[]>([])
  const pillRef = useRef<HTMLDivElement>(null)

  // Hooks
  // Reactions are handled via /api/reactions with optimistic updates
  
  const { handleIntersectingChange, togglePlayPause, currentVideo, isMute } = useVideoIntersection()
  const { toggleMute } = useFeedStore()
  // No local reaction store: single source of truth is the API

  // Build a stable mediaId and a stable guest user id
  const mediaId = stableMediaId({ rawId: item.id, profileId: item.author.id, url: item.url })
  // Robust check: only treat as video if URL looks like a video
  const isVideoUrl = typeof item.url === 'string' && /(\.mp4|\.webm|\.mov)(\?.*)?$/i.test(item.url)
  const shouldShowVideo = item.type === 'VIDEO' && isVideoUrl
  const [userId, setUserId] = useState<string | null>(null)
  useEffect(() => {
    try {
      const key = 'felora-user-id'
      let u = localStorage.getItem(key)
      if (!u) { u = `guest_${Math.random().toString(36).slice(2)}`; localStorage.setItem(key, u) }
      setUserId(u)
    } catch {}
  }, [])

  const { stats, userReactions, userHasLiked, loading, toggleReaction } = useReactions(mediaId, userId ?? undefined)

  // États dérivés (UI)
  const likeLoading = !!loading
  const totalDisplay = stats?.total ?? (initialTotal ?? 0)

  // Gestion des clics
  const handleSingleClick = useCallback(() => {
    togglePlayPause()
    if (currentVideo.isPlaying) {
      setShowPauseIcon(true)
    } else {
      setShowPlayIcon(true)
    }
  }, [togglePlayPause, currentVideo.isPlaying])

  const handleDoubleClick = useCallback(async (e: React.MouseEvent) => {
    // Position du clic pour l'animation
    const rect = e.currentTarget.getBoundingClientRect()
    setHeartPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setShowHeart(true)

    // Double tap = réaction LOVE
    await toggleReaction('LOVE')
  }, [toggleReaction])

  // Gestionnaire de clic unifié
  const handleVideoClick = useClickHandler(handleSingleClick, handleDoubleClick)

  // Gestion de l'intersection
  const onIntersectingChange = useCallback((inView: boolean) => {
    handleIntersectingChange({ id: item.id, inView, videoRef })
    if (inView && !trackedRef.current) {
      trackedRef.current = true
      try { (window as any)?.umami?.track?.('media_view', { mediaId }) } catch {}
    }
  }, [handleIntersectingChange, item.id, mediaId])

  // Click outside to close pill
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (radialOpen && pillRef.current && !pillRef.current.contains(event.target as Node)) {
        setRadialOpen(false)
        setShowReactions(false)
      }
    }
    
    if (radialOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [radialOpen])

  // Actions
  const onReact = useCallback((emoji: string) => {
    const map: Record<string, any> = { '💖':'LOVE','🔥':'FIRE','🤤':'WOW','💋':'SMILE' }
    const type = map[emoji] || 'SMILE'
    toggleReaction(type)
    setShowReactions(false)
    
    // Créer l'animation d'explosion d'emojis comme sur la page profil
    const newExplosions = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      emoji
    }))
    setExplosionEmojis(newExplosions)

    // Clear explosions after animation
    setTimeout(() => {
      setExplosionEmojis([])
    }, 3000)
  }, [toggleReaction])

  const onLike = useCallback(() => {
    toggleReaction('LIKE')
  }, [toggleReaction])
  // Partage / Follow retirés de l'UI selon demande

  return (
    <InView
      threshold={0.5}
      onChange={onIntersectingChange}
      style={{
        height: '100dvh',
        scrollSnapStop: 'always',
        scrollSnapAlign: 'start',
      }}
      className="relative w-full overflow-hidden bg-black"
    >
      {/* Vidéo Background */}
      <div className="absolute inset-0">
        {shouldShowVideo ? (
          <video
            aria-label="Lire/Pause média"
            ref={videoRef}
            className="w-full h-full object-cover cursor-pointer"
            loop
            muted
            playsInline
            preload="metadata"
            poster={item.thumb}
            onClick={handleVideoClick}
          >
            <source src={item.url} type="video/mp4" />
          </video>
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center cursor-pointer"
            style={{ 
              backgroundImage: `url(${item.url})`,
              backgroundColor: '#1a1a1a'
            }}
            onClick={handleVideoClick}
          />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* Animations */}
      <HeartAnimation 
        show={showHeart}
        position={heartPosition}
        onComplete={() => setShowHeart(false)}
      />
      
      <PlayPauseAnimation
        show={showPlayIcon}
        icon={<Play className="w-8 h-8" />}
        onComplete={() => setShowPlayIcon(false)}
      />
      
      <PlayPauseAnimation
        show={showPauseIcon}
        icon={<Pause className="w-8 h-8" />}
        onComplete={() => setShowPauseIcon(false)}
      />

      {/* Explosion d'emojis comme sur la page profil */}
      <AnimatePresence>
        {explosionEmojis.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ scale: 0, opacity: 1, x: 0, y: 0, rotate: 0 }}
            animate={{ 
              scale: [0, 1.5, 0.8],
              opacity: [1, 0.8, 0],
              x: [0, (Math.random() - 0.5) * 400],
              y: [0, (Math.random() - 0.5) * 400],
              rotate: [0, (Math.random() - 0.5) * 720]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut", delay: index * 0.1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-5xl z-30"
          >
            {item.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative z-10 flex h-full pointer-events-none">
        {/* Profile Info - Left */}
        <div className="flex-1 flex flex-col justify-end p-6 pb-32">
          <div className="space-y-4 pointer-events-auto">
            {/* Author Info */}
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                  {item.author.name}
                </h2>
              </div>
              <Crown className="w-6 h-6 text-[#FF6B9D] drop-shadow" />
              <Diamond className="w-5 h-5 text-[#4FD1C7] drop-shadow" />
            </div>

            {/* Type de média uniquement (pas de commentaires, date/heure) */}
            <div className="space-y-2 text-white/90 drop-shadow">
              <div className="text-xs">
                <span className="text-[#4FD1C7] font-semibold">
                  {item.type === 'VIDEO' ? 'Vidéo' : 'Photo'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions - Right */}
        <div className="flex flex-col items-center justify-center gap-6 p-6 pb-6 pointer-events-auto">
          {/* Avatar (accueil) – clique pour ouvrir le profil */}
          <div className="relative">
            <Link 
              href={`/profile/${item.author.id}`} 
              aria-label={`Voir le profil de ${item.author.name}`}
              onClick={(e) => e.stopPropagation()}
              className="block"
            >
              <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-gray-800/80 shadow-lg cursor-pointer">
                <div 
                  className="w-full h-full bg-cover bg-center opacity-80"
                  style={{ backgroundImage: `url(${item.author.avatar || item.url})` }}
                />
              </div>
            </Link>
            {/* Badge vérifié */}
            {(item.author.verified ?? true) && (
              <div
                className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center bg-[#111827] border border-white/20 text-[#4FD1C7] shadow-lg"
                title="Profil vérifié"
              >
                <BadgeCheck className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Mute Button (vidéos seulement) */}
          {item.type === 'VIDEO' && (
            <button
              onClick={() => toggleMute()}
              className="p-3 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/30 transition-all duration-200 shadow-lg"
            >
              {isMute ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
          )}

          {/* Like (style identique au fullscreen profil) */}
          <div className="relative flex flex-col items-center gap-2">
            <button
              onClick={onLike}
              disabled={likeLoading}
              className={`w-14 h-14 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
                userHasLiked 
                  ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30' 
                  : 'bg-black/70 text-white hover:bg-black/90'
              } ${likeLoading ? 'opacity-70' : ''}`}
              aria-label={userHasLiked ? 'Retirer le like' : 'Aimer'}
            >
              <Heart size={24} className={userHasLiked ? 'fill-current' : ''} />
            </button>
          </div>

          {/* Réactions (cercle flamme, style fullscreen profil) */}
          <div className="relative flex flex-col items-center gap-2">
            {radialOpen && (
              <div
                className="fixed inset-0 z-0"
                onClick={(e)=>{ e.stopPropagation(); setRadialOpen(false); setShowReactions(false) }}
              />
            )}
            <button
              onClick={() => { setShowReactions(v => !v); setRadialOpen(v => !v) }}
              className={`relative z-10 w-14 h-14 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
                (userReactions?.length ?? 0) > 0
                  ? 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30'
                  : 'bg-black/70 text-white hover:bg-black/90'
              }`}
              aria-haspopup="true"
              aria-expanded={radialOpen}
            >
              <Flame size={24} className={(userReactions?.length ?? 0) > 0 ? '' : 'text-violet-300'} />
            </button>
            
            {/* Menu radial (identique au fullscreen profil) */}
            {radialOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute left-1/2 top-1/2 pointer-events-none"
                style={{
                  transform: `translate(calc(-50% - ${Math.round(80 * 0.28)}px), calc(-50% - ${Math.round(80 * 0.24)}px))`
                }}
              >
                {[
                  { emoji: '💖', type: 'LOVE' },
                  { emoji: '🔥', type: 'FIRE' },
                  { emoji: '🤤', type: 'WOW' },
                  { emoji: '💋', type: 'SMILE' },
                ].map(({ emoji, type }, idx, arr) => {
                  const count = arr.length
                  const start = 30
                  const end = 150
                  const t = count > 1 ? idx / (count - 1) : 0.5
                  const rotationDeg = 60
                  const angle = (start + (end - start) * t + rotationDeg) * (Math.PI / 180)
                  const r = 80
                  const x = Math.cos(angle) * r
                  const y = Math.sin(angle) * r
                  return (
                    <div
                      key={emoji}
                      className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{ width: 0, height: 0 }}
                    >
                      <motion.button
                        initial={{ scale: 0, x: 0, y: 0 }}
                        animate={{ scale: 1, x, y }}
                        exit={{ scale: 0, x: 0, y: 0 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 18, delay: idx * 0.04 }}
                        whileHover={{ scale: 1.18, boxShadow: '0 8px 24px rgba(168,85,247,0.18), 0 4px 12px rgba(255,107,157,0.12)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onReact(emoji)
                          setRadialOpen(false)
                        }}
                        className="w-11 h-11 rounded-full bg-black/70 border border-white/10 backdrop-blur-md flex items-center justify-center text-2xl hover:bg-black/80"
                        aria-label={`Réagir ${emoji}`}
                        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)' }}
                      >
                        {emoji}
                      </motion.button>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </InView>
  )
}
