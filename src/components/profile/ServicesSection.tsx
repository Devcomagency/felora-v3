'use client'

import { CheckCircle, Globe, Star } from 'lucide-react'

interface ServicesSectionProps {
  services?: string[]
  languages?: string[] | Record<string, number> // Support des deux formats
  rates?: {
    rate1H?: number
    rate2H?: number
    overnight?: number
    currency?: string
  }
}

const SERVICE_ICONS: Record<string, string> = {
  // Catégories principales
  'escort': '💎',
  'masseuse-erotique': '💆‍♀️',
  'dominatrice-bdsm': '👑',
  'transsexuel': '🌈',

  // Services classiques
  'Rapport': '💕',
  'French kiss': '💋',
  'GFE': '🌹',
  'PSE': '🔥',
  'Lingerie': '👙',
  'Duo/Trio': '👥',
  'Jeux de rôles': '🎭',
  'Costumes': '👗',

  // Services oraux
  'Fellation protégée': '🛡️',
  'Fellation nature': '💋',
  'Gorge profonde': '🔥',
  'Éjac en bouche': '💋',
  'Éjac sur le corps': '💦',
  'Éjac sur le visage': '💦',

  // Services anaux
  'Sodomie (donne)': '🍑',
  'Sodomie (reçoit)': '🍑',
  'Doigté anal': '👆',

  // BDSM & Fétiches
  'Domination soft': '👑',
  'Fessées': '✋',
  'Donjon SM': '🔗',
  'Fétichisme pieds': '👠',

  // Massages
  'Tantrique': '🧘‍♀️',
  'Érotique': '🌹',
  'Corps à corps': '🤗',
  'Nuru': '💆‍♀️',
  'Prostate': '💆‍♂️',
  'Lingam': '🕉️',
  'Yoni': '🌸',
  '4 mains': '👐',
  'Suédois': '💆‍♀️',
  'Huiles': '🛢️',

  // Options lieu
  'Douche à deux': '🚿',
  'Jacuzzi': '🛁',
  'Sauna': '🔥',
  'Climatisation': '❄️',
  'Fumoir': '🚬',
  'Parking': '🚗',
  'Accès handicapé': '♿',
  'Ambiance musicale': '🎵',
  'Bar': '🍸',
  'Pole dance': '💃'
}

const LANGUAGE_FLAGS: Record<string, string> = {
  'Français': '🇫🇷',
  'Anglais': '🇬🇧',
  'Allemand': '🇩🇪',
  'Italien': '🇮🇹',
  'Espagnol': '🇪🇸',
  'Portugais': '🇵🇹',
  'Russe': '🇷🇺',
  'Arabe': '🇸🇦',
  'Chinois': '🇨🇳',
  'Japonais': '🇯🇵'
}

export default function ServicesSection({ services, languages, rates }: ServicesSectionProps) {
  const formatPrice = (price?: number, currency = 'CHF') => {
    if (!price) return null
    return `${price} ${currency}`
  }

  // Nettoyer les services (enlever préfixes srv: et opt: si présents)
  const cleanService = (service: string): string => {
    if (service.startsWith('srv:')) return service.substring(4)
    if (service.startsWith('opt:')) return service.substring(4)
    return service
  }

  // Déterminer la couleur de la pilule selon le type de service
  const getServiceStyle = (service: string): string => {
    const cleanedService = cleanService(service)

    // Catégories principales
    if (['escort', 'masseuse-erotique', 'dominatrice-bdsm', 'transsexuel'].includes(cleanedService)) {
      return 'bg-felora-aurora/20 border-felora-aurora/30 text-felora-aurora'
    }

    // Services premium (BDSM, anal, etc.)
    if (['Domination soft', 'Fessées', 'Donjon SM', 'Sodomie (donne)', 'Sodomie (reçoit)', 'PSE'].includes(cleanedService)) {
      return 'bg-felora-neural/20 border-felora-neural/30 text-felora-neural'
    }

    // Massages
    if (['Tantrique', 'Érotique', 'Corps à corps', 'Nuru', 'Prostate', 'Lingam', 'Yoni'].includes(cleanedService)) {
      return 'bg-felora-quantum/20 border-felora-quantum/30 text-felora-quantum'
    }

    // Services standards
    return 'bg-felora-plasma/20 border-felora-plasma/30 text-felora-plasma'
  }

  return (
    <div className="space-y-6">
      {/* Services */}
      {services && services.length > 0 && (
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-felora-aurora" />
            Services proposés
          </h3>
          <div className="flex flex-wrap gap-2">
            {services.map((service, index) => {
              const cleanedService = cleanService(service)
              const serviceStyle = getServiceStyle(service)

              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all hover:scale-105 ${serviceStyle}`}
                >
                  <span className="text-sm">
                    {SERVICE_ICONS[cleanedService] || '✨'}
                  </span>
                  <span className="font-medium text-sm">{cleanedService}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages && (Array.isArray(languages) ? languages.length > 0 : Object.keys(languages).length > 0) && (
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Globe size={20} className="text-felora-plasma" />
            Langues
          </h3>
          <div className="flex flex-wrap gap-3">
            {(Array.isArray(languages) ? languages : Object.keys(languages)).map((language, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-felora-plasma/20 border border-felora-plasma/30"
              >
                <span className="text-lg">
                  {LANGUAGE_FLAGS[language] || '🌍'}
                </span>
                <span className="text-felora-plasma font-medium">{language}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rates */}
      {rates && (rates.rate1H || rates.rate2H || rates.overnight) && (
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Star size={20} className="text-felora-quantum" />
            Tarifs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {rates.rate1H && (
              <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-2xl font-bold text-felora-quantum mb-1">
                  {formatPrice(rates.rate1H, rates.currency)}
                </div>
                <div className="text-white/60 text-sm">1 heure</div>
              </div>
            )}
            {rates.rate2H && (
              <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-2xl font-bold text-felora-quantum mb-1">
                  {formatPrice(rates.rate2H, rates.currency)}
                </div>
                <div className="text-white/60 text-sm">2 heures</div>
              </div>
            )}
            {rates.overnight && (
              <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-2xl font-bold text-felora-quantum mb-1">
                  {formatPrice(rates.overnight, rates.currency)}
                </div>
                <div className="text-white/60 text-sm">Nuitée</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
