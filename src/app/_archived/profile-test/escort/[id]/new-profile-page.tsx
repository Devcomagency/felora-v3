'use client'

import { useState, useEffect } from 'react'
import { Heart, Crown, Diamond, Flame, VolumeX, Volume2, Play, Pause, BadgeCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle } from '@/ui/atoms/card'
import { Button } from '@/ui/atoms/button'
import { GlassCard } from '@/ui/primitives/glass-card'

interface NewEscortProfilePageProps {
  id: string
}

// Mock data pour le profil
const mockProfile = {
  id: 'sofia-elite-1',
  handle: '@sofia_elite',
  name: 'Sofia Elite',
  avatar: 'https://picsum.photos/200/200?random=10',
  verified: true,
  location: 'Genève, Suisse',
  age: 25,
  description: 'Escort de luxe à Genève. Expérience professionnelle et discrétion garantie.',
  stats: {
    likes: 1247,
    views: 8920,
    rating: 4.9
  },
  media: [
    {
      id: 'media-1',
      type: 'IMAGE',
      url: 'https://picsum.photos/400/600?random=1',
      thumb: 'https://picsum.photos/400/600?random=1'
    },
    {
      id: 'media-2',
      type: 'VIDEO',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumb: 'https://picsum.photos/400/600?random=2'
    },
    {
      id: 'media-3',
      type: 'IMAGE',
      url: 'https://picsum.photos/400/600?random=3',
      thumb: 'https://picsum.photos/400/600?random=3'
    }
  ]
}

export default function NewEscortProfilePage({ id }: NewEscortProfilePageProps) {
  const [profile] = useState(mockProfile)
  const [selectedMedia, setSelectedMedia] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMute, setIsMute] = useState(true)
  const [userHasLiked, setUserHasLiked] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [radialOpen, setRadialOpen] = useState(false)
  const [explosionEmojis, setExplosionEmojis] = useState<{id: number; emoji: string}[]>([])

  const currentMedia = profile.media[selectedMedia]
  const isVideo = currentMedia?.type === 'VIDEO'

  const handleLike = () => {
    setUserHasLiked(!userHasLiked)
  }

  const handleReact = (emoji: string) => {
    setShowReactions(false)
    setRadialOpen(false)
    
    // Animation d'explosion d'emojis
    const newExplosions = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      emoji
    }))
    setExplosionEmojis(newExplosions)

    setTimeout(() => {
      setExplosionEmojis([])
    }, 3000)
  }

  const togglePlayPause = () => {
    if (isVideo) {
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    setIsMute(!isMute)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </Link>
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-[#FF6B9D]" />
            <Diamond className="w-5 h-5 text-[#4FD1C7]" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        {/* Media Carousel */}
        <div className="relative h-screen overflow-hidden">
          {currentMedia && (
            <>
              {isVideo ? (
                <video
                  className="w-full h-full object-cover"
                  loop
                  muted={isMute}
                  playsInline
                  autoPlay={isPlaying}
                  poster={currentMedia.thumb}
                  onClick={togglePlayPause}
                >
                  <source src={currentMedia.url} type="video/mp4" />
                </video>
              ) : (
                <div
                  className="w-full h-full bg-cover bg-center cursor-pointer"
                  style={{ backgroundImage: `url(${currentMedia.url})` }}
                  onClick={togglePlayPause}
                />
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            </>
          )}

          {/* Media Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {profile.media.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMedia(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === selectedMedia ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            
            {isVideo && (
              <button
                onClick={toggleMute}
                className="p-2 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/30 transition-colors"
              >
                {isMute ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            )}
          </div>

          {/* Play/Pause Overlay */}
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: isPlaying ? 0 : 1, opacity: isPlaying ? 0 : 1 }}
                className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center"
                onClick={togglePlayPause}
              >
                <Play className="w-8 h-8 ml-1" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
          <GlassCard className="p-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-gray-800/80 shadow-lg">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${profile.avatar})` }}
                  />
                </div>
                {profile.verified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center bg-[#111827] border border-white/20 text-[#4FD1C7] shadow-lg">
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Profile Details */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                  <Crown className="w-6 h-6 text-[#FF6B9D]" />
                </div>
                
                <p className="text-white/70 text-sm mb-2">{profile.location} • {profile.age} ans</p>
                <p className="text-white/80 text-sm mb-4">{profile.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span>{profile.stats.likes} likes</span>
                  <span>{profile.stats.views} vues</span>
                  <span>⭐ {profile.stats.rating}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-center gap-4">
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    userHasLiked 
                      ? 'bg-rose-500/20 text-rose-300' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Heart className="w-6 h-6" fill={userHasLiked ? 'currentColor' : 'none'} />
                </button>

                {/* Reactions Button */}
                <div className="relative">
                  <button
                    onClick={() => { setShowReactions(!showReactions); setRadialOpen(!radialOpen) }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      showReactions
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Flame className="w-6 h-6" />
                  </button>

                  {/* Radial Menu */}
                  {radialOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-2"
                    >
                      <div className="flex gap-2">
                        {['💖', '🔥', '🤤', '💋'].map((emoji, index) => (
                          <motion.button
                            key={emoji}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleReact(emoji)}
                            className="w-10 h-10 rounded-full bg-black/70 border border-white/10 backdrop-blur-md flex items-center justify-center text-xl hover:bg-black/80"
                          >
                            {emoji}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Explosion d'emojis */}
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
      </div>
    </div>
  )
}
