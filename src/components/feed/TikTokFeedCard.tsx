'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Heart, Crown, Diamond, Flame, VolumeX, Volume2, Play, Pause, BadgeCheck, MoreVertical, Trash2, Eye, EyeOff, Crown as PremiumIcon, Edit3, Download, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { InView } from 'react-intersection-observer'
import { useVideoIntersection } from '../../hooks/useVideoIntersection'
import { useFeedStore } from '../../stores/feedStore'
import useReactions from '@/hooks/useReactions'
import { stableMediaId } from '@/lib/reactions/stableMediaId'
import ResponsiveVideoContainer, { useScreenCharacteristics } from './ResponsiveVideoContainer'
import { useSession } from 'next-auth/react'
import { useTikTokPreloader } from '../../hooks/useTikTokPreloader'

// Types pour le feed
interface MediaAuthor {
  id: string
  handle: string
  name: string
  avatar: string
  verified?: boolean
}

interface MediaItem {
  id: string
  type: 'IMAGE' | 'VIDEO'
  url: string
  thumb?: string
  author: MediaAuthor
  ownerType: 'ESCORT' | 'CLUB'
  clubHandle?: string
  reactCount: number
  createdAt: string
}

interface TikTokFeedCardProps {
  item: MediaItem
  initialTotal?: number
  index: number
}

