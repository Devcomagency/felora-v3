'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ModernProfileEditor from '@/components/dashboard/ModernProfileEditor'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { CheckCircle, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

// Success message component
function KYCSuccessMessage({ onClose }: { onClose: () => void }) {
  const t = useTranslations('dashboardEscort.profil')

  return (
    <div className="mb-6 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/30 rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="text-green-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-green-400 text-lg font-bold mb-2">{t('kycSuccess.title')}</h3>
            <p className="text-green-300 text-sm mb-3">
              {t('kycSuccess.description')}
            </p>
            <div className="bg-green-500/10 rounded-lg p-3">
              <p className="text-green-200 text-xs font-medium mb-2">{t('kycSuccess.nextStepsTitle')}</p>
              <ul className="space-y-1 text-green-200 text-xs">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  {t('kycSuccess.step1')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  {t('kycSuccess.step2')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  {t('kycSuccess.step3')}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-green-400 hover:text-green-300 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}

// Old profile page (V3 original)
function OldProfilPage({ showKYCSuccess, onCloseSuccess }: { showKYCSuccess: boolean, onCloseSuccess: () => void }) {
  return (
    <div className="space-y-6">
      {showKYCSuccess && <KYCSuccessMessage onClose={onCloseSuccess} />}
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        <ModernProfileEditor />
      </div>
    </div>
  )
}

// New profile page (V2 design)
function NewProfilPage({ showKYCSuccess, onCloseSuccess }: { showKYCSuccess: boolean, onCloseSuccess: () => void }) {
  const t = useTranslations('dashboardEscort.profil')

  return (
    <div className="space-y-6">
      {showKYCSuccess && <KYCSuccessMessage onClose={onCloseSuccess} />}
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
            {t('pageTitle')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--felora-silver-70)' }}>
            {t('pageDescription')}
          </p>
        </div>
        <ModernProfileEditor />
      </div>
    </div>
  )
}

export default function EscortV2ProfilPage() {
  const isNewProfilEnabled = useFeatureFlag('NEXT_PUBLIC_FEATURE_UI_DASHBOARD_ESCORT_PROFIL')
  const searchParams = useSearchParams()
  const [showKYCSuccess, setShowKYCSuccess] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur arrive depuis la soumission KYC
    if (searchParams.get('success') === 'kyc') {
      setShowKYCSuccess(true)
      // Nettoyer l'URL après 5 secondes
      setTimeout(() => {
        window.history.replaceState({}, '', '/dashboard-escort/profil')
      }, 5000)
    }
  }, [searchParams])

  const handleCloseSuccess = () => {
    setShowKYCSuccess(false)
    window.history.replaceState({}, '', '/dashboard-escort/profil')
  }

  if (isNewProfilEnabled) {
    return <NewProfilPage showKYCSuccess={showKYCSuccess} onCloseSuccess={handleCloseSuccess} />
  }

  return <OldProfilPage showKYCSuccess={showKYCSuccess} onCloseSuccess={handleCloseSuccess} />
}