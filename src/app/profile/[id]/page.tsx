'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { User, Heart, Eye, MessageCircle } from 'lucide-react'

interface Media {
  id: string
  url: string
  type: 'image' | 'video'
  position?: number
}

interface ProfileData {
  id: string
  name: string
  avatar?: string
  bio?: string
  age?: number
  location?: string
  views: number
  followers: number
  totalLikes: number
  media: Media[]
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/public/profile/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProfile()
    }
  }, [params.id])

  const handleMessage = (profileId: string) => {
    router.push(`/messages?profile=${profileId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Profil non trouvé</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  // LOGIQUE CORRIGÉE DES MÉDIAS
  // 1. Photo de profil (position 1) = uniquement dans l'avatar
  const profilePhoto = profile.media.find(m => m.position === 1)

  // 2. Médias posts (positions 2+) = uniquement dans la grille
  const postMedias = profile.media.filter(m => m.position !== 1).sort((a, b) => (a.position || 0) - (b.position || 0))

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header avec avatar et infos */}
        <header className="w-full">
          <div className="flex w-full items-start justify-between">
            <div className="flex flex-1 items-center">
              {/* Avatar - uniquement photo de profil */}
              <div className="h-16 w-16 xs:h-20 xs:w-20 sm:h-28 sm:w-28 rounded-full overflow-hidden bg-gray-200">
                {profilePhoto?.url ? (
                  <img
                    src={profilePhoto.url}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>

              {/* Infos profil */}
              <div className="ml-2 xs:ml-4">
                <h2 className="text-base font-extrabold leading-4 xs:text-xl xs:leading-5 sm:text-2xl sm:leading-6">
                  {profile.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-200 xs:text-base sm:text-lg">
                  @{profile.name?.toLowerCase().replace(/\s+/g, '')}
                </p>
                <button
                  onClick={() => handleMessage(profile.id)}
                  className="mt-1 xs:mt-2 sm:mt-3 w-28 xs:w-40 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm xs:text-base font-semibold rounded-md transition-colors"
                >
                  Message
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-200">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span className="font-semibold">{profile.views}</span>
              <span>Vues</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span className="font-semibold">{profile.followers}</span>
              <span>Followers</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span className="font-semibold">{profile.totalLikes}</span>
              <span>Likes</span>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-4 border-l-4 border-pink-500 pl-3">
              <p className="text-sm xs:text-base text-gray-700 dark:text-gray-200">
                {profile.bio}
              </p>
            </div>
          )}
        </header>

        {/* Grille des médias - SANS la photo de profil */}
        {postMedias.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Posts ({postMedias.length})
            </h3>

            <div className="grid grid-cols-3 gap-1">
              {postMedias.map((media, index) => (
                <div key={media.id} className="aspect-square relative bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                  {media.type === 'video' ? (
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={media.url}
                      alt={`Post ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Indicateur de type */}
                  {media.type === 'video' && (
                    <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message si aucun post */}
        {postMedias.length === 0 && (
          <div className="mt-6 text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Aucun post disponible</p>
          </div>
        )}
      </div>
    </div>
  )
}