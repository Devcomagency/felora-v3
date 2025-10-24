'use client'

import { useState } from 'react'
import { Heart, Star, MessageCircle, Share2, MoreHorizontal, Plus } from 'lucide-react'

type Theme = 'current' | 'premium' | 'neon' | 'luxury' | 'minimal' | 'sunset' | 'ocean';

const THEMES = {
  premium: {
    name: '💎 Premium Pro',
    vars: {
      '--felora-void': '#0B0B0F',           // Noir avec nuance
      '--felora-surface': 'rgba(255, 255, 255, 0.06)', // Surface VISIBLE (6% au lieu de 3%)
      '--felora-panel': 'rgba(255, 255, 255, 0.10)',   // Panel clairement visible (10%)
      '--felora-elevated': 'rgba(255, 255, 255, 0.14)', // Élevé (pour hover)
      '--felora-text': '#FFFFFF',           // Blanc PUR (contraste max)
      '--felora-text-secondary': '#B4B4B8', // Gris MOYEN (pas trop clair)
      '--felora-text-tertiary': '#6E6E73',  // Gris FONCÉ (hiérarchie claire)
      '--felora-primary': '#FF6B9D',        // Rose Felora
      '--felora-secondary': '#B794F6',      // Violet Felora
      '--felora-accent': '#4FD1C7',         // Turquoise Felora
      '--felora-success': '#34D399',        // Vert moderne
      '--felora-warning': '#FBBF24',        // Jaune moderne
      '--felora-border': 'rgba(255, 255, 255, 0.12)', // Bordure VISIBLE (12% au lieu de 8%)
      '--felora-border-strong': 'rgba(255, 255, 255, 0.18)', // Bordure accentuée
      '--felora-grad-primary': '#FF6B9D',
      '--felora-glow': 'rgba(255, 107, 157, 0.5)',
    }
  },
  current: {
    name: 'Actuel (Felora)',
    vars: {
      '--felora-void': '#000000',
      '--felora-surface': 'rgba(255, 255, 255, 0.05)',
      '--felora-panel': 'rgba(255, 255, 255, 0.08)',
      '--felora-text': '#FFFFFF',
      '--felora-text-secondary': '#E5E5E5',
      '--felora-text-tertiary': '#A0A0A0',
      '--felora-primary': '#FF6B9D',
      '--felora-secondary': '#B794F6',
      '--felora-accent': '#4FD1C7',
      '--felora-success': '#10B981',
      '--felora-warning': '#F59E0B',
      '--felora-border': 'rgba(255, 255, 255, 0.1)',
      '--felora-grad-primary': 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 50%, #4FD1C7 100%)',
    }
  },
  neon: {
    name: 'Neon Cyberpunk',
    vars: {
      '--felora-void': '#0a0e27',
      '--felora-surface': 'rgba(255, 0, 255, 0.1)',
      '--felora-panel': 'rgba(0, 255, 255, 0.15)',
      '--felora-text': '#00ffff',
      '--felora-text-secondary': '#ff00ff',
      '--felora-text-tertiary': '#8b5cf6',
      '--felora-primary': '#00ffff',
      '--felora-secondary': '#ff00ff',
      '--felora-accent': '#ffff00',
      '--felora-success': '#00ff00',
      '--felora-warning': '#ff6600',
      '--felora-border': 'rgba(0, 255, 255, 0.3)',
      '--felora-grad-primary': 'linear-gradient(135deg, #00ffff 0%, #ff00ff 50%, #ffff00 100%)',
    }
  },
  luxury: {
    name: 'Luxury Gold',
    vars: {
      '--felora-void': '#1a1410',
      '--felora-surface': 'rgba(212, 175, 55, 0.08)',
      '--felora-panel': 'rgba(212, 175, 55, 0.12)',
      '--felora-text': '#faf9f6',
      '--felora-text-secondary': '#e8dcc4',
      '--felora-text-tertiary': '#b8a888',
      '--felora-primary': '#d4af37',
      '--felora-secondary': '#b8860b',
      '--felora-accent': '#ffd700',
      '--felora-success': '#00a86b',
      '--felora-warning': '#ff8c00',
      '--felora-border': 'rgba(212, 175, 55, 0.2)',
      '--felora-grad-primary': 'linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #b8860b 100%)',
    }
  },
  minimal: {
    name: 'Minimal Monochrome',
    vars: {
      '--felora-void': '#ffffff',
      '--felora-surface': '#f5f5f5',
      '--felora-panel': '#eeeeee',
      '--felora-text': '#000000',
      '--felora-text-secondary': '#4a4a4a',
      '--felora-text-tertiary': '#888888',
      '--felora-primary': '#000000',
      '--felora-secondary': '#333333',
      '--felora-accent': '#666666',
      '--felora-success': '#2d7a4d',
      '--felora-warning': '#d97706',
      '--felora-border': '#dddddd',
      '--felora-grad-primary': 'linear-gradient(135deg, #000000 0%, #333333 50%, #666666 100%)',
    }
  },
  sunset: {
    name: 'Sunset Vibes',
    vars: {
      '--felora-void': '#1a0f2e',
      '--felora-surface': 'rgba(255, 107, 107, 0.08)',
      '--felora-panel': 'rgba(255, 142, 60, 0.12)',
      '--felora-text': '#fff5e6',
      '--felora-text-secondary': '#ffd4a3',
      '--felora-text-tertiary': '#d4a574',
      '--felora-primary': '#ff6b6b',
      '--felora-secondary': '#ff8e3c',
      '--felora-accent': '#ffd93d',
      '--felora-success': '#6bcf7f',
      '--felora-warning': '#f59e42',
      '--felora-border': 'rgba(255, 107, 107, 0.2)',
      '--felora-grad-primary': 'linear-gradient(135deg, #ff6b6b 0%, #ff8e3c 50%, #ffd93d 100%)',
    }
  },
  ocean: {
    name: 'Ocean Deep',
    vars: {
      '--felora-void': '#0a1628',
      '--felora-surface': 'rgba(59, 130, 246, 0.08)',
      '--felora-panel': 'rgba(14, 165, 233, 0.12)',
      '--felora-text': '#e0f2fe',
      '--felora-text-secondary': '#bae6fd',
      '--felora-text-tertiary': '#7dd3fc',
      '--felora-primary': '#3b82f6',
      '--felora-secondary': '#0ea5e9',
      '--felora-accent': '#06b6d4',
      '--felora-success': '#14b8a6',
      '--felora-warning': '#f59e0b',
      '--felora-border': 'rgba(59, 130, 246, 0.2)',
      '--felora-grad-primary': 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 50%, #06b6d4 100%)',
    }
  }
};

