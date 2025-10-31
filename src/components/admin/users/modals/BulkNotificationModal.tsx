'use client'

import { useState } from 'react'
import { X, Send, Users, FileText } from 'lucide-react'

interface BulkNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  userCount: number
  userEmails: string[]
  onSend: (title: string, message: string, type: string, link?: string) => Promise<void>
}

const NOTIFICATION_TEMPLATES = [
  {
    id: 'custom',
    name: 'Message personnalisé',
    title: '',
    message: '',
    type: 'INFO',
    link: undefined
  },
  {
    id: 'verification_reminder',
    name: '⚠️ Rappel vérification profil',
    title: '✨ Obtenez votre badge de vérification !',
    message: 'Bonjour,\n\nNous avons remarqué que votre profil n\'est pas encore vérifié. Le badge de vérification vous permet de :\n\n✅ Gagner en crédibilité auprès des clients\n✅ Apparaître en priorité dans les résultats de recherche\n✅ Augmenter votre visibilité jusqu\'à 300%\n✅ Recevoir plus de messages et de demandes\n\nLa vérification ne prend que 5 minutes !\n\n👉 Cliquez sur cette notification pour commencer la vérification maintenant.\n\nL\'équipe Felora 💎',
    type: 'WARNING',
    link: '/profile-test-signup/escort?step=3'
  },
  {
    id: 'maintenance',
    name: 'Maintenance programmée',
    title: 'Maintenance du système',
    message: 'Une maintenance est programmée ce week-end. La plateforme sera indisponible de 2h à 6h du matin.',
    type: 'WARNING',
    link: undefined
  },
  {
    id: 'new_feature',
    name: 'Nouvelle fonctionnalité',
    title: 'Découvrez nos nouvelles fonctionnalités !',
    message: 'Nous avons ajouté de nouvelles fonctionnalités pour améliorer votre expérience. Connectez-vous pour les découvrir !',
    type: 'INFO',
    link: undefined
  },
  {
    id: 'policy_update',
    name: 'Mise à jour des CGU',
    title: 'Mise à jour de nos conditions d\'utilisation',
    message: 'Nos conditions d\'utilisation ont été mises à jour. Veuillez les consulter pour rester informé.',
    type: 'WARNING',
    link: '/legal/terms'
  },
  {
    id: 'security_alert',
    name: 'Alerte sécurité',
    title: 'Important : Sécurisez votre compte',
    message: 'Nous vous recommandons de changer votre mot de passe et d\'activer l\'authentification à deux facteurs.',
    type: 'ERROR',
    link: '/settings'
  }
]

export default function BulkNotificationModal({
  isOpen,
  onClose,
  userCount,
  userEmails,
  onSend
}: BulkNotificationModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('custom')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'>('INFO')
  const [link, setLink] = useState<string | undefined>(undefined)
  const [isSending, setIsSending] = useState(false)
  const [showRecipients, setShowRecipients] = useState(false)

  if (!isOpen) return null

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = NOTIFICATION_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setTitle(template.title)
      setMessage(template.message)
      setType(template.type as any)
      setLink(template.link)
    }
  }

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return

    const confirmed = confirm(
      `Êtes-vous sûr de vouloir envoyer cette notification à ${userCount} utilisateur(s) ?\n\nCette action est irréversible.`
    )
    if (!confirmed) return

    setIsSending(true)
    try {
      await onSend(title, message, type, link)
      onClose()
      // Reset form
      setSelectedTemplate('custom')
      setTitle('')
      setMessage('')
      setType('INFO')
      setLink(undefined)
    } catch (error) {
      console.error('Erreur envoi notifications en masse:', error)
      alert('Erreur lors de l\'envoi des notifications')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Send size={24} className="text-purple-400" />
              Notification en masse
            </h2>
            <p className="text-white/60 text-sm mt-1 flex items-center gap-2">
              <Users size={14} />
              {userCount} destinataire{userCount > 1 ? 's' : ''}
              <button
                onClick={() => setShowRecipients(!showRecipients)}
                className="text-purple-400 hover:text-purple-300 underline ml-2"
              >
                {showRecipients ? 'Masquer' : 'Voir la liste'}
              </button>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Recipients list (collapsible) */}
        {showRecipients && (
          <div className="p-4 bg-white/5 border-b border-white/10 max-h-40 overflow-y-auto">
            <div className="text-xs text-white/60 mb-2">Destinataires :</div>
            <div className="flex flex-wrap gap-2">
              {userEmails.slice(0, 50).map((email, i) => (
                <span key={i} className="px-2 py-1 bg-white/10 rounded text-xs text-white/80">
                  {email}
                </span>
              ))}
              {userEmails.length > 50 && (
                <span className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300">
                  +{userEmails.length - 50} autres
                </span>
              )}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Template selector */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <FileText size={16} className="inline mr-2" />
              Modèle de notification
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {NOTIFICATION_TEMPLATES.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Type de notification
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['INFO', 'SUCCESS', 'WARNING', 'ERROR'].map(t => (
                <button
                  key={t}
                  onClick={() => setType(t as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    type === t
                      ? t === 'INFO' ? 'bg-blue-500 text-white'
                        : t === 'SUCCESS' ? 'bg-green-500 text-white'
                        : t === 'WARNING' ? 'bg-yellow-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la notification"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={100}
            />
            <div className="text-xs text-white/40 mt-1">{title.length}/100 caractères</div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Contenu du message..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[150px] resize-y"
              maxLength={500}
            />
            <div className="text-xs text-white/40 mt-1">{message.length}/500 caractères</div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="text-xs text-white/60 mb-2">Aperçu :</div>
            <div className={`p-3 rounded-lg ${
              type === 'INFO' ? 'bg-blue-500/10 border border-blue-500/20'
                : type === 'SUCCESS' ? 'bg-green-500/10 border border-green-500/20'
                : type === 'WARNING' ? 'bg-yellow-500/10 border border-yellow-500/20'
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <div className="font-semibold text-white mb-1">{title || 'Titre de la notification'}</div>
              <div className="text-sm text-white/80">{message || 'Contenu du message...'}</div>
            </div>
          </div>

          {/* Warning */}
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="text-red-400 text-sm">
              ⚠️ <strong>Attention :</strong> Cette notification sera envoyée à {userCount} utilisateur(s). Cette action est irréversible.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            disabled={isSending}
          >
            Annuler
          </button>
          <button
            onClick={handleSend}
            disabled={!title.trim() || !message.trim() || isSending}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <Send size={16} />
                Envoyer à {userCount} utilisateur{userCount > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
