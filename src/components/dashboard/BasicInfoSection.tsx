'use client'

import { useState } from 'react'
import { ModernAddressSearch } from './ModernAddressSearch'


interface ProfileData {
  email: string
  phone: string
  canton: string
  codePostal: string
  ville: string
  rue: string
  numero: string
  addressVisible: boolean
  latitude?: number
  longitude?: number
  dateOfBirth: string | null
  description: string
}

interface BasicInfoSectionProps {
  profileData: ProfileData
  onProfileChange: (data: Partial<ProfileData>) => void
}

export function BasicInfoSection({ profileData, onProfileChange }: BasicInfoSectionProps) {
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  // Fonction pour gérer le changement d'email
  const handleEmailChange = async () => {
    if (!newEmail) return
    
    setEmailLoading(true)
    try {
      // TODO: Implémenter l'API de changement d'email avec vérification
      console.log('Changement email vers:', newEmail)
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert(`Un email de vérification a été envoyé à ${newEmail}`)
      setShowEmailModal(false)
      setNewEmail('')
    } catch (error) {
      alert('Erreur lors du changement d\'email')
    } finally {
      setEmailLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Informations de base</h2>
        <p className="text-gray-400">Vos coordonnées et informations personnelles</p>
      </div>

      {/* Email et téléphone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
          <div className="relative">
            <input 
              type="email" 
              value={profileData.email || ''}
              disabled
              className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600 rounded-xl text-gray-300 cursor-not-allowed pr-20"
            />
            <button
              onClick={() => setShowEmailModal(true)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-purple-400 hover:text-purple-300 underline"
            >
              Modifier
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Défini lors de l'inscription</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone *</label>
          <input 
            type="tel" 
            value={profileData.phone || ''}
            onChange={(e) => onProfileChange({ phone: e.target.value })}
            placeholder="+41 79 123 45 67"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">Pour WhatsApp, SMS et appels directs</p>
        </div>
      </div>

      {/* Adresse avec API moderne */}
      <ModernAddressSearch 
        addressData={{
          canton: profileData.canton,
          codePostal: profileData.codePostal,
          ville: profileData.ville,
          rue: profileData.rue,
          numero: profileData.numero,
          addressVisible: profileData.addressVisible,
          latitude: profileData.latitude,
          longitude: profileData.longitude
        }}
        onAddressChange={onProfileChange}
      />

      {/* Date de naissance et mot de passe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Date de naissance</label>
          <div className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600 rounded-xl text-gray-300">
            {profileData.dateOfBirth ? 
              new Date(profileData.dateOfBirth).toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
              }) : 
              'Non renseignée'
            }
          </div>
          <p className="text-xs text-gray-400 mt-1">Définie lors de l'inscription - seul l'âge apparaît sur le profil</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Modifier le mot de passe</label>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-xl text-white font-medium transition-colors"
          >
            Changer mon mot de passe
          </button>
          <p className="text-xs text-gray-400 mt-1">Changement nécessite vérification par email</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description * 
          <span className="text-xs text-gray-500 ml-2">
            ({profileData.description.length}/200 caractères minimum)
          </span>
        </label>
        <textarea
          value={profileData.description}
          onChange={(e) => onProfileChange({ description: e.target.value })}
          rows={6}
          placeholder="Décrivez-vous de manière attractive et professionnelle. Parlez de votre personnalité, vos passions, ce qui vous rend unique..."
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
        />
        {profileData.description.length >= 50 && (
          <div className="mt-2 text-sm text-green-400">✓ Description suffisamment détaillée</div>
        )}
      </div>

      {/* Modal de changement d'email */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Changer l'email</h3>
              <p className="text-gray-400 text-sm">Un email de vérification sera envoyé à la nouvelle adresse</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nouvel email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="nouveau@email.com"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEmailModal(false)}
                disabled={emailLoading}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-xl text-gray-300 font-medium transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleEmailChange}
                disabled={emailLoading || !newEmail}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emailLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Envoi...</span>
                  </div>
                ) : (
                  'Envoyer la vérification'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Changer le mot de passe</h3>
              <p className="text-gray-400 text-sm">Un email de vérification sera envoyé</p>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-xl text-gray-300 font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  alert('Fonctionnalité à implémenter : envoi email de vérification')
                  setShowPasswordModal(false)
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg text-white rounded-xl font-medium transition-all"
              >
                Envoyer la vérification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}