'use client'

import { useState } from 'react'
import { X, Trash2, AlertTriangle } from 'lucide-react'

interface DeleteUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id: string
    email: string
    name: string | null
    role: string
  }
  onDelete: (userId: string) => Promise<void>
}

export default function DeleteUserModal({
  isOpen,
  onClose,
  user,
  onDelete
}: DeleteUserModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isOpen) return null

  const CONFIRM_TEXT = 'SUPPRIMER'
  const isConfirmed = confirmText === CONFIRM_TEXT

  const handleDelete = async () => {
    if (!isConfirmed) return

    setIsDeleting(true)
    try {
      await onDelete(user.id)
      onClose()
      setConfirmText('')
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-red-500/20 rounded-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-red-500/5">
          <div>
            <h2 className="text-2xl font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle size={24} />
              Supprimer l'utilisateur
            </h2>
            <p className="text-white/60 text-sm mt-1">Action irréversible</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Warning */}
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="text-red-400 font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle size={20} />
              Attention : Cette action est irréversible !
            </div>
            <div className="text-white/80 text-sm space-y-1">
              <p>• L'utilisateur sera définitivement supprimé</p>
              <p>• Toutes ses données seront perdues</p>
              <p>• Son profil et ses messages seront supprimés</p>
              <p>• Cette action ne peut pas être annulée</p>
            </div>
          </div>

          {/* User info */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="text-xs text-white/60 mb-2">Utilisateur à supprimer :</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Email:</span>
                <span className="text-white font-medium">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Nom:</span>
                <span className="text-white font-medium">{user.name || '(Non défini)'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Rôle:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user.role === 'ESCORT' ? 'bg-pink-500/20 text-pink-400'
                    : user.role === 'CLUB' ? 'bg-purple-500/20 text-purple-400'
                    : user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">ID:</span>
                <span className="text-white/60 text-xs font-mono">{user.id.slice(0, 20)}...</span>
              </div>
            </div>
          </div>

          {/* Confirmation input */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Pour confirmer, tapez <code className="bg-red-500/20 px-2 py-0.5 rounded text-red-400 font-mono">{CONFIRM_TEXT}</code>
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="Tapez SUPPRIMER"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono uppercase"
              autoComplete="off"
            />
            {confirmText && !isConfirmed && (
              <div className="text-red-400 text-sm mt-1">
                ❌ Le texte ne correspond pas
              </div>
            )}
            {isConfirmed && (
              <div className="text-green-400 text-sm mt-1">
                ✅ Confirmation valide
              </div>
            )}
          </div>

          {/* Final warning */}
          <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
            <div className="text-red-400 text-xs text-center">
              ⚠️ Dernier avertissement : Cette action supprimera définitivement l'utilisateur et toutes ses données
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            disabled={isDeleting}
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Suppression...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Supprimer définitivement
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
