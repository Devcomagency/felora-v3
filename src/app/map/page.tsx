'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

// Import dynamique pour éviter les erreurs SSR avec MapLibre
const MapTest = dynamic(() => import('@packages/ui/map-test/MapTest'), {
  ssr: false,
  loading: () => <MapSkeleton />
})

// Old map page (V3 original)
function OldMapPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Map (Version Originale)</h1>
        <p className="text-gray-400">Cette page utilise l'ancienne interface V3</p>
      </div>
    </div>
  )
}

// New map page (V2 design)
function NewMapPage() {
  return (
    <Suspense fallback={<MapSkeleton />}>
      <MapTest />
    </Suspense>
  )
}

function MapSkeleton() {
  return (
    <div 
      className="w-full h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, var(--felora-void) 0%, var(--felora-void-50) 50%, var(--felora-void) 100%)'
      }}
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'linear-gradient(135deg, var(--felora-aurora-10) 0%, var(--felora-plasma-08) 50%, var(--felora-quantum-06) 100%)'
        }}
      />
      
      {/* Loading Content */}
      <div className="relative text-center">
        <div 
          className="w-16 h-16 rounded-full mb-6 mx-auto animate-spin"
          style={{
            background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 50%, var(--felora-quantum) 100%)',
            mask: 'radial-gradient(circle at center, transparent 6px, black 8px)'
          }}
        />
        <h2 
          className="text-2xl font-bold mb-2"
          style={{
            background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 50%, var(--felora-quantum) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
          }}
        >
          Chargement de la carte...
        </h2>
        <p className="text-sm" style={{ color: 'var(--felora-silver-70)' }}>
          Initialisation des données géographiques
        </p>
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