'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, BadgeCheck } from 'lucide-react'

// Composant ProfileHeader simplifié
function ProfileHeader({
  name,
  city,
  age,
  avatar,
  verified = false,
  premium = false,
  online = false,
  stats,
  availability,
  description
}: {
  name: string
  city?: string
  age?: number
  avatar?: string
  verified?: boolean
  premium?: boolean
  online?: boolean
  stats?: { likes?: number; followers?: number; views?: number }
  availability?: { available?: boolean; incall?: boolean; outcall?: boolean }
  description?: string
}) {
  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex items-start gap-4 mb-4">
        {/* Photo de profil avec gradient ring */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 p-0.5">
            <img
              src={avatar || 'https://picsum.photos/300/300?random=1'}
              alt={name}
              className="w-full h-full rounded-full object-cover border-2 border-black"
            />
          </div>
          {/* Status online */}
          {online && (
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse" />
          )}
        </div>

        {/* Nom + stats */}
        <div className="flex-1">
          <div className="mb-2">
            <h2 className="font-semibold text-lg flex items-center gap-2 text-white">
              {name}
              {verified && (
                <BadgeCheck size={20} className="text-blue-500" />
              )}
              {premium && (
                <div className="w-5 h-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">👑</span>
                </div>
              )}
            </h2>
            <div className="text-sm text-gray-400 flex items-center gap-2">
              {age && <span>{age} ans</span>}
              {age && city && <span>•</span>}
              {city && <span>{city}</span>}
            </div>
          </div>

          <div className="flex items-start mb-3">
            <div className="flex gap-6">
              {/* Vues */}
              <div className="text-center">
                <div className="text-lg font-bold text-white">{stats?.views || 0}</div>
                <div className="text-xs text-gray-400">Vues</div>
              </div>
              {/* Réactions */}
              <div className="text-center">
                <div className="text-lg font-bold text-white">{stats?.likes || 0}</div>
                <div className="text-xs text-gray-400">💎</div>
              </div>
              {/* Followers */}
              <div className="text-center">
                <div className="text-lg font-bold text-white">{stats?.followers || 0}</div>
                <div className="text-xs text-gray-400">Suiveurs</div>
              </div>
            </div>
          </div>

          {/* Description */}
          {description && (
            <div className="text-sm text-gray-300 mb-3">
              {description}
            </div>
          )}

          {/* Disponibilité */}
          {availability && (
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                availability.available 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  availability.available ? 'bg-green-400' : 'bg-red-400'
                }`} />
                {availability.available ? 'Disponible' : 'Non disponible'}
              </div>
              
              {(availability.incall || availability.outcall) && (
                <div className="text-xs text-gray-400">
                  {availability.incall && availability.outcall ? 'Se déplace et reçoit' :
                   availability.incall ? 'Reçoit uniquement' :
                   availability.outcall ? 'Se déplace uniquement' : ''}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Composant ActionsBar simplifié
function ActionsBar({
  onMessage,
  onFollow,
  onLike,
  onSave,
  onGift,
  isFollowing,
  isLiked,
  isSaved
}: {
  onMessage: () => void
  onFollow: () => void
  onLike: () => void
  onSave: () => void
  onGift: () => void
  isFollowing: boolean
  isLiked: boolean
  isSaved: boolean
}) {
  return (
    <div className="px-4 py-3 border-y border-white/10">
      <div className="flex gap-3">
        <button
          onClick={onMessage}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium text-sm hover:from-pink-600 hover:to-purple-700 transition-all"
        >
          Message
        </button>
        <button
          onClick={onFollow}
          className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
            isFollowing 
              ? 'bg-white/10 text-white border border-white/20' 
              : 'bg-white text-black'
          }`}
        >
          {isFollowing ? 'Suivi' : 'Suivre'}
        </button>
        <button
          onClick={onLike}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isLiked ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white'
          }`}
        >
          ❤️
        </button>
        <button
          onClick={onSave}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isSaved ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/10 text-white'
          }`}
        >
          ⭐
        </button>
      </div>
    </div>
  )
}

