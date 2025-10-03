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

  // Hooks
  const { handleIntersectingChange, togglePlayPause, currentVideo, isMute } = useVideoIntersection()
  const { toggleMute } = useFeedStore()
  const screenCharacteristics = useScreenCharacteristics()
  const { data: session } = useSession()

  // Build a stable mediaId and a stable guest user id
  const mediaId = stableMediaId({ rawId: item.id, profileId: item.author.id, url: item.url })
  // Utiliser l'ID réel du profil au lieu du slug généré
  const profileId = item.author.id
  
  // Debug: vérifier que l'ID du profil est correct
  console.log('🔗 [VIDEO FEED CARD] Profile ID:', profileId, 'Author:', item.author.name)
  
  // Vérifier si l'utilisateur est le propriétaire du média
  const isOwner = session?.user?.id === item.author.id
  
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

  // Sécuriser l'appel au hook de réactions (évite le destructuring sur undefined)
  const reactionsRes = useReactions(mediaId, userId ?? undefined)
  const stats = reactionsRes?.stats || { reactions: {}, total: 0 }
  const userReactions = reactionsRes?.userReactions || []
  const userHasLiked = reactionsRes?.userHasLiked || false
  const loading = reactionsRes?.loading || false
  const toggleReaction = reactionsRes?.toggleReaction || (async (_t: any) => {})

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

  // Click outside to close pill
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (radialOpen) {
        setRadialOpen(false)
        setShowReactions(false)
      }
    }
    
    if (radialOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [radialOpen])

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
      threshold={0.5}
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
        {shouldShowVideo ? (
          <video
            aria-label="Lire/Pause média"
            ref={videoRef}
            className="w-full h-full cursor-pointer"
            style={{
              objectFit: 'cover',
              objectPosition: 'center center',
              // Optimisation pour éviter les déformations
              minWidth: '100%',
              minHeight: '100%',
              maxWidth: 'none',
              maxHeight: 'none'
            }}
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
            className="w-full h-full cursor-pointer"
            style={{ 
              backgroundImage: `url(${item.url})`,
              backgroundColor: '#1a1a1a',
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              // Optimisation pour éviter les déformations
              minWidth: '100%',
              minHeight: '100%'
            }}
            onClick={handleVideoClick}
          />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
        
        {/* Menu de gestion des médias (propriétaire uniquement) */}
        {isOwner && (
          <div className="absolute top-4 right-4 z-20">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMediaMenu(!showMediaMenu)
                }}
                className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors flex items-center justify-center"
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
      </div>

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
        {/* Profile Info - Left */}
        <div className="flex-1 flex flex-col justify-end p-4 pb-24">
          <div className="space-y-3 pointer-events-auto">
            {/* Author Info */}
            <div className="flex items-center gap-2">
              <div>
                <h2 className="text-lg font-semibold text-white drop-shadow-lg">
                  {item.author.name}
                </h2>
              </div>
              <Crown className="w-4 h-4 text-[#FF6B9D] drop-shadow" />
              <Diamond className="w-3.5 h-3.5 text-[#4FD1C7] drop-shadow" />
            </div>

            {/* Type de média */}
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
        <div className="flex flex-col items-center justify-center gap-4 p-4 pb-4 pointer-events-auto">
          {/* Avatar */}
          <div className="relative">
            <Link 
              href={`/profile-test/escort/${profileId}`} 
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
              className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
                userHasLiked 
                  ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30' 
                  : 'bg-black/70 text-white hover:bg-black/90'
              }`}
              aria-label={userHasLiked ? 'Retirer le like' : 'Aimer'}
            >
              <Heart size={18} className={userHasLiked ? 'fill-current' : ''} />
            </button>
            <span className="text-xs text-white/70">{totalDisplay}</span>
          </div>

          {/* Réactions */}
          <div className="relative flex flex-col items-center gap-1">
            {radialOpen && (
              <div
                className="fixed inset-0 z-0"
                onClick={(e)=>{ e.stopPropagation(); setRadialOpen(false); setShowReactions(false) }}
              />
            )}
            <button
              onClick={() => { setShowReactions(v => !v); setRadialOpen(v => !v) }}
              className={`relative z-10 w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
                showReactions
                  ? 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30'
                  : 'bg-black/70 text-white hover:bg-black/90'
              }`}
              aria-haspopup="true"
              aria-expanded={radialOpen}
            >
              <Flame size={18} className={showReactions ? '' : 'text-violet-300'} />
            </button>
            
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
                          e.stopPropagation(); 
                          onReact(emoji)
                          setRadialOpen(false)
                        }}
                        className="w-9 h-9 rounded-full bg-black/70 border border-white/10 backdrop-blur-md flex items-center justify-center text-lg hover:bg-black/80"
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
