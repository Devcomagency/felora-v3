'use client'

import { memo } from 'react'

interface ClusterBadgeProps {
  count: number
  /** Types d'établissements dans le cluster pour déterminer la couleur */
  types: ('ESCORT' | 'CLUB' | 'SALON')[]
  /** Pourcentage d'établissements actifs (pour la nuance de couleur) */
  activeRatio: number
  onClick?: () => void
}

const ClusterBadge = memo(function ClusterBadge({ 
  count, 
  types, 
  activeRatio,
  onClick 
}: ClusterBadgeProps) {
  
  // Déterminer la couleur principale selon le type dominant
  const getClusterColor = () => {
    const typeCounts = types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const dominantType = Object.entries(typeCounts).reduce(
      (a, b) => typeCounts[a[0]] > typeCounts[b[0]] ? a : b
    )[0]

    // Couleurs selon le type dominant avec variations selon activeRatio
    const baseColors = {
      ESCORT: '#FF6B9D',  // Rose électrique
      CLUB: '#4FD1C7',    // Turquoise quantique  
      SALON: '#B794F6'    // Violet plasma
    }

    const baseColor = baseColors[dominantType as keyof typeof baseColors] || '#FF6B9D'
    
    // Ajuster l'opacité selon le ratio d'actifs
    // Plus il y a d'actifs, plus la couleur est vive
    const opacity = 0.7 + (activeRatio * 0.3) // Entre 0.7 et 1.0
    
    return `${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
  }

  // Style pour les gros nombres (>99)
  const fontSize = count > 99 ? '12px' : count > 9 ? '14px' : '16px'

  return (
    <div
      onClick={onClick}
      style={{
        width: '50px',
        height: '50px',
        background: getClusterColor(),
        border: '3px solid white',
        borderRadius: '50%',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: fontSize,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        userSelect: 'none',
        transform: 'translate(-50%, -50%)',
      }}
      className="hover:scale-110 hover:shadow-lg active:scale-95"
      title={`${count} établissement${count > 1 ? 's' : ''} • ${Math.round(activeRatio * 100)}% actifs`}
    >
      {count}
      
      {/* Indicateur subtil pour les mixtes */}
      {types.length > 1 && (
        <div
          style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '12px',
            height: '12px',
            background: 'linear-gradient(45deg, #FF6B9D 50%, #4FD1C7 50%)',
            borderRadius: '50%',
            border: '1px solid white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
          title="Établissements mixtes"
        />
      )}
      
      {/* Ring d'animation pour les clusters très actifs */}
      {activeRatio > 0.8 && (
        <div
          style={{
            position: 'absolute',
            inset: '-3px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${getClusterColor()}40, transparent)`,
            animation: 'pulse 2s infinite',
          }}
        />
      )}
    </div>
  )
})

export default ClusterBadge

// Styles CSS à ajouter aux globals si pas déjà présents
export const clusterStyles = `
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    70% {
      transform: scale(1.1);
      opacity: 0.5;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`