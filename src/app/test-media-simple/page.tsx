'use client'

import EnhancedMediaManager from '@/components/dashboard/EnhancedMediaManager'
import { ArrowLeft, Smartphone, Monitor, Zap, Sparkles } from 'lucide-react'

export default function TestMediaSimplePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header moderne avec navigation */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-purple-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Retour</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Gestionnaire de Médias
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Smartphone className="w-4 h-4 sm:hidden" />
              <Monitor className="w-4 h-4 hidden sm:block" />
              <span className="hidden sm:inline">Version Test</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Section avec features */}
        <div className="mb-8 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                🚀 Gestionnaire de Médias Nouvelle Génération
              </h2>
              <p className="text-gray-300 text-base sm:text-lg mb-6">
                Interface moderne, mobile-first, avec drag & drop et preview instantané
              </p>
              
              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: '📱', title: 'Mobile-First', desc: 'Design responsive optimisé' },
                  { icon: '🎯', title: 'Drag & Drop', desc: 'Upload intuitif par glisser-déposer' },
                  { icon: '👁️', title: 'Preview Instant', desc: 'Aperçu avant publication' },
                  { icon: '💎', title: 'Premium Content', desc: 'Médias payants en diamants' },
                  { icon: '🔍', title: 'Recherche Avancée', desc: 'Filtres et recherche rapide' },
                  { icon: '⚡', title: 'Performance', desc: 'Optimisé pour la vitesse' }
                ].map((feature, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{feature.icon}</span>
                      <h3 className="text-white font-semibold text-sm">{feature.title}</h3>
                    </div>
                    <p className="text-gray-400 text-xs">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gestionnaire de médias */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 sm:p-6">
          <EnhancedMediaManager />
        </div>

        {/* Footer avec infos techniques */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Technical Specs */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-400" />
              Spécifications Techniques
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Formats supportés:</span>
                <span className="text-white font-mono">JPG, PNG, MP4, MOV</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Taille max:</span>
                <span className="text-white font-mono">50 MB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">API:</span>
                <span className="text-white font-mono">/api/media/upload</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Stockage:</span>
                <span className="text-white font-mono">Cloudflare R2</span>
              </div>
            </div>
          </div>

          {/* UX Features */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-400" />
              Expérience Utilisateur
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-gray-300">Interface responsive mobile-first</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-300">Preview instantané des fichiers</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">Gestion mémoire optimisée</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-gray-300">Fallback pour erreurs d'images</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-300 text-sm font-medium">Version Test • API Unifiée</span>
          </div>
        </div>
      </div>
    </div>
  )
}