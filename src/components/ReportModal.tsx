'use client'

import { useState } from 'react'
import { X, AlertTriangle, Flag } from 'lucide-react'
import { REPORT_REASONS_BY_TYPE, REPORT_REASON_LABELS, type ReportType, type ReportReason } from '@/types/reports'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  reportType: ReportType
  targetType: string
  targetId: string
  targetName?: string
}

export default function ReportModal({
  isOpen,
  onClose,
  reportType,
  targetType,
  targetId,
  targetName
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | ''>('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const reasons = REPORT_REASONS_BY_TYPE[reportType] || []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!reason) {
      alert('Veuillez sélectionner une raison')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          targetType,
          targetId,
          reason,
          description: description.trim() || undefined,
          reporterEmail: email.trim() || undefined
        })
      })

      const data = await res.json()

      if (data.success) {
        setSubmitted(true)
        setTimeout(() => {
          onClose()
          // Reset
          setReason('')
          setDescription('')
          setEmail('')
          setSubmitted(false)
        }, 2000)
      } else {
        alert(data.error || 'Erreur lors de l\'envoi du signalement')
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Erreur de connexion')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Flag className="text-green-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Signalement envoyé</h3>
          <p className="text-gray-400">
            Merci pour votre signalement. Notre équipe va l'examiner dans les plus brefs délais.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="text-red-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Signaler</h2>
              {targetName && (
                <p className="text-sm text-gray-400">{targetName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="text-gray-400" size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Raison */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Raison du signalement <span className="text-red-400">*</span>
            </label>
            <div className="space-y-2">
              {reasons.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    reason === r
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value as ReportReason)}
                    className="w-4 h-4 text-red-500 focus:ring-red-500"
                  />
                  <span className={`text-sm ${reason === r ? 'text-white font-medium' : 'text-gray-400'}`}>
                    {REPORT_REASON_LABELS[r]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Description (optionnelle) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (optionnelle)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Donnez plus de détails sur le problème..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {description.length}/500 caractères
            </div>
          </div>

          {/* Email (optionnel) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Votre email (optionnel)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              Pour que nous puissions vous contacter si nécessaire
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!reason || submitting}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Envoi...
                </>
              ) : (
                <>
                  <Flag size={18} />
                  Signaler
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
