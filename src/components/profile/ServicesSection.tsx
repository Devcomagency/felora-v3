'use client'

import { CheckCircle, Globe, Star } from 'lucide-react'

interface ServicesSectionProps {
  services?: string[]
  languages?: string[]
  rates?: {
    rate1H?: number
    rate2H?: number
    overnight?: number
    currency?: string
  }
}

const SERVICE_ICONS: Record<string, string> = {
  'Escort Premium': '💎',
  'Massage Relaxant': '💆‍♀️',
  'Soirées VIP': '🥂',
  'Service Discret': '🔒',
  'Accompagnement': '👥',
  'Dîner': '🍽️',
  'Voyage': '✈️',
  'Weekend': '🏖️',
  'Massage Sensuel': '🌹',
  'BDSM': '🔗',
  'Fetish': '👠',
  'Couple': '💑',
  'Groupe': '👥',
  'Médias Privés': '📸'
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

  return (
    <div className="space-y-6">
      {/* Services */}
      {services && services.length > 0 && (
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-felora-aurora" />
            Services
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <span className="text-2xl">
                  {SERVICE_ICONS[service] || '✨'}
                </span>
                <span className="text-white/90 font-medium">{service}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Globe size={20} className="text-felora-plasma" />
            Langues
          </h3>
          <div className="flex flex-wrap gap-3">
            {languages.map((language, index) => (
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
