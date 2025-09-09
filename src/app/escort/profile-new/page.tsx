'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface EscortProfile {
  stageName: string
  age: number
  description: string
  height: number
  weight: number
  ville: string
  rue: string
  codePostal: string
  canton: string
  hourlyRate: number
  languages: string[]
  bodyType: string
  breastSize: string
  hairColor: string
  services: string[]
}

export default function EscortProfileNew() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // États simples
  const [profile, setProfile] = useState<EscortProfile>({
    stageName: '',
    age: 18,
    description: '',
    height: 165,
    weight: 55,
    ville: '',
    rue: '',
    codePostal: '',
    canton: '',
    hourlyRate: 200,
    languages: [],
    bodyType: '',
    breastSize: '',
    hairColor: '',
    services: []
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  // Auth check
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user) {
      router.push('/login?callbackUrl=/escort/profile-new')
      return
    }
  }, [session, status, router])

  // Charger le profil existant
  useEffect(() => {
    if (!session?.user) return
    
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/escort/profile', { 
          credentials: 'include' 
        })
        const data = await response.json()
        
        if (response.ok && data.success && data.profile) {
          const p = data.profile
          
          // Calculer l'âge depuis dateOfBirth
          const age = p.dateOfBirth ? 
            new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear() : 18

          // Parser les langues et services depuis CSV
          const parseCSV = (csv: string) => csv ? csv.split(',').map(s => s.trim()).filter(Boolean) : []
          
          setProfile({
            stageName: p.stageName || '',
            age: age,
            description: p.description || '',
            height: p.height || 165,
            weight: p.weight || 55, // À ajouter dans l'API si nécessaire
            ville: p.ville || p.city || '', // Support des deux formats
            rue: p.rue || '',
            codePostal: p.codePostal || '',
            canton: p.canton || '',
            hourlyRate: p.rate1H || 200,
            languages: parseCSV(p.languages || ''),
            bodyType: p.bodyType || '',
            breastSize: p.bustSize || '', // bustSize → breastSize
            hairColor: p.hairColor || '',
            services: parseCSV(p.services || '')
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
      // Mapper nos champs vers ceux attendus par l'API
      const payload = {
        stageName: profile.stageName,
        age: profile.age,
        description: profile.description,
        city: profile.ville, // ville → city
        canton: profile.canton,
        address: `${profile.rue}, ${profile.codePostal} ${profile.ville}`.trim(), // construire address complète
        rate1H: profile.hourlyRate, // hourlyRate → rate1H
        height: profile.height,
        languages: profile.languages, // L'API gère les arrays
        services: profile.services,
        bodyType: profile.bodyType,
        bustSize: profile.breastSize, // breastSize → bustSize
        hairColor: profile.hairColor
      }

      console.log('Envoi des données:', payload) // Debug

      const response = await fetch('/api/escort/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
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

  // Mise à jour des champs
  const updateField = (field: keyof EscortProfile, value: any) => {
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
  const availableServices = ['Escort', 'Massage', 'Compagnie', 'Dîner', 'Événements']

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Mon Profil Escort</h1>
          <p className="text-gray-400">Gérez vos informations personnelles - Version Simple</p>
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
          {/* Informations de base */}
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Informations de base</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom de scène</label>
                <input
                  type="text"
                  value={profile.stageName}
                  onChange={(e) => updateField('stageName', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Votre nom de scène"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Âge</label>
                <input
                  type="number"
                  min="18"
                  max="65"
                  value={profile.age}
                  onChange={(e) => updateField('age', parseInt(e.target.value) || 18)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Taille (cm)</label>
                <input
                  type="number"
                  min="140"
                  max="200"
                  value={profile.height}
                  onChange={(e) => updateField('height', parseInt(e.target.value) || 165)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Poids (kg)</label>
                <input
                  type="number"
                  min="40"
                  max="120"
                  value={profile.weight}
                  onChange={(e) => updateField('weight', parseInt(e.target.value) || 55)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tarif horaire (CHF)</label>
                <input
                  type="number"
                  min="50"
                  value={profile.hourlyRate}
                  onChange={(e) => updateField('hourlyRate', parseInt(e.target.value) || 200)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={profile.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="Décrivez-vous..."
              />
            </div>
          </div>

          {/* Localisation */}
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Localisation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ville</label>
                <input
                  type="text"
                  value={profile.ville}
                  onChange={(e) => updateField('ville', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Votre ville"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Code postal</label>
                <input
                  type="text"
                  value={profile.codePostal}
                  onChange={(e) => updateField('codePostal', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="1000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rue</label>
                <input
                  type="text"
                  value={profile.rue}
                  onChange={(e) => updateField('rue', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Votre adresse"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Canton</label>
                <input
                  type="text"
                  value={profile.canton}
                  onChange={(e) => updateField('canton', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="GE, VD, ZH..."
                />
              </div>
            </div>
          </div>

          {/* Langues */}
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

          {/* Services */}
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Services proposés</h2>
            <div className="flex flex-wrap gap-2">
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
          </div>

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end">
            <button
              onClick={saveProfile}
              disabled={saving}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                saving 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
              }`}
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder le profil'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}