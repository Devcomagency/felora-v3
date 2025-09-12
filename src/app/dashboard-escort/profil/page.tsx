'use client'

import ModernProfileEditor from '@/components/dashboard/ModernProfileEditor'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

// Old profile page (V3 original)
function OldProfilPage() {
  return (
    <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
      <ModernProfileEditor />
    </div>
  )
}

// New profile page (V2 design)
function NewProfilPage() {
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
          Mon Profil
        </h1>
        <p className="text-sm" style={{ color: 'var(--felora-silver-70)' }}>
          Gérez vos informations publiques et votre présentation
        </p>
      </div>
      <ModernProfileEditor />
    </div>
  )
}

export default function EscortV2ProfilPage() {
  const isNewProfilEnabled = useFeatureFlag('NEXT_PUBLIC_FEATURE_UI_DASHBOARD_ESCORT_PROFIL')
  
  if (isNewProfilEnabled) {
    return <NewProfilPage />
  }
  
  return <OldProfilPage />
}