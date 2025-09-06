'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Import dynamique pour éviter les erreurs SSR avec MapLibre
const MapTest = dynamic(() => import('@packages/ui/map-test/MapTest'), {
  ssr: false,
  loading: () => <MapSkeleton />
})

function MapSkeleton() {
  return (
    <div 
      className="w-full h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 50%, #0D0D0D 100%)'
      }}
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.1) 0%, rgba(183, 148, 246, 0.08) 50%, rgba(79, 209, 199, 0.06) 100%)'
        }}
      />
      
      {/* Loading Content */}
      <div className="relative text-center">
        <div 
          className="w-16 h-16 rounded-full mb-6 mx-auto animate-spin"
          style={{
            background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 50%, #4FD1C7 100%)',
            mask: 'radial-gradient(circle at center, transparent 6px, black 8px)'
          }}
        />
        <h2 
          className="text-2xl font-bold mb-2"
          style={{
            background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 50%, #4FD1C7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
          }}
        >
          Chargement de la carte...
        </h2>
        <p className="text-white/70">
          Initialisation des données géographiques
        </p>
      </div>
    </div>
  )
}

export default function MapPage() {
  const hasToken = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN || !!process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY
  if (!hasToken) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="max-w-md text-center text-white/80 p-6 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-xl font-semibold mb-2">Configuration requise</h2>
          <p className="text-sm mb-3">La carte nécessite un token Mapbox ou une clé Google Places.</p>
          <pre className="text-xs bg-black/50 rounded p-3 text-left whitespace-pre-wrap">
NEXT_PUBLIC_MAPBOX_TOKEN=…
ou
NEXT_PUBLIC_GOOGLE_PLACES_KEY=…
          </pre>
          <p className="text-xs mt-3">Ajoutez les variables dans <code>.env.local</code>, puis redémarrez le serveur.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="w-full h-screen">
      <Suspense fallback={<MapSkeleton />}>
        <MapTest />
      </Suspense>
    </div>
  )
}
