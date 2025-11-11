'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Heart, Play, Crown, Smile, Share, MoreVertical, Flag, Edit, Trash2, Bookmark, Flame } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import useReactions, { ReactionType } from '../../../src/hooks/useReactions'
import { useMediaInteractions } from '../../../src/hooks/useProfileInteractions'
import ReactionBar from '../../../src/components/reactions/ReactionBar'
import { stableMediaId } from '@/lib/reactions/stableMediaId'
import MediaManagementModal from '../../../src/components/MediaManagementModal'
import { useHLS } from '../../../src/hooks/useHLS'

interface MediaItem {
  id?: string
  type: 'image' | 'video'
  url: string
  thumb?: string
  poster?: string
  isPrivate?: boolean
  visibility?: string
  price?: number
  description?: string
  likes?: number
  comments?: number
}

interface MediaFeedWithGalleryProps {
  media: MediaItem[]
  profileId: string
  profileName?: string
  userId?: string | null
  onLike?: (index: number) => Promise<void>
  onSave?: (index: number) => Promise<void>
  onReactionChange?: () => Promise<void>
  className?: string
  privateEnabled?: boolean
  viewerIsOwner?: boolean
  onDeleteMedia?: (mediaUrl: string, index: number) => void
  onEditMedia?: (mediaUrl: string, index: number) => void
  onUpdateMedia?: (mediaUrl: string, updates: Partial<MediaItem>) => Promise<void>
  hideTabsHeader?: boolean
  showPremiumTab?: boolean // Pour cacher l'onglet Premium (clubs n'ont pas de premium)
}

const EMOJI_REACTIONS = ['❤️', '😍', '🔥', '🥵', '😈', '💋', '🤤', '😘', '🫦', '🔞']

interface MediaPlayerProps extends MediaItem {
  index: number
  isActive: boolean
  profileId: string
  userId?: string | null
  onLike?: () => Promise<void>
  onSave?: () => Promise<void>
  onFullscreen?: () => void
  onReactionChange?: () => Promise<void> | void
  refreshTrigger?: number
  optimisticDelta?: number
  viewerIsOwner?: boolean
  onDeleteMedia?: (mediaUrl: string, index: number) => void
  onEditMedia?: (mediaUrl: string, index: number) => void
  onUpdateMedia?: (mediaUrl: string, updates: Partial<MediaItem>) => Promise<void>
}

