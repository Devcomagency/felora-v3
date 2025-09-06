'use client'

interface GiftItemProps {
  emoji: string
  name: string
  color: string
  gradient: string
  className?: string
  onClick?: () => void
  selected?: boolean
}

function GiftItem({ emoji, name, color, gradient, className = 'w-20 h-20', onClick, selected }: GiftItemProps) {
  return (
    <div 
      onClick={onClick}
      className={`relative flex flex-col items-center cursor-pointer group ${selected ? 'ring-2 ring-felora-aurora' : ''}`}
    >
      <div className={`${className} relative flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur-lg"
          style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
        />
        
        {/* Main container */}
        <div className={`
          relative w-full h-full rounded-xl 
          bg-gradient-to-br ${gradient} 
          flex items-center justify-center 
          drop-shadow-lg
          border border-white/20
          ${selected ? 'ring-2 ring-felora-aurora ring-offset-2 ring-offset-felora-void' : ''}
        `}>
          <span className="text-4xl filter drop-shadow-md">{emoji}</span>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-60" />
        </div>
      </div>
      <div className="text-xs text-felora-silver text-center font-medium">
        {name}
      </div>
    </div>
  )
}

export function GiftCollection() {
  // Collection complète de 50 cadeaux avec gradients et couleurs
  const allGifts = [
    // ❤️ Amour & Romance
    { emoji: '❤️', name: 'Coeur', color: '#FF6B9D', gradient: 'from-pink-500 to-rose-500' },
    { emoji: '💖', name: 'Coeur Sparkle', color: '#FF1493', gradient: 'from-pink-400 to-pink-600' },
    { emoji: '💕', name: 'Deux Coeurs', color: '#FF69B4', gradient: 'from-pink-300 to-pink-500' },
    { emoji: '💘', name: 'Flèche Coeur', color: '#FF1493', gradient: 'from-rose-400 to-pink-600' },
    { emoji: '💝', name: 'Cadeau Coeur', color: '#FF6347', gradient: 'from-red-400 to-pink-500' },
    { emoji: '🌹', name: 'Rose', color: '#EC4899', gradient: 'from-pink-600 to-purple-500' },
    { emoji: '💐', name: 'Bouquet', color: '#FF69B4', gradient: 'from-pink-500 to-purple-400' },
    { emoji: '🌺', name: 'Hibiscus', color: '#FF1493', gradient: 'from-pink-400 to-red-400' },
    
    // 💎 Luxe & Richesse  
    { emoji: '💎', name: 'Diamant', color: '#4FD1C7', gradient: 'from-cyan-400 to-teal-500' },
    { emoji: '💍', name: 'Bague', color: '#FFD700', gradient: 'from-yellow-400 to-orange-500' },
    { emoji: '👑', name: 'Couronne', color: '#F59E0B', gradient: 'from-yellow-500 to-orange-500' },
    { emoji: '🏆', name: 'Trophée', color: '#FFD700', gradient: 'from-yellow-300 to-yellow-600' },
    { emoji: '🥇', name: 'Médaille Or', color: '#FFD700', gradient: 'from-yellow-400 to-amber-600' },
    { emoji: '⚜️', name: 'Fleur de Lys', color: '#FFD700', gradient: 'from-yellow-500 to-orange-400' },
    { emoji: '🎖️', name: 'Médaille', color: '#FFD700', gradient: 'from-yellow-400 to-red-500' },
    
    // ✨ Magie & Éclat
    { emoji: '✨', name: 'Sparkles', color: '#9333EA', gradient: 'from-purple-500 to-indigo-600' },
    { emoji: '⭐', name: 'Étoile', color: '#FFD700', gradient: 'from-yellow-400 to-orange-500' },
    { emoji: '🌟', name: 'Étoile Brillante', color: '#FFD700', gradient: 'from-yellow-300 to-yellow-600' },
    { emoji: '💫', name: 'Étoile Filante', color: '#9333EA', gradient: 'from-purple-400 to-blue-500' },
    { emoji: '🔥', name: 'Flamme', color: '#FF4500', gradient: 'from-orange-500 to-red-600' },
    { emoji: '⚡', name: 'Éclair', color: '#FFD700', gradient: 'from-yellow-400 to-orange-600' },
    { emoji: '🌈', name: 'Arc-en-ciel', color: '#FF69B4', gradient: 'from-pink-400 via-purple-500 to-blue-500' },
    
    // 🎉 Fête & Célébration
    { emoji: '🎉', name: 'Confettis', color: '#FF69B4', gradient: 'from-pink-400 to-purple-500' },
    { emoji: '🎊', name: 'Boule Confettis', color: '#FF1493', gradient: 'from-pink-500 to-purple-600' },
    { emoji: '🎈', name: 'Ballon', color: '#FF69B4', gradient: 'from-pink-400 to-red-500' },
    { emoji: '🎁', name: 'Cadeau', color: '#FF1493', gradient: 'from-pink-500 to-purple-500' },
    { emoji: '🍾', name: 'Champagne', color: '#32CD32', gradient: 'from-green-400 to-yellow-500' },
    { emoji: '🥂', name: 'Verres Champagne', color: '#FFD700', gradient: 'from-yellow-300 to-amber-500' },
    { emoji: '🎂', name: 'Gâteau', color: '#FF69B4', gradient: 'from-pink-300 to-orange-400' },
    
    // 🦋 Nature & Beauté
    { emoji: '🦋', name: 'Papillon', color: '#9333EA', gradient: 'from-purple-400 to-pink-500' },
    { emoji: '🌸', name: 'Fleur Cerisier', color: '#FF69B4', gradient: 'from-pink-300 to-pink-500' },
    { emoji: '🌻', name: 'Tournesol', color: '#FFD700', gradient: 'from-yellow-400 to-orange-500' },
    { emoji: '🌷', name: 'Tulipe', color: '#FF1493', gradient: 'from-pink-500 to-red-500' },
    { emoji: '🌺', name: 'Fleur Tropicale', color: '#FF4500', gradient: 'from-orange-400 to-red-500' },
    { emoji: '🍀', name: 'Trèfle', color: '#32CD32', gradient: 'from-green-400 to-emerald-500' },
    
    // 🎵 Musique & Art
    { emoji: '🎵', name: 'Notes Musique', color: '#9333EA', gradient: 'from-purple-500 to-blue-500' },
    { emoji: '🎶', name: 'Mélodie', color: '#4FD1C7', gradient: 'from-teal-400 to-blue-500' },
    { emoji: '🎨', name: 'Palette', color: '#FF69B4', gradient: 'from-pink-500 to-purple-500' },
    { emoji: '🖼️', name: 'Tableau', color: '#FFD700', gradient: 'from-yellow-400 to-brown-500' },
    
    // 🌙 Mystique & Nuit
    { emoji: '🌙', name: 'Croissant Lune', color: '#FFD700', gradient: 'from-yellow-300 to-blue-900' },
    { emoji: '🌜', name: 'Lune Visage', color: '#FFD700', gradient: 'from-yellow-400 to-gray-600' },
    { emoji: '⭐', name: 'Étoile Nuit', color: '#FFD700', gradient: 'from-yellow-300 to-purple-900' },
    { emoji: '🔮', name: 'Boule Cristal', color: '#9333EA', gradient: 'from-purple-400 to-indigo-600' },
    
    // 🍹 Luxe & Plaisir
    { emoji: '🍹', name: 'Cocktail', color: '#FF69B4', gradient: 'from-pink-400 to-orange-500' },
    { emoji: '🍸', name: 'Martini', color: '#32CD32', gradient: 'from-green-400 to-teal-500' },
    { emoji: '🍷', name: 'Vin Rouge', color: '#DC143C', gradient: 'from-red-500 to-purple-600' },
    { emoji: '🥃', name: 'Whisky', color: '#D2691E', gradient: 'from-amber-600 to-orange-700' },
    
    // 💝 Cadeaux Spéciaux
    { emoji: '🎀', name: 'Noeud', color: '#FF69B4', gradient: 'from-pink-500 to-purple-500' },
    { emoji: '💌', name: 'Lettre Amour', color: '#FF1493', gradient: 'from-pink-500 to-red-500' },
    { emoji: '📿', name: 'Collier Perles', color: '#F8F8FF', gradient: 'from-gray-200 to-purple-300' },
    { emoji: '💄', name: 'Rouge Lèvres', color: '#FF1493', gradient: 'from-pink-500 to-red-600' },
    { emoji: '👠', name: 'Escarpin', color: '#FF1493', gradient: 'from-pink-600 to-red-600' }
  ]

  return (
    <div className="min-h-screen bg-felora-void p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-felora-silver mb-4">
            🎁 COLLECTION COMPLÈTE - 50 CADEAUX !
          </h1>
          <div className="bg-felora-obsidian rounded-xl p-6 border border-felora-aurora/30 inline-block">
            <div className="text-felora-aurora font-semibold text-xl mb-2">
              📋 Choisis tes 10 préférés !
            </div>
            <div className="text-felora-silver/80 text-sm max-w-lg">
              Clique sur les cadeaux que tu veux garder pour le système final.
              On va sélectionner les 10 plus beaux pour Felora.
            </div>
          </div>
        </div>

        {/* Grille complète */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-6">
          {allGifts.map((gift, index) => (
            <GiftItem
              key={index}
              emoji={gift.emoji}
              name={gift.name}
              color={gift.color}
              gradient={gift.gradient}
              className="w-16 h-16"
              onClick={() => alert(`Cadeau sélectionné: ${gift.name} ${gift.emoji}`)}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-felora-obsidian rounded-xl p-6 border border-green-500/30 inline-block">
            <h3 className="text-green-400 font-semibold mb-4 text-lg">
              ✨ Collection Premium Ready !
            </h3>
            <div className="text-felora-silver/80 text-sm space-y-2 max-w-lg">
              <div>🎨 <strong>50 designs uniques</strong> avec gradients personnalisés</div>
              <div>🌈 <strong>8 catégories</strong> : Amour, Luxe, Magie, Fête, Nature, Art, Mystique, Plaisir</div>
              <div>💎 <strong>Qualité premium</strong> - Chaque cadeau a son style unique</div>
              <div className="pt-2 text-felora-aurora font-semibold">
                Dis-moi lesquels tu veux garder !
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}