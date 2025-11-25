'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft, Lock, Bell, Globe, HelpCircle, ChevronRight, Mail, AlertTriangle, Trash2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { signOut } from 'next-auth/react'

interface User {
  id: string
  email?: string
  role?: string
}

interface SettingsClientProps {
  user: User
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter()
  const t = useTranslations()
  const locale = useLocale()
  const pathname = usePathname()

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Password change form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Delete account form
  const [deleteEmail, setDeleteEmail] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Fetch initial email notifications preference
  useEffect(() => {
    const fetchNotificationPreference = async () => {
      try {
        const res = await fetch('/api/settings/notifications')
        if (res.ok) {
          const data = await res.json()
          setEmailNotifications(data.emailNotifications)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des préférences:', error)
      }
    }
    fetchNotificationPreference()
  }, [])

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'sq', name: 'Shqip', flag: '🇦🇱' }
  ]

  const currentLanguage = languages.find(l => l.code === locale) || languages[0]

  const handleLanguageChange = (langCode: string) => {
    // Changer la langue via cookie
    document.cookie = `NEXT_LOCALE=${langCode};path=/;max-age=31536000`
    setShowLanguageModal(false)
    // Recharger la page pour appliquer la nouvelle langue
    window.location.reload()
  }

  const handleSaveEmailNotifications = async () => {
    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailNotifications })
      })
      if (res.ok) {
        alert('Paramètres de notifications mis à jour')
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError('')

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Veuillez remplir tous les champs')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères')
      return
    }

    setPasswordLoading(true)

    try {
      const res = await fetch('/api/settings/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await res.json()

      if (res.ok) {
        alert('Mot de passe modifié avec succès')
        setShowPasswordModal(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordError(data.error || 'Erreur lors du changement de mot de passe')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setPasswordError('Erreur de connexion au serveur')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteError('')

    if (deleteEmail !== user.email) {
      setDeleteError('L\'email ne correspond pas')
      return
    }

    setDeleteLoading(true)

    try {
      const res = await fetch('/api/settings/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: deleteEmail })
      })

      const data = await res.json()

      if (res.ok) {
        alert('Votre compte a été supprimé avec succès')
        // Déconnexion et redirection
        await signOut({ callbackUrl: '/' })
      } else {
        setDeleteError(data.error || 'Erreur lors de la suppression du compte')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setDeleteError('Erreur de connexion au serveur')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Paramètres</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Section Compte */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Lock className="text-pink-500" size={20} />
              <h2 className="text-lg font-semibold">Compte</h2>
            </div>
          </div>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lock size={18} className="text-white/60" />
              <span>Changer de mot de passe</span>
            </div>
            <ChevronRight size={18} className="text-white/40" />
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors text-red-500"
          >
            <div className="flex items-center gap-3">
              <Trash2 size={18} />
              <span>Supprimer mon compte</span>
            </div>
            <ChevronRight size={18} className="text-red-500/40" />
          </button>
        </div>

        {/* Section Notifications */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Bell className="text-pink-500" size={20} />
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>
          </div>

          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-white/60" />
              <span>Notifications par email</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => {
                  setEmailNotifications(e.target.checked)
                  handleSaveEmailNotifications()
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
            </label>
          </div>
        </div>

        {/* Section Langue */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Globe className="text-pink-500" size={20} />
              <h2 className="text-lg font-semibold">Langue</h2>
            </div>
          </div>

          <button
            onClick={() => setShowLanguageModal(true)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentLanguage.flag}</span>
              <span>{currentLanguage.name}</span>
            </div>
            <ChevronRight size={18} className="text-white/40" />
          </button>
        </div>

        {/* Section Aide & Support */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <HelpCircle className="text-pink-500" size={20} />
              <h2 className="text-lg font-semibold">Aide & Support</h2>
            </div>
          </div>

          <a
            href="https://felora.com/faq"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors block"
          >
            <div className="flex items-center gap-3">
              <HelpCircle size={18} className="text-white/60" />
              <span>Centre d'aide / FAQ</span>
            </div>
            <ChevronRight size={18} className="text-white/40" />
          </a>

          <a
            href="mailto:support@felora.com?subject=Demande de support"
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors block"
          >
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-white/60" />
              <span>Contacter le support</span>
            </div>
            <ChevronRight size={18} className="text-white/40" />
          </a>

          <a
            href="mailto:support@felora.com?subject=Signalement de problème"
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors block"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-white/60" />
              <span>Signaler un problème</span>
            </div>
            <ChevronRight size={18} className="text-white/40" />
          </a>
        </div>
      </div>

      {/* Modal Langue */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-[#1A1A1A] rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold">Choisir la langue</h3>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors ${
                    locale === lang.code ? 'bg-pink-500/20' : ''
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="flex-1 text-left">{lang.name}</span>
                  {locale === lang.code && (
                    <span className="text-pink-500">✓</span>
                  )}
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => setShowLanguageModal(false)}
                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Changer mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-[#1A1A1A] rounded-2xl w-full max-w-md">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold">Changer de mot de passe</h3>
            </div>
            <div className="p-4 space-y-4">
              {passwordError && (
                <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-sm text-red-500">
                  {passwordError}
                </div>
              )}
              <div>
                <label className="block text-sm text-white/60 mb-2">Mot de passe actuel</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-pink-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-pink-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-pink-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="p-4 border-t border-white/10 flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordError('')
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                disabled={passwordLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Supprimer compte */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-[#1A1A1A] rounded-2xl w-full max-w-md">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-red-500">Supprimer mon compte</h3>
            </div>
            <div className="p-4">
              {deleteError && (
                <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-sm text-red-500 mb-4">
                  {deleteError}
                </div>
              )}
              <p className="text-white/80 mb-4">
                Cette action est <strong>irréversible</strong>. Toutes vos données seront définitivement supprimées.
              </p>
              <p className="text-sm text-white/60">
                Pour confirmer, tapez votre email : <strong className="text-white">{user.email}</strong>
              </p>
              <input
                type="email"
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
                className="w-full px-4 py-3 mt-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-red-500"
                placeholder={user.email}
              />
            </div>
            <div className="p-4 border-t border-white/10 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteError('')
                  setDeleteEmail('')
                }}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                disabled={deleteLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteEmail !== user.email}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
