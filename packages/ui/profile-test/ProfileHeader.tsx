'use client'

import React from 'react'
import { Star, Crown, MapPin } from 'lucide-react'

interface ProfileHeaderProps {
  name: string
  handle?: string
  city?: string
  age?: number
  avatar?: string
  verified?: boolean
  premium?: boolean
  online?: boolean
  languages: string[]
  services: string[]
  stats?: {
    likes?: number
    followers?: number
    views?: number
  }
  mediaCount?: number
  availability?: {
    available?: boolean
    availableUntil?: string // Format: "2025-01-15T14:30:00Z" ou "today" ou "tomorrow"
    nextAvailable?: string // Format: "2025-01-16T09:00:00Z"
    schedule?: string // "Disponible jusqu'à 18h" ou "De retour demain 9h"
  }
  realTimeAvailability?: {
    isAvailable: boolean
    status: string
    message: string
    nextAvailable?: {
      date: string
      time: string
    }
  }
  scheduleData?: any
  showAvatar?: boolean
  description?: string
  // Optionnel: affichage du bouton agenda sous la disponibilité
  showAgendaPill?: boolean
  onAgendaClick?: () => void
  agendaIsOpenNow?: boolean
}

export default function ProfileHeader({
  name,
  handle,
  city,
  age,
  avatar,
  verified = false,
  premium = false,
  online = false,
  languages,
  services,
  stats,
  mediaCount = 0,
  availability,
  realTimeAvailability,
  scheduleData,
  showAvatar = true,
  description,
  showAgendaPill,
  onAgendaClick,
  agendaIsOpenNow
}: ProfileHeaderProps) {
  // Animation des viewers retirée

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex items-start gap-4 mb-4">
        {/* Photo de profil avec gradient ring */}
        {showAvatar && (
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 p-0.5">
              <img
                src={avatar || '/placeholder-avatar.jpg'}
                alt={name}
                className="w-full h-full rounded-full object-cover border-2 border-black"
              />
            </div>
            {/* Status online */}
            {online && (
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse" />
            )}
          </div>
        )}

        {/* Nom + stats - Style TikTok */}
        <div className="flex-1">
          {/* Nom au-dessus des compteurs */}
          <div className="mb-2">
            <h2 className="font-semibold text-lg flex items-center gap-2 text-white">
              {name}
              {verified && (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
              {premium && (
                <div className="w-5 h-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Crown size={12} className="text-white" />
                </div>
              )}
            </h2>
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
                <div className="text-xs text-gray-400">React</div>
              </div>
              {/* Publications (public + privé) */}
              <div className="text-center">
                <div className="text-lg font-bold text-white">{mediaCount}</div>
                <div className="text-xs text-gray-400">Publications</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Infos profil complètes - Style moderne */}
      <div className="space-y-3">
        <div>
          {/* Handle et infos de base */}
          {handle && (
            <p className="text-gray-400 text-sm mb-2">{handle}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
            {city && (
              <>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{city}</span>
                </div>
                <span>•</span>
              </>
            )}
            {age && <span>{age} ans</span>}
            {/* Indicateur en ligne retiré */}
          </div>

          {/* Description courte placée sous l'âge et au-dessus des langues */}
          {description && (
            <p className="mt-2 text-sm text-white/85 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Langues avec design moderne */}
        {languages.length > 0 && (
          <div>
            <h4 className="text-white font-medium mb-2 text-sm">Langues</h4>
            <div className="flex flex-wrap gap-2">
              {languages.slice(0, 4).map((language) => (
                <span
                  key={language}
                  className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30 font-medium"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Services avec design amélioré */}
        {services.length > 0 && (
          <div>
            <h4 className="text-white font-medium mb-2 text-sm">Services</h4>
            <div className="flex flex-wrap gap-1.5">
              {services.slice(0, 6).map((service, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white/10 rounded-lg text-xs border border-white/10 text-gray-300"
                >
                  {service}
                </span>
              ))}
              {services.length > 6 && (
                <span className="px-2 py-1 bg-white/5 rounded-lg text-xs border border-white/5 text-gray-500">
                  +{services.length - 6} autres
                </span>
              )}
            </div>
          </div>
        )}

        {/* Statut de disponibilité temps réel + bouton Agenda */}
        {(realTimeAvailability || availability || showAgendaPill) && (
          <div>
            {realTimeAvailability ? (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  realTimeAvailability.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className={`text-sm font-medium ${
                  realTimeAvailability.isAvailable ? 'text-green-400' : 'text-red-400'
                }`}>
                  {realTimeAvailability.message}
                </span>
                {/* Bouton agenda */}
                <button
                  onClick={() => {
                    console.log('📅 Ouvrir modal horaires:', scheduleData)
                  }}
                  className="ml-2 px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-200 text-xs text-white/80 hover:text-white"
                >
                  📅
                </button>
              </div>
            ) : availability ? (
              <div className="flex items-center gap-2">
                {availability.available ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-green-400 font-medium">
                      {availability.schedule || 'Disponible'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-sm text-red-400 font-medium">
                      {availability.schedule || 'Indisponible'}
                    </span>
                  </div>
                )}
              </div>
            ) : null}

            {showAgendaPill && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={onAgendaClick}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${agendaIsOpenNow ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-white/10 text-white/80 border-white/15'}`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: agendaIsOpenNow ? '#10B981' : 'rgba(255,255,255,0.5)' }}
                  />
                  Voir agenda
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
