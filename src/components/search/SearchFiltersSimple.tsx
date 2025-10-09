'use client'

import React, { useState } from 'react'
import { X, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchFiltersSimpleProps {
  filters: {
    q?: string
    city?: string
    canton?: string
    sort?: string
    categories?: string[]
  }
  onFiltersChange: (filters: any) => void
  onClose: () => void
  isOpen: boolean
}

// Cantons et villes principales de Suisse (simplifiés)
const swissLocations = {
  "GE": ["Genève", "Carouge", "Meyrin", "Vernier"],
  "VD": ["Lausanne", "Montreux", "Nyon", "Yverdon"],
  "VS": ["Sion", "Martigny", "Monthey", "Sierre"],
  "NE": ["Neuchâtel", "La Chaux-de-Fonds"],
  "FR": ["Fribourg", "Bulle"],
  "BE": ["Berne", "Biel/Bienne", "Thun"],
  "ZH": ["Zurich", "Winterthur", "Uster"],
  "BS": ["Basel", "Liestal"],
  "LU": ["Lucerne", "Emmen"],
  "TI": ["Lugano", "Bellinzona", "Locarno"]
}

// Catégories d'escortes
const escortCategories = [
  { value: 'escort', label: 'Escorte' },
  { value: 'masseuse_erotique', label: 'Masseuse Érotique' },
  { value: 'dominatrice_bdsm', label: 'Dominatrice BDSM' },
  { value: 'transsexuel', label: 'Transsexuel' }
]

export default function SearchFiltersSimple({
  filters,
  onFiltersChange,
  onClose,
  isOpen
}: SearchFiltersSimpleProps) {
  const [localFilters, setLocalFilters] = useState({
    ...filters,
    categories: filters.categories || []
  })

  const handleApply = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleReset = () => {
    const resetFilters = { q: filters.q || '', categories: [] }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const handleCategoryToggle = (categoryValue: string) => {
    const currentCategories = localFilters.categories || []
    const newCategories = currentCategories.includes(categoryValue)
      ? currentCategories.filter(c => c !== categoryValue)
      : [...currentCategories, categoryValue]
    
    setLocalFilters({ ...localFilters, categories: newCategories })
  }

  // Synchroniser les filtres locaux avec les filtres reçus
  React.useEffect(() => {
    setLocalFilters({
      ...filters,
      categories: filters.categories || []
    })
  }, [filters])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-20 max-w-lg mx-auto bg-[#111318] border border-white/10 rounded-2xl shadow-2xl z-[101] max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#111318] border-b border-white/10 p-6 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-white">Filtres</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="Fermer les filtres"
              >
                <X size={18} className="text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Catégories */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Catégorie
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {escortCategories.map(category => (
                    <button
                      key={category.value}
                      onClick={() => handleCategoryToggle(category.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        (localFilters.categories || []).includes(category.value)
                          ? 'bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] text-white'
                          : 'bg-white/5 hover:bg-white/10 text-white/80'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Canton */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  Canton
                </label>
              <select
                value={localFilters.canton || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, canton: e.target.value, city: '' })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF6B9D] transition-colors"
              >
                <option value="">Tous les cantons</option>
                {Object.keys(swissLocations).map(canton => (
                  <option key={canton} value={canton}>
                    {canton === 'GE' ? 'Genève' :
                     canton === 'VD' ? 'Vaud' :
                     canton === 'VS' ? 'Valais' :
                     canton === 'NE' ? 'Neuchâtel' :
                     canton === 'FR' ? 'Fribourg' :
                     canton === 'BE' ? 'Berne' :
                     canton === 'ZH' ? 'Zurich' :
                     canton === 'BS' ? 'Basel' :
                     canton === 'LU' ? 'Lucerne' :
                     canton === 'TI' ? 'Tessin' : canton}
                  </option>
                ))}
              </select>
              </div>

              {/* Ville (si canton sélectionné) */}
              {localFilters.canton && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Ville
                  </label>
                  <select
                    value={localFilters.city || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, city: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF6B9D] transition-colors"
                  >
                    <option value="">Toutes les villes</option>
                    {swissLocations[localFilters.canton as keyof typeof swissLocations]?.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </motion.div>
              )}

              {/* Tri */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Trier par
                </label>
                <select
                  value={localFilters.sort || 'recent'}
                  onChange={(e) => setLocalFilters({ ...localFilters, sort: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF6B9D] transition-colors"
                >
                  <option value="recent">Plus récents</option>
                  <option value="popular">Plus populaires</option>
                  <option value="rating">Mieux notés</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                </select>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-[#111318] border-t border-white/10 p-6 flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
              >
                Réinitialiser
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-pink-500/25 transition-all"
              >
                Appliquer
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
