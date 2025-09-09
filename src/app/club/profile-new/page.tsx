'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface ClubProfile {
  name: string
  description: string
  address: string
  openingHours: string
  avatarUrl: string
  coverUrl: string
  isActive: boolean
  websiteUrl: string
  languages: string[]
  paymentMethods: string[]
  services: string[]
}

export default function ClubProfileNew() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // États simples
  const [profile, setProfile] = useState<ClubProfile>({
    name: '',
    description: '',
    address: '',
    openingHours: '',
    avatarUrl: '',
    coverUrl: '',
    isActive: false,
    websiteUrl: '',
    languages: [],
    paymentMethods: [],
    services: []
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  // Auth check
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user) {
      router.push('/login?callbackUrl=/club/profile-new')
      return
    }
  }, [session, status, router])

  // Charger le profil existant
  useEffect(() => {
    if (!session?.user) return
    
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/clubs/profile/me', { 
          credentials: 'include' 
        })
        const data = await response.json()
        
        if (response.ok && data.success && data.club) {
          const c = data.club
          
          // Parser les CSV en arrays
          const parseCSV = (csv: string) => csv ? csv.split(',').map(s => s.trim()).filter(Boolean) : []
          
          setProfile({
            name: c.name || '',
            description: c.description || '',
            address: c.address || '',
            openingHours: c.openingHours || '',
            avatarUrl: c.avatarUrl || '',
            coverUrl: c.coverUrl || '',
            isActive: !!c.isActive,
            websiteUrl: c.websiteUrl || '',
            languages: parseCSV(c.languages || ''),
            paymentMethods: parseCSV(c.paymentMethods || ''),
            services: parseCSV(c.services || '')
          })
        }
      } catch (error) {
        console.error('Erreur chargement profil:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [session])

  // Sauvegarde simple et directe
  const saveProfile = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/clubs/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: profile.name,
          description: profile.description,
          address: profile.address,
          openingHours: profile.openingHours,
          avatarUrl: profile.avatarUrl,
          coverUrl: profile.coverUrl,
          isActive: profile.isActive
        })
      })
      
      const result = await response.json()
      
      if (response.ok && result.ok) {
        setMessage({ type: 'success', text: 'Profil sauvegardé avec succès !' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Erreur lors de la sauvegarde' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' })
    } finally {
      setSaving(false)
    }

    // Masquer le message après 3s
    setTimeout(() => setMessage(null), 3000)
  }

  // Sauvegarde des services
  const saveServices = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/clubs/services/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          languages: profile.languages,
          paymentMethods: profile.paymentMethods,
          services: profile.services
        })
      })
      
      const result = await response.json()
      
      if (response.ok && result.ok) {
        setMessage({ type: 'success', text: 'Services sauvegardés avec succès !' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Erreur lors de la sauvegarde' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' })
    } finally {
      setSaving(false)
    }

    // Masquer le message après 3s
    setTimeout(() => setMessage(null), 3000)
  }

  // Mise à jour des champs
  const updateField = (field: keyof ClubProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const toggleLanguage = (lang: string) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }))
  }

  const togglePayment = (payment: string) => {
    setProfile(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(payment)
        ? prev.paymentMethods.filter(p => p !== payment)
        : [...prev.paymentMethods, payment]
    }))
  }

  const toggleService = (service: string) => {
    setProfile(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }))
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) return null

  const availableLanguages = ['Français', 'Anglais', 'Allemand', 'Italien', 'Espagnol']
  const availablePayments = ['Cash', 'Carte', 'TWINT', 'Virement']
  const availableServices = ['Bar', 'Champagne', 'Privé', 'Sécurité', 'Parking', 'Salle VIP']

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Mon Profil Club</h1>
          <p className="text-gray-400">Gérez les informations de votre établissement - Version Simple</p>
        </div>

        {/* Message de feedback */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.type === 'success' 
              ? 'bg-green-500/20 border border-green-500/40 text-green-400'
              : 'bg-red-500/20 border border-red-500/40 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid gap-6">
          {/* Informations principales */}
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Informations principales</h2>
            
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom du club</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Ex. Club Luxe Geneva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={profile.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Décrivez votre établissement, ambiance, services..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Adresse</label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Rue, ville, code postal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Horaires d'ouverture</label>
                <input
                  type="text"
                  value={profile.openingHours}
                  onChange={(e) => updateField('openingHours', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Lun-Dim 18:00–05:00"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Avatar URL</label>
                  <input
                    type="url"
                    value={profile.avatarUrl}
                    onChange={(e) => updateField('avatarUrl', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bannière URL</label>
                  <input
                    type="url"
                    value={profile.coverUrl}
                    onChange={(e) => updateField('coverUrl', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Site web (facultatif)</label>
                <input
                  type="url"
                  value={profile.websiteUrl}
                  onChange={(e) => updateField('websiteUrl', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="https://votre-site.ch"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={profile.isActive}
                  onChange={(e) => updateField('isActive', e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-300">
                  Profil actif (visible publiquement)
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={saveProfile}
                disabled={saving}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  saving 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder les infos'}
              </button>
            </div>
          </div>

          {/* Langues parlées */}
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Langues parlées</h2>
            <div className="flex flex-wrap gap-2">
              {availableLanguages.map(lang => (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    profile.languages.includes(lang)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Moyens de paiement */}
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Moyens de paiement</h2>
            <div className="flex flex-wrap gap-2">
              {availablePayments.map(payment => (
                <button
                  key={payment}
                  onClick={() => togglePayment(payment)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    profile.paymentMethods.includes(payment)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {payment}
                </button>
              ))}
            </div>
          </div>

          {/* Services proposés */}
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Services proposés</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {availableServices.map(service => (
                <button
                  key={service}
                  onClick={() => toggleService(service)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    profile.services.includes(service)
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={saveServices}
                disabled={saving}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  saving 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                }`}
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder les services'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}