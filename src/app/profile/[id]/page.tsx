'use client'

import { useFeatureFlag } from '@/hooks/useFeatureFlag'

// Old profile page (V3 original)
function OldProfilePage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Profil (Version Originale)</h1>
        <p className="text-gray-400">Cette page utilise l'ancienne interface V3</p>
      </div>
    </div>
  )
}

// New profile page (V2 design) - Import from test page
function NewProfilePage() {
  // Dynamic import to avoid circular dependencies
  const { default: EscortProfileTestPage } = require('../../profile-test/escort/[id]/new-profile-page')
  return <EscortProfileTestPage />
}

export default function ProfilePage() {
  const isNewProfileEnabled = useFeatureFlag('NEXT_PUBLIC_FEATURE_UI_PROFILE')
  
  if (isNewProfileEnabled) {
    return <NewProfilePage />
  }
  
  return <OldProfilePage />
}