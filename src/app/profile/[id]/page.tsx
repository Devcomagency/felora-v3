'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Heart, Share2, MapPin, Clock, Star, Shield, Camera, Video, MessageCircle } from 'lucide-react'

interface EscortProfile {
  id: string
  stageName: string
  age?: number
  city?: string
  canton?: string
  isVerifiedBadge?: boolean
  isActive?: boolean
  profilePhoto?: string
  heroMedia?: { type: 'IMAGE'|'VIDEO'; url: string; thumb?: string }
  languages?: string[]
  services?: string[]
  rate1H?: number
  rate2H?: number
  rateOvernight?: number
  latitude?: number
  longitude?: number
  updatedAt: string
  // Nouveaux champs V2
  height?: number
  bodyType?: string
  hairColor?: string
  eyeColor?: string
  ethnicity?: string
  bustSize?: string
  tattoos?: string
  piercings?: string
  availableNow?: boolean
  outcall?: boolean
  incall?: boolean
  weekendAvailable?: boolean
  hasPrivatePhotos?: boolean
  hasPrivateVideos?: boolean
  hasWebcamLive?: boolean
  messagingPreference?: string
  minimumDuration?: string
  acceptsCards?: boolean
  rating?: number
  reviewCount?: number
  views?: number
  likes?: number
  status?: string
  description?: string
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<EscortProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)

  const profileId = params.id as string

  useEffect(() => {
    if (!profileId) return

    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('[Profile] Fetching profile:', profileId)
        const response = await fetch(`/api/public/profile/${profileId}`)
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('[Profile] Profile data:', data)
        
        if (data.error) {
          throw new Error(data.error)
        }
        
        setProfile(data)
      } catch (err: any) {
        console.error('[Profile] Error loading profile:', err)
        setError(err.message || 'Erreur lors du chargement du profil')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [profileId])

  const handleLike = () => {
    setLiked(!liked)
    // TODO: Implémenter l'API de like
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: profile?.stageName,
        text: `Découvrez le profil de ${profile?.stageName}`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // TODO: Afficher une notification de copie
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white/60">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-6">😔</div>
          <h1 className="text-2xl font-bold mb-4 text-white">
            Profil non trouvé
          </h1>
          <p className="text-lg text-white/60 mb-6">
            {error || 'Ce profil n\'existe pas ou a été supprimé.'}
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg text-white font-semibold"
            style={{
              background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/85 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`p-2 rounded-full transition-colors ${
                liked ? 'text-red-500' : 'text-white/60 hover:text-red-400'
              }`}
            >
              <Heart size={24} fill={liked ? 'currentColor' : 'none'} />
            </button>
            
            <button
              onClick={handleShare}
              className="p-2 rounded-full text-white/60 hover:text-white transition-colors"
            >
              <Share2 size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="pb-20">
        {/* Hero Section */}
        <div className="relative">
          {profile.heroMedia ? (
            <div className="aspect-[4/5] relative overflow-hidden">
              {profile.heroMedia.type === 'VIDEO' ? (
                <video
                  src={profile.heroMedia.url}
                  className="w-full h-full object-cover"
                  controls
                  poster={profile.heroMedia.thumb}
                />
              ) : (
                <img
                  src={profile.heroMedia.url}
                  alt={profile.stageName}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ) : profile.profilePhoto ? (
            <div className="aspect-[4/5] relative overflow-hidden">
              <img
                src={profile.profilePhoto}
                alt={profile.stageName}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-[4/5] bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">👤</div>
                <p className="text-white/60">Photo de profil</p>
              </div>
            </div>
          )}
          
          {/* Overlay Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profile.stageName}
                  {profile.isVerifiedBadge && (
                    <Shield className="inline ml-2 text-cyan-400" size={24} />
                  )}
                </h1>
                <div className="flex items-center gap-4 text-white/80">
                  {profile.age && <span>{profile.age} ans</span>}
                  {profile.city && (
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span>{profile.city}</span>
                    </div>
                  )}
                  {profile.availableNow && (
                    <div className="flex items-center gap-1 text-green-400">
                      <Clock size={16} />
                      <span>Disponible maintenant</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                {profile.rate1H && (
                  <div className="text-2xl font-bold text-white">
                    {profile.rate1H} CHF/h
                  </div>
                )}
                {profile.rating && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star size={16} fill="currentColor" />
                    <span>{profile.rating.toFixed(1)}</span>
                    {profile.reviewCount && (
                      <span className="text-white/60">({profile.reviewCount})</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {profile.description && (
            <div>
              <h2 className="text-xl font-semibold mb-3 text-cyan-400">À propos</h2>
              <p className="text-white/80 leading-relaxed">{profile.description}</p>
            </div>
          )}

          {/* Physical Characteristics */}
          <div>
            <h2 className="text-xl font-semibold mb-3 text-cyan-400">Caractéristiques</h2>
            <div className="grid grid-cols-2 gap-4">
              {profile.height && (
                <div>
                  <span className="text-white/60">Taille</span>
                  <p className="text-white">{profile.height} cm</p>
                </div>
              )}
              {profile.bodyType && (
                <div>
                  <span className="text-white/60">Corpulence</span>
                  <p className="text-white">{profile.bodyType}</p>
                </div>
              )}
              {profile.hairColor && (
                <div>
                  <span className="text-white/60">Cheveux</span>
                  <p className="text-white">{profile.hairColor}</p>
                </div>
              )}
              {profile.eyeColor && (
                <div>
                  <span className="text-white/60">Yeux</span>
                  <p className="text-white">{profile.eyeColor}</p>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          {profile.services && profile.services.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3 text-cyan-400">Services</h2>
              <div className="flex flex-wrap gap-2">
                {profile.services.map((service, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm bg-white/10 text-white/80"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {profile.languages && profile.languages.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3 text-cyan-400">Langues</h2>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((lang, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm bg-cyan-500/20 text-cyan-300"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          <div>
            <h2 className="text-xl font-semibold mb-3 text-cyan-400">Disponibilité</h2>
            <div className="grid grid-cols-2 gap-4">
              {profile.outcall && (
                <div className="flex items-center gap-2 text-green-400">
                  <MapPin size={16} />
                  <span>Se déplace</span>
                </div>
              )}
              {profile.incall && (
                <div className="flex items-center gap-2 text-green-400">
                  <Clock size={16} />
                  <span>Reçoit</span>
                </div>
              )}
              {profile.weekendAvailable && (
                <div className="flex items-center gap-2 text-green-400">
                  <Clock size={16} />
                  <span>Weekend</span>
                </div>
              )}
            </div>
          </div>

          {/* Premium Features */}
          {(profile.hasPrivatePhotos || profile.hasPrivateVideos || profile.hasWebcamLive) && (
            <div>
              <h2 className="text-xl font-semibold mb-3 text-cyan-400">Contenu Premium</h2>
              <div className="flex flex-wrap gap-2">
                {profile.hasPrivatePhotos && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">
                    <Camera size={16} />
                    <span>Photos privées</span>
                  </div>
                )}
                {profile.hasPrivateVideos && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">
                    <Video size={16} />
                    <span>Vidéos exclusives</span>
                  </div>
                )}
                {profile.hasWebcamLive && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">
                    <Video size={16} />
                    <span>Webcam Live</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rates */}
          {(profile.rate1H || profile.rate2H || profile.rateOvernight) && (
            <div>
              <h2 className="text-xl font-semibold mb-3 text-cyan-400">Tarifs</h2>
              <div className="space-y-2">
                {profile.rate1H && (
                  <div className="flex justify-between">
                    <span className="text-white/60">1 heure</span>
                    <span className="text-white font-semibold">{profile.rate1H} CHF</span>
                  </div>
                )}
                {profile.rate2H && (
                  <div className="flex justify-between">
                    <span className="text-white/60">2 heures</span>
                    <span className="text-white font-semibold">{profile.rate2H} CHF</span>
                  </div>
                )}
                {profile.rateOvernight && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Nuit</span>
                    <span className="text-white font-semibold">{profile.rateOvernight} CHF</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/10 p-4">
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/search')}
            className="flex-1 py-3 px-6 rounded-lg text-white font-semibold border border-white/20 hover:bg-white/10 transition-colors"
          >
            Retour à la recherche
          </button>
          
          <button
            className="flex-1 py-3 px-6 rounded-lg text-white font-semibold"
            style={{
              background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <MessageCircle size={20} />
              <span>Contacter</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}