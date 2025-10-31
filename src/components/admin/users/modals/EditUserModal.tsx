'use client'

import { useState, useEffect } from 'react'
import { X, Save, User } from 'lucide-react'

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id: string
    email: string
    name: string | null
    role: string
  }
  onSave: (userId: string, data: { email: string; name: string; role: string }) => Promise<void>
}

export default function EditUserModal({
  isOpen,
  onClose,
  user,
  onSave
}: EditUserModalProps) {
  const [email, setEmail] = useState(user.email)
  const [name, setName] = useState(user.name || '')
  const [role, setRole] = useState(user.role)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; name?: string }>({})

  useEffect(() => {
    if (isOpen) {
      setEmail(user.email)
      setName(user.name || '')
      setRole(user.role)
      setErrors({})
    }
  }, [isOpen, user])

  if (!isOpen) return null

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSave = async () => {
    // Validation
    const newErrors: { email?: string; name?: string } = {}

    if (!email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Email invalide'
    }

    if (!name.trim()) {
      newErrors.name = 'Le nom est requis'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSaving(true)
    try {
      await onSave(user.id, {
        email: email.trim(),
        name: name.trim(),
        role
      })
      onClose()
    } catch (error) {
      console.error('Erreur sauvegarde utilisateur:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = () => {
    return email !== user.email ||
           name !== (user.name || '') ||
           role !== user.role
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <User size={24} className="text-purple-400" />
              Éditer l'utilisateur
            </h2>
            <p className="text-white/60 text-sm mt-1">ID: {user.id.slice(0, 12)}...</p>
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
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setErrors({ ...errors, email: undefined })
              }}
              placeholder="email@example.com"
              className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.email ? 'border-red-500' : 'border-white/10'
              }`}
            />
            {errors.email && (
              <div className="text-red-400 text-sm mt-1">{errors.email}</div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setErrors({ ...errors, name: undefined })
              }}
              placeholder="Nom Prénom"
              className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.name ? 'border-red-500' : 'border-white/10'
              }`}
            />
            {errors.name && (
              <div className="text-red-400 text-sm mt-1">{errors.name}</div>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Rôle
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="CLIENT">Client</option>
              <option value="ESCORT">Escort</option>
              <option value="CLUB">Club</option>
              <option value="ADMIN">Admin</option>
            </select>
            <div className="text-xs text-white/40 mt-1">
              ⚠️ Attention : changer le rôle peut affecter l'accès de l'utilisateur
            </div>
          </div>

          {/* Changes indicator */}
          {hasChanges() && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="text-yellow-400 text-sm">
                ⚠️ Modifications non sauvegardées
              </div>
            </div>
          )}

          {/* Original values */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
            <div className="text-xs text-white/60 mb-2">Valeurs actuelles :</div>
            <div className="text-xs text-white/80 space-y-1">
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Nom:</strong> {user.name || '(Non défini)'}</div>
              <div><strong>Rôle:</strong> {user.role}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            disabled={isSaving}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges() || isSaving}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save size={16} />
                Sauvegarder
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
