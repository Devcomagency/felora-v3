'use client'

import { useState } from 'react'
import { Heart, Star, MessageCircle, Share2, MoreHorizontal, Plus, Sparkles } from 'lucide-react'
import Image from 'next/image'

type Theme = 'current' | 'premium' | 'neon' | 'luxury' | 'minimal' | 'sunset' | 'ocean';

const THEMES = {
  premium: {
    name: 'Premium Pro',
    vars: {
      // === COULEURS DE BASE ===
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
      
      // === TOKENS DE DESIGN ===
      // Espacement
      '--space-1': '0.25rem',    // 4px
      '--space-2': '0.5rem',     // 8px
      '--space-3': '0.75rem',    // 12px
      '--space-4': '1rem',       // 16px
      '--space-5': '1.25rem',    // 20px
      '--space-6': '1.5rem',     // 24px
      '--space-8': '2rem',       // 32px
      '--space-10': '2.5rem',    // 40px
      '--space-12': '3rem',      // 48px
      '--space-16': '4rem',      // 64px
      '--space-20': '5rem',      // 80px
      '--space-24': '6rem',      // 96px
      
      // Typographie
      '--text-xs': '0.75rem',    // 12px
      '--text-sm': '0.875rem',   // 14px
      '--text-base': '1rem',     // 16px
      '--text-lg': '1.125rem',   // 18px
      '--text-xl': '1.25rem',    // 20px
      '--text-2xl': '1.5rem',    // 24px
      '--text-3xl': '1.875rem',  // 30px
      '--text-4xl': '2.25rem',   // 36px
      '--text-5xl': '3rem',      // 48px
      '--text-6xl': '3.75rem',   // 60px
      
      // Rayons de bordure
      '--radius-sm': '0.375rem',  // 6px
      '--radius-md': '0.5rem',    // 8px
      '--radius-lg': '0.75rem',   // 12px
      '--radius-xl': '1rem',      // 16px
      '--radius-2xl': '1.5rem',   // 24px
      '--radius-3xl': '2rem',     // 32px
      '--radius-full': '9999px',  // Rond complet
      
      // Ombres optimisées
      '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
      '--shadow-md': '0 4px 6px rgba(0, 0, 0, 0.07)',
      '--shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
      '--shadow-xl': '0 20px 25px rgba(0, 0, 0, 0.1)',
      '--shadow-glow': '0 0 20px rgba(255, 107, 157, 0.3)',
      
      // Transitions
      '--transition-fast': '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      '--transition-normal': '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '--transition-slow': '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      
      // Z-index
      '--z-dropdown': '1000',
      '--z-sticky': '1020',
      '--z-fixed': '1030',
      '--z-modal': '1040',
      '--z-popover': '1050',
      '--z-tooltip': '1060',
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

        /* Glass Card - OPTIMISÉ pour la performance */
        .glass-card {
          position: relative;
          background: var(--felora-surface);
          backdrop-filter: blur(20px) saturate(150%);
          border: 1px solid var(--felora-border);
          border-radius: var(--radius-2xl);
          transition: var(--transition-normal);
          overflow: hidden;
          box-shadow: var(--shadow-md);
          will-change: transform;
          transform: translateZ(0);
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
          box-shadow: var(--shadow-lg), var(--shadow-glow);
        }

        .glass-card:hover::after {
          opacity: 0.12;
        }

        .glass-card-strong {
          position: relative;
          background: var(--felora-panel);
          backdrop-filter: blur(24px) saturate(180%);
          border: 1.5px solid var(--felora-border-strong);
          border-radius: var(--radius-3xl);
          box-shadow: var(--shadow-xl), var(--shadow-glow);
          overflow: hidden;
          will-change: transform;
          transform: translateZ(0);
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

        /* Boutons Premium - OPTIMISÉS */
        .btn-primary {
          position: relative;
          background: var(--felora-primary);
          color: white;
          padding: var(--space-4) var(--space-10);
          border-radius: var(--radius-xl);
          font-weight: 600;
          font-size: var(--text-sm);
          border: none;
          cursor: pointer;
          transition: var(--transition-normal);
          letter-spacing: -0.01em;
          box-shadow: var(--shadow-md), var(--shadow-glow);
          overflow: hidden;
          will-change: transform;
          transform: translateZ(0);
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
          box-shadow: var(--shadow-lg), var(--shadow-glow);
        }

        .btn-primary:active {
          transform: translateY(0px);
        }

        .btn-secondary {
          position: relative;
          background: var(--felora-surface);
          color: var(--felora-text);
          padding: var(--space-4) var(--space-10);
          border-radius: var(--radius-xl);
          font-weight: 600;
          font-size: var(--text-sm);
          border: 1.5px solid var(--felora-border);
          cursor: pointer;
          transition: var(--transition-normal);
          letter-spacing: -0.01em;
          backdrop-filter: blur(20px);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          will-change: transform;
          transform: translateZ(0);
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
          box-shadow: var(--shadow-md), var(--shadow-glow);
        }

        .btn-secondary:active {
          transform: translateY(0px);
        }

        .btn-glass {
          position: relative;
          background: rgba(124, 58, 237, 0.04);
          backdrop-filter: blur(20px);
          color: var(--felora-text-secondary);
          padding: var(--space-3) var(--space-6);
          border-radius: var(--radius-xl);
          font-weight: 500;
          font-size: var(--text-sm);
          border: 1px solid var(--felora-border);
          cursor: pointer;
          transition: var(--transition-normal);
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          will-change: transform;
          transform: translateZ(0);
        }

        .btn-glass:hover {
          background: rgba(124, 58, 237, 0.08);
          border-color: var(--felora-primary);
          color: var(--felora-text);
          transform: translateY(-2px);
        }

        /* === ACCESSIBILITÉ COMPLÈTE === */
        .focus-ring:focus {
          outline: none;
          border-color: var(--felora-primary);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
        }

        .focus-ring:focus-visible {
          outline: 2px solid var(--felora-primary);
          outline-offset: 2px;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          
          .glass-card:hover {
            transform: none;
          }
          
          .btn-primary:hover,
          .btn-secondary:hover,
          .btn-glass:hover {
            transform: none;
          }
        }

        /* High contrast support */
        @media (prefers-contrast: high) {
          .glass-card {
            border-width: 2px;
            background: rgba(255, 255, 255, 0.1);
          }
          
          .btn-primary {
            border: 2px solid var(--felora-primary);
          }
        }

        /* Container system responsive */
        .container {
          width: 100%;
          margin: 0 auto;
          padding: 0 var(--space-4);
        }

        @media (min-width: 640px) { .container { max-width: 640px; } }
        @media (min-width: 768px) { .container { max-width: 768px; } }
        @media (min-width: 1024px) { .container { max-width: 1024px; } }
        @media (min-width: 1280px) { .container { max-width: 1280px; } }
        @media (min-width: 1536px) { .container { max-width: 1536px; } }

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

        /* === MICRO-INTERACTIONS PREMIUM === */
        
        /* Loading states */
        .loading {
          position: relative;
          overflow: hidden;
        }

        .loading::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        /* Skeleton loading */
        .skeleton {
          background: linear-gradient(90deg, var(--felora-surface) 25%, var(--felora-panel) 50%, var(--felora-surface) 75%);
          background-size: 200% 100%;
          animation: skeleton 1.5s infinite;
        }

        @keyframes skeleton {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Hover micro-interactions */
        .glass-card {
          cursor: pointer;
        }

        .glass-card:active {
          transform: scale(0.98);
          transition: var(--transition-fast);
        }

        /* Button press feedback */
        .btn-primary:active,
        .btn-secondary:active,
        .btn-glass:active {
          transform: scale(0.95);
          transition: var(--transition-fast);
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Focus trap for accessibility */
        .focus-trap:focus-within {
          outline: 2px solid var(--felora-primary);
          outline-offset: 2px;
        }

        /* Improved text selection */
        ::selection {
          background: var(--felora-primary);
          color: white;
        }

        ::-moz-selection {
          background: var(--felora-primary);
          color: white;
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
          <div className="container py-6">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center space-x-5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: 'var(--felora-primary)',
                    boxShadow: '0 8px 24px rgba(255, 107, 157, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <Image
                    src="/logo-principal.png"
                    alt="Felora"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text mb-1">Felora Design Lab</h1>
                  <p className="text-sm font-medium" style={{ color: 'var(--felora-text-tertiary)' }}>
                    Premium Pro Edition
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {(Object.keys(THEMES) as Theme[]).map((themeKey) => (
                  <button
                    key={themeKey}
                    onClick={() => setSelectedTheme(themeKey)}
                    className={`px-5 py-3 rounded-2xl font-semibold text-sm transition-all flex items-center gap-2 ${
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
                    {themeKey === 'premium' && <Sparkles size={16} />}
                    {THEMES[themeKey].name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main className="container py-16">
          {/* Palette de couleurs */}
          <section className="mb-20">
            <h3 className="text-xl font-semibold mb-8" style={{ color: 'var(--felora-text-secondary)' }}>
              Palette • {THEMES[selectedTheme].name}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

          {/* Micro-interactions Demo */}
          <section className="mb-12">
            <h3 className="text-2xl font-semibold mb-6">Micro-interactions Premium</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Loading States */}
              <div className="glass-card p-6">
                <h4 className="font-semibold mb-4">Loading States</h4>
                <div className="space-y-4">
                  <div className="skeleton h-4 rounded w-3/4"></div>
                  <div className="skeleton h-4 rounded w-1/2"></div>
                  <div className="skeleton h-4 rounded w-5/6"></div>
                </div>
                <div className="mt-4">
                  <button className="btn-primary loading w-full">
                    Chargement...
                  </button>
                </div>
              </div>

              {/* Interactive Elements */}
              <div className="glass-card p-6">
                <h4 className="font-semibold mb-4">Éléments Interactifs</h4>
                <div className="space-y-3">
                  <button className="btn-glass w-full text-left">
                    <Heart size={16} className="mr-2" />
                    Interaction 1
                  </button>
                  <button className="btn-glass w-full text-left">
                    <Star size={16} className="mr-2" />
                    Interaction 2
                  </button>
                  <button className="btn-glass w-full text-left">
                    <MessageCircle size={16} className="mr-2" />
                    Interaction 3
                  </button>
                </div>
              </div>

              {/* Accessibility Demo */}
              <div className="glass-card p-6 focus-trap">
                <h4 className="font-semibold mb-4">Accessibilité</h4>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 rounded-lg border focus-ring"
                    style={{ 
                      background: 'var(--felora-surface)', 
                      borderColor: 'var(--felora-border)',
                      color: 'var(--felora-text)'
                    }}
                    placeholder="Focus avec Tab"
                  />
                  <button className="btn-secondary w-full focus-ring">
                    Bouton accessible
                  </button>
                  <div className="text-xs" style={{ color: 'var(--felora-text-tertiary)' }}>
                    Utilisez Tab pour naviguer
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Responsive Grid Demo */}
          <section className="mb-12">
            <h3 className="text-2xl font-semibold mb-6">Grille Responsive</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="glass-card p-4 text-center">
                  <div className="text-sm font-medium">Item {i + 1}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--felora-text-tertiary)' }}>
                    Responsive
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-16 py-8" style={{ 
          background: 'var(--felora-surface)', 
          borderTop: '1px solid var(--felora-border)' 
        }}>
          <div className="container text-center">
            <p style={{ color: 'var(--felora-text-tertiary)' }}>
              © 2024 Felora Premium Design System
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
