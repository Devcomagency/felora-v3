'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, BadgeCheck, Crown, MapPin } from 'lucide-react'

interface EscortProfile {
  id: string
  name: string
  stageName: string
  age: number
  location: string
  media: string
  gallery: string[]
  blurredGallery: string[]
  description: string
  services: string[]
  price: number
  rating: number
  reviews: number
  likes: number
  followers: number
  online: boolean
  lastSeen: string
  verified: boolean
  premium: boolean
  viewersCount: number
  responseRate: number
  responseTime: string
  languages: string[]
  stats: {
    views: number
    hearts: number
    bookings: number
  }
  physicalDetails?: {
    height?: string
    bodyType?: string
    hairColor?: string
    eyeColor?: string
    ethnicity?: string
    bustSize?: string
    tattoos?: string
    piercings?: string
  }
  rates?: {
    hour?: number
    twoHours?: number
    halfDay?: number
    fullDay?: number
    overnight?: number
  }
  workingArea?: string
  practices?: string[]
  incall?: boolean
  outcall?: boolean
  availableNow?: boolean
  weekendAvailable?: boolean
}

// Composant ProfileHeader moderne (style felora-v2)
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
  description,
  agendaEnabled = false
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
  agendaEnabled?: boolean
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

        {/* Nom + stats - Style TikTok */}
        <div className="flex-1">
          {/* Nom au-dessus des compteurs */}
          <div className="mb-2">
            <h2 className="font-semibold text-lg flex items-center gap-2 text-white">
              {name}
              {verified && (
                <BadgeCheck size={20} className="text-[#4FD1C7]" />
              )}
              {premium && (
                <div className="w-5 h-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Crown size={12} className="text-white" />
                </div>
              )}
            </h2>
            <div className="text-sm text-gray-400 flex items-center gap-2">
              {age && <span>{age} ans</span>}
              {age && city && <span>•</span>}
              {city && (
                <div className="flex items-center gap-1">
                  <MapPin size={12} />
                  <span>{city}</span>
                </div>
              )}
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

          {/* Disponibilité - Affiche seulement si agenda activé */}
          {(() => {
            console.log('🔍 [ProfileClientV2] Debug disponibilité:')
            console.log('  - agendaEnabled:', agendaEnabled, 'type:', typeof agendaEnabled)
            console.log('  - availability:', availability)
            console.log('  - agendaEnabled && availability:', agendaEnabled && availability)
            console.log('  - strict equality agendaEnabled === true:', agendaEnabled === true)
            console.log('  - truthy agendaEnabled:', !!agendaEnabled)
            return agendaEnabled && availability
          })() && (
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

// Composant ActionsBar moderne
function ActionsBar({
  onMessage,
  onFollow,
  onLike,
  onSave,
  onGift,
  onShowDetails,
  isFollowing,
  isLiked,
  isSaved
}: {
  onMessage: () => void
  onFollow: () => void
  onLike: () => void
  onSave: () => void
  onGift: () => void
  onShowDetails: () => void
  isFollowing: boolean
  isLiked: boolean
  isSaved: boolean
}) {
  return (
    <div className="px-4 py-3 border-y border-white/10">
      <div className="flex gap-3 mb-3">
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
        <button
          onClick={onGift}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white flex items-center justify-center transition-all hover:scale-105"
        >
          🎁
        </button>
      </div>
      <button
        onClick={onShowDetails}
        className="w-full py-2 text-center text-gray-400 text-sm hover:text-white transition-colors"
      >
        Voir plus d'informations
      </button>
    </div>
  )
}

// Composant MediaFeed moderne
function MediaFeed({ media }: { media: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  return (
    <div className="px-4">
      <h3 className="text-lg font-semibold text-white mb-4">Galerie ({media.length})</h3>
      
      {/* Image principale */}
      {media.length > 0 && (
        <div className="mb-4">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-800">
            <img 
              src={media[currentIndex]} 
              alt={`Media ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Navigation */}
          {media.length > 1 && (
            <div className="flex justify-center gap-2 mt-3">
              {media.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-pink-500' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grille de miniatures */}
      <div className="grid grid-cols-3 gap-2">
        {media.slice(0, 6).map((item, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`aspect-square rounded-lg overflow-hidden ${
              index === currentIndex ? 'ring-2 ring-pink-500' : ''
            }`}
          >
            <img 
              src={item}
              alt={`Miniature ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ProfileClientV2({ profile }: { profile: EscortProfile }) {
  const { data: session } = useSession()
  const router = useRouter()
  
  // États locaux pour les actions
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

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

  const handleShowDetails = useCallback(() => {
    setShowDetailModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowDetailModal(false)
  }, [])

  // Générer les données étendues du profil
  const extendedProfileData = useMemo(() => {
    const rates = []
    if (profile.rates?.hour) rates.push({ duration: '1h', price: profile.rates.hour, description: 'Rencontre intime' })
    if (profile.rates?.twoHours) rates.push({ duration: '2h', price: profile.rates.twoHours, description: 'Moment prolongé' })
    if (profile.rates?.halfDay) rates.push({ duration: '4h', price: profile.rates.halfDay, description: 'Demi-journée' })
    if (profile.rates?.fullDay) rates.push({ duration: '8h', price: profile.rates.fullDay, description: 'Journée complète' })
    if (profile.rates?.overnight) rates.push({ duration: '24h', price: profile.rates.overnight, description: 'Week-end VIP' })

    return {
      languages: profile.languages || ['Français'],
      practices: profile.practices || profile.services || [],
      rates: rates.length > 0 ? rates : [{ duration: '1h', price: profile.price, description: 'Rencontre intime' }],
      physicalDetails: {
        height: profile.physicalDetails?.height ? `${profile.physicalDetails.height}` : 'Non spécifié',
        bodyType: profile.physicalDetails?.bodyType || 'Non spécifié',
        hairColor: profile.physicalDetails?.hairColor || 'Non spécifié',
        eyeColor: profile.physicalDetails?.eyeColor || 'Non spécifié'
      },
      workingArea: profile.workingArea || profile.location || 'Suisse'
    }
  }, [profile])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header style TikTok */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/5" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
              title="Retour à la recherche"
            >
              <ArrowLeft size={24} className="text-white" />
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-lg font-bold">{profile.name}</h1>
          </div>

          {/* Placeholder to keep the title centered */}
          <div className="w-10 h-10" />
        </div>
      </div>

      {/* Contenu principal avec padding-top pour header fixe */}
      <div className="pt-0" style={{ paddingTop: 'calc(72px + env(safe-area-inset-top, 0px))' }}>
        <ProfileHeader
          name={profile.name}
          city={profile.location}
          age={profile.age}
          avatar={profile.media}
          verified={profile.verified}
          premium={profile.premium}
          online={profile.online}
          stats={{
            likes: profile.likes || 0,
            followers: profile.followers || 0,
            views: profile.stats?.views || 0
          }}
          availability={{
            available: profile.availableNow,
            incall: profile.incall,
            outcall: profile.outcall
          }}
          description={profile.description}
        />

        <ActionsBar
          onMessage={handleMessage}
          onFollow={handleFollow}
          onLike={handleLike}
          onSave={handleSave}
          onGift={handleGift}
          onShowDetails={handleShowDetails}
          isFollowing={isFollowing}
          isLiked={isLiked}
          isSaved={isSaved}
        />

        <div className="py-6">
          <MediaFeed media={profile.gallery} />
        </div>
      </div>

      {/* Modal détails - Design moderne */}
      {showDetailModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,0,40,0.95) 50%, rgba(0,0,0,0.9) 100%)',
            overflow: 'hidden',
            touchAction: 'none'
          }}
          onClick={handleCloseModal}
        >
          <div
            className="relative w-full max-w-sm scrollbar-hide"
            style={{
              background: 'linear-gradient(145deg, rgba(15,15,25,0.95) 0%, rgba(25,15,35,0.98) 50%, rgba(15,15,25,0.95) 100%)',
              borderRadius: '24px',
              padding: '0',
              border: '1px solid rgba(255,107,157,0.2)',
              backdropFilter: 'blur(30px)',
              boxShadow: `
                0 24px 48px rgba(255,107,157,0.1),
                0 12px 24px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.1)
              `,
              maxHeight: '85vh',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5" style={{ padding: '20px 16px' }}>
              {/* Header avec bouton fermeture */}
              <div className="relative">
                <button
                  onClick={handleCloseModal}
                  className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-md border border-pink-400/30 text-white hover:from-pink-500/30 hover:to-purple-600/30 transition-all duration-300"
                  style={{
                    boxShadow: '0 0 15px rgba(255,107,157,0.3)'
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <div className="text-center">
                  <div 
                    className="inline-block text-xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-1"
                  >
                    {profile.name}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-300">
                    <span>{profile.age} ans</span>
                    <div className="w-1 h-1 bg-pink-400 rounded-full"></div>
                    <span>{profile.location}</span>
                    {profile.verified && (
                      <>
                        <div className="w-1 h-1 bg-pink-400 rounded-full"></div>
                        <span className="text-pink-400 font-medium flex items-center gap-1">
                          <BadgeCheck className="w-3 h-3 text-[#4FD1C7]" /> Vérifiée
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Détails physiques */}
              <div className="relative">
                <h3 className="text-sm font-semibold text-white mb-3">Apparence</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Taille', value: extendedProfileData.physicalDetails.height },
                    { label: 'Silhouette', value: extendedProfileData.physicalDetails.bodyType },
                    { label: 'Cheveux', value: extendedProfileData.physicalDetails.hairColor },
                    { label: 'Yeux', value: extendedProfileData.physicalDetails.eyeColor }
                  ].map((item, index) => (
                    <div key={index} className="p-2 rounded-xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10">
                      <div className="text-xs text-pink-300/80 font-medium uppercase tracking-wider">{item.label}</div>
                      <div className="text-xs font-medium text-white mt-0.5">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services spécialisés */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Services Spécialisés</h3>
                <div className="flex flex-wrap gap-1.5">
                  {extendedProfileData.practices.map((practice, index) => (
                    <span 
                      key={index}
                      className="px-2.5 py-1 rounded-full text-xs font-medium text-purple-200 border border-purple-400/30"
                      style={{
                        background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(236,72,153,0.15) 100%)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {practice}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tarifs (discrets) */}
              <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
                <div className="text-xs text-gray-500 mb-2 uppercase tracking-widest">Tarification</div>
                <div className="space-y-1">
                  {extendedProfileData.rates.slice(0, 3).map((rate, index) => (
                    <div key={index} className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">{rate.duration}</span>
                      <span className="text-gray-400 font-mono">{rate.price} CHF</span>
                    </div>
                  ))}
                  {extendedProfileData.rates.length > 3 && (
                    <div className="text-xs text-gray-600 italic">+ autres durées disponibles</div>
                  )}
                </div>
              </div>

              {/* Zone de travail */}
              <div>
                <h3 className="text-xs font-semibold text-white mb-2">Zone de service</h3>
                <div 
                  className="p-2 rounded-lg border border-emerald-400/30 text-emerald-200"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(20,184,166,0.1) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="text-xs font-medium">{extendedProfileData.workingArea}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}