'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface EscortProfilePublic {
  id: string
  stageName: string
  age: number
  description: string
  city: string
  canton: string
  height: number
  languages: string[]
  services: string[]
  rate1H: number
  profilePhoto?: string
  galleryPhotos: string[]
  isActive: boolean
  status: string
}

export default function ProfilePage() {
  const params = useParams()
  const profileId = params.id as string
  
  const [profile, setProfile] = useState<EscortProfilePublic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profileId) return

    const loadProfile = async () => {
      try {
        console.log('🔍 Chargement du profil public:', profileId)
        
        const response = await fetch(`/api/profiles/${profileId}`)
        const data = await response.json()
        
        console.log('📊 Réponse API profil:', data)
        
        if (response.ok && data.success) {
          setProfile(data.profile)
        } else {
          setError(data.error || 'Profil introuvable')
        }
      } catch (err) {
        console.error('Erreur chargement profil:', err)
        setError('Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [profileId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-6 mb-4">
            <h1 className="text-2xl font-bold text-red-400 mb-2">Something went wrong</h1>
            <p className="text-red-300 mb-4">We're having trouble loading this profile. Please try again.</p>
            <p className="text-red-400 text-sm">Error: {error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            
            <div className="flex-shrink-0">
              {profile.profilePhoto ? (
                <img 
                  src={profile.profilePhoto} 
                  alt={profile.stageName}
                  className="w-48 h-48 object-cover rounded-xl"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-600 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400">Photo non disponible</span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{profile.stageName}</h1>
              <div className="flex items-center gap-4 text-gray-300 mb-4">
                <span>{profile.age} ans</span>
                <span>•</span>
                <span>{profile.height} cm</span>
                <span>•</span>
                <span>{profile.city}, {profile.canton}</span>
              </div>
              
              <div className="text-2xl font-bold text-purple-400 mb-4">
                {profile.rate1H} CHF/heure
              </div>
            </div>
          </div>
        </div>

        {profile.description && (
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">À propos</h2>
            <p className="text-gray-300">{profile.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}