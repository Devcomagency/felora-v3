'use client'

import React, { useState } from 'react'
import { X, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'

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

// Catégories d'escortes - values match translation keys
const escortCategoryValues = ['ESCORT', 'MASSEUSE', 'DOMINATRICE', 'TRANSSEXUELLE']

export default function SearchFiltersSimple({
  filters,
  onFiltersChange,
  onClose,
  isOpen
}: SearchFiltersSimpleProps) {
  const tFilters = useTranslations('filters')
  const tCategories = useTranslations('categories')

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
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-20 max-w-lg mx-auto rounded-2xl shadow-2xl z-[101] max-h-[80vh] overflow-hidden"
            style={{
              background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            {/* Header */}
            <div className="sticky top-0 border-b p-6 flex items-center justify-between z-10"
              style={{
                background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3))',
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <h2 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">{tFilters('title')}</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                aria-label={tFilters('closeFilters')}
              >
                <X size={18} className="text-white" />
              </button>
            </div>

            {/* Content - avec overflow scroll */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              {/* Catégories */}
              <div>
                <label className="block text-sm font-bold text-white mb-3">
                  {tFilters('category')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {escortCategoryValues.map(categoryValue => (
                    <button
                      key={categoryValue}
                      onClick={() => handleCategoryToggle(categoryValue)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        (localFilters.categories || []).includes(categoryValue)
                          ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50'
                          : 'text-white/80 border hover:bg-white/5'
                      }`}
                      style={!(localFilters.categories || []).includes(categoryValue) ? {
                        background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                        backdropFilter: 'blur(20px)',
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                      } : {}}
                    >
                      {tCategories(categoryValue)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Canton */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  {tFilters('canton')}
                </label>
                <select
                  value={localFilters.canton || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, canton: e.target.value, city: '' })}
                  className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all border"
                  style={{
                    background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                    backdropFilter: 'blur(20px)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <option value="" style={{ background: '#1a1a1a' }}>{tFilters('allCantons')}</option>
                  {Object.keys(swissLocations).map(canton => (
                    <option key={canton} value={canton} style={{ background: '#1a1a1a' }}>
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
                  <label className="block text-sm font-bold text-white mb-2">
                    {tFilters('city')}
                  </label>
                  <select
                    value={localFilters.city || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all border"
                    style={{
                      background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                      backdropFilter: 'blur(20px)',
                      borderColor: 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <option value="" style={{ background: '#1a1a1a' }}>{tFilters('allCities')}</option>
                    {swissLocations[localFilters.canton as keyof typeof swissLocations]?.map(city => (
                      <option key={city} value={city} style={{ background: '#1a1a1a' }}>{city}</option>
                    ))}
                  </select>
                </motion.div>
              )}

              {/* Tri */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  {tFilters('sortBy')}
                </label>
                <select
                  value={localFilters.sort || 'recent'}
                  onChange={(e) => setLocalFilters({ ...localFilters, sort: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all border"
                  style={{
                    background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                    backdropFilter: 'blur(20px)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <option value="recent" style={{ background: '#1a1a1a' }}>{tFilters('mostRecent')}</option>
                  <option value="popular" style={{ background: '#1a1a1a' }}>{tFilters('mostPopular')}</option>
                  <option value="rating" style={{ background: '#1a1a1a' }}>{tFilters('bestRated')}</option>
                  <option value="price-asc" style={{ background: '#1a1a1a' }}>{tFilters('priceAsc')}</option>
                  <option value="price-desc" style={{ background: '#1a1a1a' }}>{tFilters('priceDesc')}</option>
                </select>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 border-t p-6 flex gap-3"
              style={{
                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.5))',
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <button
                onClick={handleReset}
                className="flex-1 px-6 py-3.5 text-white font-bold rounded-xl transition-all hover:scale-105 border"
                style={{
                  background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                  backdropFilter: 'blur(20px)',
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                {tFilters('reset')}
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-6 py-3.5 text-white font-bold rounded-xl transition-all bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 hover:border-pink-500/50 shadow-lg hover:shadow-pink-500/20"
              >
                {tFilters('apply')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
