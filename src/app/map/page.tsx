'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { useTranslations } from 'next-intl'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { MapErrorBoundary } from '@/components/error/MapErrorBoundary'

// Import dynamique pour éviter les erreurs SSR avec MapLibre
const MapTest = dynamic(() => import('@packages/ui/map-test/MapTest'), {
  ssr: false,
  loading: () => <MapSkeleton />
})

// Old map page (V3 original) - Updated with premium design
function OldMapPage() {
  const t = useTranslations('map')

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      {/* Background Effects - same as other pages */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/10 via-black to-black" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-white/60 text-sm md:text-base font-light mb-8">
            {t('inDevelopment')}
          </p>

          {/* Bouton retour - même style que les autres pages */}
          <button
            onClick={() => window.location.href = '/'}
            className="w-full rounded-xl py-3.5 font-bold text-base transition-all bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 hover:border-pink-500/50 text-white shadow-lg hover:shadow-pink-500/20"
          >
            {t('backToHome')}
          </button>
        </div>
      </div>
    </div>
  )
}

// New map page (V2 design)
function NewMapPage() {
  return (
    <MapErrorBoundary>
      <Suspense fallback={<MapSkeleton />}>
        <MapTest />
      </Suspense>
    </MapErrorBoundary>
  )
}

function MapSkeleton() {
  const t = useTranslations('map')

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      {/* Background Effects - same as other pages */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/10 via-black to-black" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />

      {/* Loading Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center">
          {/* Logo Felora animé */}
          <div className="w-24 h-24 mx-auto mb-6 animate-spin">
            <img
              src="/logo-principal.png"
              alt="Felora"
              className="w-full h-full object-contain"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(255, 107, 157, 0.5))',
                animation: 'spin 2s linear infinite'
              }}
            />
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
            {t('loading')}
          </h2>
          <p className="text-white/60 text-sm md:text-base font-light">
            {t('initializingGeoData')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function MapPage() {
  const isNewMapEnabled = useFeatureFlag('NEXT_PUBLIC_FEATURE_UI_MAP')
  
  if (isNewMapEnabled) {
    return <NewMapPage />
  }
  
  return <OldMapPage />
}