export default function TikTokFeedCard({ item, initialTotal, index }: TikTokFeedCardProps) {
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
  
  // États pour le menu de gestion
  const [showMediaMenu, setShowMediaMenu] = useState(false)
  const [isManaging, setIsManaging] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // États pour l'optimisation vidéo TIKTOK
  const [isInView, setIsInView] = useState(false)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(true) // PRÉCHARGER IMMÉDIATEMENT
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Hooks
  const { handleIntersectingChange, togglePlayPause, currentVideo, isMute } = useVideoIntersection()
  const { toggleMute } = useFeedStore()
  const screenCharacteristics = useScreenCharacteristics()
  const { data: session } = useSession()
  const { addToPreloadQueue, isPreloaded } = useTikTokPreloader()

  // Build a stable mediaId
  const mediaId = stableMediaId({ rawId: null, profileId: item.author.id, url: item.url })

  // Déterminer l'URL du profil selon le type
  const isClub = item.ownerType === 'CLUB'
  const profileUrl = isClub && item.clubHandle
    ? `/profile-test/club/${item.clubHandle}`
    : `/profile/${item.author.id}`

  // Vérifier si l'utilisateur est le propriétaire du média
  const isOwner = session?.user?.id === item.author.id

  // PRÉCHARGEMENT INTELLIGENT TIKTOK
  useEffect(() => {
    if (item.type === 'VIDEO' && item.url) {
      // Précharger les 3 premières vidéos immédiatement
      const priority = index < 3 ? 10 : Math.max(0, 5 - index)
      addToPreloadQueue(item.id, item.url, priority)
    }
  }, [item.id, item.url, item.type, index, addToPreloadQueue])

  // Gestion de l'intersection TIKTOK (ultra-rapide)
  const onIntersectingChange = useCallback((inView: boolean) => {
    setIsInView(inView)
    handleIntersectingChange({ id: item.id, inView, videoRef })
    
    if (inView && !trackedRef.current) {
      trackedRef.current = true
      try { (window as any)?.umami?.track?.('media_view', { mediaId }) } catch {}
    }
    
    // Charger immédiatement quand visible
    if (inView) {
      setShouldLoadVideo(true)
    }
  }, [handleIntersectingChange, item.id, mediaId, videoRef])

  // Gestion des erreurs vidéo
  const handleVideoError = useCallback((e: any) => {
    const target = e.target as HTMLVideoElement
    const error = target.error
    
    console.error('❌ Erreur vidéo TikTok:', {
      errorCode: error?.code,
      errorMessage: error?.message,
      src: target.src,
      networkState: target.networkState,
      readyState: target.readyState,
      videoId: item.id
    })
    
    setHasError(true)
    setIsVideoReady(false)
  }, [item.id])

  // Gestion du chargement vidéo
  const handleVideoLoadStart = useCallback(() => {
    console.log('🎬 Chargement vidéo TikTok:', item.id)
    setHasError(false)
  }, [item.id])

  const handleVideoCanPlay = useCallback(() => {
    console.log('✅ Vidéo TikTok prête:', item.id)
    setIsVideoReady(true)
    setHasError(false)
  }, [item.id])

  // Actions
  const onReact = useCallback((emoji: string) => {
    console.log('🔥 [TIKTOK FEED CARD] onReact called with emoji:', emoji)
    toggleReaction(emoji)
    
    // Animation de cœur
    setShowHeart(true)
    setHeartPosition({ x: Math.random() * 200 - 100, y: Math.random() * 200 - 100 })
    setTimeout(() => setShowHeart(false), 1000)
  }, [])

  const { stats, userHasLiked, userReactions, toggleReaction } = useReactions(mediaId, session?.user?.id, 0)

  // Gestion des clics
  const handleVideoClick = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(e => console.warn('Play failed:', e))
        setShowPlayIcon(true)
        setTimeout(() => setShowPlayIcon(false), 500)
      } else {
        videoRef.current.pause()
        setShowPauseIcon(true)
        setTimeout(() => setShowPauseIcon(false), 500)
      }
    }
  }, [])

  const handleDownload = useCallback(() => {
    const link = document.createElement('a')
    link.href = item.url
    link.download = `felora-${item.id}.${item.type === 'VIDEO' ? 'mp4' : 'jpg'}`
    link.click()
  }, [item.url, item.id, item.type])

  return (
    <InView
      threshold={0.0}
      rootMargin="300px"
      onChange={onIntersectingChange}
      style={{
        scrollSnapStop: 'always',
        scrollSnapAlign: 'start',
      }}
      className="relative w-full bg-black"
    >
      <ResponsiveVideoContainer
        aspectRatio="9:16"
        maxHeight="100vh"
        minHeight="100vh"
        className="bg-black"
      >
        {/* Vidéo Background */}
        <div className="absolute inset-0">
          {shouldLoadVideo && item.type === 'VIDEO' ? (
            <video
              aria-label="Lire/Pause média"
              ref={videoRef}
              className="w-full h-full cursor-pointer"
              style={{
                objectFit: 'cover',
                objectPosition: 'center center',
                minWidth: '100%',
                minHeight: '100%',
                maxWidth: 'none',
                maxHeight: 'none'
              }}
              loop
              muted
              playsInline
              preload="auto"
              poster={item.thumb}
              onClick={handleVideoClick}
              onLoadStart={handleVideoLoadStart}
              onCanPlay={handleVideoCanPlay}
              onError={handleVideoError}
            >
              <source src={item.url} type="video/mp4" />
            </video>
          ) : item.type === 'IMAGE' ? (
            <img
              src={item.url}
              alt="Media"
              className="w-full h-full object-cover cursor-pointer"
              onClick={handleVideoClick}
            />
          ) : (
            <div 
              className="w-full h-full cursor-pointer flex items-center justify-center bg-black"
              style={{ 
                backgroundImage: item.thumb ? `url(${item.thumb})` : 'none',
                backgroundColor: '#1a1a1a',
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                minWidth: '100%',
                minHeight: '100%'
              }}
              onClick={handleVideoClick}
            >
              {hasError ? (
                <div className="text-center text-white/60">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-red-500" />
                  <div className="text-sm">Erreur de chargement</div>
                </div>
              ) : (
                <div className="text-center text-white/60">
                  <div className="text-4xl mb-2">🎬</div>
                  <div className="text-sm">
                    {isPreloaded(item.id) ? 'Prêt' : 'Chargement...'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
        
        {/* Contenu overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <Link href={profileUrl} className="flex items-center space-x-2">
                <img
                  src={item.author.avatar || '/logo-principal.png'}
                  alt={item.author.name}
                  className="w-10 h-10 rounded-full border-2 border-white/20"
                />
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-sm">{item.author.name}</span>
                    {item.author.verified && <BadgeCheck className="w-4 h-4 text-blue-400" />}
                  </div>
                  <div className="text-xs text-white/70">@{item.author.handle}</div>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Actions droite */}
          <div className="flex flex-col items-center space-y-4">
            {/* Réactions */}
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={() => onReact('❤️')}
                className="p-3 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all transform hover:scale-110"
              >
                <Heart className={`w-6 h-6 ${userReactions.includes('❤️') ? 'text-red-500 fill-current' : 'text-white'}`} />
              </button>
              
              <button
                onClick={() => onReact('🔥')}
                className="p-3 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all transform hover:scale-110"
              >
                <Flame className={`w-6 h-6 ${userReactions.includes('🔥') ? 'text-orange-500 fill-current' : 'text-white'}`} />
              </button>
              
              <button
                onClick={() => onReact('💎')}
                className="p-3 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all transform hover:scale-110"
              >
                <Diamond className={`w-6 h-6 ${userReactions.includes('💎') ? 'text-blue-500 fill-current' : 'text-white'}`} />
              </button>
            </div>

            {/* Compteur de réactions */}
            <div className="text-center">
              <div className="text-lg font-bold">
                {(stats?.total ?? 0) + (initialTotal || 0)}
              </div>
              <div className="text-xs text-white/70">réactions</div>
            </div>

            {/* Bouton son */}
            <button
              onClick={toggleMute}
              className="p-3 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all"
            >
              {isMute ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Animations */}
        <AnimatePresence>
          {showHeart && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ 
                scale: 1.5, 
                opacity: 0,
                x: heartPosition.x,
                y: heartPosition.y
              }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute text-red-500 text-4xl pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              ❤️
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play/Pause Animation */}
        <AnimatePresence>
          {showPlayIcon && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-black/50 rounded-full p-4">
                <Play className="w-12 h-12 text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPauseIcon && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-black/50 rounded-full p-4">
                <Pause className="w-12 h-12 text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ResponsiveVideoContainer>
    </InView>
  )
}
