'use client'

import { AvailabilityStatus as AvailabilityStatusType, formatAvailabilityDisplay } from '@/lib/availability-calculator'

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
export function AvailabilityDetailed({ status, className = '' }: { status: AvailabilityStatusType; className?: string }) {
  const display = formatAvailabilityDisplay(status)

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
          status.isAvailable
            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
            : 'bg-gradient-to-r from-red-500 to-rose-600'
        }`}>
          <span className="text-xs">{display.icon}</span>
        </div>
        <h3 className="text-sm font-semibold text-white">Disponibilité</h3>
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
  )
}