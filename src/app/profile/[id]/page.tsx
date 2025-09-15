'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Heart, Share2, Flag } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import MediaGallery from '@/components/profile/MediaGallery'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ServicesSection from '@/components/profile/ServicesSection'

// Skeleton component for loading states
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 bg-black/85 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse" />
          <div className="flex-1">
            <div className="h-6 bg-white/10 rounded w-1/3 animate-pulse mb-2" />
            <div className="h-4 bg-white/10 rounded w-1/4 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-6">
        {/* Media Gallery Skeleton */}
        <div className="aspect-[4/5] bg-white/10 rounded-2xl animate-pulse" />

        {/* Profile Header Skeleton */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="h-8 bg-white/10 rounded w-1/2 animate-pulse mb-4" />
          <div className="h-4 bg-white/10 rounded w-1/3 animate-pulse mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse" />
          </div>
        </div>

        {/* Services Skeleton */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="h-6 bg-white/10 rounded w-1/4 animate-pulse mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-white/10 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params.id as string
  
  const { profile, isLoading, error, refresh } = useProfile(profileId)
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set())

  const handleLike = (id: string) => {
    setLikedProfiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleBack = () => {
    router.back()
  }

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold mb-4 text-white">
            Erreur de chargement
          </h1>
          <p className="text-white/60 mb-6">
            {error}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleBack}
              className="px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              Retour
            </button>
            <button
              onClick={refresh}
              className="px-6 py-3 rounded-lg text-white font-semibold"
              style={{
                background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-2xl font-bold mb-4 text-white">
            Profil non trouvé
          </h1>
          <p className="text-white/60 mb-6">
            Ce profil n'existe pas ou a été supprimé.
          </p>
          <button
            onClick={handleBack}
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
      <div className="sticky top-0 z-50 bg-black/85 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-white truncate">
              {profile.stageName}
            </h1>
            <p className="text-sm text-white/60">
              {[profile.city, profile.canton].filter(Boolean).join(', ')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleLike(profile.id)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Heart 
                size={20} 
                className={`transition-colors ${likedProfiles.has(profile.id) ? 'text-red-500 fill-red-500' : 'text-white'}`} 
              />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Share2 size={20} className="text-white" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Flag size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Media Gallery */}
        <MediaGallery 
          media={profile.media} 
          className="w-full"
        />

        {/* Profile Header */}
        <ProfileHeader
          escort={profile}
          onLike={handleLike}
          isLiked={likedProfiles.has(profile.id)}
        />

        {/* Services Section */}
        <ServicesSection
          services={profile.services}
          languages={profile.languages}
          rates={profile.rates}
        />
      </div>
    </div>
  )
}