// Composant MediaFeed simplifié
function MediaFeed({ media }: { media: Array<{ type: 'image' | 'video'; url: string }> }) {
  return (
    <div className="px-4">
      <h3 className="text-lg font-semibold text-white mb-4">Galerie ({media.length})</h3>
      <div className="grid grid-cols-2 gap-2">
        {media.slice(0, 6).map((item, index) => (
          <div key={index} className="aspect-square rounded-lg overflow-hidden">
            {item.type === 'image' ? (
              <img 
                src={item.url} 
                alt={`Media ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <div className="text-white">▶️ Vidéo</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Interface du profil complet
interface EscortProfile {
  id: string
  name: string
  stageName?: string
  avatar?: string
  city?: string
  age?: number
  languages: string[]
  services: string[]
  media: Array<{
    type: 'image' | 'video'
    url: string
  }>
  verified?: boolean
  premium?: boolean
  online?: boolean
  description?: string
  stats?: {
    likes?: number
    followers?: number
    views?: number
  }
  rates?: {
    hour?: number
    twoHours?: number
    halfDay?: number
    fullDay?: number
    overnight?: number
  }
  availability?: {
    incall?: boolean
    outcall?: boolean
    available?: boolean
  }
  physical?: {
    height?: number
    bodyType?: string
    hairColor?: string
    eyeColor?: string
  }
  practices?: string[]
  workingArea?: string
  category?: string
  serviceType?: string
  experience?: string
  style?: string
  profile?: string
  specialties?: string[]
  additionalLanguages?: string[]
}

export default function ProfileTestPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  // État local pour les actions
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Profil de test basé sur felora-v2
  const profile: EscortProfile = {
    id: 'test-profile',
    name: 'Sofia Luxury',
    stageName: 'Sofia Luxury',
    avatar: 'https://picsum.photos/300/300?random=20',
    city: 'Genève',
    age: 26,
    languages: ['Français', 'Anglais', 'Italien'],
    services: ['GFE', 'Massage', 'Accompagnement'],
    media: [
      { type: 'image', url: 'https://picsum.photos/600/900?random=21' },
      { type: 'image', url: 'https://picsum.photos/600/900?random=22' },
      { type: 'image', url: 'https://picsum.photos/600/900?random=23' },
      { type: 'image', url: 'https://picsum.photos/600/900?random=24' },
      { type: 'video', url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_720x480_1mb.mp4' },
      { type: 'image', url: 'https://picsum.photos/600/900?random=25' }
    ],
    verified: true,
    premium: true,
    online: true,
    description: '✨ Élégance suisse premium • Expérience GFE authentique • Disponible 24/7 pour gentlemen exigeants',
    stats: {
      likes: 1247,
      followers: 892,
      views: 15420
    },
    rates: {
      hour: 500,
      twoHours: 900,
      halfDay: 1800,
      fullDay: 3200,
      overnight: 4500
    },
    availability: {
      incall: true,
      outcall: true,
      available: true
    },
    physical: {
      height: 170,
      bodyType: 'Athlétique',
      hairColor: 'Blonde',
      eyeColor: 'Bleus'
    },
    practices: ['GFE (Girlfriend Experience)', 'Massage Tantrique', 'Accompagnement VIP'],
    workingArea: 'Suisse Romande',
    category: 'Premium',
    serviceType: 'Escort Indépendante',
    experience: 'Experte (5+ ans)',
    style: 'Élégante & Sophistiquée',
    profile: 'Escorte de Luxe',
    specialties: ['GFE (Girlfriend Experience)', 'Massage Tantrique', 'Accompagnement VIP', 'Soirées Privées'],
    additionalLanguages: ['Allemand', 'Espagnol']
  }

  // Handlers
  const handleMessage = useCallback(() => {
    router.push(`/messages?to=${profile.id}`)
  }, [router, profile.id])

  const handleFollow = useCallback(() => {
    setIsFollowing(!isFollowing)
  }, [isFollowing])

  const handleLike = useCallback(() => {
    setIsLiked(!isLiked)
  }, [isLiked])

  const handleSave = useCallback(() => {
    setIsSaved(!isSaved)
  }, [isSaved])

  const handleGift = useCallback(() => {
    console.log('Gift clicked')
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header fixe */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          
          <h1 className="text-lg font-bold">{profile.name}</h1>
          
          <div className="w-10 h-10" />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="pt-20">
        <ProfileHeader
          name={profile.name}
          city={profile.city}
          age={profile.age}
          avatar={profile.avatar}
          verified={profile.verified}
          premium={profile.premium}
          online={profile.online}
          stats={profile.stats}
          availability={profile.availability}
          description={profile.description}
        />

        <ActionsBar
          onMessage={handleMessage}
          onFollow={handleFollow}
          onLike={handleLike}
          onSave={handleSave}
          onGift={handleGift}
          isFollowing={isFollowing}
          isLiked={isLiked}
          isSaved={isSaved}
        />

        <div className="py-6">
          <MediaFeed media={profile.media} />
        </div>

        {/* Informations détaillées */}
        <div className="px-4 pb-8 space-y-6">
          {/* Détails physiques */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Apparence</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-xs text-gray-400">Taille</div>
                <div className="text-white font-medium">{profile.physical?.height}cm</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-xs text-gray-400">Silhouette</div>
                <div className="text-white font-medium">{profile.physical?.bodyType}</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-xs text-gray-400">Cheveux</div>
                <div className="text-white font-medium">{profile.physical?.hairColor}</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-xs text-gray-400">Yeux</div>
                <div className="text-white font-medium">{profile.physical?.eyeColor}</div>
              </div>
            </div>
          </div>

          {/* Services spécialisés */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Services Spécialisés</h3>
            <div className="flex flex-wrap gap-2">
              {profile.specialties?.map((specialty, index) => (
                <span 
                  key={index}
                  className="px-3 py-1.5 bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-pink-200 rounded-full text-sm font-medium border border-pink-500/30"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          {/* Tarifs (discrets) */}
          <div className="opacity-70 hover:opacity-100 transition-opacity">
            <h3 className="text-lg font-semibold text-white mb-3">Tarification</h3>
            <div className="space-y-2">
              {profile.rates?.hour && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">1 heure</span>
                  <span className="text-white font-mono">{profile.rates.hour} CHF</span>
                </div>
              )}
              {profile.rates?.twoHours && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">2 heures</span>
                  <span className="text-white font-mono">{profile.rates.twoHours} CHF</span>
                </div>
              )}
              {profile.rates?.fullDay && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Journée complète</span>
                  <span className="text-white font-mono">{profile.rates.fullDay} CHF</span>
                </div>
              )}
            </div>
          </div>

          {/* Zone de service */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Zone de service</h3>
            <div className="bg-gradient-to-r from-emerald-500/20 to-teal-600/20 p-3 rounded-lg border border-emerald-500/30">
              <div className="text-emerald-200 font-medium">{profile.workingArea}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}