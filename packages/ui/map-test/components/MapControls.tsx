'use client'

import { motion } from 'framer-motion'
import { Navigation, MapPin } from 'lucide-react'
import { FilterType, UI_CONFIG } from '../map.constants'

interface MapControlsProps {
  // Filter state
  filterType: FilterType
  onFilterChange: (filter: FilterType) => void

  // Category filter state
  selectedCategories: string[]
  onCategoryToggle: (category: string) => void

  // Geolocation
  userLocation: [number, number] | null
  onGeolocate: () => void
  geolocating: boolean

  // Counts
  escortCount: number
  clubCount: number
}

export function MapControls({
  filterType,
  onFilterChange,
  selectedCategories,
  onCategoryToggle,
  userLocation,
  onGeolocate,
  geolocating,
  escortCount,
  clubCount
}: MapControlsProps) {
  return (
    <>
      {/* Filtres Type (Tous/Escorts/Clubs) - Top Left */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <FilterButton
          active={filterType === 'ALL'}
          onClick={() => onFilterChange('ALL')}
          gradient={UI_CONFIG.FILTER_COLORS.ALL}
        >
          Tous ({escortCount + clubCount})
        </FilterButton>

        <FilterButton
          active={filterType === 'ESCORT'}
          onClick={() => onFilterChange('ESCORT')}
          gradient={UI_CONFIG.FILTER_COLORS.ESCORT}
        >
          Escorts ({escortCount})
        </FilterButton>

        <FilterButton
          active={filterType === 'CLUB'}
          onClick={() => onFilterChange('CLUB')}
          gradient={UI_CONFIG.FILTER_COLORS.CLUB}
        >
          Clubs ({clubCount})
        </FilterButton>
      </div>

      {/* Filtres Catégories - Top Left (below type filters) */}
      {filterType === 'ESCORT' && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={{
            hidden: { opacity: 0, y: -10 },
            visible: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -10 }
          }}
          className="absolute top-20 left-4 z-10 flex flex-wrap gap-2 max-w-md"
        >
          <CategoryButton
            active={selectedCategories.includes('FEMALE')}
            onClick={() => onCategoryToggle('FEMALE')}
          >
            👩 Femme
          </CategoryButton>

          <CategoryButton
            active={selectedCategories.includes('MALE')}
            onClick={() => onCategoryToggle('MALE')}
          >
            👨 Homme
          </CategoryButton>

          <CategoryButton
            active={selectedCategories.includes('TRANS')}
            onClick={() => onCategoryToggle('TRANS')}
          >
            🏳️‍⚧️ Trans
          </CategoryButton>

          <CategoryButton
            active={selectedCategories.includes('COUPLE')}
            onClick={() => onCategoryToggle('COUPLE')}
          >
            👫 Couple
          </CategoryButton>
        </motion.div>
      )}

      {/* Geolocation Button - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGeolocate}
          disabled={geolocating}
          className={`
            px-4 py-2.5 rounded-xl font-semibold text-sm
            backdrop-blur-md border transition-all
            ${userLocation
              ? 'bg-green-500/20 border-green-500/40 text-green-300'
              : 'bg-black/40 border-white/20 text-white/80 hover:bg-black/60'
            }
            ${geolocating ? 'opacity-50 cursor-not-allowed' : ''}
            shadow-lg flex items-center gap-2
          `}
        >
          {geolocating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Localisation...
            </>
          ) : userLocation ? (
            <>
              <MapPin className="w-4 h-4" />
              Localisé
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              Me localiser
            </>
          )}
        </motion.button>
      </div>
    </>
  )
}

// ===== SUB-COMPONENTS =====

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  gradient: string
  children: React.ReactNode
}

function FilterButton({ active, onClick, gradient, children }: FilterButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        px-4 py-2.5 rounded-xl font-semibold text-sm
        backdrop-blur-md border transition-all shadow-lg
        ${active
          ? `bg-gradient-to-r ${gradient} border-white/30 text-white`
          : 'bg-black/40 border-white/20 text-white/60 hover:text-white/80 hover:bg-black/60'
        }
      `}
    >
      {children}
    </motion.button>
  )
}

interface CategoryButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function CategoryButton({ active, onClick, children }: CategoryButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-lg text-xs font-medium
        backdrop-blur-md border transition-all
        ${active
          ? 'bg-pink-500/30 border-pink-500/50 text-white'
          : 'bg-black/40 border-white/20 text-white/60 hover:text-white/80 hover:bg-black/60'
        }
      `}
    >
      {children}
    </motion.button>
  )
}
