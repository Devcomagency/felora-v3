'use client'

import { useState } from 'react'
import { X, Send, FileText } from 'lucide-react'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userEmail: string
  onSend: (title: string, message: string, type: string) => Promise<void>
}

const NOTIFICATION_TEMPLATES = [
  {
    id: 'custom',
    name: 'Message personnalisé',
    title: '',
    message: '',
    type: 'INFO'
  },
  {
    id: 'welcome',
    name: 'Bienvenue',
    title: 'Bienvenue sur Felora !',
    message: 'Nous sommes ravis de vous accueillir sur notre plateforme. N\'hésitez pas à compléter votre profil pour maximiser vos opportunités.',
    type: 'INFO'
  },
  {
    id: 'kyc_reminder',
    name: 'Rappel KYC',
    title: 'Vérification de votre compte',
    message: 'Votre compte n\'est pas encore vérifié. Veuillez soumettre vos documents d\'identité pour débloquer toutes les fonctionnalités.',
    type: 'WARNING'
  },
  {
    id: 'subscription_expired',
    name: 'Abonnement expiré',
    title: 'Votre abonnement a expiré',
    message: 'Votre abonnement premium a expiré. Renouvelez-le dès maintenant pour continuer à profiter de tous les avantages.',
    type: 'WARNING'
  },
  {
    id: 'account_warning',
    name: 'Avertissement',
    title: 'Avertissement concernant votre compte',
    message: 'Votre compte a fait l\'objet d\'un signalement. Veuillez respecter nos conditions d\'utilisation pour éviter une suspension.',
    type: 'ERROR'
  },
  {
    id: 'profile_incomplete',
    name: 'Profil incomplet',
    title: 'Complétez votre profil',
    message: 'Votre profil est incomplet. Ajoutez des photos et complétez vos informations pour augmenter votre visibilité.',
    type: 'INFO'
  }
]

export default function NotificationModal({
  isOpen,
  onClose,
  userId,
  userEmail,
  onSend
}: NotificationModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('custom')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'>('INFO')
  const [isSending, setIsSending] = useState(false)

  if (!isOpen) return null

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = NOTIFICATION_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setTitle(template.title)
      setMessage(template.message)
      setType(template.type as any)
    }
  }

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return

    setIsSending(true)
    try {
      await onSend(title, message, type)
      onClose()
      // Reset form
      setSelectedTemplate('custom')
      setTitle('')
      setMessage('')
      setType('INFO')
    } catch (error) {
      console.error('Erreur envoi notification:', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Send size={24} className="text-purple-400" />
              Envoyer une notification
            </h2>
            <p className="text-white/60 text-sm mt-1">À : {userEmail}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

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
                Envoi...
              </>
            ) : (
              <>
                <Send size={16} />
                Envoyer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
