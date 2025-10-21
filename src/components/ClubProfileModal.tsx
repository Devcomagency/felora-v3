'use client'

import { useState, useEffect } from 'react'
import { X, MapPin, Phone, Globe, Mail, Clock, Star, Settings } from 'lucide-react'

interface ClubProfileModalProps {
  profileId: string
  profileData?: ClubProfile // Optionnel : données déjà chargées
  onClose: () => void
}

interface ClubProfile {
  id: string
  name: string
  handle?: string
  avatar?: string
  city?: string
  description?: string
  verified?: boolean
  languages: string[]
  services: string[]
  contact?: {
    phone?: string
    website?: string
    email?: string
  }
  location?: {
    address?: string
    coordinates?: { lat: number; lng: number }
  }
  amenities?: string[]
  workingHours?: string
  establishmentType?: string
}

export function ClubProfileModal({ profileId, profileData, onClose }: ClubProfileModalProps) {
  const [profile, setProfile] = useState<ClubProfile | null>(profileData || null)
  const [loading, setLoading] = useState(!profileData) // Si profileData existe, pas de loading
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Si on a déjà les données, pas besoin de fetch
    if (profileData) {
      setProfile(profileData)
      setLoading(false)
      return
    }

    async function fetchClubProfile() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/profile-test/club/${profileId}`, {
          cache: 'no-store',
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Erreur de chargement')
        }

        setProfile(data.data)
      } catch (err: any) {
        console.error('❌ [ClubProfileModal] Error:', err)
        setError(err.message || 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    if (profileId && !profileData) {
      fetchClubProfile()
    }
  }, [profileId, profileData])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-8 text-white">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-32"></div>
          </div>
          <p className="text-gray-300 mt-4">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-8 text-white text-center max-w-md mx-4">
          <div className="text-red-400 mb-4">
            <X className="w-8 h-8 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-gray-300 mb-4">{error || 'Profil non trouvé'}</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-2xl border border-gray-800">

          {/* Header avec fermeture */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-lg border-b border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 p-0.5">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center text-2xl font-bold text-white">
                        {profile.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  {profile.verified && (
                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-black flex items-center justify-center">
                      <Star className="w-2.5 h-2.5 text-white fill-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white truncate">{profile.name}</h1>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-300">
                    {profile.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {profile.city}
                      </span>
                    )}
                    {profile.establishmentType && (
                      <span className="px-3 py-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 rounded-full text-xs border border-pink-500/30">
                        {profile.establishmentType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="overflow-y-auto max-h-[calc(90vh-100px)] pb-6">
            <div className="p-6 space-y-6">

              {/* Langues */}
              {profile.languages && profile.languages.length > 0 && (
                <div className="glass-card">
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">Langues parlées</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((language, index) => (
                        <span
                          key={index}
                          className="px-3 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 rounded-lg text-sm border border-blue-500/30 font-medium"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Services */}
              {profile.services && profile.services.length > 0 && (
                <div className="glass-card">
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">Services</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {profile.services.map((service, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg border border-pink-500/20 hover:border-pink-400/40 transition-all"
                        >
                          <span className="w-2 h-2 bg-pink-400 rounded-full flex-shrink-0"></span>
                          <span className="text-pink-300 text-sm font-medium truncate">
                            {service}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Équipements */}
              {profile.amenities && profile.amenities.length > 0 && (
                <div className="glass-card">
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-orange-400" />
                      Équipements
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {profile.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20"
                        >
                          <span className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></span>
                          <span className="text-orange-300 text-xs font-medium truncate">
                            {amenity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Horaires */}
              {profile.workingHours && (
                <div className="glass-card">
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-400" />
                      Horaires d'ouverture
                    </h3>
                    {(() => {
                      try {
                        // Essayer de parser le JSON des horaires
                        const hours = typeof profile.workingHours === 'string'
                          ? JSON.parse(profile.workingHours)
                          : profile.workingHours

                        const dayNames: Record<string, string> = {
                          'lundi': 'Lundi',
                          'mardi': 'Mardi',
                          'mercredi': 'Mercredi',
                          'jeudi': 'Jeudi',
                          'vendredi': 'Vendredi',
                          'samedi': 'Samedi',
                          'dimanche': 'Dimanche'
                        }

                        return (
                          <div className="space-y-2">
                            {Object.entries(hours).map(([day, schedule]: [string, any]) => (
                              <div
                                key={day}
                                className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                              >
                                <span className="text-gray-300 font-medium capitalize">
                                  {dayNames[day.toLowerCase()] || day}
                                </span>
                                {schedule.closed ? (
                                  <span className="text-red-400 text-sm">Fermé</span>
                                ) : (
                                  <span className="text-green-400 text-sm font-mono">
                                    {schedule.open} - {schedule.close}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )
                      } catch (error) {
                        // Si ce n'est pas du JSON, afficher tel quel
                        return <p className="text-gray-300">{profile.workingHours}</p>
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Localisation */}
              {profile.location?.address && (
                <div className="glass-card">
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-pink-400" />
                      Localisation
                    </h3>
                    <p className="text-gray-300">{profile.location.address}</p>
                  </div>
                </div>
              )}

              {/* Contact */}
              <div className="glass-card border-gradient-to-r from-pink-500/30 via-purple-500/30 to-blue-500/30">
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
                  <div className="space-y-3">
                    {profile.contact?.phone && (
                      <a
                        href={`tel:${profile.contact.phone}`}
                        className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20 hover:bg-green-500/20 transition-colors"
                      >
                        <Phone className="w-5 h-5 text-green-400" />
                        <span className="text-green-300 font-medium">{profile.contact.phone}</span>
                      </a>
                    )}
                    {profile.contact?.website && (
                      <a
                        href={profile.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                      >
                        <Globe className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-300 font-medium truncate">{profile.contact.website}</span>
                      </a>
                    )}
                    {profile.contact?.email && (
                      <a
                        href={`mailto:${profile.contact.email}`}
                        className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                      >
                        <Mail className="w-5 h-5 text-purple-400" />
                        <span className="text-purple-300 font-medium truncate">{profile.contact.email}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
