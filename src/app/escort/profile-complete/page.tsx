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

export default function EscortProfileComplete() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // États
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
      router.push('/login?callbackUrl=/escort/profile-complete')
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
            // Informations de base
            stageName: p.stageName || '',
            age: age,
            description: p.description || '',
            languages: parseCSV(p.languages || ''),
            
            // Apparence physique
            height: p.height || 165,
            weight: p.weight || 55,
            bodyType: p.bodyType || '',
            breastSize: p.bustSize || '', // bustSize → breastSize
            hairColor: p.hairColor || '',
            hairLength: p.hairLength || '',
            eyeColor: p.eyeColor || '',
            ethnicity: p.ethnicity || '',
            tattoos: !!p.tattoos,
            piercings: !!p.piercings,
            breastType: p.breastType || 'naturelle',
            pubicHair: p.pubicHair || 'naturel',
            smoker: !!p.smoker,

            // Services proposés
            serviceType: parseCSV(p.services || ''),
            specialties: parseCSV(p.practices || ''),
            outcall: !!p.outcall,
            incall: !!p.incall,

            // Tarifs et disponibilités
            prices: {
              fifteenMin: p.rate15Min,
              thirtyMin: p.rate30Min,
              oneHour: p.rate1H || 200,
              twoHours: p.rate2H,
              overnight: p.rateOvernight
            },
            paymentMethods: parseCSV(p.paymentMethods || ''),
            availability: parseCSV(p.availability || ''),

            // Localisation
            canton: p.canton || '',
            ville: p.ville || p.city || '', // Support des deux formats
            rue: p.rue || '',
            codePostal: p.codePostal || '',
            address: p.workingArea || '',
            phoneVisibility: p.phoneVisibility || 'hidden',
            phone: p.user?.phone || '',

            // Préférences
            acceptsCouples: !!p.acceptsCouples,
            acceptsWomen: !!p.acceptsWomen,
            acceptsHandicapped: !!p.acceptsHandicapped,
            acceptsSeniors: !!p.acceptsSeniors,
            gfe: !!p.gfe,
            pse: !!p.pse,
            duoTrio: !!p.duoTrio,

            // Affichage des tarifs
            showPrices: p.showPrices !== false // Par défaut true
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

  // Sauvegarde fonctionnelle (celle qui marche !)
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
        rate1H: profile.prices.oneHour, // oneHour → rate1H
        rate2H: profile.prices.twoHours,
        rateOvernight: profile.prices.overnight,
        height: profile.height,
        bodyType: profile.bodyType,
        bustSize: profile.breastSize, // breastSize → bustSize
        hairColor: profile.hairColor,
        hairLength: profile.hairLength,
        eyeColor: profile.eyeColor,
        ethnicity: profile.ethnicity,
        tattoos: profile.tattoos ? 'Oui' : 'Non', // boolean → string
        piercings: profile.piercings ? 'Oui' : 'Non',
        breastType: profile.breastType,
        pubicHair: profile.pubicHair,
        smoker: profile.smoker,
        languages: profile.languages, // L'API gère les arrays
        services: profile.serviceType,
        practices: profile.specialties,
        outcall: profile.outcall,
        incall: profile.incall,
        paymentMethods: profile.paymentMethods,
        phone: profile.phone,
        phoneVisibility: profile.phoneVisibility,
        acceptsCouples: profile.acceptsCouples,
        acceptsWomen: profile.acceptsWomen,
        acceptsHandicapped: profile.acceptsHandicapped,
        acceptsSeniors: profile.acceptsSeniors
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

  const updatePriceField = (field: keyof EscortProfile['prices'], value: number) => {
    setProfile(prev => ({ 
      ...prev, 
      prices: { ...prev.prices, [field]: value }
    }))
  }

  const toggleArrayField = (field: keyof EscortProfile, value: string) => {
    setProfile(prev => {
      const currentArray = prev[field] as string[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      return { ...prev, [field]: newArray }
    })
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
  const availableServices = ['Escort', 'Massage', 'Compagnie', 'Dîner', 'Événements', 'Soirées', 'Voyages']
  const availableSpecialties = ['GFE', 'PSE', 'Duo', 'Trio', 'BDSM', 'Fétichisme', 'Tantrique']
  const availableBodyTypes = ['Mince', 'Sportive', 'Normale', 'Ronde', 'Pulpeuse']
  const availableHairColors = ['Blonde', 'Brune', 'Rousse', 'Noire', 'Châtain', 'Colorée']
  const availableHairLengths = ['Court', 'Moyen', 'Long', 'Très long']
  const availableEyeColors = ['Bleus', 'Verts', 'Marrons', 'Noisette', 'Gris', 'Noirs']
  const availableEthnicities = ['Européenne', 'Africaine', 'Asiatique', 'Latino', 'Métissée', 'Autre']
  const availablePaymentMethods = ['Cash', 'Carte', 'TWINT', 'Crypto', 'Virement']
  const availableAvailability = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

  return (
    <DashboardLayout title="Mon Profil Complet" subtitle="Gérez toutes vos informations professionnelles">
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

      {/* Contenu des onglets */}
      <div className="grid gap-6">
        
        {/* Onglet: Informations de base */}
        {activeTab === 'basic' && (
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

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Langues parlées</label>
              <div className="flex flex-wrap gap-2">
                {availableLanguages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => toggleArrayField('languages', lang)}
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
          </div>
        )}

        {/* Onglet: Apparence physique */}
        {activeTab === 'physical' && (
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Apparence physique</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Taille de poitrine</label>
                <select
                  value={profile.breastSize}
                  onChange={(e) => updateField('breastSize', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Sélectionner...</option>
                  {['AA', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H+'].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type de poitrine</label>
                <select
                  value={profile.breastType}
                  onChange={(e) => updateField('breastType', e.target.value as 'naturelle' | 'siliconee')}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="naturelle">Naturelle</option>
                  <option value="siliconee">Siliconée</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Type de corps</label>
              <div className="flex flex-wrap gap-2">
                {availableBodyTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => updateField('bodyType', type)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      profile.bodyType === type
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Couleur de cheveux</label>
              <div className="flex flex-wrap gap-2">
                {availableHairColors.map(color => (
                  <button
                    key={color}
                    onClick={() => updateField('hairColor', color)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      profile.hairColor === color
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Longueur de cheveux</label>
              <div className="flex flex-wrap gap-2">
                {availableHairLengths.map(length => (
                  <button
                    key={length}
                    onClick={() => updateField('hairLength', length)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      profile.hairLength === length
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {length}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Couleur des yeux</label>
              <div className="flex flex-wrap gap-2">
                {availableEyeColors.map(color => (
                  <button
                    key={color}
                    onClick={() => updateField('eyeColor', color)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      profile.eyeColor === color
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Ethnicité</label>
              <div className="flex flex-wrap gap-2">
                {availableEthnicities.map(ethnicity => (
                  <button
                    key={ethnicity}
                    onClick={() => updateField('ethnicity', ethnicity)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      profile.ethnicity === ethnicity
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {ethnicity}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profile.tattoos}
                  onChange={(e) => updateField('tattoos', e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-300">Tatouages</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profile.piercings}
                  onChange={(e) => updateField('piercings', e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-300">Piercings</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profile.smoker}
                  onChange={(e) => updateField('smoker', e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-300">Fumeuse</span>
              </label>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Pilosité pubienne</label>
              <div className="flex gap-2">
                {['naturel', 'rase', 'partiel'].map(type => (
                  <button
                    key={type}
                    onClick={() => updateField('pubicHair', type as 'naturel' | 'rase' | 'partiel')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      profile.pubicHair === type
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Onglet: Services proposés */}
        {activeTab === 'services' && (
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Services proposés</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profile.incall}
                  onChange={(e) => updateField('incall', e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-300">Incall (chez moi)</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profile.outcall}
                  onChange={(e) => updateField('outcall', e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-300">Outcall (chez vous)</span>
              </label>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Types de services</label>
              <div className="flex flex-wrap gap-2">
                {availableServices.map(service => (
                  <button
                    key={service}
                    onClick={() => toggleArrayField('serviceType', service)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      profile.serviceType.includes(service)
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Spécialités</label>
              <div className="flex flex-wrap gap-2">
                {availableSpecialties.map(specialty => (
                  <button
                    key={specialty}
                    onClick={() => toggleArrayField('specialties', specialty)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      profile.specialties.includes(specialty)
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Onglet: Tarifs */}
        {activeTab === 'rates' && (
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Tarifs</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">15 minutes (CHF)</label>
                <input
                  type="number"
                  min="0"
                  value={profile.prices.fifteenMin || ''}
                  onChange={(e) => updatePriceField('fifteenMin', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Optionnel"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">30 minutes (CHF)</label>
                <input
                  type="number"
                  min="0"
                  value={profile.prices.thirtyMin || ''}
                  onChange={(e) => updatePriceField('thirtyMin', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Optionnel"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">1 heure (CHF) *</label>
                <input
                  type="number"
                  min="50"
                  value={profile.prices.oneHour}
                  onChange={(e) => updatePriceField('oneHour', parseInt(e.target.value) || 200)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">2 heures (CHF)</label>
                <input
                  type="number"
                  min="0"
                  value={profile.prices.twoHours || ''}
                  onChange={(e) => updatePriceField('twoHours', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Optionnel"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nuit complète (CHF)</label>
                <input
                  type="number"
                  min="0"
                  value={profile.prices.overnight || ''}
                  onChange={(e) => updatePriceField('overnight', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Optionnel"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Moyens de paiement</label>
              <div className="flex flex-wrap gap-2">
                {availablePaymentMethods.map(method => (
                  <button
                    key={method}
                    onClick={() => toggleArrayField('paymentMethods', method)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      profile.paymentMethods.includes(method)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profile.showPrices}
                  onChange={(e) => updateField('showPrices', e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-300">Afficher mes tarifs publiquement</span>
              </label>
            </div>
          </div>
        )}

        {/* Onglet: Localisation */}
        {activeTab === 'location' && (
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Localisation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Canton</label>
                <select
                  value={profile.canton}
                  onChange={(e) => updateField('canton', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Sélectionner un canton</option>
                  <option value="GE">Genève</option>
                  <option value="VD">Vaud</option>
                  <option value="VS">Valais</option>
                  <option value="ZH">Zurich</option>
                  <option value="BE">Berne</option>
                  <option value="BS">Bâle</option>
                  <option value="FR">Fribourg</option>
                  <option value="NE">Neuchâtel</option>
                  <option value="LU">Lucerne</option>
                  <option value="TI">Tessin</option>
                  <option value="SG">Saint-Gall</option>
                </select>
              </div>
              
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
                  placeholder="Votre adresse (optionnel)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="+41 XX XXX XX XX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Visibilité téléphone</label>
                <select
                  value={profile.phoneVisibility}
                  onChange={(e) => updateField('phoneVisibility', e.target.value as 'visible' | 'hidden' | 'none')}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="none">Non renseigné</option>
                  <option value="hidden">Masqué (clients peuvent demander)</option>
                  <option value="visible">Visible publiquement</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Disponibilités</label>
              <div className="flex flex-wrap gap-2">
                {availableAvailability.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleArrayField('availability', day)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      profile.availability.includes(day)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Onglet: Préférences */}
        {activeTab === 'preferences' && (
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Préférences clientèle</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profile.acceptsCouples}
                  onChange={(e) => updateField('acceptsCouples', e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-300">Accepte les couples</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profile.acceptsWomen}
                  onChange={(e) => updateField('acceptsWomen', e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-300">Accepte les femmes</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profile.acceptsHandicapped}
                  onChange={(e) => updateField('acceptsHandicapped', e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-300">Accepte les personnes handicapées</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profile.acceptsSeniors}
                  onChange={(e) => updateField('acceptsSeniors', e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-300">Accepte les seniors</span>
              </label>
            </div>

            <h3 className="text-lg font-semibold text-white mt-6 mb-4">Services spéciaux</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profile.gfe}
                  onChange={(e) => updateField('gfe', e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-300">GFE (Girlfriend Experience)</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profile.pse}
                  onChange={(e) => updateField('pse', e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-300">PSE (Porn Star Experience)</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profile.duoTrio}
                  onChange={(e) => updateField('duoTrio', e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-300">Duo/Trio</span>
              </label>
            </div>
          </div>
        )}

        {/* Bouton de sauvegarde global */}
        <div className="flex justify-end">
          <button
            onClick={saveProfile}
            disabled={saving}
            className={`px-8 py-4 rounded-lg font-medium text-lg transition-colors ${
              saving 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg'
            }`}
          >
            {saving ? 'Sauvegarde en cours...' : 'Sauvegarder mon profil complet'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}