export default function DesignTestPage() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>('premium')
  const [isLiked, setIsLiked] = useState(false)

  const theme = THEMES[selectedTheme];

  return (
    <>
      {/* Style dynamique basé sur le thème sélectionné */}
      <style jsx global>{`
        :root {
          ${Object.entries(theme.vars).map(([key, value]) => `${key}: ${value};`).join('\n          ')}
        }

        body {
          background: var(--felora-void);
          color: var(--felora-text);
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
          margin: 0;
          padding: 0;
          transition: background-color 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        * {
          box-sizing: border-box;
        }

        /* Texture de grain subtile pour effet premium */
        body::after {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.015;
          pointer-events: none;
          z-index: 1;
        }

        /* Glass Card - VRAIMENT Premium avec lumière */
        .glass-card {
          position: relative;
          background: var(--felora-surface);
          backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid var(--felora-border);
          border-radius: 20px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.06),
            0 4px 12px rgba(0, 0, 0, 0.1),
            0 12px 24px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        /* Lumière du haut VISIBLE */
        .glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.4) 50%,
            transparent
          );
        }

        /* Glow au hover */
        .glass-card::after {
          content: '';
          position: absolute;
          inset: -2px;
          background: var(--felora-primary);
          opacity: 0;
          border-radius: 20px;
          filter: blur(20px);
          z-index: -1;
          transition: opacity 0.3s ease;
        }

        .glass-card:hover {
          background: var(--felora-elevated);
          border-color: rgba(255, 107, 157, 0.4);
          transform: translateY(-2px);
          box-shadow:
            0 2px 4px rgba(0, 0, 0, 0.06),
            0 8px 20px rgba(0, 0, 0, 0.12),
            0 20px 40px rgba(255, 107, 157, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .glass-card:hover::after {
          opacity: 0.12;
        }

        .glass-card-strong {
          position: relative;
          background: var(--felora-panel);
          backdrop-filter: blur(40px) saturate(200%);
          border: 1.5px solid var(--felora-border-strong);
          border-radius: 32px;
          box-shadow:
            0 2px 4px rgba(0, 0, 0, 0.06),
            0 8px 20px rgba(0, 0, 0, 0.1),
            0 20px 48px rgba(0, 0, 0, 0.12),
            0 0 60px rgba(255, 107, 157, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
          overflow: hidden;
        }

        /* Ligne top colorée VISIBLE */
        .glass-card-strong::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            rgba(255, 107, 157, 0.3),
            rgba(255, 107, 157, 0.6) 50%,
            rgba(255, 107, 157, 0.3)
          );
        }

        /* Effet de brillance subtile */
        .glass-card-strong::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.04),
            transparent
          );
          animation: shimmer 8s infinite;
          pointer-events: none;
        }

        @keyframes shimmer {
          0%, 100% { left: -100%; }
          50% { left: 200%; }
        }

        .gradient-text {
          color: var(--felora-primary);
          font-weight: 700;
          letter-spacing: -0.03em;
          position: relative;
          text-shadow: 0 0 40px rgba(255, 107, 157, 0.5);
        }

        /* Boutons Premium - Pro Quality */
        .btn-primary {
          position: relative;
          background: var(--felora-primary);
          color: white;
          padding: 16px 40px;
          border-radius: 16px;
          font-weight: 600;
          font-size: 15px;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: -0.01em;
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.08),
            0 4px 12px rgba(255, 107, 157, 0.4),
            0 12px 32px rgba(255, 107, 157, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
          overflow: hidden;
        }

        /* Effet de brillance animé */
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        /* Glow sur hover */
        .btn-primary::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0%;
          height: 0%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent 70%);
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: all 0.5s ease;
        }

        .btn-primary:hover::after {
          width: 150%;
          height: 150%;
          opacity: 1;
        }

        .btn-primary:hover {
          background: #FF5A8F;
          transform: translateY(-2px);
          box-shadow:
            0 2px 4px rgba(0, 0, 0, 0.08),
            0 8px 20px rgba(255, 107, 157, 0.5),
            0 20px 48px rgba(255, 107, 157, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .btn-primary:active {
          transform: translateY(0px);
        }

        .btn-secondary {
          position: relative;
          background: var(--felora-surface);
          color: var(--felora-text);
          padding: 16px 40px;
          border-radius: 16px;
          font-weight: 600;
          font-size: 15px;
          border: 1.5px solid var(--felora-border);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: -0.01em;
          backdrop-filter: blur(20px);
          overflow: hidden;
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.06),
            0 2px 8px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }

        .btn-secondary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--felora-panel);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .btn-secondary:hover::before {
          opacity: 1;
        }

        .btn-secondary:hover {
          border-color: var(--felora-primary);
          transform: translateY(-2px);
          box-shadow:
            0 2px 4px rgba(0, 0, 0, 0.06),
            0 4px 16px rgba(255, 107, 157, 0.15),
            0 12px 32px rgba(255, 107, 157, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .btn-secondary:active {
          transform: translateY(0px);
        }

        .btn-glass {
          position: relative;
          background: rgba(124, 58, 237, 0.04);
          backdrop-filter: blur(20px);
          color: var(--felora-text-secondary);
          padding: 12px 24px;
          border-radius: 16px;
          font-weight: 500;
          font-size: 14px;
          border: 1px solid var(--felora-border);
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-glass:hover {
          background: rgba(124, 58, 237, 0.08);
          border-color: var(--felora-primary);
          color: var(--felora-text);
          transform: translateY(-2px);
        }

        .focus-ring:focus {
          outline: none;
          border-color: var(--felora-primary);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Amélioration de la typographie premium */
        h1, h2, h3, h4, h5, h6 {
          letter-spacing: -0.02em;
          font-weight: 700;
          line-height: 1.15;
        }

        p {
          letter-spacing: -0.005em;
          line-height: 1.6;
          font-weight: 400;
        }

        /* Augmenter le contraste du texte */
        h1, h2 {
          color: var(--felora-text);
        }

        h3, h4, h5, h6 {
          color: var(--felora-text-secondary);
        }

        /* Animation d'apparition avec glow */
        @keyframes fadeInUpGlow {
          from {
            opacity: 0;
            transform: translateY(40px);
            filter: blur(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        /* Effet de particules lumineuses en fond - Couleurs Felora */
        body::before {
          content: '';
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 20% 50%, rgba(255, 107, 157, 0.06) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(183, 148, 246, 0.05) 0%, transparent 50%),
                      radial-gradient(circle at 40% 20%, rgba(79, 209, 199, 0.04) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
          animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(30px, -30px); }
          66% { transform: translate(-20px, 20px); }
        }

        /* Assurer que le contenu est au-dessus du fond */
        body > div {
          position: relative;
          z-index: 1;
        }
      `}</style>

      <div className="min-h-screen" style={{ background: 'var(--felora-void)' }}>
        {/* Header Premium avec Sélecteur de Thème */}
        <header className="sticky top-0 z-50" style={{
          background: 'rgba(10, 6, 20, 0.7)',
          borderBottom: '1px solid var(--felora-border)',
          backdropFilter: 'blur(60px) saturate(180%)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1), inset 0 -1px 0 rgba(124, 58, 237, 0.1)'
        }}>
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center space-x-5">
                <div
                  className="w-14 h-14 rounded-3xl flex items-center justify-center relative"
                  style={{
                    background: 'var(--felora-primary)',
                    boxShadow: '0 8px 24px rgba(255, 107, 157, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <span className="text-3xl">💎</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text mb-1">Felora Design Lab</h1>
                  <p className="text-sm font-medium" style={{ color: 'var(--felora-text-tertiary)' }}>
                    Premium Flat Edition
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {(Object.keys(THEMES) as Theme[]).map((themeKey) => (
                  <button
                    key={themeKey}
                    onClick={() => setSelectedTheme(themeKey)}
                    className={`px-5 py-3 rounded-2xl font-semibold text-sm transition-all ${
                      selectedTheme === themeKey ? 'scale-105' : 'hover:scale-102'
                    }`}
                    style={{
                      background: selectedTheme === themeKey
                        ? 'var(--felora-primary)'
                        : 'var(--felora-surface)',
                      color: selectedTheme === themeKey ? 'white' : 'var(--felora-text-secondary)',
                      border: `1px solid ${selectedTheme === themeKey ? 'transparent' : 'var(--felora-border)'}`,
                      boxShadow: selectedTheme === themeKey
                        ? '0 4px 16px rgba(255, 107, 157, 0.4)'
                        : 'none',
                    }}
                  >
                    {THEMES[themeKey].name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-8 py-16">
          {/* Palette de couleurs */}
          <section className="mb-20">
            <h3 className="text-xl font-semibold mb-8" style={{ color: 'var(--felora-text-secondary)' }}>
              Palette • {THEMES[selectedTheme].name}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {Object.entries(theme.vars).map(([varName, value]) => {
                const colorName = varName.replace('--felora-', '').replace(/-/g, ' ');
                return (
                  <div key={varName} className="glass-card p-5">
                    <div
                      className="w-full h-28 rounded-2xl mb-4"
                      style={{
                        background: value,
                        border: '1px solid var(--felora-border)'
                      }}
                    />
                    <p className="text-sm font-medium mb-2 capitalize" style={{ color: 'var(--felora-text)' }}>{colorName}</p>
                    <p className="text-xs font-mono" style={{ color: 'var(--felora-text-tertiary)' }}>
                      {value.length > 30 ? value.substring(0, 30) + '...' : value}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Hero Section */}
          <section className="mb-20">
            <h3 className="text-xl font-semibold mb-8" style={{ color: 'var(--felora-text-secondary)' }}>
              Hero Section
            </h3>
            <div className="glass-card-strong p-16 text-center">
              <h2 className="text-6xl font-bold mb-6 gradient-text">
                Bienvenue sur Felora
              </h2>
              <p className="text-xl mb-12 max-w-2xl mx-auto" style={{ color: 'var(--felora-text-secondary)' }}>
                La plateforme premium suisse de rencontres d'élite
              </p>
              <div className="flex gap-5 justify-center flex-wrap">
                <button className="btn-primary">
                  Commencer maintenant
                </button>
                <button className="btn-secondary">
                  En savoir plus
                </button>
              </div>
            </div>
          </section>

          {/* Cards Grid */}
          <section className="mb-20">
            <h3 className="text-xl font-semibold mb-8" style={{ color: 'var(--felora-text-secondary)' }}>
              Composants Premium
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
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
