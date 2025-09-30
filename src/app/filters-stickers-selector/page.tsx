'use client'

import { useState } from 'react'

export default function FiltersStickersSelector() {
  const [activeTab, setActiveTab] = useState<'filters' | 'stickers'>('filters')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [selectedStickers, setSelectedStickers] = useState<string[]>([])

  // Filtres inspirés des projets gpupixel, Harbeth, MetalPetal
  const ALL_FILTERS = [
    // Filtres de base
    { id: 'original', name: 'Original', icon: '📷', category: 'basic' },
    { id: 'brightness', name: 'Luminosité', icon: '☀️', category: 'basic' },
    { id: 'contrast', name: 'Contraste', icon: '⚡', category: 'basic' },
    { id: 'saturation', name: 'Saturation', icon: '🌈', category: 'basic' },
    { id: 'hue', name: 'Teinte', icon: '🎨', category: 'basic' },
    { id: 'blur', name: 'Flou', icon: '🌫️', category: 'basic' },
    { id: 'sepia', name: 'Sépia', icon: '🟤', category: 'basic' },
    { id: 'grayscale', name: 'Noir & Blanc', icon: '⚫', category: 'basic' },
    
    // Filtres vintage
    { id: 'vintage1', name: 'Vintage 1970', icon: '📸', category: 'vintage' },
    { id: 'vintage2', name: 'Vintage 1980', icon: '📹', category: 'vintage' },
    { id: 'vintage3', name: 'Vintage 1990', icon: '📼', category: 'vintage' },
    { id: 'retro', name: 'Rétro', icon: '🎞️', category: 'vintage' },
    { id: 'film', name: 'Film', icon: '🎬', category: 'vintage' },
    { id: 'polaroid', name: 'Polaroid', icon: '📷', category: 'vintage' },
    
    // Filtres artistiques
    { id: 'dramatic', name: 'Dramatique', icon: '🎭', category: 'artistic' },
    { id: 'moody', name: 'Mélancolique', icon: '😔', category: 'artistic' },
    { id: 'ethereal', name: 'Éthéré', icon: '✨', category: 'artistic' },
    { id: 'mystical', name: 'Mystique', icon: '🔮', category: 'artistic' },
    { id: 'surreal', name: 'Surréaliste', icon: '🌙', category: 'artistic' },
    { id: 'abstract', name: 'Abstrait', icon: '🎨', category: 'artistic' },
    
    // Filtres de couleur
    { id: 'warm', name: 'Chaud', icon: '🌅', category: 'color' },
    { id: 'cool', name: 'Froid', icon: '❄️', category: 'color' },
    { id: 'vibrant', name: 'Vibrant', icon: '🌈', category: 'color' },
    { id: 'fade', name: 'Fade', icon: '🌫️', category: 'color' },
    { id: 'clarendon', name: 'Clarendon', icon: '☀️', category: 'color' },
    { id: 'lark', name: 'Lark', icon: '🐦', category: 'color' },
    { id: 'juno', name: 'Juno', icon: '🌙', category: 'color' },
    { id: 'slumber', name: 'Slumber', icon: '😴', category: 'color' },
    
    // Filtres premium
    { id: 'golden', name: 'Golden Hour', icon: '🌇', category: 'premium' },
    { id: 'blue', name: 'Blue Hour', icon: '🌃', category: 'premium' },
    { id: 'magic', name: 'Magic', icon: '🪄', category: 'premium' },
    { id: 'royal', name: 'Royal', icon: '👑', category: 'premium' },
    { id: 'diamond', name: 'Diamond', icon: '💎', category: 'premium' },
    { id: 'platinum', name: 'Platinum', icon: '🥈', category: 'premium' }
  ]

  // Stickers inspirés de twemoji, react-stickers et emojis
  const ALL_STICKERS = [
    // Émotions (24)
    { id: 'heart', name: 'Cœur', emoji: '❤️', category: 'emotions', number: 1 },
    { id: 'fire', name: 'Feu', emoji: '🔥', category: 'emotions', number: 2 },
    { id: 'star', name: 'Étoile', emoji: '⭐', category: 'emotions', number: 3 },
    { id: 'thumbs', name: 'Pouce', emoji: '👍', category: 'emotions', number: 4 },
    { id: 'clap', name: 'Applaudir', emoji: '👏', category: 'emotions', number: 5 },
    { id: 'party', name: 'Fête', emoji: '🎉', category: 'emotions', number: 6 },
    { id: 'love', name: 'Amour', emoji: '💕', category: 'emotions', number: 7 },
    { id: 'kiss', name: 'Bisou', emoji: '💋', category: 'emotions', number: 8 },
    { id: 'wink', name: 'Clin d\'œil', emoji: '😉', category: 'emotions', number: 9 },
    { id: 'laugh', name: 'Rire', emoji: '😂', category: 'emotions', number: 10 },
    { id: 'cry', name: 'Pleurer', emoji: '😢', category: 'emotions', number: 11 },
    { id: 'angry', name: 'En colère', emoji: '😠', category: 'emotions', number: 12 },
    { id: 'smile', name: 'Sourire', emoji: '😊', category: 'emotions', number: 13 },
    { id: 'laugh2', name: 'Rire aux éclats', emoji: '🤣', category: 'emotions', number: 14 },
    { id: 'love_eyes', name: 'Yeux en cœur', emoji: '🥰', category: 'emotions', number: 15 },
    { id: 'kiss_face', name: 'Visage bisou', emoji: '😘', category: 'emotions', number: 16 },
    { id: 'thinking', name: 'Réfléchir', emoji: '🤔', category: 'emotions', number: 17 },
    { id: 'shy', name: 'Timide', emoji: '😳', category: 'emotions', number: 18 },
    { id: 'cool', name: 'Cool', emoji: '😎', category: 'emotions', number: 19 },
    { id: 'sleepy', name: 'Endormi', emoji: '😴', category: 'emotions', number: 20 },
    { id: 'dizzy', name: 'Étourdi', emoji: '😵', category: 'emotions', number: 21 },
    { id: 'sick', name: 'Malade', emoji: '🤒', category: 'emotions', number: 22 },
    { id: 'nerd', name: 'Intello', emoji: '🤓', category: 'emotions', number: 23 },
    { id: 'sunglasses', name: 'Lunettes de soleil', emoji: '🕶️', category: 'emotions', number: 24 },
    
    // Objets (24)
    { id: 'camera', name: 'Appareil', emoji: '📷', category: 'objects', number: 25 },
    { id: 'phone', name: 'Téléphone', emoji: '📱', category: 'objects', number: 26 },
    { id: 'music', name: 'Musique', emoji: '🎵', category: 'objects', number: 27 },
    { id: 'coffee', name: 'Café', emoji: '☕', category: 'objects', number: 28 },
    { id: 'food', name: 'Nourriture', emoji: '🍕', category: 'objects', number: 29 },
    { id: 'car', name: 'Voiture', emoji: '🚗', category: 'objects', number: 30 },
    { id: 'plane', name: 'Avion', emoji: '✈️', category: 'objects', number: 31 },
    { id: 'house', name: 'Maison', emoji: '🏠', category: 'objects', number: 32 },
    { id: 'gift', name: 'Cadeau', emoji: '🎁', category: 'objects', number: 33 },
    { id: 'book', name: 'Livre', emoji: '📚', category: 'objects', number: 34 },
    { id: 'game', name: 'Jeu', emoji: '🎮', category: 'objects', number: 35 },
    { id: 'ball', name: 'Ballon', emoji: '⚽', category: 'objects', number: 36 },
    { id: 'laptop', name: 'Ordinateur', emoji: '💻', category: 'objects', number: 37 },
    { id: 'watch', name: 'Montre', emoji: '⌚', category: 'objects', number: 38 },
    { id: 'headphones', name: 'Casque', emoji: '🎧', category: 'objects', number: 39 },
    { id: 'camera2', name: 'Caméra vidéo', emoji: '📹', category: 'objects', number: 40 },
    { id: 'tv', name: 'Télévision', emoji: '📺', category: 'objects', number: 41 },
    { id: 'radio', name: 'Radio', emoji: '📻', category: 'objects', number: 42 },
    { id: 'bike', name: 'Vélo', emoji: '🚲', category: 'objects', number: 43 },
    { id: 'bus', name: 'Bus', emoji: '🚌', category: 'objects', number: 44 },
    { id: 'train', name: 'Train', emoji: '🚂', category: 'objects', number: 45 },
    { id: 'ship', name: 'Bateau', emoji: '🚢', category: 'objects', number: 46 },
    { id: 'rocket', name: 'Fusée', emoji: '🚀', category: 'objects', number: 47 },
    { id: 'umbrella', name: 'Parapluie', emoji: '☂️', category: 'objects', number: 48 },
    
    // Symboles (24)
    { id: 'check', name: 'Valider', emoji: '✅', category: 'symbols', number: 49 },
    { id: 'cross', name: 'Annuler', emoji: '❌', category: 'symbols', number: 50 },
    { id: 'warning', name: 'Attention', emoji: '⚠️', category: 'symbols', number: 51 },
    { id: 'info', name: 'Info', emoji: 'ℹ️', category: 'symbols', number: 52 },
    { id: 'question', name: 'Question', emoji: '❓', category: 'symbols', number: 53 },
    { id: 'exclamation', name: 'Exclamation', emoji: '❗', category: 'symbols', number: 54 },
    { id: 'plus', name: 'Plus', emoji: '➕', category: 'symbols', number: 55 },
    { id: 'minus', name: 'Moins', emoji: '➖', category: 'symbols', number: 56 },
    { id: 'arrow', name: 'Flèche', emoji: '➡️', category: 'symbols', number: 57 },
    { id: 'recycle', name: 'Recyclage', emoji: '♻️', category: 'symbols', number: 58 },
    { id: 'peace', name: 'Paix', emoji: '☮️', category: 'symbols', number: 59 },
    { id: 'yin', name: 'Yin Yang', emoji: '☯️', category: 'symbols', number: 60 },
    { id: 'star2', name: 'Étoile brillante', emoji: '✨', category: 'symbols', number: 61 },
    { id: 'sparkles', name: 'Paillettes', emoji: '💫', category: 'symbols', number: 62 },
    { id: 'rainbow', name: 'Arc-en-ciel', emoji: '🌈', category: 'symbols', number: 63 },
    { id: 'sun', name: 'Soleil', emoji: '☀️', category: 'symbols', number: 64 },
    { id: 'moon', name: 'Lune', emoji: '🌙', category: 'symbols', number: 65 },
    { id: 'cloud', name: 'Nuage', emoji: '☁️', category: 'symbols', number: 66 },
    { id: 'snowflake', name: 'Flocon', emoji: '❄️', category: 'symbols', number: 67 },
    { id: 'droplet', name: 'Goutte', emoji: '💧', category: 'symbols', number: 68 },
    { id: 'flower', name: 'Fleur', emoji: '🌸', category: 'symbols', number: 69 },
    { id: 'rose', name: 'Rose', emoji: '🌹', category: 'symbols', number: 70 },
    { id: 'leaf', name: 'Feuille', emoji: '🍃', category: 'symbols', number: 71 },
    { id: 'tree', name: 'Arbre', emoji: '🌳', category: 'symbols', number: 72 },
    
    // Premium (24)
    { id: 'crown', name: 'Couronne', emoji: '👑', category: 'premium', number: 73 },
    { id: 'diamond', name: 'Diamant', emoji: '💎', category: 'premium', number: 74 },
    { id: 'trophy', name: 'Trophée', emoji: '🏆', category: 'premium', number: 75 },
    { id: 'medal', name: 'Médaille', emoji: '🏅', category: 'premium', number: 76 },
    { id: 'gem', name: 'Gemme', emoji: '💠', category: 'premium', number: 77 },
    { id: 'sparkles', name: 'Étincelles', emoji: '✨', category: 'premium', number: 78 },
    { id: 'rainbow', name: 'Arc-en-ciel', emoji: '🌈', category: 'premium', number: 79 },
    { id: 'unicorn', name: 'Licorne', emoji: '🦄', category: 'premium', number: 80 },
    { id: 'rocket', name: 'Fusée', emoji: '🚀', category: 'premium', number: 81 },
    { id: 'star2', name: 'Étoile filante', emoji: '🌠', category: 'premium', number: 82 },
    { id: 'comet', name: 'Comète', emoji: '☄️', category: 'premium', number: 83 },
    { id: 'galaxy', name: 'Galaxie', emoji: '🌌', category: 'premium', number: 84 },
    { id: 'money', name: 'Argent', emoji: '💰', category: 'premium', number: 85 },
    { id: 'bank', name: 'Banque', emoji: '🏦', category: 'premium', number: 86 },
    { id: 'credit', name: 'Carte de crédit', emoji: '💳', category: 'premium', number: 87 },
    { id: 'gold', name: 'Or', emoji: '🥇', category: 'premium', number: 88 },
    { id: 'silver', name: 'Argent', emoji: '🥈', category: 'premium', number: 89 },
    { id: 'bronze', name: 'Bronze', emoji: '🥉', category: 'premium', number: 90 },
    { id: 'ring', name: 'Bague', emoji: '💍', category: 'premium', number: 91 },
    { id: 'crown2', name: 'Couronne dorée', emoji: '👑', category: 'premium', number: 92 },
    { id: 'star3', name: 'Étoile dorée', emoji: '⭐', category: 'premium', number: 93 },
    { id: 'fire2', name: 'Flamme dorée', emoji: '🔥', category: 'premium', number: 94 },
    { id: 'lightning2', name: 'Éclair doré', emoji: '⚡', category: 'premium', number: 95 },
    { id: 'diamond2', name: 'Diamant bleu', emoji: '💎', category: 'premium', number: 96 }
  ]

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    )
  }

  const toggleSticker = (stickerId: string) => {
    setSelectedStickers(prev => 
      prev.includes(stickerId) 
        ? prev.filter(id => id !== stickerId)
        : [...prev, stickerId]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0B] to-[#1a1a1a] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            ←
          </button>
          <h1 className="text-xl font-bold">Sélection Filtres & Stickers (96 stickers)</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('filters')}
          className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
            activeTab === 'filters'
              ? 'border-b-2 border-[#FF6B9D] text-[#FF6B9D]'
              : 'text-white/60 hover:text-white'
          }`}
        >
          🎨 Filtres ({selectedFilters.length})
        </button>
        <button
          onClick={() => setActiveTab('stickers')}
          className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
            activeTab === 'stickers'
              ? 'border-b-2 border-[#FF6B9D] text-[#FF6B9D]'
              : 'text-white/60 hover:text-white'
          }`}
        >
          🎪 Stickers ({selectedStickers.length})
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'filters' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold mb-4">Filtres Visuels (32 au total)</h2>
            
            {/* Grille de filtres */}
            <div className="grid grid-cols-2 gap-3">
              {ALL_FILTERS.map((filter, index) => (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedFilters.includes(filter.id)
                      ? 'border-[#FF6B9D] bg-[#FF6B9D]/10 scale-105'
                      : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{filter.icon}</div>
                    <div className="text-sm font-medium text-white/90">{filter.name}</div>
                    <div className="text-xs text-white/60">#{index + 1}</div>
                    {selectedFilters.includes(filter.id) && (
                      <div className="text-[#FF6B9D] text-sm mt-1">✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stickers' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold mb-4">Stickers (48 au total)</h2>
            
            {/* Grille de stickers */}
            <div className="grid grid-cols-6 gap-2">
              {ALL_STICKERS.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => toggleSticker(sticker.id)}
                  className={`p-3 rounded-lg border-2 transition-all duration-300 relative ${
                    selectedStickers.includes(sticker.id)
                      ? 'border-[#FF6B9D] bg-[#FF6B9D]/10 scale-105'
                      : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{sticker.emoji}</div>
                    <div className="text-xs text-white/60">#{sticker.number}</div>
                    {selectedStickers.includes(sticker.id) && (
                      <div className="absolute top-1 right-1 text-[#FF6B9D] text-xs">✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Résumé des sélections */}
        {(selectedFilters.length > 0 || selectedStickers.length > 0) && (
          <div className="mt-8 bg-white/5 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">Sélections actuelles</h3>
            
            {selectedFilters.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-white/70 mb-2">Filtres sélectionnés ({selectedFilters.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFilters.map(filterId => {
                    const filter = ALL_FILTERS.find(f => f.id === filterId)
                    return (
                      <div key={filterId} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                        <span className="text-lg">{filter?.icon}</span>
                        <span className="text-sm">{filter?.name}</span>
                        <button
                          onClick={() => toggleFilter(filterId)}
                          className="text-white/60 hover:text-white transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {selectedStickers.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white/70 mb-2">Stickers sélectionnés ({selectedStickers.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStickers.map(stickerId => {
                    const sticker = ALL_STICKERS.find(s => s.id === stickerId)
                    return (
                      <div key={stickerId} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                        <span className="text-lg">{sticker?.emoji}</span>
                        <span className="text-sm">#{sticker?.number}</span>
                        <button
                          onClick={() => toggleSticker(stickerId)}
                          className="text-white/60 hover:text-white transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Boutons d'action */}
        <div className="mt-8 flex gap-3">
          <button 
            onClick={() => {
              setSelectedFilters([])
              setSelectedStickers([])
            }}
            className="flex-1 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
          >
            Réinitialiser
          </button>
          <button className="flex-1 py-3 bg-[#FF6B9D] text-white rounded-xl font-medium hover:bg-[#FF6B9D]/80 transition-colors">
            Appliquer ({selectedFilters.length + selectedStickers.length})
          </button>
        </div>
      </div>
    </div>
  )
}