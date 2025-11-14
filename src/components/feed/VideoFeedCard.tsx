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
import Hls from 'hls.js'

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
  thumb: string
  visibility: string
  ownerType?: 'ESCORT' | 'CLUB'
  clubHandle?: string | null
  author: MediaAuthor
  likeCount: number
  reactCount: number
  createdAt: string
}

interface VideoFeedCardProps {
  item: MediaItem
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
      className="pointer-events-none absolute text-4xl text-[#FF6B9D] z-20"
      style={{ left: position.x - 20, top: position.y - 20 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        opacity: [0.8, 1, 0],
        scale: [1, 1.3, 1],
        rotate: [0, -10, 10, 0],
      }}
      transition={{ duration: 0.6 }}
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
      className="absolute left-1/2 top-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white z-20"
      initial={{
        scale: 0,
        opacity: 0,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        opacity: [0, 1, 0],
        scale: [1, 1.2, 0],
      }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={onComplete}
    >
      {icon}
    </motion.div>
  )
}

export default function VideoFeedCard({ item, initialTotal }: VideoFeedCardProps) {
  // Refs et états
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
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

  // États pour l'optimisation vidéo
  const [videoError, setVideoError] = useState<string | null>(null)
  const [videoReady, setVideoReady] = useState(false)
  const [isInView, setIsInView] = useState(false)

  // Debug : suivre les changements de videoReady
  useEffect(() => {
    console.log(`🎥 [${item.id}] videoReady changed:`, videoReady)
  }, [videoReady, item.id])

  // 🎬 HLS.js setup pour compatibilité tous navigateurs (Samsung Internet, etc.)
  useEffect(() => {
    const video = videoRef.current
    if (!video || item.type !== 'VIDEO') return

    const videoUrl = item.url
    const isHLS = videoUrl.includes('.m3u8')

    if (!isHLS) {
      // Vidéo normale (MP4, etc.) - pas besoin de hls.js
      video.src = videoUrl
      return
    }

    // Vidéo HLS - utiliser hls.js si nécessaire
    if (Hls.isSupported()) {
      // hls.js supporté (la plupart des navigateurs sauf Safari)
      console.log(`🎬 [HLS.js] Initialisation pour ${item.id}`)

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 30,
      })

      hls.loadSource(videoUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log(`✅ [HLS.js] Manifest chargé pour ${item.id}`)
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error(`❌ [HLS.js] Erreur pour ${item.id}:`, data)
        if (data.fatal) {
          setVideoError(`Erreur HLS: ${data.type}`)
        }
      })

      hlsRef.current = hls

      return () => {
        console.log(`🧹 [HLS.js] Cleanup pour ${item.id}`)
        hls.destroy()
        hlsRef.current = null
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari natif HLS support
      console.log(`🍎 [Safari HLS] Support natif pour ${item.id}`)
      video.src = videoUrl
    } else {
      // Aucun support HLS
      console.error(`❌ [HLS] Pas de support HLS pour ${item.id}`)
      setVideoError('Format vidéo non supporté par ce navigateur')
    }
  }, [item.url, item.type, item.id])

  // Hooks
  const { handleIntersectingChange, togglePlayPause, currentVideo, isMute } = useVideoIntersection()
  const { toggleMute } = useFeedStore()
  const { data: session } = useSession()

  // Build a stable mediaId and a stable guest user id
  // IMPORTANT: On force rawId: null pour utiliser le hash basé sur profileId + url
  // Cela garantit que le même média a le même ID dans le feed ET dans le profil
  const mediaId = stableMediaId({ rawId: null, profileId: item.author.id, url: item.url })

  // Déterminer l'URL du profil selon le type (CLUB ou ESCORT)
  const isClub = item.ownerType === 'CLUB'
  const profileUrl = isClub && item.clubHandle
    ? `/profile-test/club/${item.clubHandle}`
    : `/profile/${item.author.id}`

  // Vérifier si l'utilisateur est le propriétaire du média (uniquement si connecté)
  const isOwner = !!(session?.user?.id && session.user.id === item.author.id)

  const [userId, setUserId] = useState<string | null>(null)
  useEffect(() => {
    try {
      const key = 'felora-user-id'
      let u = localStorage.getItem(key)
      if (!u) { u = `guest_${Math.random().toString(36).slice(2)}`; localStorage.setItem(key, u) }
      setUserId(u)
    } catch {}
  }, [])

  // Sécuriser l'appel au hook de réactions (évite le destructuring sur undefined)
  const reactionsRes = useReactions(mediaId, userId ?? undefined)
  const stats = reactionsRes?.stats || { reactions: {}, total: 0 }
  const userReactions = reactionsRes?.userReactions || []
  const userHasLiked = reactionsRes?.userHasLiked || false
  const loading = reactionsRes?.loading || false
  const toggleReaction = reactionsRes?.toggleReaction || (async (_t: any) => {})

  // États dérivés (UI)
  // Afficher sous le bouton like uniquement le nombre de likes (pas le total des réactions)
  const likeDisplay = (stats?.reactions && typeof stats.reactions.LIKE === 'number')
    ? stats.reactions.LIKE
    : (initialTotal ?? 0)

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

  // Gestion de l'intersection avec chargement intelligent
  const onIntersectingChange = useCallback((inView: boolean) => {
    setIsInView(inView)

    if (videoRef.current) {
      handleIntersectingChange({ id: item.id, inView, videoRef: videoRef as React.RefObject<HTMLVideoElement> })
    }

    if (inView && !trackedRef.current) {
      trackedRef.current = true
      try { (window as any)?.umami?.track?.('media_view', { mediaId }) } catch {}
    }
  }, [handleIntersectingChange, item.id, mediaId])

  // Actions
  const onReact = useCallback((emoji: string) => {
    console.log('🔥 [VIDEO FEED CARD] onReact called with emoji:', emoji)
    const map: Record<string, any> = { '💖':'LOVE','🔥':'FIRE','🤤':'WOW','💋':'SMILE' }
    const type = map[emoji] || 'SMILE'
    console.log('🔥 [VIDEO FEED CARD] Mapped to type:', type)
    console.log('🔥 [VIDEO FEED CARD] Calling toggleReaction with type:', type)
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

  // Fonctions de gestion des médias
  const handleMediaAction = useCallback(async (action: string) => {
    if (!isOwner) return
    
    setIsManaging(true)
    try {
      const response = await fetch(`/api/media/${item.id}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ [MEDIA MANAGEMENT] Action réussie:', action, result)
        
        // Rafraîchir la page ou mettre à jour l'état local
        if (action === 'delete') {
          // Le média sera supprimé, on peut fermer le menu
          setShowMediaMenu(false)
          setShowDeleteConfirm(false)
        }
      } else {
        console.error('❌ [MEDIA MANAGEMENT] Erreur:', response.status)
        alert('Erreur lors de la gestion du média')
      }
    } catch (error) {
      console.error('❌ [MEDIA MANAGEMENT] Erreur:', error)
      alert('Erreur de connexion')
    } finally {
      setIsManaging(false)
    }
  }, [isOwner, item.id])

  const handleDelete = useCallback(() => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce média ? Cette action est irréversible.')) {
      handleMediaAction('delete')
    }
  }, [handleMediaAction])

  const handleVisibilityChange = useCallback((visibility: 'PUBLIC' | 'PRIVATE' | 'PREMIUM') => {
    handleMediaAction(`visibility:${visibility}`)
  }, [handleMediaAction])

  const handleDownload = useCallback(() => {
    const link = document.createElement('a')
    link.href = item.url
    link.download = `media-${item.id}.${item.type === 'VIDEO' ? 'mp4' : 'jpg'}`
    link.click()
  }, [item.url, item.id, item.type])

  // Variables dupliquées supprimées - déjà déclarées ligne 148

  return (
    <InView
      threshold={0.0}
      rootMargin="200px"
      onChange={onIntersectingChange}
      style={{
        scrollSnapStop: 'always',
        scrollSnapAlign: 'start',
      }}
      className="relative w-full bg-black"
    >
      <ResponsiveVideoContainer
        aspectRatio="9:16"
        maxHeight="calc(100vh - 64px)"
        minHeight="calc(100vh - 64px)"
        className="bg-black"
      >
      {/* Vidéo Background */}
      <div className="absolute inset-0 bg-black">
        {/* Fond noir pour contain */}

        {/* Si c'est une IMAGE, ne pas essayer de la lire comme vidéo */}
        {item.type === 'IMAGE' && (
          <img
            src={item.url}
            alt=""
            className="absolute inset-0 w-full h-full cursor-pointer"
            style={{
              objectFit: 'contain',
              objectPosition: 'center',
              zIndex: 2
            }}
            onClick={handleVideoClick}
          />
        )}

        {/* Vidéo - chargée avec IntersectionObserver - seulement si TYPE = VIDEO */}
        {item.type === 'VIDEO' && (
        <video
          aria-label="Lire/Pause média"
          ref={videoRef}
          className="w-full h-full cursor-pointer transition-opacity duration-500"
          style={{
            objectFit: 'contain',
            objectPosition: 'center center',
            opacity: videoReady ? 1 : 0,
            zIndex: 2
          }}
          loop
          muted={true}
          playsInline
          preload="metadata"
          poster={item.thumb}
          onClick={handleVideoClick}
          onLoadStart={() => {
            console.log('🎬 [VIDEO] LoadStart:', item.id, 'URL:', item.url)
            setVideoError(null)
            // Ne pas réinitialiser videoReady si déjà prêt (évite le clignotement)
            // setVideoReady(false) → Supprimé car cause les écrans noirs
          }}
          onLoadedMetadata={() => {
            console.log('📦 [VIDEO] Metadata loaded:', item.id)
            // Métadonnées chargées - appliquer le mute global
            if (videoRef.current) {
              videoRef.current.muted = isMute
            }
          }}
          onCanPlay={() => {
            console.log('✅ [VIDEO] CanPlay:', item.id)
            // Buffer suffisant pour commencer la lecture
            setVideoReady(true)
            setVideoError(null)
            // S'assurer que le mute est appliqué
            if (videoRef.current) {
              videoRef.current.muted = isMute
            }
          }}
          onWaiting={() => {
            console.log('⏳ [VIDEO] Waiting (buffering):', item.id)
          }}
          onStalled={() => {
            console.log('⚠️ [VIDEO] Stalled (network issue?):', item.id)
          }}
          onError={(e) => {
            const target = e.target as HTMLVideoElement
            const error = target.error

            console.error('❌ [VIDEO] Error for:', item.id)
            console.error('   URL:', item.url)
            console.error('   Type:', item.type)
            console.error('   Thumb:', item.thumb)
            console.error('   Error code:', error?.code)
            console.error('   Error message:', error?.message)
            console.error('   Network state:', target.networkState)
            console.error('   Ready state:', target.readyState)

            if (error) {
              setVideoError(`Erreur ${error.code}: ${error.message}`)
            } else {
              setVideoError('Vidéo non disponible')
            }
            setVideoReady(false)
          }}
        />
        )}

        {/* Overlay d'erreur si nécessaire - seulement pour vidéos */}
        {item.type === 'VIDEO' && videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="text-center text-white/80">
              <AlertTriangle className="w-16 h-16 mx-auto mb-2 text-red-500" />
              <div className="text-sm font-medium mb-1">Vidéo non disponible</div>
              <div className="text-xs text-white/50">{videoError}</div>
            </div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" style={{ zIndex: 3 }} />
      </div>

      {/* Menu de gestion des médias (propriétaire uniquement) */}
        {isOwner && (
          <div className="absolute top-4 right-4 z-30 pointer-events-auto">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('🔧 [MEDIA MENU] Clic sur le bouton 3 points')
                  setShowMediaMenu(!showMediaMenu)
                }}
                className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors flex items-center justify-center border border-white/20"
                aria-label="Options du média"
              >
                <MoreVertical size={16} />
              </button>
              
              {/* Menu déroulant */}
              {showMediaMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMediaMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-10 w-48 bg-black/90 backdrop-blur-md rounded-lg border border-white/10 shadow-xl z-20"
                  >
                    <div className="py-2">
                      {/* Changer la visibilité */}
                      <div className="px-3 py-2 text-xs text-white/60 border-b border-white/10">
                        Visibilité
                      </div>
                      
                      <button
                        onClick={() => {
                          handleVisibilityChange('PUBLIC')
                          setShowMediaMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-3"
                      >
                        <Eye size={16} />
                        <span>Public</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          handleVisibilityChange('PRIVATE')
                          setShowMediaMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-3"
                      >
                        <EyeOff size={16} />
                        <span>Privé</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          handleVisibilityChange('PREMIUM')
                          setShowMediaMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-3"
                      >
                        <PremiumIcon size={16} />
                        <span>Premium</span>
                      </button>
                      
                      <div className="px-3 py-2 text-xs text-white/60 border-b border-white/10">
                        Actions
                      </div>
                      
                      <button
                        onClick={() => {
                          handleDownload()
                          setShowMediaMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-3"
                      >
                        <Download size={16} />
                        <span>Télécharger</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          // TODO: Implémenter l'édition
                          alert('Fonction d\'édition à venir')
                          setShowMediaMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-3"
                      >
                        <Edit3 size={16} />
                        <span>Modifier</span>
                      </button>
                      
                      <div className="px-3 py-2 text-xs text-white/60 border-b border-white/10">
                        Danger
                      </div>
                      
                      <button
                        onClick={() => {
                          handleDelete()
                          setShowMediaMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/20 flex items-center gap-3"
                      >
                        <Trash2 size={16} />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        )}

      {/* Animations */}
      <HeartAnimation 
        show={showHeart}
        position={heartPosition}
        onComplete={() => setShowHeart(false)}
      />
      
      <PlayPauseAnimation
        show={showPlayIcon}
        icon={<Play className="w-5 h-5" />}
        onComplete={() => setShowPlayIcon(false)}
      />
      
      <PlayPauseAnimation
        show={showPauseIcon}
        icon={<Pause className="w-5 h-5" />}
        onComplete={() => setShowPauseIcon(false)}
      />

      {/* Explosion d'emojis */}
      <AnimatePresence>
        {explosionEmojis.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ scale: 0, opacity: 1, x: 0, y: 0, rotate: 0 }}
            animate={{ 
              scale: [0, 1.2, 0.6],
              opacity: [1, 0.8, 0],
              x: [0, (Math.random() - 0.5) * 300],
              y: [0, (Math.random() - 0.5) * 300],
              rotate: [0, (Math.random() - 0.5) * 360]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-3xl z-30"
          >
            {item.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative z-10 flex h-full pointer-events-none">
        {/* Profile Info - Left - Position absolue fixe */}
        <div className="absolute bottom-20 left-4 pointer-events-auto">
          <div className="space-y-2">
            {/* Author Info */}
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white drop-shadow-lg">
                {item.author.name}
              </h2>
              <Crown className="w-4 h-4 text-[#FF6B9D] drop-shadow" />
              <Diamond className="w-3.5 h-3.5 text-[#4FD1C7] drop-shadow" />
            </div>

            {/* Type de média */}
            <div className="text-xs">
              <span className="text-[#5FE1D7] font-semibold drop-shadow">
                {item.type === 'VIDEO' ? 'Vidéo' : 'Photo'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions - Right - Position absolue fixe à droite */}
        <div className="absolute right-4 top-0 bottom-0 flex flex-col items-center justify-center gap-4 pointer-events-auto">
          {/* Avatar */}
          <div className="relative">
            <Link
              href={profileUrl}
              aria-label={`Voir le profil de ${item.author.name}`}
              onClick={(e) => e.stopPropagation()}
              className="block"
            >
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-800/80 shadow-lg cursor-pointer">
                <div 
                  className="w-full h-full bg-cover bg-center opacity-80"
                  style={{ backgroundImage: `url(${item.author.avatar || item.url})` }}
                />
              </div>
            </Link>
            {/* Badge vérifié */}
            {(item.author.verified ?? true) && (
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-[#111827] border border-white/20 text-[#4FD1C7] shadow-lg"
                title="Profil vérifié"
              >
                <BadgeCheck className="w-3 h-3" />
              </div>
            )}
          </div>

          {/* Mute Button (vidéos seulement) */}
          {item.type === 'VIDEO' && (
            <button
              onClick={toggleMute}
              className="p-2 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/30 transition-all duration-200 shadow-lg"
            >
              {isMute ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}

          {/* Like */}
          <div className="relative flex flex-col items-center gap-1">
            <button
              onClick={onLike}
              className={`w-9 h-9 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
                userHasLiked
                  ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                  : 'bg-black/70 text-white hover:bg-black/90'
              }`}
              aria-label={userHasLiked ? 'Retirer le like' : 'Aimer'}
            >
              <Heart size={16} className={userHasLiked ? 'fill-current' : ''} />
            </button>
            <span className="text-xs text-white/90">{likeDisplay}</span>
          </div>

          {/* Réactions */}
          <div className="relative flex flex-col items-center gap-1">
            <button
              onClick={() => {
                console.log('🔥 [VIDEO FEED CARD] Reaction button clicked')
                setShowReactions(v => {
                  console.log('🔥 [VIDEO FEED CARD] setShowReactions from', v, 'to', !v)
                  return !v
                })
                setRadialOpen(v => {
                  console.log('🔥 [VIDEO FEED CARD] setRadialOpen from', v, 'to', !v)
                  return !v
                })
              }}
              className={`relative z-10 w-9 h-9 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
                userReactions.length > 0
                  ? 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30'
                  : showReactions
                    ? 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30'
                    : 'bg-black/70 text-white hover:bg-black/90'
              }`}
              aria-haspopup="true"
              aria-expanded={radialOpen}
            >
              <Flame size={16} className={userReactions.length > 0 ? 'text-violet-300' : showReactions ? 'text-violet-300' : ''} />
            </button>
            <span className="text-xs text-white/90">
              {(stats?.reactions?.LOVE ?? 0) + (stats?.reactions?.FIRE ?? 0) + (stats?.reactions?.WOW ?? 0) + (stats?.reactions?.SMILE ?? 0)}
            </span>

            {/* Menu radial */}
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
                          console.log('🎯 [EMOJI BUTTON] Clicked on emoji:', emoji)
                          e.stopPropagation();
                          onReact(emoji)
                          setRadialOpen(false)
                        }}
                        className="w-8 h-8 rounded-full bg-black/70 border border-white/10 backdrop-blur-md flex items-center justify-center text-base hover:bg-black/80"
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
      </ResponsiveVideoContainer>
    </InView>
  )
}
