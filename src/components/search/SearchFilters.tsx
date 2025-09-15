'use client'

import { useState, useEffect } from 'react'
import { X, MapPin, Filter, ChevronDown } from 'lucide-react'

interface SearchFiltersProps {
  filters: {
    q: string
    city: string
    canton: string
    services: string[]
    languages: string[]
    status: string
    sort: string
  }
  onFiltersChange: (filters: any) => void
  onClose: () => void
  isOpen: boolean
}

const SWISS_CANTONS = [
  'Genève', 'Vaud', 'Valais', 'Neuchâtel', 'Jura', 'Fribourg', 
  'Berne', 'Zurich', 'Suisse Alémanique', 'Tessin'
]

const SWISS_CITIES = {
  "Genève": ["Genève", "Carouge", "Chambésy", "Champel", "Cité-Centre", "Cologny", "Cornavin", "Eaux-vives", "Plainpalais", "Plan-les-Ouates", "Servette", "Thônex", "Versoix", "Meyrin", "Vernier", "Lancy"],
  "Vaud": ["Lausanne", "Montreux", "Vevey", "Nyon", "Morges", "Yverdon-les-Bains", "Renens", "Pully", "Gland", "Aigle", "Bex", "Coppet", "Crissier", "Moudon", "Payerne", "Rolle"],
  "Valais": ["Sion", "Martigny", "Monthey", "Sierre", "Brig", "Visp", "Crans-Montana", "Verbier", "Saillon", "Saint-Maurice", "Saxon", "Turtmann", "Vétroz", "Savièse", "Fully", "Veyras"],
  "Neuchâtel": ["Neuchâtel", "La Chaux-de-Fonds", "Le Locle", "Boudry", "Colombier"],
  "Jura": ["Delémont", "Porrentruy", "Moutier", "Boncourt", "Bassecourt", "Courrendlin", "Alle"],
  "Fribourg": ["Fribourg", "Bulle", "Romont", "Morat", "Estavayer-le-Lac", "Châtel-Saint-Denis", "Düdingen", "Flamatt", "Marly", "Kerzers"],
  "Berne": ["Berne", "Biel/Bienne", "Thun", "Interlaken", "Spiez", "Burgdorf", "Gstaad", "Kirchberg", "Laupen", "Oberdiessbach", "Ostermundigen", "Uetendorf", "Zollikofen", "Lyss", "Münsingen"],
  "Zurich": ["Zürich", "Winterthur", "Uster", "Dübendorf", "Dietikon", "Wädenswil", "Bülach", "Kloten", "Opfikon", "Regensdorf", "Schlieren", "Bassersdorf", "Effretikon", "Pfäffikon", "Wald", "Schwerzenbach"],
  "Suisse Alémanique": ["Basel", "Lucerne", "Saint-Gall", "Chur", "Aarau", "Solothurn", "Liestal", "Schaffhouse", "Frauenfeld", "Zug", "Allschwil", "Pratteln", "Muttenz", "Emmen", "Kriens", "Horw", "Arosa", "St-Moritz", "Davos"],
  "Tessin": ["Lugano", "Bellinzona", "Locarno", "Mendrisio", "Chiasso", "Ascona", "Biasca", "Faido", "Gordola", "Massagno", "Minusio", "Morbio Inferiore", "Pregassona", "Sorengo", "Viganello"]
}

const SERVICES = [
  'Escort Premium', 'Massage Relaxant', 'Soirées VIP', 'Service Discret',
  'Accompagnement', 'Dîner', 'Voyage', 'Weekend', 'Massage Sensuel',
  'BDSM', 'Fetish', 'Couple', 'Groupe', 'Médias Privés'
]

const LANGUAGES = [
  'Français', 'Anglais', 'Allemand', 'Italien', 'Espagnol', 'Portugais',
  'Russe', 'Arabe', 'Chinois', 'Japonais'
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récent' },
  { value: 'distance', label: 'Plus proche' },
  { value: 'relevance', label: 'Pertinence' }
]

export default function SearchFilters({ filters, onFiltersChange, onClose, isOpen }: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters)
  const [activeTab, setActiveTab] = useState('location')

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleResetFilters = () => {
    const resetFilters = {
      q: '',
      city: '',
      canton: '',
      services: [],
      languages: [],
      status: '',
      sort: 'recent'
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const getAvailableCities = () => {
    if (localFilters.canton && localFilters.canton !== 'ALL') {
      return SWISS_CITIES[localFilters.canton as keyof typeof SWISS_CITIES] || []
    }
    return Object.values(SWISS_CITIES).flat()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="absolute right-0 top-0 h-full w-full max-w-md bg-black/95 backdrop-blur-xl border-l border-white/10 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Filtres</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 border-b border-white/10">
            {[
              { id: 'location', label: 'Localisation', icon: MapPin },
              { id: 'services', label: 'Services', icon: Filter },
              { id: 'sort', label: 'Tri', icon: ChevronDown }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'text-white border-b-2 border-felora-aurora'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* Location Tab */}
          {activeTab === 'location' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-3">Canton</label>
                <select
                  value={localFilters.canton}
                  onChange={(e) => {
                    handleFilterChange('canton', e.target.value)
                    handleFilterChange('city', '')
                  }}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-felora-aurora focus:outline-none"
                >
                  <option value="">Tous les cantons</option>
                  <option value="ALL">Tous</option>
                  {SWISS_CANTONS.map(canton => (
                    <option key={canton} value={canton}>{canton}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">Ville</label>
                <select
                  value={localFilters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-felora-aurora focus:outline-none"
                >
                  <option value="">Toutes les villes</option>
                  {getAvailableCities().map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-3">Services</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {SERVICES.map(service => (
                    <label key={service} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localFilters.services.includes(service)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('services', [...localFilters.services, service])
                          } else {
                            handleFilterChange('services', localFilters.services.filter(s => s !== service))
                          }
                        }}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-felora-aurora focus:ring-felora-aurora focus:ring-2"
                      />
                      <span className="text-sm text-white/80">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">Langues</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {LANGUAGES.map(language => (
                    <label key={language} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localFilters.languages.includes(language)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('languages', [...localFilters.languages, language])
                          } else {
                            handleFilterChange('languages', localFilters.languages.filter(l => l !== language))
                          }
                        }}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-felora-aurora focus:ring-felora-aurora focus:ring-2"
                      />
                      <span className="text-sm text-white/80">{language}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">Statut</label>
                <select
                  value={localFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-felora-aurora focus:outline-none"
                >
                  <option value="">Tous les statuts</option>
                  <option value="ACTIVE">Actif</option>
                  <option value="PAUSED">En pause</option>
                </select>
              </div>
            </div>
          )}

          {/* Sort Tab */}
          {activeTab === 'sort' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-3">Trier par</label>
                <div className="space-y-2">
                  {SORT_OPTIONS.map(option => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="sort"
                        value={option.value}
                        checked={localFilters.sort === option.value}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                        className="w-4 h-4 border-white/20 bg-white/5 text-felora-aurora focus:ring-felora-aurora focus:ring-2"
                      />
                      <span className="text-sm text-white/80">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
            <button
              onClick={handleResetFilters}
              className="flex-1 px-4 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors"
            >
              Réinitialiser
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-felora-aurora to-felora-plasma text-white font-medium hover:opacity-90 transition-opacity"
            >
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
