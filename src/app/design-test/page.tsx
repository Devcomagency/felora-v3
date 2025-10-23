'use client'

import { useState } from 'react'
import { Heart, Star, MessageCircle, Share2, MoreHorizontal, Settings, User, Bell, Search, Plus } from 'lucide-react'

export default function DesignTestPage() {
  const [isLiked, setIsLiked] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  return (
    <>
      {/* Import des nouveaux tokens */}
      <style jsx global>{`
        @import '../ui/tokens/premium-design-tokens.css';
        
        body {
          background: var(--felora-void);
          color: var(--felora-text);
          font-family: var(--felora-font-primary);
          margin: 0;
          padding: 0;
        }
        
        * {
          box-sizing: border-box;
        }
      `}</style>

      <div className="min-h-screen" style={{ background: 'var(--felora-void)' }}>
        {/* Header Premium */}
        <header className="sticky top-0 z-50" style={{ 
          background: 'var(--felora-surface)', 
          borderBottom: '1px solid var(--felora-border)',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full" style={{ background: 'var(--felora-grad-primary)' }}></div>
                <h1 className="text-2xl font-bold gradient-text">Felora Premium</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="p-2 rounded-lg hover:bg-felora-panel transition-colors">
                  <Search size={20} />
                </button>
                <button className="p-2 rounded-lg hover:bg-felora-panel transition-colors">
                  <Bell size={20} />
                </button>
                <button className="p-2 rounded-lg hover:bg-felora-panel transition-colors">
                  <Settings size={20} />
                </button>
                <div className="w-8 h-8 rounded-full bg-felora-primary"></div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Hero Section */}
          <section className="mb-12">
            <div className="glass-card-strong p-8 text-center">
              <h2 className="text-4xl font-bold mb-4 gradient-text">
                Nouveau Design Premium
              </h2>
              <p className="text-lg mb-6" style={{ color: 'var(--felora-text-secondary)' }}>
                Découvrez notre nouvelle charte graphique sophistiquée et performante
              </p>
              <div className="flex gap-4 justify-center">
                <button className="btn-primary">
                  Commencer
                </button>
                <button className="btn-secondary">
                  En savoir plus
                </button>
              </div>
            </div>
          </section>

          {/* Cards Grid */}
          <section className="mb-12">
            <h3 className="text-2xl font-semibold mb-6">Composants Premium</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Card 1 - Profil */}
              <div className="glass-card p-6 animate-fade-in-up">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-felora-primary mr-4"></div>
                  <div>
                    <h4 className="font-semibold">Sophie Martin</h4>
                    <p className="text-sm" style={{ color: 'var(--felora-text-tertiary)' }}>Paris, France</p>
                  </div>
                </div>
                <p className="mb-4" style={{ color: 'var(--felora-text-secondary)' }}>
                  Design sophistiqué avec des effets subtils et une excellente lisibilité.
                </p>
                <div className="flex gap-2">
                  <button 
                    className={`btn-${isLiked ? 'primary' : 'glass'}`}
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                    {isLiked ? 'Aimé' : 'Aimer'}
                  </button>
                  <button className="btn-glass">
                    <MessageCircle size={16} />
                    Message
                  </button>
                </div>
              </div>

              {/* Card 2 - Statistiques */}
              <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h4 className="font-semibold mb-4">Statistiques</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--felora-text-secondary)' }}>Vues</span>
                    <span className="font-semibold">12.5K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--felora-text-secondary)' }}>Likes</span>
                    <span className="font-semibold">2.3K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--felora-text-secondary)' }}>Messages</span>
                    <span className="font-semibold">156</span>
                  </div>
                </div>
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--felora-border)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--felora-text-tertiary)' }}>
                      Performance
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className="text-felora-warning fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 - Actions */}
              <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h4 className="font-semibold mb-4">Actions Rapides</h4>
                <div className="space-y-3">
                  <button className="w-full btn-primary flex items-center justify-center">
                    <Plus size={16} className="mr-2" />
                    Nouveau Post
                  </button>
                  <button className="w-full btn-secondary flex items-center justify-center">
                    <Share2 size={16} className="mr-2" />
                    Partager
                  </button>
                  <button className="w-full btn-glass flex items-center justify-center">
                    <MoreHorizontal size={16} className="mr-2" />
                    Plus d'options
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Boutons de Test */}
          <section className="mb-12">
            <h3 className="text-2xl font-semibold mb-6">Boutons Premium</h3>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary">Primary</button>
              <button className="btn-secondary">Secondary</button>
              <button className="btn-glass">Glass</button>
              <button className="btn-primary" disabled>Disabled</button>
            </div>
          </section>

          {/* Typography Test */}
          <section className="mb-12">
            <h3 className="text-2xl font-semibold mb-6">Typographie</h3>
            <div className="glass-card p-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold gradient-text">Heading 1</h1>
                <h2 className="text-3xl font-semibold">Heading 2</h2>
                <h3 className="text-2xl font-medium">Heading 3</h3>
                <h4 className="text-xl font-medium">Heading 4</h4>
                <p className="text-base" style={{ color: 'var(--felora-text-secondary)' }}>
                  Paragraphe normal avec du texte secondaire pour tester la lisibilité.
                </p>
                <p className="text-sm" style={{ color: 'var(--felora-text-tertiary)' }}>
                  Texte petit pour les captions et informations supplémentaires.
                </p>
              </div>
            </div>
          </section>

          {/* Form Test */}
          <section className="mb-12">
            <h3 className="text-2xl font-semibold mb-6">Formulaire</h3>
            <div className="glass-card p-6 max-w-md">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--felora-text-secondary)' }}>
                    Nom d'utilisateur
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border transition-colors focus-ring"
                    style={{ 
                      background: 'var(--felora-surface)', 
                      borderColor: 'var(--felora-border)',
                      color: 'var(--felora-text)'
                    }}
                    placeholder="Entrez votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--felora-text-secondary)' }}>
                    Message
                  </label>
                  <textarea 
                    className="w-full px-4 py-3 rounded-lg border transition-colors focus-ring resize-none"
                    style={{ 
                      background: 'var(--felora-surface)', 
                      borderColor: 'var(--felora-border)',
                      color: 'var(--felora-text)'
                    }}
                    rows={4}
                    placeholder="Votre message..."
                  />
                </div>
                <button className="w-full btn-primary">
                  Envoyer
                </button>
              </div>
            </div>
          </section>

          {/* Performance Indicators */}
          <section className="mb-12">
            <h3 className="text-2xl font-semibold mb-6">Indicateurs de Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-2">95%</div>
                <div className="text-sm" style={{ color: 'var(--felora-text-secondary)' }}>
                  Performance Score
                </div>
              </div>
              <div className="glass-card p-6 text-center">
                <div className="text-3xl font-bold text-felora-success mb-2">2.1s</div>
                <div className="text-sm" style={{ color: 'var(--felora-text-secondary)' }}>
                  Temps de Chargement
                </div>
              </div>
              <div className="glass-card p-6 text-center">
                <div className="text-3xl font-bold text-felora-accent mb-2">A+</div>
                <div className="text-sm" style={{ color: 'var(--felora-text-secondary)' }}>
                  Accessibilité
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-16 py-8" style={{ 
          background: 'var(--felora-surface)', 
          borderTop: '1px solid var(--felora-border)' 
        }}>
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p style={{ color: 'var(--felora-text-tertiary)' }}>
              © 2024 Felora Premium Design System
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
