'use client'

import { useState } from 'react'
import { AvailabilityStatus as AvailabilityStatusType, formatAvailabilityDisplay, ScheduleData } from '@/lib/availability-calculator'

interface AvailabilityStatusProps {
  status: AvailabilityStatusType
  className?: string
  showNextAvailable?: boolean
}

export default function AvailabilityStatus({
  status,
  className = '',
  showNextAvailable = true
}: AvailabilityStatusProps) {
  const display = formatAvailabilityDisplay(status)

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Statut principal */}
      <div className={display.className}>
        <div className="flex items-center gap-2">
          <span className="text-xs">{display.icon}</span>
          <span>{display.text}</span>
        </div>
      </div>

      {/* Prochaine disponibilité si pas disponible */}
      {!status.isAvailable && status.nextAvailable && showNextAvailable && (
        <div className="px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>
              Prochaine disponibilité: {status.nextAvailable.date} à {status.nextAvailable.time}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Version compacte pour les cartes de profil
 */
export function AvailabilityBadge({ status, className = '' }: { status: AvailabilityStatusType; className?: string }) {
  const display = formatAvailabilityDisplay(status)

  return (
    <div className={`${display.className} ${className}`}>
      <div className="flex items-center gap-1.5">
        <span className="text-xs">{display.icon}</span>
        <span className="text-xs font-medium">{display.text}</span>
      </div>
    </div>
  )
}

/**
 * Version détaillée pour la modal "Voir plus"
 */
export function AvailabilityDetailed({ status, className = '', scheduleData }: {
  status: AvailabilityStatusType;
  className?: string;
  scheduleData?: ScheduleData | null;
}) {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const display = formatAvailabilityDisplay(status)

  // Debug logs
  console.log('[AvailabilityDetailed] Status:', status)
  console.log('[AvailabilityDetailed] ScheduleData:', scheduleData)

  return (
    <>
      <div className={`p-4 rounded-2xl bg-gradient-to-br from-gray-900/50 to-black/30 backdrop-blur-sm border border-white/10 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
            status.isAvailable
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : 'bg-gradient-to-r from-red-500 to-rose-600'
          }`}>
            <span className="text-xs">{display.icon}</span>
          </div>
          <h3 className="text-sm font-semibold text-white">Disponibilité</h3>
          {/* Bouton petit pill cliquable */}
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="ml-auto px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-200 text-xs text-white/80 hover:text-white"
          >
            📅 Horaires
          </button>
        </div>

        <div className="space-y-2">
          {/* Statut actuel */}
          <div className={display.className}>
            <div className="flex items-center gap-2">
              <span className="text-xs">{display.icon}</span>
              <span className="text-xs font-medium">{display.text}</span>
            </div>
          </div>

          {/* Prochaine disponibilité */}
          {!status.isAvailable && status.nextAvailable && (
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/5 to-indigo-600/10 backdrop-blur-sm border border-blue-500/20">
              <div className="text-xs text-blue-300/80 font-medium uppercase tracking-wider mb-1">Prochaine disponibilité</div>
              <div className="text-xs text-white">
                {status.nextAvailable.date} à {status.nextAvailable.time}
              </div>
            </div>
          )}

          {/* Recommandations */}
          {!status.isAvailable && (
            <div className="text-xs text-white/60 italic">
              💡 Vous pouvez réserver à l'avance ou envoyer un message
            </div>
          )}
        </div>
      </div>

      {/* Modal des horaires détaillés */}
      {isScheduleModalOpen && (
        <ScheduleModal
          scheduleData={scheduleData}
          onClose={() => setIsScheduleModalOpen(false)}
        />
      )}
    </>
  )
}

/**
 * Modal détaillée pour afficher les horaires et absences
 */
function ScheduleModal({ scheduleData, onClose }: {
  scheduleData?: ScheduleData | null;
  onClose: () => void;
}) {
  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            📅 Horaires de disponibilité
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {!scheduleData ? (
            <div className="text-center text-white/60 py-8">
              📋 Aucun planning configuré
            </div>
          ) : (
            <div className="space-y-4">
              {/* Planning hebdomadaire */}
              {scheduleData.weekly && scheduleData.weekly.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-white mb-3">📅 Planning hebdomadaire</h3>
                  <div className="space-y-2">
                    {scheduleData.weekly.map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-sm text-white font-medium">
                          {dayNames[day.weekday] || `Jour ${day.weekday}`}
                        </span>
                        <div className="text-xs">
                          {day.available ? (
                            <span className="text-green-400">
                              {day.timeSlot ? `${day.timeSlot.start} - ${day.timeSlot.end}` : 'Toute la journée'}
                            </span>
                          ) : (
                            <span className="text-red-400">Indisponible</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pause générale */}
              {scheduleData.pause && (
                <div>
                  <h3 className="text-sm font-medium text-white mb-3">⏸️ Pause générale</h3>
                  <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <div className="text-sm text-orange-300">
                      Du {new Date(scheduleData.pause.start).toLocaleDateString('fr-CH')}
                      au {new Date(scheduleData.pause.end).toLocaleDateString('fr-CH')}
                    </div>
                  </div>
                </div>
              )}

              {/* Absences spécifiques */}
              {scheduleData.absences && scheduleData.absences.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-white mb-3">🚫 Absences spécifiques</h3>
                  <div className="space-y-2">
                    {scheduleData.absences.map((absence) => (
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
              {(!scheduleData.weekly || scheduleData.weekly.length === 0) &&
               !scheduleData.pause &&
               (!scheduleData.absences || scheduleData.absences.length === 0) && (
                <div className="text-center text-white/60 py-4">
                  📋 Aucun planning détaillé configuré
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="text-xs text-white/60 text-center">
            💡 Vous pouvez réserver à l'avance même en cas d'indisponibilité
          </div>
        </div>
      </div>
    </div>
  )
}