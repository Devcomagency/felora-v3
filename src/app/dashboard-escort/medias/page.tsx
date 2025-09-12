'use client'

import MediaManager from './MediaManager'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import R2UploadClient from '@/components/upload/R2UploadClient'

// Old medias page (V3 original)
function OldMediasPage() {
  return (
    <div className="space-y-4">
      <MediaManager />
    </div>
  )
}

// New medias page (V2 design)
function NewMediasPage() {
  return (
    <div 
      className="rounded-2xl p-6"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="mb-6">
        <h1 
          className="text-2xl font-bold mb-2"
          style={{
            background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Mes Médias
        </h1>
        <p className="text-sm" style={{ color: 'var(--felora-silver-70)' }}>
          Gérez vos photos et vidéos pour attirer plus de clients
        </p>
      </div>
      
      {/* Upload R2 (Canary) */}
      <div className="mb-6">
        <h3 
          className="text-lg font-semibold mb-3"
          style={{
            background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Upload R2 (Canary)
        </h3>
        <R2UploadClient
          accept="image/*,video/*"
          maxSize={50}
          onUploadComplete={(url) => {
            console.log('Upload R2 réussi:', url)
            // Ici tu peux ajouter l'URL à la liste des médias
          }}
          onUploadError={(error) => {
            console.error('Erreur upload R2:', error)
          }}
        />
      </div>
      
      <MediaManager />
    </div>
  )
}

export default function EscortV2MediasPage() {
  const isNewMediasEnabled = useFeatureFlag('NEXT_PUBLIC_FEATURE_UI_DASHBOARD_ESCORT_MEDIAS')
  
  if (isNewMediasEnabled) {
    return <NewMediasPage />
  }
  
  return <OldMediasPage />
}