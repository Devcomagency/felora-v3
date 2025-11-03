'use client'

import { useState } from 'react'
import { X, AlertTriangle, Ban, UserX, CheckCircle, XCircle } from 'lucide-react'

interface ModerationActionsModalProps {
  isOpen: boolean
  onClose: () => void
  report: {
    id: string
    reportType: string
    targetType: string
    targetId: string
    targetName?: string
    reporterName?: string
    reason: string
    description?: string
  }
  onActionComplete: () => void
}

type ModerationAction = 'WARNING' | 'SUSPEND_3_DAYS' | 'SUSPEND_7_DAYS' | 'SUSPEND_30_DAYS' | 'BAN' | 'DISMISS'

export default function ModerationActionsModal({ isOpen, onClose, report, onActionComplete }: ModerationActionsModalProps) {
  const [selectedAction, setSelectedAction] = useState<ModerationAction | null>(null)
  const [adminMessage, setAdminMessage] = useState('')
  const [notifyReporter, setNotifyReporter] = useState(true)
  const [notifyReported, setNotifyReported] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const actions = [
    {
      value: 'WARNING' as ModerationAction,
      label: 'Envoyer un avertissement',
      icon: AlertTriangle,
      color: 'yellow',
      description: 'Avertir l\'utilisateur signalé sans sanction'
    },
    {
      value: 'SUSPEND_3_DAYS' as ModerationAction,
      label: 'Suspendre 3 jours',
      icon: UserX,
      color: 'orange',
      description: 'Suspension temporaire de 3 jours'
    },
    {
      value: 'SUSPEND_7_DAYS' as ModerationAction,
      label: 'Suspendre 7 jours',
      icon: UserX,
      color: 'orange',
      description: 'Suspension temporaire de 7 jours'
    },
    {
      value: 'SUSPEND_30_DAYS' as ModerationAction,
      label: 'Suspendre 30 jours',
      icon: UserX,
      color: 'red',
      description: 'Suspension temporaire de 30 jours'
    },
    {
      value: 'BAN' as ModerationAction,
      label: 'Bannir définitivement',
      icon: Ban,
      color: 'red',
      description: 'Bannissement permanent du compte'
    },
    {
      value: 'DISMISS' as ModerationAction,
      label: 'Rejeter le signalement',
      icon: XCircle,
      color: 'gray',
      description: 'Aucune sanction, signalement infondé'
    }
  ]

  async function handleSubmit() {
    if (!selectedAction) {
      alert('Veuillez sélectionner une action')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/reports/${report.id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ Fix Chrome: transmettre les cookies httpOnly
        body: JSON.stringify({
          action: selectedAction,
          adminMessage,
          notifyReporter,
          notifyReported
        })
      })

      const data = await res.json()

      if (data.success) {
        alert('Action de modération effectuée avec succès')
        onActionComplete()
        onClose()
      } else {
        alert(data.error || 'Erreur lors de l\'action')
      }
    } catch (error) {
      console.error('Error moderating:', error)
      alert('Erreur de connexion')
    } finally {
      setSubmitting(false)
    }
  }

  const getActionColor = (color: string) => {
    switch (color) {
      case 'yellow': return 'border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400'
      case 'orange': return 'border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400'
      case 'red': return 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400'
      case 'gray': return 'border-gray-500/30 bg-gray-500/10 hover:bg-gray-500/20 text-gray-400'
      default: return 'border-white/10 bg-white/5 hover:bg-white/10 text-white'
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="text-yellow-400" size={24} />
              Actions de modération
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Signalement : {report.reportType} · {report.targetType}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Détails du signalement */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">Détails du signalement</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Cible :</span>
                <span className="text-white">{report.targetName || report.targetId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Raison :</span>
                <span className="text-white">{report.reason}</span>
              </div>
              {report.description && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <span className="text-gray-400 block mb-1">Description :</span>
                  <p className="text-white">{report.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions disponibles */}
          <div>
            <h3 className="font-semibold text-white mb-3">Choisir une action</h3>
            <div className="grid gap-3">
              {actions.map((action) => {
                const Icon = action.icon
                const isSelected = selectedAction === action.value
                return (
                  <button
                    key={action.value}
                    onClick={() => setSelectedAction(action.value)}
                    className={`
                      p-4 rounded-lg border-2 text-left transition-all
                      ${isSelected
                        ? `${getActionColor(action.color)} border-opacity-100 scale-[1.02]`
                        : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <Icon size={20} className={isSelected ? '' : 'text-gray-400'} />
                      <div className="flex-1">
                        <div className="font-medium">{action.label}</div>
                        <div className={`text-sm mt-1 ${isSelected ? 'opacity-90' : 'text-gray-500'}`}>
                          {action.description}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle size={20} className="flex-shrink-0" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Message admin optionnel */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message personnalisé (optionnel)
            </label>
            <textarea
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              placeholder="Expliquer la raison de cette décision..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
            />
          </div>

          {/* Options de notification */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-white text-sm">Notifications</h3>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyReporter}
                onChange={(e) => setNotifyReporter(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-900"
              />
              <span className="text-sm text-gray-300">
                Notifier le signaleur que son signalement a été traité
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyReported}
                onChange={(e) => setNotifyReported(e.target.checked)}
                disabled={selectedAction === 'DISMISS'}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-900 disabled:opacity-50"
              />
              <span className="text-sm text-gray-300">
                Notifier l'utilisateur signalé de la sanction
                {selectedAction === 'DISMISS' && ' (désactivé pour les rejets)'}
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-3 px-6 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedAction || submitting}
            className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Traitement...' : 'Appliquer l\'action'}
          </button>
        </div>
      </div>
    </div>
  )
}
