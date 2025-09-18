'use client'

import React, { useMemo, useState } from 'react'
import { Star, Crown, MapPin } from 'lucide-react'
import { normalizeScheduleData } from '@/lib/availability-calculator'

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
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  const normalizedSchedule = useMemo(() => normalizeScheduleData(scheduleData), [scheduleData])
  const weeklyEntries = normalizedSchedule?.weekly ?? []
  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

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
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="ml-2 px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-200 text-xs text-white/80 hover:text-white"
                >
                  Agenda
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

      {/* Modal agenda */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                📅 Horaires de disponibilité
              </h2>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {!normalizedSchedule ? (
                <div className="text-center text-white/60 py-8">
                  📋 Aucun planning configuré
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Planning hebdomadaire */}
                  {weeklyEntries.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-white mb-3">📅 Planning hebdomadaire</h3>
                      <div className="space-y-2">
                        {weeklyEntries.map((day, index) => {
                          const weekdayIndex = Number.isInteger(day.weekday) ? day.weekday : index
                          const label = dayNames[weekdayIndex] || `Jour ${weekdayIndex}`
                          const isAvailable = !!day.enabled
                          const start = day.start
                          const end = day.end
                          const hasSlot = Boolean(start && end)

                          return (
                            <div key={`${weekdayIndex}-${index}`} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                              <span className="text-sm text-white font-medium">{label}</span>
                              <div className="text-xs">
                                {isAvailable ? (
                                  <span className="text-green-400">
                                    {hasSlot ? `${start} - ${end}` : 'Toute la journée'}
                                  </span>
                                ) : (
                                  <span className="text-red-400">Indisponible</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pause générale */}
                  {normalizedSchedule.pause && (
                    <div>
                      <h3 className="text-sm font-medium text-white mb-3">⏸️ Pause générale</h3>
                      <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <div className="text-sm text-orange-300">
                          Du {new Date(normalizedSchedule.pause.start).toLocaleDateString('fr-CH')}
                          au {new Date(normalizedSchedule.pause.end).toLocaleDateString('fr-CH')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Absences spécifiques */}
                  {normalizedSchedule.absences && normalizedSchedule.absences.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-white mb-3">🚫 Absences spécifiques</h3>
                      <div className="space-y-2">
                        {normalizedSchedule.absences.map((absence) => (
                          <div key={absence.id} className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                            <div className="text-sm text-red-300">
                              Du {new Date(absence.start).toLocaleDateString('fr-CH')}
                              au {new Date(absence.end).toLocaleDateString('fr-CH')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message si pas de données */}
                  {weeklyEntries.length === 0 &&
                   !normalizedSchedule.pause &&
                   (!normalizedSchedule.absences || normalizedSchedule.absences.length === 0) && (
                    <div className="text-center text-white/60 py-4">
                      📋 Aucun planning détaillé configuré
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
