'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../../components/dashboard-v2/DashboardLayout'

interface EscortProfile {
  // Informations de base
  stageName: string
  age: number
  description: string
  languages: string[]
  
  // Apparence physique
  height: number
  weight: number
  bodyType: string
  breastSize: string
  hairColor: string
  hairLength: string
  eyeColor: string
  ethnicity: string
  tattoos: boolean
  piercings: boolean
  breastType: 'naturelle' | 'siliconee'
  pubicHair: 'naturel' | 'rase' | 'partiel'
  smoker: boolean

  // Services proposés
  serviceType: string[]
  specialties: string[]
  outcall: boolean
  incall: boolean

  // Tarifs et disponibilités
  prices: {
    fifteenMin?: number
    thirtyMin?: number
    oneHour: number
    twoHours?: number
    overnight?: number
  }
  paymentMethods: string[]
  availability: string[]

  // Localisation
  canton: string
  ville: string
  rue: string
  codePostal: string
  address: string
  phoneVisibility: 'visible' | 'hidden' | 'none'
  phone?: string

  // Préférences
  acceptsCouples: boolean
  acceptsWomen: boolean
  acceptsHandicapped: boolean
  acceptsSeniors: boolean
  gfe: boolean
  pse: boolean
  duoTrio: boolean

  // Affichage des tarifs
  showPrices: boolean
}

export default function EscortProfileNew() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // États simples
  const [profile, setProfile] = useState<EscortProfile>({
    // Informations de base
    stageName: '',
    age: 18,
    description: '',
    languages: [],
    
    // Apparence physique
    height: 165,
    weight: 55,
    bodyType: '',
    breastSize: '',
    hairColor: '',
    hairLength: '',
    eyeColor: '',
    ethnicity: '',
    tattoos: false,
    piercings: false,
    breastType: 'naturelle',
    pubicHair: 'naturel',
    smoker: false,

    // Services proposés
    serviceType: [],
    specialties: [],
    outcall: true,
    incall: true,

    // Tarifs et disponibilités
    prices: {
      oneHour: 200,
      twoHours: 350,
      overnight: 800
    },
    paymentMethods: [],
    availability: [],

    // Localisation
    canton: '',
    ville: '',
    rue: '',
    codePostal: '',
    address: '',
    phoneVisibility: 'hidden',
    phone: '',

    // Préférences
    acceptsCouples: false,
    acceptsWomen: false,
    acceptsHandicapped: false,
    acceptsSeniors: false,
    gfe: false,
    pse: false,
    duoTrio: false,

    // Affichage des tarifs
    showPrices: true
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [activeTab, setActiveTab] = useState<'basic' | 'physical' | 'services' | 'rates' | 'location' | 'preferences'>('basic')

  // Auth check
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user) {
      router.push('/login?callbackUrl=/escort/profile')
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
  const availableBodyTypes = ['Mince', 'Sportive', 'Normale', 'Ronde', 'Pulpeuse']
  const availableHairColors = ['Blonde', 'Brune', 'Rousse', 'Noire', 'Châtain']
  const availableHairLengths = ['Court', 'Moyen', 'Long', 'Très long']
  const availableEyeColors = ['Bleus', 'Verts', 'Marrons', 'Noisette', 'Gris']
  const availableEthnicities = ['Européenne', 'Africaine', 'Asiatique', 'Latino', 'Métissée']
  const availablePaymentMethods = ['Cash', 'Carte', 'TWINT', 'Crypto']
  const availableAvailability = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

  return (
    <DashboardLayout title="Mon Profil" subtitle="Gérez vos informations personnelles et professionnelles">
      {/* Onglets de navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 p-1 bg-gray-800/40 rounded-xl border border-gray-700/50">
          {[
            { key: 'basic', label: 'Informations de base' },
            { key: 'physical', label: 'Apparence physique' },
            { key: 'services', label: 'Services proposés' },
            { key: 'rates', label: 'Tarifs' },
            { key: 'location', label: 'Localisation' },
            { key: 'preferences', label: 'Préférences' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
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