'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Verified } from 'lucide-react'
import { EscortPoint, ClubPoint, PERFORMANCE_CONFIG, ANIMATION_CONFIG } from '../map.constants'

interface MapSidebarProps {
  isOpen: boolean
  onClose: () => void
  visibleEscorts: EscortPoint[]
  filteredEscorts: (EscortPoint | ClubPoint)[]
  onEscortClick: (escort: EscortPoint | ClubPoint) => void
}

export function MapSidebar({
  isOpen,
  onClose,
  visibleEscorts,
  filteredEscorts,
  onEscortClick
}: MapSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={ANIMATION_CONFIG.SIDEBAR_VARIANTS}
          className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-black/95 backdrop-blur-xl border-l border-white/10 z-20 shadow-2xl"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Profils visibles ({visibleEscorts.length})
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Liste des profils */}
          <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            {visibleEscorts.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                Aucun profil visible dans cette zone
              </div>
            ) : (
              <div className="space-y-3">
                {visibleEscorts.map(escort => (
                  <ProfileCard
                    key={escort.id}
                    profile={escort}
                    onClick={() => onEscortClick(escort)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer - Indicateur de profils supplémentaires */}
          {visibleEscorts.length >= PERFORMANCE_CONFIG.MAX_VISIBLE_ESCORTS &&
           filteredEscorts.length > visibleEscorts.length && (
            <div className="p-3 border-t border-white/10 text-center text-xs text-white/60">
              +{filteredEscorts.length - visibleEscorts.length} autres profils dans la zone
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ===== SUB-COMPONENT =====

interface ProfileCardProps {
  profile: EscortPoint | ClubPoint
  onClick: () => void
}

function ProfileCard({ profile, onClick }: ProfileCardProps) {
  const isEscort = 'stageName' in profile
  const avatar = isEscort
    ? profile.profilePhoto
    : (profile as ClubPoint).logo

  const name = isEscort
    ? profile.stageName
    : (profile as ClubPoint).name

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-all cursor-pointer border border-white/10 hover:border-pink-500/30"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-pink-500/20 to-purple-500/20">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                👤
              </div>
            )}
          </div>

          {/* Badge vérifié */}
          {profile.verified && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black">
              <Verified className="w-3 h-3 text-white" fill="currentColor" />
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate">
                {name}
              </h3>
              <p className="text-xs text-white/60 truncate">
                @{profile.handle}
              </p>
            </div>

            {/* Catégorie badge (escorts only) */}
            {isEscort && profile.category && (
              <span className={`
                px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                ${getCategoryColor(profile.category)}
              `}>
                {getCategoryLabel(profile.category)}
              </span>
            )}
          </div>

          {/* Localisation */}
          <div className="flex items-center gap-1 mt-2 text-xs text-white/60">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{profile.city}</span>
          </div>

          {/* Age (escorts only) */}
          {isEscort && profile.age && (
            <div className="text-xs text-white/60 mt-1">
              {profile.age} ans
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ===== UTILS =====

function getCategoryColor(category: string): string {
  switch (category) {
    case 'FEMALE':
      return 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
    case 'MALE':
      return 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
    case 'TRANS':
      return 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
    case 'COUPLE':
      return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
    default:
      return 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'FEMALE':
      return 'Femme'
    case 'MALE':
      return 'Homme'
    case 'TRANS':
      return 'Trans'
    case 'COUPLE':
      return 'Couple'
    default:
      return category
  }
}
