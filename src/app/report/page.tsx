'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'
import { AlertTriangle, ChevronLeft } from 'lucide-react'

function ReportForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = searchParams.get('type') // 'media', 'profile', 'message'
  const id = searchParams.get('id')

  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const reportReasons = {
    media: [
      'Contenu inapproprié',
      'Nudité non autorisée',
      'Violence ou harcèlement',
      'Contenu illégal',
      'Spam ou publicité',
      'Droits d\'auteur',
      'Faux profil',
      'Autre'
    ],
    profile: [
      'Faux profil',
      'Contenu inapproprié',
      'Harcèlement',
      'Usurpation d\'identité',
      'Spam',
      'Autre'
    ],
    message: [
      'Harcèlement',
      'Contenu inapproprié',
      'Spam',
      'Menaces',
      'Autre'
    ]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason) {
      alert('Veuillez sélectionner une raison')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          targetId: id,
          reason,
          details
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.back()
        }, 2000)
      } else {
        alert('Erreur lors du signalement')
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Erreur de connexion')
    } finally {
      setSubmitting(false)
    }
  }

  if (!type || !id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
          <h1 className="text-xl font-bold text-white mb-2">Paramètres manquants</h1>
          <p className="text-gray-400 mb-4">Impossible de traiter le signalement</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Signalement envoyé</h1>
          <p className="text-gray-400">Merci, notre équipe va examiner votre signalement.</p>
        </div>
      </div>
    )
  }

  const currentReasons = reportReasons[type as keyof typeof reportReasons] || reportReasons.media

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-2xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft size={20} />
            Retour
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Signaler un {type === 'media' ? 'média' : type === 'profile' ? 'profil' : 'message'}</h1>
              <p className="text-gray-400 text-sm">Aidez-nous à maintenir une communauté sûre</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Raison du signalement *
                </label>
                <div className="space-y-2">
                  {currentReasons.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        reason === r
                          ? 'bg-red-500/20 border-red-500/50'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={reason === r}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-white">{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Détails supplémentaires (optionnel)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white resize-none focus:outline-none focus:border-red-500"
                  rows={4}
                  placeholder="Ajoutez des informations supplémentaires pour nous aider à comprendre le problème..."
                />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-200">
                <p className="font-medium mb-1">Note importante</p>
                <p className="text-yellow-200/80">
                  Les signalements abusifs ou répétés peuvent entraîner la suspension de votre compte.
                  Veuillez signaler uniquement du contenu qui viole réellement nos conditions d'utilisation.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-colors"
              disabled={submitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!reason || submitting}
              className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Envoi...' : 'Envoyer le signalement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    }>
      <ReportForm />
    </Suspense>
  )
}
