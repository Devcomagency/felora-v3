'use client'

import React, { Component, ReactNode } from 'react'
import { RefreshCw, AlertTriangle, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * Error Boundary spécifique pour la page carte
 * Capture les erreurs React et affiche un fallback UI élégant
 */
export class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Met à jour l'état pour que le prochain rendu affiche l'UI de fallback
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log l'erreur pour le monitoring (Sentry, etc.)
    console.error('🚨 [MapErrorBoundary] Erreur capturée:', error, errorInfo)

    this.setState({
      error,
      errorInfo
    })

    // TODO: Envoyer l'erreur à un service de monitoring (Sentry, LogRocket, etc.)
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorInfo })
    // }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Utiliser le fallback personnalisé si fourni
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Sinon, afficher l'UI de fallback par défaut
      return (
        <div className="fixed inset-0 bg-black text-white overflow-hidden">
          {/* Background Effects - cohérent avec le reste de l'app */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black" />
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-700" />

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center px-4">
            <div className="max-w-md w-full">
              {/* Icon d'erreur */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
                  <div className="relative w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                  </div>
                </div>
              </div>

              {/* Titre */}
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-center bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
                Une erreur est survenue
              </h1>

              {/* Description */}
              <p className="text-white/60 text-sm md:text-base font-light mb-8 text-center">
                La carte a rencontré un problème. Nos équipes ont été notifiées et travaillent sur une solution.
              </p>

              {/* Détails de l'erreur (en dev uniquement) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <p className="text-red-400 text-sm font-mono mb-2 break-words">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-white/60 text-xs cursor-pointer hover:text-white/80">
                        Voir la stack trace
                      </summary>
                      <pre className="mt-2 text-white/40 text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                {/* Bouton Réessayer */}
                <button
                  onClick={this.handleReset}
                  className="w-full rounded-xl py-3.5 font-bold text-base transition-all bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 hover:border-pink-500/50 text-white shadow-lg hover:shadow-pink-500/20 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Réessayer
                </button>

                {/* Bouton Retour */}
                <button
                  onClick={this.handleGoHome}
                  className="w-full rounded-xl py-3.5 font-bold text-base transition-all bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 hover:text-white flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Retour à l'accueil
                </button>
              </div>

              {/* Note technique */}
              <p className="text-white/40 text-xs text-center mt-6">
                Code erreur: MAP_BOUNDARY_{Date.now()}
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
