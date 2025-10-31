'use client'

import React from 'react'
import { MapPin, Clock, Star, Users } from 'lucide-react'
import { Club } from '@/hooks/useClubs'

interface ClubCardProps {
  club: Club
  onClick?: (club: Club) => void
}

export default function ClubCard({ club, onClick }: ClubCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(club)
    }
  }

  // ✅ L'API envoie déjà les URLs avec cache-buster, on les utilise directement
  // Note: On utilise l'avatar comme image principale car c'est la position 0 (photo de couverture dans le dashboard)
  const coverUrl = club.avatar || club.cover

  const getEstablishmentTypeLabel = (type: string) => {
    switch (type) {
      case 'salon_erotique': return 'Salon'
      case 'institut_massage': return 'Institut'
      case 'agence_escorte': return 'Agence'
      default: return 'Club'
    }
  }

  const getEstablishmentTypeColor = (type: string) => {
    switch (type) {
      case 'salon_erotique': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'institut_massage': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'agence_escorte': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default: return 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    }
  }

  return (
    <div 
      className="group relative aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer card-hover"
      onClick={handleClick}
    >
      {/* Image de couverture */}
      <div className="relative w-full h-full">
        <img
          key={`cover-${club.id}-${club.updatedAt}`}
          src={coverUrl}
          alt={club.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // Fallback si l'image ne charge pas
            e.currentTarget.src = `https://picsum.photos/seed/club-${club.id}/600/400`
          }}
        />
        
        {/* Overlay dégradé */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Badge type d'établissement */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getEstablishmentTypeColor(club.establishmentType)}`}>
            {getEstablishmentTypeLabel(club.establishmentType)}
          </span>
        </div>

        {/* Badge ouvert/fermé */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${
            club.isActive 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
              : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
          }`}>
            {club.isActive ? 'Ouvert' : 'Fermé'}
          </span>
        </div>

        {/* Contenu en bas */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Nom et ville */}
          <div className="mb-2">
            <h3 className="text-white font-semibold text-lg leading-tight mb-1">
              {club.name}
            </h3>
            <div className="flex items-center gap-1 text-white/80 text-sm">
              <MapPin size={12} />
              <span>{club.city}</span>
            </div>
          </div>

          {/* Stats et infos */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white/70 text-xs">
              {club.stats.views > 0 && (
                <div className="flex items-center gap-1">
                  <Users size={12} />
                  <span>{club.stats.views}</span>
                </div>
              )}
              {club.stats.likes > 0 && (
                <div className="flex items-center gap-1">
                  <Star size={12} />
                  <span>{club.stats.likes}</span>
                </div>
              )}
            </div>

            {/* Horaires */}
            {club.openingHours && (
              <div className="flex items-center gap-1 text-white/70 text-xs">
                <Clock size={12} />
                <span>Horaires</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Effet de hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  )
}