function MediaPlayer({ id, type, url, thumb, poster, index, isActive, profileId, userId, onLike, onSave, onFullscreen, isPrivate, onReactionChange, refreshTrigger, optimisticDelta = 0, viewerIsOwner = false, onDeleteMedia, onEditMedia, onUpdateMedia, visibility, price }: MediaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState(false)
  const [guestId, setGuestId] = useState<string | null>(null)

  // Hook HLS pour supporter les vidéos Bunny.net (.m3u8)
  useHLS(videoRef, url, isActive && type === 'video')

  useEffect(() => {
    try {
      const key = 'felora-user-id'
      let u = localStorage.getItem(key)
      if (!u) { u = `guest_${Math.random().toString(36).slice(2)}`; localStorage.setItem(key, u) }
      setGuestId(u)
    } catch {}
  }, [])
  const effectiveUserId = useMemo(() => userId ?? guestId ?? 'felora-guest', [userId, guestId])
  const mediaId = useMemo(() => stableMediaId({ rawId: null, profileId, url }), [id, profileId, url])

  const { stats, userHasLiked, userReactions, toggleReaction } = useReactions(mediaId, effectiveUserId, refreshTrigger)
  

  const trackMediaView = useCallback(async (mediaUrl: string, mediaIndex: number) => {
    try {
      const trackingId = stableMediaId({ rawId: id || null, profileId, url: mediaUrl })
      // Umami event (si script présent)
      try { (window as any)?.umami?.track?.('media_view', { mediaId: trackingId }) } catch {}
      await fetch('/api/analytics/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetId: trackingId, 
          viewType: 'media'
        })
      })
    } catch (error) {
      console.error('Failed to track media view:', error)
    }
  }, [id, profileId])

  useEffect(() => {
    const video = videoRef.current
    if (!video || type !== 'video') return

    console.log('🎮 Video play control:', {
      isActive,
      isPrivate,
      hasVideo: !!video,
      videoSrc: video.src?.substring(0, 60),
      readyState: video.readyState,
      networkState: video.networkState
    })

    if (isActive && !isPrivate) {
      console.log('▶️ Attempting to play video...')
      video.play()
        .then(() => {
          console.log('✅ Video playing successfully')
          setIsPlaying(true)
        })
        .catch((err) => {
          console.error('❌ Video play failed:', err)
          setError(true)
        })
    } else {
      console.log('⏸️ Pausing video')
      video.pause()
      setIsPlaying(false)
    }
  }, [isActive, type, isPrivate])

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => setError(true))
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }, [])

  // 🔍 DEBUG LOGS - Log isActive changes
  useEffect(() => {
    if (type === 'video') {
      console.log('🎬 MediaFeedWithGallery - State Change:', {
        index,
        type,
        isActive,
        hasThumb: !!thumb,
        thumbUrl: thumb?.substring(0, 80),
        videoUrl: url?.substring(0, 80),
        isPrivate,
        error,
        hasVideoRef: !!videoRef.current
      })
    }
  }, [index, type, isActive, thumb, url, isPrivate, error])

  if (type === 'video') {
    // Dans la grille (isActive=false), TOUJOURS afficher le thumbnail (jamais la vidéo)
    // Cela évite les écrans noirs et optimise les performances
    if (!isActive) {
      console.log('📺 Rendering VIDEO in GRID mode (thumbnail):', { index, hasThumb: !!thumb, thumb })

      return (
        <div className="relative w-full h-full bg-black rounded-none overflow-hidden group">
          {thumb ? (
            // Utiliser <img> natif au lieu de Next.js Image pour bypasser l'optimisation
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt={`Video thumbnail ${index + 1}`}
              loading="lazy"
              className={`w-full h-full object-cover ${isPrivate ? 'blur-xl brightness-30' : ''}`}
              onError={(e) => {
                console.error('❌ Native img thumbnail failed to load:', { thumb, error: e })
                setError(true)
              }}
              onLoad={() => console.log('✅ Native img thumbnail loaded successfully:', thumb)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center">
                <Play size={48} className="text-white/50 mx-auto mb-2" />
                <span className="text-white/50 text-sm">Thumbnail en cours...</span>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              console.log('👆 Click on video thumbnail:', {
                index,
                url: url?.substring(0, 60),
                thumb: thumb?.substring(0, 60),
                isActive,
                type
              })
              onFullscreen && onFullscreen()
              trackMediaView(url, index)
            }}
            className="absolute inset-0 bg-transparent group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center"
            aria-label="Lire la vidéo"
          >
            <div className="w-16 h-16 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              {isPrivate ? <Crown size={24} className="text-white" /> : <Play size={24} className="text-white ml-1" />}
            </div>
          </button>

          <div className="absolute bottom-2 right-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-xs">
              <Flame className="w-4 h-4 text-violet-300" />
              <span>{(stats?.total ?? 0) + (optimisticDelta || 0)}</span>
            </div>
          </div>
        </div>
      )
    }

    // Dans le feed (isActive=true), afficher la vraie vidéo
    return (
      <div className="relative w-full h-full bg-black rounded-none overflow-hidden group">
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${isPrivate && !isActive ? 'blur-xl brightness-30' : ''}`}
          controls
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          webkit-playsinline="true"
          x5-video-player-type="h5"
          x5-video-player-fullscreen="true"
          poster={poster || thumb}
          onError={() => setError(true)}
        >
          {/* HLS.js injectera automatiquement la source */}
        </video>

        <button
          onClick={() => {
            onFullscreen && onFullscreen()
            trackMediaView(url, index)
          }}
          className="absolute inset-0 bg-transparent group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center"
          aria-label={isPlaying ? 'Mettre en pause la vidéo' : 'Lire la vidéo'}
        >
          {(!error) && (
            <div className="w-16 h-16 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              {isPrivate ? <Crown size={24} className="text-white" /> : <Play size={24} className="text-white ml-1" />}
            </div>
          )}
        </button>

        <div className="absolute bottom-2 right-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-xs">
            <Flame className="w-4 h-4 text-violet-300" />
            <span>{(stats?.total ?? 0) + (optimisticDelta || 0)}</span>
          </div>
        </div>



      </div>
    )
  }

  // Pour les vidéos, utiliser le thumbnail au lieu de l'URL .m3u8
  const displaySrc = type === 'video' ? (thumb || url) : url

  console.log('🖼️ Rendering fallback Image component:', {
    index,
    type,
    displaySrc: displaySrc?.substring(0, 60),
    isVideo: type === 'video',
    hasThumb: !!thumb
  })

  return (
    <div className="relative w-full h-full bg-black rounded-none overflow-hidden group">
      <Image
        src={displaySrc}
        alt={`Media ${index + 1}`}
        fill
        loading="lazy"
        className={`object-cover ${isPrivate ? 'blur-xl brightness-30' : ''}`}
        onError={(e) => {
          console.error('❌ Fallback Image failed:', { displaySrc, error: e })
          setError(true)
        }}
        sizes="(max-width: 768px) 50vw, 33vw"
      />

      <button
        onClick={() => {
          onFullscreen && onFullscreen()
          trackMediaView(url, index)
        }}
        className="absolute inset-0 bg-transparent group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center"
        aria-label="Voir le média en plein écran"
      >
        {isPrivate && (
          <div className="w-16 h-16 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <Crown size={24} className="text-white" />
          </div>
        )}
      </button>

      <div className="absolute bottom-2 right-2">
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-xs">
          <Flame className="w-4 h-4 text-violet-300" />
          <span>{(stats?.total ?? 0) + (optimisticDelta || 0)}</span>
        </div>
      </div>


    </div>
  )
}

export default function MediaFeedWithGallery({
  media,
  profileId,
  profileName = '',
  userId,
  onLike,
  onSave,
  onReactionChange,
  className = '',
  privateEnabled = false,
  viewerIsOwner = false,
  onDeleteMedia,
  onEditMedia,
  onUpdateMedia,
  hideTabsHeader = false,
  showPremiumTab = true
}: MediaFeedWithGalleryProps) {
  const router = useRouter()
  
  // Fonction par défaut pour onDeleteMedia
  const defaultDeleteMedia = async (mediaUrl: string, index: number): Promise<void> => {}
  
  const [activeTab, setActiveTab] = useState<'public' | 'premium' | 'private'>('public')
  const [fullscreenMedia, setFullscreenMedia] = useState<string | null>(null)
  const [fullscreenIndex, setFullscreenIndex] = useState(0)
  const [showReactions, setShowReactions] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [mediaReactions, setMediaReactions] = useState<Record<string, string>>({})
  const [explosionEmojis, setExplosionEmojis] = useState<{id: number; emoji: string}[]>([])
  const [reactionCount] = useState(4)
  const [globalRefreshTrigger, setGlobalRefreshTrigger] = useState(0)
  const [optimistic, setOptimistic] = useState<Record<string, number>>({})
  const reactionRadius = 80
  const fullscreenRef = useRef<HTMLDivElement>(null)
  const { isGalleryUnlocked, handleUnlockContent, handleUnlockGallery } = useMediaInteractions()
  const [unlockTarget, setUnlockTarget] = useState<{ id: string; url: string } | null>(null)
  const [showFullscreenManagementModal, setShowFullscreenManagementModal] = useState(false)
  

  // Catégorisation par visibility (PUBLIC, PREMIUM, PRIVATE)
  const publicContent = useMemo(() => media.filter(m => (m.visibility || 'PUBLIC') === 'PUBLIC'), [media])
  const premiumContent = useMemo(() => media.filter(m => (m.visibility || 'PUBLIC') === 'PREMIUM'), [media])
  const privateContent = useMemo(() => media.filter(m => (m.visibility || 'PUBLIC') === 'PRIVATE'), [media])

  const mixedContent = useMemo(() => [...publicContent, ...premiumContent, ...privateContent], [publicContent, premiumContent, privateContent])

  const fullUserId = useMemo(() => userId ?? 'dev-guest', [userId])

  // Detect #media-{id} in URL hash and open that media in fullscreen
  useEffect(() => {
    if (typeof window === 'undefined' || !media.length) return

    const hash = window.location.hash
    if (hash.startsWith('#media-')) {
      const mediaId = hash.substring(7) // Remove '#media-' prefix
      const mediaIndex = media.findIndex(m => m.id === mediaId)

      if (mediaIndex !== -1) {
        const targetMedia = media[mediaIndex]
        setFullscreenMedia(targetMedia.url)
        setFullscreenIndex(mediaIndex)

        // Remove hash from URL after opening (optional)
        setTimeout(() => {
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }, 100)
      }
    }
  }, [media])

  const fullscreenMediaId = useMemo(() => {
    if (!fullscreenMedia) return ''
    return stableMediaId({ rawId: null, profileId, url: fullscreenMedia })
  }, [mixedContent, profileId, fullscreenIndex, fullscreenMedia])
  
  const { userHasLiked: fsUserHasLiked, userReactions: fsUserReactions, toggleReaction: fsToggle } = useReactions(fullscreenMediaId, fullUserId)
  
  const RADIAL_CHOICES: { emoji: string; type: ReactionType }[] = [
    { emoji: '❤️', type: 'LOVE' },
    { emoji: '🔥', type: 'FIRE' },
    { emoji: '😮', type: 'WOW' },
    { emoji: '🙂', type: 'SMILE' },
  ]

  const handleEmojiReaction = useCallback((emoji: string) => {
    if (!fullscreenMedia) return
    
    setMediaReactions(prev => ({
      ...prev,
      [fullscreenMedia]: emoji
    }))
    
    setTimeout(() => {
      setMediaReactions(prev => {
        const { [fullscreenMedia]: removed, ...rest } = prev
        return rest
      })
    }, 2000)

    const newExplosions = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      emoji
    }))
    setExplosionEmojis(newExplosions)

    setTimeout(() => {
      setExplosionEmojis([])
    }, 3000)
    // Bump optimiste immédiat sur la tuile correspondante
    if (fullscreenMediaId) {
      setOptimistic(prev => ({ ...prev, [fullscreenMediaId]: (prev[fullscreenMediaId] || 0) + 1 }))
      // Attendre un court instant puis rafraîchir les stats et nettoyer le bump
      setTimeout(() => {
        setGlobalRefreshTrigger(v => v + 1)
        setOptimistic(prev => {
          const next = { ...prev }
          delete next[fullscreenMediaId]
          return next
        })
      }, 800)
    }
  }, [fullscreenMedia])

  const openFullscreen = useCallback((mediaUrl: string, index: number) => {
    setFullscreenMedia(mediaUrl)
    setFullscreenIndex(index)
    setShowReactions(false)
  }, [])

  const closeFullscreen = useCallback(() => {
    setFullscreenMedia(null)
    setShowReactions(false)
    setShowMenu(false)
  }, [])

  const nextMedia = useCallback(() => {
    const nextIndex = (fullscreenIndex + 1) % mixedContent.length
    setFullscreenIndex(nextIndex)
    setFullscreenMedia(mixedContent[nextIndex].url)
    setShowReactions(false)
  }, [fullscreenIndex, mixedContent])

  const prevMedia = useCallback(() => {
    const prevIndex = fullscreenIndex === 0 ? mixedContent.length - 1 : fullscreenIndex - 1
    setFullscreenIndex(prevIndex) 
    setFullscreenMedia(mixedContent[prevIndex].url)
    setShowReactions(false)
  }, [fullscreenIndex, mixedContent])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fullscreenMedia) return
      
      if (e.key === 'Escape') {
        closeFullscreen()
      } else if (e.key === 'ArrowRight') {
        nextMedia()
      } else if (e.key === 'ArrowLeft') {
        prevMedia()
      }
    }

    if (fullscreenMedia) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [fullscreenMedia, closeFullscreen, nextMedia, prevMedia])

  if (!media || media.length === 0) {
    return (
      <div className={`glass-card p-8 text-center ${className}`}>
        <div className="text-gray-400 mb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
            <Play size={32} />
          </div>
          <p className="text-lg font-semibold text-gray-300">Aucun contenu disponible</p>
          <p className="text-sm">Ce profil n'a pas encore publié de contenu.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {!hideTabsHeader && (
        <div className="border-t border-white/10">
          <div className="flex px-4">
            <button
              onClick={() => setActiveTab('public')}
              className={`flex-1 py-3 text-center transition-all ${
                activeTab === 'public'
                  ? 'border-b-2 border-white text-white'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-sm font-medium">Public</span>
              <span className="ml-1 text-xs">({publicContent.length})</span>
            </button>
            {showPremiumTab && (
              <button
                onClick={() => setActiveTab('premium')}
                className={`flex-1 py-3 text-center transition-all ${
                  activeTab === 'premium'
                    ? 'border-b-2 border-white text-white'
                    : 'text-gray-400'
                }`}
              >
                <span className="text-sm font-medium">Premium</span>
                <span className="ml-1 text-xs">({premiumContent.length})</span>
              </button>
            )}
            {viewerIsOwner && (
              <button
                onClick={() => setActiveTab('private')}
                className={`flex-1 py-3 text-center transition-all ${
                  activeTab === 'private'
                    ? 'border-b-2 border-white text-white'
                    : 'text-gray-400'
                }`}
              >
                <span className="text-sm font-medium">Privé 🔒</span>
                <span className="ml-1 text-xs">({privateContent.length})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'public' && (
        <div
          className={`${hideTabsHeader ? 'mt-0' : 'mt-2'} rounded-2xl backdrop-blur-md p-2 shadow-[0_6px_18px_rgba(0,0,0,0.25)]`}
          style={{ background: 'linear-gradient(135deg, rgba(46,16,101,0.22) 0%, rgba(88,28,135,0.16) 40%, rgba(236,72,153,0.10) 100%)', border: '1px solid rgba(168,85,247,0.22)' }}
        >
          <div className="grid grid-cols-3 gap-2">
            {publicContent.map((content, index) => (
              <div key={index} className="p-[1px] rounded-none" style={{ background: 'linear-gradient(135deg, rgba(183,148,246,0.26), rgba(255,107,157,0.24), rgba(79,209,199,0.16))' }}>
                <div
                  className="aspect-square relative cursor-pointer rounded-none overflow-hidden bg-black/60 backdrop-blur-sm border border-violet-300/20 hover:border-fuchsia-300/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(168,85,247,0.18),0_2px_8px_rgba(255,107,157,0.12)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                >
                  <MediaPlayer
                    {...content}
                    index={index}
                    isActive={false}
                    profileId={profileId}
                    userId={userId}
                    onLike={onLike ? () => onLike(index) : undefined}
                    onSave={onSave ? () => onSave(index) : undefined}
                    onFullscreen={() => openFullscreen(content.url, index)}
                    onReactionChange={onReactionChange}
                    refreshTrigger={globalRefreshTrigger}
                    optimisticDelta={optimistic[stableMediaId({ rawId: content.id || null, profileId, url: content.url })] || 0}
                    viewerIsOwner={viewerIsOwner}
                    onDeleteMedia={onDeleteMedia}
                    onEditMedia={onEditMedia}
                    onUpdateMedia={onUpdateMedia}
                    visibility={content.visibility}
                    price={content.price}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'premium' && (
        <div className="p-2">
          <div className="grid grid-cols-3 gap-2">
            {premiumContent.map((content, index) => {
              const mediaId = stableMediaId({ rawId: content.id || null, profileId, url: content.url })
              const isOwner = viewerIsOwner
              return (
                <div key={`premium-${index}`} className="p-[1px] rounded-none" style={{ background: 'linear-gradient(135deg, rgba(183,148,246,0.26), rgba(255,107,157,0.24), rgba(79,209,199,0.16))' }}>
                  <div
                    className="aspect-square relative cursor-pointer rounded-none overflow-hidden bg-black/60 backdrop-blur-sm border border-violet-300/20"
                    onClick={() => isOwner ? openFullscreen(content.url, index) : setUnlockTarget({ id: mediaId, url: content.url })}
                  >
                    <MediaPlayer
                      {...content}
                      index={index}
                      isActive={false}
                      profileId={profileId}
                      userId={userId}
                      onLike={undefined}
                      onSave={undefined}
                      onFullscreen={isOwner ? () => openFullscreen(content.url, index) : undefined}
                      onReactionChange={onReactionChange}
                      refreshTrigger={globalRefreshTrigger}
                      optimisticDelta={0}
                      isPrivate={!isOwner}
                      viewerIsOwner={viewerIsOwner}
                      onDeleteMedia={onDeleteMedia}
                      onEditMedia={onEditMedia}
                      onUpdateMedia={onUpdateMedia}
                      visibility={content.visibility}
                      price={content.price}
                    />
                    {!isOwner && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="text-white text-sm font-bold">{content.price ? `${content.price} CHF` : 'Premium'}</div>
                        <button className="mt-2 px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-xs font-semibold text-white hover:scale-105 transition-transform">
                          Déverrouiller
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'private' && (
        <div
          className={`${hideTabsHeader ? 'mt-0' : 'mt-2'} rounded-2xl backdrop-blur-md p-2 shadow-[0_6px_18px_rgba(0,0,0,0.25)]`}
          style={{ background: 'linear-gradient(135deg, rgba(46,16,101,0.22) 0%, rgba(88,28,135,0.16) 40%, rgba(236,72,153,0.10) 100%)', border: '1px solid rgba(168,85,247,0.22)' }}
        >
          <div className="grid grid-cols-3 gap-2">
            {privateContent.map((content, index) => (
              <div key={`priv-${index}`} className="p-[1px] rounded-none" style={{ background: 'linear-gradient(135deg, rgba(183,148,246,0.26), rgba(255,107,157,0.24), rgba(79,209,199,0.16))' }}>
                <div
                  className="aspect-square relative cursor-pointer rounded-none overflow-hidden bg-black/60 backdrop-blur-sm border border-violet-300/20 hover:border-fuchsia-300/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(168,85,247,0.18),0_2px_8px_rgba(255,107,157,0.12)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                >
                  <MediaPlayer
                    {...content}
                    index={index}
                    isActive={false}
                    profileId={profileId}
                    userId={userId}
                    onLike={onLike ? () => onLike(index) : undefined}
                    onSave={onSave ? () => onSave(index) : undefined}
                    onFullscreen={() => openFullscreen(content.url, index)}
                    onReactionChange={onReactionChange}
                    refreshTrigger={globalRefreshTrigger}
                    optimisticDelta={optimistic[stableMediaId({ rawId: content.id || null, profileId, url: content.url })] || 0}
                    isPrivate={false}
                    viewerIsOwner={viewerIsOwner}
                    onDeleteMedia={onDeleteMedia}
                    onEditMedia={onEditMedia}
                    onUpdateMedia={onUpdateMedia}
                    visibility={content.visibility}
                    price={content.price}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {unlockTarget && (
        <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setUnlockTarget(null)}>
          <div className="bg-black/85 border border-white/10 rounded-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-semibold text-lg mb-3">Déverrouiller le contenu</h3>
            <p className="text-white/70 text-sm mb-4">Choisissez une option de déverrouillage.</p>
            <div className="space-y-2 mb-4">
              <button
                onClick={() => { handleUnlockContent(unlockTarget.id); setUnlockTarget(null) }}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium hover:from-pink-600 hover:to-purple-700 transition-colors"
              >
                Déverrouiller ce média — 9 CHF
              </button>
              <button
                onClick={() => { handleUnlockGallery(); setUnlockTarget(null) }}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white font-medium hover:bg-white/15 transition-colors"
              >
                Déverrouiller toute la galerie — 29 CHF
              </button>
            </div>
            <div className="text-center">
              <a href="/profile-test-signup/escort?step=2" className="text-xs text-white/60 hover:text-white underline">Procéder au paiement (démo)</a>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {fullscreenMedia && (
          <motion.div
            ref={fullscreenRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              const swipeThreshold = 50
              const swipeVelocity = 500

              if (offset.x > swipeThreshold || velocity.x > swipeVelocity) {
                // Swipe vers la droite → média précédent
                prevMedia()
              } else if (offset.x < -swipeThreshold || velocity.x < -swipeVelocity) {
                // Swipe vers la gauche → média suivant
                nextMedia()
              }
            }}
          >
            <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent safe-area-inset-top z-[10000]">
              <div className="flex items-center justify-between">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={closeFullscreen}
                  className="w-12 h-12 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-colors"
                >
                  <ArrowLeft size={20} />
                </motion.button>
                <div className="relative z-[10001]" style={{ zIndex: 10001 }}>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowMenu(v => !v)
                    }}
                    className="w-12 h-12 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-colors cursor-pointer"
                    aria-label="Options"
                    style={{ zIndex: 10002, position: 'relative' }}
                  >
                    <MoreVertical size={20} />
                  </motion.button>
                  
                  {/* Menu déroulant fullscreen */}
                  <AnimatePresence>
                    {showMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-[10002]"
                          onClick={() => setShowMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute right-0 mt-2 min-w-[180px] bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-[10003]"
                        >
                        <div className="py-2 text-sm text-white/90">
                          {/* Temporairement forcé pour tester */}
                          <button
                            onClick={() => {
                              setShowFullscreenManagementModal(true)
                              setShowMenu(false)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/10 text-left"
                          >
                            <Edit size={16} /> Gérer le média
                          </button>
                          <button
                            onClick={() => {
                              if (navigator.share) {
                                navigator.share({ 
                                  title: profileName || 'Media', 
                                  url: fullscreenMedia || window.location.href 
                                }).catch(() => {})
                              } else {
                                navigator.clipboard.writeText(fullscreenMedia || window.location.href)
                              }
                              setShowMenu(false)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/10 text-left"
                          >
                            <Share size={16} /> Partager
                          </button>
                          <button
                            onClick={() => {
                              router.push(`/report?type=media&id=${fullscreenMedia}`)
                              setShowMenu(false)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/10 text-left text-red-300"
                          >
                            <Flag size={16} /> Signaler
                          </button>
                        </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent safe-area-inset-bottom z-[10000]">
              <div className="flex items-center justify-between">
                <div className="text-white/80 text-sm">
                  {fullscreenIndex + 1} / {mixedContent.length}
                </div>
              </div>
            </div>

            {/* Colonne d'actions à droite (même placement que l'accueil) */}
            <div className="absolute right-6 bottom-32 flex flex-col gap-4 z-[10000] safe-area-inset-bottom">
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={async () => {
                  if (fullscreenMedia) {
                    await fsToggle('LIKE');
                    try { onReactionChange && await onReactionChange() } catch {}
                  }
                }}
                className={`w-14 h-14 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
                  fsUserHasLiked
                    ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                    : 'bg-black/70 text-white hover:bg-black/90'
                }`}
                aria-label="J'aime"
              >
                <Heart size={24} className={fsUserHasLiked ? 'fill-current' : ''} />
              </motion.button>

              <div className="relative flex items-center justify-center">
                {/* Overlay clic extérieur pour fermer le menu de réactions */}
                {showReactions && (
                  <div
                    className="fixed inset-0 z-0"
                    onClick={(e)=>{ e.stopPropagation(); setShowReactions(false) }}
                  />
                )}
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => setShowReactions(!showReactions)}
                  className={`relative z-10 w-14 h-14 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
                    (fsUserReactions?.length ?? 0) > 0
                      ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30'
                      : 'bg-black/70 text-white hover:bg-black/90'
                  }`}
                >
                  <Flame size={24} className={(fsUserReactions?.length ?? 0) > 0 ? 'text-orange-300' : 'text-violet-300'} />
                </motion.button>

                <AnimatePresence>
                  {showReactions && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute left-1/2 top-1/2 pointer-events-none"
                      style={{
                        // Décalage plus à gauche pour rapprocher le menu du bouton
                        transform: `translate(calc(-50% - ${Math.round(reactionRadius * 0.28)}px), calc(-50% - ${Math.round(reactionRadius * 0.24)}px))`
                      }}
                    >
                      {RADIAL_CHOICES.slice(0, reactionCount).map(({ emoji, type }, idx, arr) => {
                        const count = arr.length
                        const start = 30
                        const end = 150
                        // Pivot 1° vers la gauche (sens anti‑horaire)
                        const rotationDeg = 1
                        const t = count > 1 ? idx / (count - 1) : 0.5
                        const angle = (start + (end - start) * t + rotationDeg) * (Math.PI / 180)
                        const r = reactionRadius
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
                              onClick={async (e) => { 
                                e.stopPropagation(); 
                                e.preventDefault(); 
                                if (fullscreenMedia) {
                                  await fsToggle(type)
                                  handleEmojiReaction(emoji)
                                  try { onReactionChange && await onReactionChange() } catch {}
                                }
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
                </AnimatePresence>
              </div>
            </div>

            <div className="w-full h-full max-w-md max-h-screen bg-black relative border-radius-20">
              {fullscreenMedia && mixedContent[fullscreenIndex] && (
                <MediaPlayer
                  {...mixedContent[fullscreenIndex]}
                  index={fullscreenIndex}
                  isActive={true}
                  profileId={profileId}
                  userId={userId}
                  onLike={onLike ? () => onLike(fullscreenIndex) : undefined}
                  onSave={onSave ? () => onSave(fullscreenIndex) : undefined}
                  onReactionChange={onReactionChange}
                  refreshTrigger={globalRefreshTrigger}
                  optimisticDelta={optimistic[fullscreenMediaId] || 0}
                  viewerIsOwner={viewerIsOwner}
                  onDeleteMedia={onDeleteMedia}
                  onEditMedia={onEditMedia}
                  onUpdateMedia={onUpdateMedia}
                />
              )}
            </div>

            <AnimatePresence>
              {mediaReactions[fullscreenMedia] && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, y: 50 }}
                  animate={{ 
                    scale: [0, 1.5, 1],
                    opacity: [0, 1, 0.8],
                    y: [50, -20, 0]
                  }}
                  exit={{ scale: 0, opacity: 0, y: -100 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 text-8xl"
                >
                  {mediaReactions[fullscreenMedia]}
                </motion.div>
              )}
            </AnimatePresence>

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
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-5xl"
                >
                  {item.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de gestion des médias (fullscreen) */}
      <MediaManagementModal
        isOpen={showFullscreenManagementModal}
        onClose={() => setShowFullscreenManagementModal(false)}
        media={fullscreenMedia ? {
          id: mixedContent[fullscreenIndex]?.id,
          type: mixedContent[fullscreenIndex]?.type || 'image',
          url: mixedContent[fullscreenIndex]?.url || fullscreenMedia, // Utiliser l'URL originale du média
          visibility: (mixedContent[fullscreenIndex]?.visibility || 'PUBLIC') as 'PUBLIC' | 'PREMIUM' | 'PRIVATE',
          price: mixedContent[fullscreenIndex]?.price
        } : null}
        mediaIndex={fullscreenIndex}
        onUpdateMedia={onUpdateMedia || (async () => {})}
        onDeleteMedia={onDeleteMedia || defaultDeleteMedia}
      />
    </>
  )
}
