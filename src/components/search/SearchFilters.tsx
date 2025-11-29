'use client'

import React, { useState, useEffect } from 'react'
import { X, MapPin, Filter } from 'lucide-react'
import { useTranslations } from 'next-intl'
import track from '@/lib/analytics/tracking'

interface SearchFiltersProps {
  filters: {
    q?: string
    city?: string
    canton?: string
    services?: string[]
    languages?: string[]
    status?: string
    sort?: string
    // Filtres étendus
    categories?: string[]
    ageRange?: [number, number]
    heightRange?: [number, number]
    bodyType?: string
    hairColor?: string
    eyeColor?: string
    ethnicity?: string
    breastSize?: string
    hasTattoos?: string
    serviceTypes?: string[]
    specialties?: string[]
    experienceTypes?: string[]
    roleTypes?: string[]
    budgetRange?: [number, number]
    minDuration?: string
    acceptsCards?: boolean
    availability?: string[]
    timeSlots?: string[]
    weekendAvailable?: boolean
    verified?: boolean
    minRating?: number
    minReviews?: number
    premiumContent?: boolean
    liveCam?: boolean
    premiumMessaging?: boolean
    privatePhotos?: boolean
    exclusiveVideos?: boolean
    availableNow?: boolean
    outcall?: boolean
    incall?: boolean
    radius?: number
  }
  onFiltersChange: (filters: any) => void
  onClose: () => void
  isOpen: boolean
}

// Toutes les villes de Suisse organisées par canton
const swissCities = {
  "Genève": [
    "Genève", "Carouge", "Chambésy", "Champel", "Cité-Centre", "Cologny", "Cornavin",
    "Eaux-vives", "Plainpalais", "Plan-les-Ouates", "Servette", "Thônex", "Versoix",
    "Meyrin", "Vernier", "Lancy"
  ],
  "Vaud": [
    "Aigle", "Aubonne", "Bex", "Bussigny", "Chavannes-Renens", "Clarens", "Coppet",
    "Corcelles-près-Payerne", "Crissier", "Gland", "Lausanne", "Montreux", "Morges",
    "Moudon", "Nyon", "Oron", "Payerne", "Prilly", "Renens", "Roche", "Vevey",
    "Villeneuve", "Yverdon-les-Bains", "Rolle", "Pully"
  ],
  "Valais": [
    "Aproz", "Ardon", "Brig", "Chippis", "Collombey", "Conthey", "Crans-Montana",
    "Grône", "Martigny", "Massongex", "Monthey", "Riddes", "Saillon", "Saint-Léonard",
    "Saint-Maurice", "Saxon", "Sierre", "Sion", "Turtmann", "Verbier", "Vétroz",
    "Visp", "Savièse", "Fully", "Veyras"
  ],
  "Neuchâtel": [
    "La Chaux-de-Fonds", "Le Locle", "Neuchâtel", "Boudry", "Colombier"
  ],
  "Jura": [
    "Bassecourt", "Boncourt", "Courrendlin", "Delémont", "Moutier", "Porrentruy", "Alle"
  ],
  "Fribourg": [
    "Bulle", "Châtel-Saint-Denis", "Düdingen", "Estavayer-le-Lac", "Flamatt",
    "Fribourg", "Marly", "Romont", "Morat", "Kerzers"
  ],
  "Berne": [
    "Belp", "Berne", "Biel/Bienne", "Lengnau", "Burgdorf", "Granges", "Gstaad",
    "Interlaken", "Kirchberg", "Laupen", "Oberdiessbach", "Ostermundigen", "Thun",
    "Uetendorf", "Zollikofen", "Lyss", "Münsingen", "Spiez"
  ],
  "Zurich": [
    "Bassersdorf", "Effretikon", "Opfikon", "Regensdorf", "Dietikon", "Dübendorf",
    "Pfäffikon (Zurich)", "Schlieren", "Wald Zürich", "Schwerzenbach", "Zürich",
    "Glattbrugg", "Oerlikon", "Winterthur", "Uster", "Kloten"
  ],
  "Suisse Alémanique": [
    "Altendorf", "Aarau", "Baden", "Basel", "Glaris", "Lucerne", "Buchs", "Chur",
    "Lenzburg", "Othmarsingen", "Oensingen", "Rothrist", "Safenwil", "Olten",
    "Saint-Gall", "St-Moritz", "Davos", "Derendingen", "Ebikon", "Emmenbrücke",
    "Spreitenbach", "Schindellegi", "Sevelen", "Solothurn", "Wil", "Liestal",
    "Münchenstein", "Winterthur", "Wolfwil", "Zofingen", "Zug", "Schaffhouse",
    "Frauenfeld", "Kreuzlingen", "Allschwil", "Pratteln", "Muttenz", "Emmen",
    "Kriens", "Horw", "Arosa"
  ],
  "Tessin": [
    "Lugano", "Bellinzona", "Locarno"
  ]
}

// ===== UNIFICATION COMPLÈTE AVEC DASHBOARD =====
// TERMES EXACTS UTILISÉS DANS LE DASHBOARD

const CATEGORIES = ['Escorte', 'Salon', 'Massage', 'VIP', 'BDSM', 'Médias privés']

// SERVICES CLASSIQUES - EXACTEMENT COMME DASHBOARD
const SERVICES_CLASSIQUES = [
  'Rapport', 'French kiss', 'GFE', 'PSE', 'Lingerie', 'Duo/Trio', 'Jeux de rôles', 'Costumes'
]

// SERVICES ORAL - EXACTEMENT COMME DASHBOARD
const SERVICES_ORAL = [
  'Oral', 'Fellation protégée', 'Fellation nature', 'Gorge profonde',
  'Éjac en bouche', 'Éjac sur le corps', 'Éjac sur le visage'
]

// SERVICES ANAL - EXACTEMENT COMME DASHBOARD
const SERVICES_ANAL = [
  'Anal', 'Sodomie (donne)', 'Sodomie (reçoit)', 'Doigté anal'
]

// BDSM & FÉTICHES - EXACTEMENT COMME DASHBOARD
const SERVICES_BDSM = [
  'Domination soft', 'Fessées', 'Donjon SM', 'Fétichisme pieds'
]

// MASSAGES - EXACTEMENT COMME DASHBOARD
const SERVICES_MASSAGE = [
  'Tantrique', 'Érotique', 'Corps à corps', 'Nuru', 'Prostate',
  'Lingam', 'Yoni', '4 mains', 'Suédois', 'Huiles'
]

// ÉQUIPEMENTS - EXACTEMENT COMME DASHBOARD
const EQUIPEMENTS = [
  'Douche à deux', 'Jacuzzi', 'Sauna', 'Climatisation', 'Fumoir',
  'Parking', 'Accès handicapé', 'Ambiance musicale', 'Bar', 'Pole dance'
]

// CLIENTÈLE ACCEPTÉE - EXACTEMENT COMME DASHBOARD
const CLIENTELE = ['Couples', 'Femmes', 'Personnes handicapées', 'Personnes âgées']

// LIEU & OPTIONS - EXACTEMENT COMME DASHBOARD
const LIEU_OPTIONS = ['Incall', 'Outcall']

// APPARENCE PHYSIQUE - EXACTEMENT COMME DASHBOARD
const SILHOUETTES = ['Mince', 'Sportive', 'Pulpeuse', 'Ronde']
const TOUR_POITRINE = ['A', 'B', 'C', 'D', 'E', 'F+']
const CHEVEUX_COULEUR = ['Brun', 'Blond', 'Châtain', 'Gris', 'Roux', 'Autre']
const POITRINE_TYPE = ['Naturelle', 'Siliconée']
const CHEVEUX_LONGUEUR = ['Court', 'Mi-long', 'Long']
const YEUX_COULEUR = ['Noir', 'Marron', 'Vert', 'Bleu', 'Gris']
const ORIGINES = [
  'Suissesse', 'Française', 'Espagnole', 'Italienne', 'Allemand', 'Européenne (autres)',
  'Latine', 'Asiatique', 'Africaine', 'Russe', 'Orientale', 'Brésilienne',
  'Moyen-Orient', 'Balkanique', 'Nordique', 'Métissée'
]
const POILS_PUBIS = ['Naturel', 'Rasé', 'Partiellement rasé']

// LANGUES PARLÉES - EXACTEMENT COMME DASHBOARD
const LANGUES_DASHBOARD = ['Français', 'Anglais', 'Allemand', 'Italien', 'Espagnol', 'Russe', 'Arabe', 'Chinois']

// MÉTHODES DE PAIEMENT - EXACTEMENT COMME DASHBOARD
const PAIEMENTS = ['Cash', 'TWINT', 'Crypto', 'Visa', 'Mastercard', 'Amex', 'Maestro', 'PostFinance']

// DEVISES ACCEPTÉES - EXACTEMENT COMME DASHBOARD
const DEVISES = ['CHF', 'EUR', 'USD']

export default function SearchFilters({ filters, onFiltersChange, onClose, isOpen }: SearchFiltersProps) {
  const t = useTranslations('search')
  const tFilters = useTranslations('filters')
  const tCategories = useTranslations('categories')

  // États des filtres basés sur les vrais champs de la base de données
  const [selectedCategories, setSelectedCategories] = useState<string[]>(filters.categories || [])
  const [selectedCanton, setSelectedCanton] = useState(filters.canton || '')
  const [selectedCity, setSelectedCity] = useState(filters.city || '')
  const [availableNow, setAvailableNow] = useState(filters.availableNow || false)
  const [outcall, setOutcall] = useState(filters.outcall || false)
  const [incall, setIncall] = useState(filters.incall || false)
  
  // Profil & Physique (basé sur les vrais champs)
  const [ageRange, setAgeRange] = useState(filters.ageRange || [18, 65])
  const [heightRange, setHeightRange] = useState(filters.heightRange || [150, 180])
  const [bodyType, setBodyType] = useState(filters.bodyType || '')
  const [hairColor, setHairColor] = useState(filters.hairColor || '')
  const [eyeColor, setEyeColor] = useState(filters.eyeColor || '')
  const [ethnicity, setEthnicity] = useState(filters.ethnicity || '')
  const [breastSize, setBreastSize] = useState(filters.breastSize || '')
  const [hasTattoos, setHasTattoos] = useState(filters.hasTattoos || '')
  
  // Services & Types (basé sur les vrais champs)
  const [services, setServices] = useState<string[]>(filters.services || [])
  const [serviceTypes, setServiceTypes] = useState<string[]>(filters.serviceTypes || [])
  const [specialties, setSpecialties] = useState<string[]>(filters.specialties || [])
  
  // Expériences & Rôles
  const [experienceTypes, setExperienceTypes] = useState<string[]>(filters.experienceTypes || [])
  const [roleTypes, setRoleTypes] = useState<string[]>(filters.roleTypes || [])
  
  // Tarifs
  const [budgetRange, setBudgetRange] = useState(filters.budgetRange || [0, 2000])
  const [minDuration, setMinDuration] = useState(filters.minDuration || '')
  const [acceptsCards, setAcceptsCards] = useState(filters.acceptsCards || false)
  
  // Disponibilité
  const [availability, setAvailability] = useState<string[]>(filters.availability || [])
  const [timeSlots, setTimeSlots] = useState<string[]>(filters.timeSlots || [])
  const [weekendAvailable, setWeekendAvailable] = useState(filters.weekendAvailable || false)
  
  // Qualité
  const [verified, setVerified] = useState(filters.verified || false)
  const [minRating, setMinRating] = useState(filters.minRating || 0)
  const [minReviews, setMinReviews] = useState(filters.minReviews || 0)
  
  // Communication
  const [languages, setLanguages] = useState<string[]>(filters.languages || [])
  
  // Premium
  const [premiumContent, setPremiumContent] = useState(false)
  const [liveCam, setLiveCam] = useState(false)
  const [premiumMessaging, setPremiumMessaging] = useState(false)
  const [privatePhotos, setPrivatePhotos] = useState(false)
  const [exclusiveVideos, setExclusiveVideos] = useState(false)
  

  // Replier certains blocs par défaut sur mobile
  const [openExperienceFilters, setOpenExperienceFilters] = useState(false)
  const [openProfileFilters, setOpenProfileFilters] = useState(false)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDesktop = window.innerWidth >= 768
      setOpenExperienceFilters(isDesktop)
      setOpenProfileFilters(isDesktop)
    }
  }, [])

  // HARMONISATION AVEC DASHBOARD ESCORT - Utiliser exactement les mêmes termes
  // Utilisation directe des constantes du dashboard
  const bodyTypes = SILHOUETTES.map(s => s.toLowerCase())
  const hairColors = CHEVEUX_COULEUR.map(c => c.toLowerCase())
  const eyeColors = YEUX_COULEUR.map(c => c.toLowerCase())
  const ethnicities = ["suissesse", "francaise", "espagnole", "italienne", "allemand", "europeenne", "latine", "asiatique", "africaine", "russe", "orientale", "bresilienne", "moyen-orient", "balkanique", "nordique", "metissee"]

  // Mappings pour l'affichage user-friendly
  const bodyTypeLabels: {[key: string]: string} = {
    "mince": "Mince",
    "sportive": "Sportive",
    "pulpeuse": "Pulpeuse",
    "ronde": "Ronde"
  }

  const hairColorLabels: {[key: string]: string} = {
    "brun": "Brun",
    "blond": "Blond",
    "chatain": "Châtain",
    "gris": "Gris",
    "roux": "Roux",
    "autre": "Autre"
  }

  const eyeColorLabels: {[key: string]: string} = {
    "noir": "Noir",
    "marron": "Marron",
    "vert": "Vert",
    "bleu": "Bleu",
    "gris": "Gris"
  }
  const breastSizes = ["A", "B", "C", "D", "E", "F", "G+"]
  
  // Liste complète des services/pratiques (basée sur les vrais champs)
  const servicesList = [
    // Services de base
    "69", "Anulingus (donne)", "Anulingus (reçois)", "Branlette seins", "Café Pipe",
    "Champagne doré", "Couple", "Cunnilingus", "Doigté anal", "Doigté vaginal",
    
    // Services avancés
    "Domination soft", "Double pénétration", "Duo", "Déjeuner/dîner", "Ejac Facial",
    "Ejac corps", "Ejac en bouche", "Ejac multiple OK", "Facesitting", "Fellation nature",
    
    // Services spécialisés
    "Fellation protégée", "Fellation royale", "Femme fontaine", "Fessées acceptées",
    "Fisting (donne)", "Fisting (reçois)", "French kiss", "Fétichisme", "GFE",
    "Gorge profonde", "Groupe orgie", "Jeux de rôles", "Lingerie", "Massage érotique",
    
    // Services premium
    "Masturbation", "Rapport sexuel", "Service VIP", "Sex toys", "Sodomie (donne)",
    "Sodomie (reçois)", "Soumise", "Striptease"
  ]
  
  const languagesList = ["Français", "Allemand", "Italien", "Anglais", "Espagnol", "Russe", "Ukrainien", "Arabe"]
  const timeSlotsList = ["Matin", "Après-midi", "Soir", "Nuit"]
  const availabilityList = ["Maintenant", "Aujourd'hui", "Cette semaine"]

  // Fonctions utilitaires pour les filtres multi-sélection
  const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item))
    } else {
      setter([...array, item])
    }
  }

  // Appliquer les filtres
  const applyFilters = () => {
    const newFilters = {
      // Filtres de base
      q: filters.q || '',
      city: selectedCity,
      canton: selectedCanton,
      services: services,
      languages: languages,
      status: verified ? 'VERIFIED' : '',
      sort: 'recent',
      categories: selectedCategories,
      
      // Filtres V2 - Tous les filtres disponibles
      availableNow,
      outcall,
      incall,
      weekendAvailable,
      ageRange,
      heightRange,
      bodyType,
      hairColor,
      eyeColor,
      ethnicity,
      breastSize,
      hasTattoos,
      serviceTypes,
      specialties,
      experienceTypes,
      roleTypes,
      budgetRange,
      minDuration,
      acceptsCards,
      availability,
      timeSlots,
      minRating,
      minReviews,
      premiumContent,
      liveCam,
      premiumMessaging,
      privatePhotos,
      exclusiveVideos
    }

    // 📊 Track filters applied
    const activeFilters: string[] = []
    let filterCount = 0

    if (selectedCategories.length > 0) { activeFilters.push('categories'); filterCount++ }
    if (selectedCity) { activeFilters.push('city'); filterCount++; track.filterCity(selectedCity, selectedCanton) }
    if (ageRange[0] !== 18 || ageRange[1] !== 65) { activeFilters.push('age'); filterCount++; track.filterAge(ageRange[0], ageRange[1]) }
    if (services.length > 0) { activeFilters.push('services'); filterCount++; track.filterServices(services) }
    if (languages.length > 0) { activeFilters.push('languages'); filterCount++; track.filterLanguages(languages) }
    if (budgetRange[0] > 0 || budgetRange[1] < 2000) { activeFilters.push('rates'); filterCount++; track.filterRates(budgetRange[0], budgetRange[1]) }
    if (availableNow || incall || outcall) { activeFilters.push('availability'); filterCount++; track.filterAvailability(availableNow, incall, outcall) }
    if (verified) { activeFilters.push('verified'); filterCount++; track.filterVerified(true) }
    if (bodyType) { activeFilters.push('bodyType'); filterCount++ }
    if (hairColor) { activeFilters.push('hairColor'); filterCount++ }
    if (eyeColor) { activeFilters.push('eyeColor'); filterCount++ }
    if (ethnicity) { activeFilters.push('ethnicity'); filterCount++ }

    track.filtersApplied(filterCount, activeFilters)

    onFiltersChange(newFilters)
    onClose()
  }

  // Reset tous les filtres
  const resetFilters = () => {
    // Réinitialiser tous les états locaux
    setSelectedCategories([])
    setSelectedCity('')
    setSelectedCanton('')
    setAvailableNow(false)
    setOutcall(false)
    setIncall(false)
    setWeekendAvailable(false)
    setAgeRange([18, 65])
    setHeightRange([150, 180])
    setBodyType('')
    setHairColor('')
    setEyeColor('')
    setEthnicity('')
    setBreastSize('')
    setHasTattoos('')
    setServices([])
    setAcceptsCards(false)
    setVerified(false)
    setLanguages([])
    setServiceTypes([])
    setSpecialties([])
    setExperienceTypes([])
    setRoleTypes([])
    setBudgetRange([0, 10000])
    setMinDuration('')
    setAvailability([])
    setTimeSlots([])
    setMinRating(0)
    setMinReviews(0)
    setPremiumContent(false)
    setLiveCam(false)
    setPremiumMessaging(false)
    setPrivatePhotos(false)
    setExclusiveVideos(false)
    
    // Appliquer les filtres réinitialisés
    const resetFiltersData = {
      q: filters.q || '', // Garder la recherche textuelle
      city: '',
      canton: '',
      services: [],
      languages: [],
      status: '',
      sort: 'recent',
      categories: [],
      availableNow: false,
      outcall: false,
      incall: false,
      weekendAvailable: false,
      ageRange: [18, 65],
      heightRange: [150, 180],
      bodyType: '',
      hairColor: '',
      eyeColor: '',
      ethnicity: '',
      breastSize: '',
      hasTattoos: '',
      serviceTypes: [],
      specialties: [],
      experienceTypes: [],
      roleTypes: [],
      budgetRange: [0, 10000],
      minDuration: '',
      acceptsCards: false,
      availability: [],
      timeSlots: [],
      minRating: 0,
      minReviews: 0,
      premiumContent: false,
      liveCam: false,
      premiumMessaging: false,
      privatePhotos: false,
      exclusiveVideos: false
    }
    
    // 📊 Track filters reset
    track.filtersReset()

    onFiltersChange(resetFiltersData)
    onClose()
  }


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl"
        style={{
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-black/50 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white">{tFilters('title')}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Contenu des filtres */}
        <div className="p-6 space-y-6">
          {/* Catégories */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">{tFilters('categories')}</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'escort', label: tCategories('escort') },
                { key: 'salon', label: tCategories('salon') },
                { key: 'massage', label: tCategories('massage') },
                { key: 'vip', label: tCategories('vip') },
                { key: 'bdsm', label: tCategories('bdsm') },
                { key: 'privateMedia', label: tCategories('privateMedia') }
              ].map(({ key, label }) => {
                const isSelected = selectedCategories.includes(key)
                return (
                  <button
                    key={key}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCategories(prev => prev.filter(cat => cat !== key))
                      } else {
                        setSelectedCategories(prev => [...prev, key])
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50'
                        : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Géolocalisation */}
          <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
            <h4 className="text-lg font-semibold mb-4 text-cyan-400 flex items-center gap-2">
              <MapPin size={20} />
              {tFilters('location')}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={selectedCanton}
                onChange={(e) => {
                  const canton = e.target.value
                  setSelectedCanton(canton)
                  // Si on change de canton, on reset la ville
                  if (canton !== selectedCanton) {
                    setSelectedCity('')
                  }
                }}
                className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="">{tFilters('chooseCanton')}</option>
                {Object.keys(swissCities).map(canton => (
                  <option key={canton} value={canton}>{canton}</option>
                ))}
              </select>
              
              <select
                value={selectedCity}
                onChange={(e) => {
                  const city = e.target.value
                  setSelectedCity(city)
                  
                  // Si on choisit une ville, on trouve automatiquement son canton
                  if (city) {
                    for (const [canton, cities] of Object.entries(swissCities)) {
                      if (cities.includes(city)) {
                        setSelectedCanton(canton)
                        break
                      }
                    }
                  } else {
                    // Si on efface la ville, on garde le canton
                    // Ne pas reset le canton
                  }
                }}
                className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-500/50 focus:outline-none"
                disabled={!selectedCanton}
              >
                <option value="">{tFilters('chooseCity')}</option>
                {selectedCanton && swissCities[selectedCanton as keyof typeof swissCities]?.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            {/* Options de service */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { key: 'availableNow', label: tFilters('availableNow'), value: availableNow, setter: setAvailableNow },
                { key: 'outcall', label: tFilters('outcall'), value: outcall, setter: setOutcall },
                { key: 'incall', label: tFilters('incall'), value: incall, setter: setIncall }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => filter.setter(!filter.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    filter.value 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                      : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NOTE: Types de Service et Expériences & Styles supprimés */}
            {/* Remplacés par les services organisés du dashboard ci-dessous */}

            {/* Méthodes de paiement - NOUVEAU FILTRE DASHBOARD */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">{tFilters('paymentMethods')}</h4>
              <div className="flex flex-wrap gap-2">
                {PAIEMENTS.map(paiement => (
                  <button
                    key={paiement}
                    onClick={() => toggleArrayItem(serviceTypes, paiement, setServiceTypes)}
                    className={`px-3 py-2 rounded-full text-sm transition-all ${
                      serviceTypes.includes(paiement)
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {paiement}
                  </button>
                ))}
              </div>
            </div>

            {/* Devises acceptées - NOUVEAU FILTRE DASHBOARD */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">{tFilters('currencies')}</h4>
              <div className="flex flex-wrap gap-2">
                {DEVISES.map(devise => (
                  <button
                    key={devise}
                    onClick={() => toggleArrayItem(experienceTypes, devise, setExperienceTypes)}
                    className={`px-3 py-2 rounded-full text-sm transition-all ${
                      experienceTypes.includes(devise)
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                        : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {devise}
                  </button>
                ))}
              </div>
            </div>

            {/* Profil & Physique */}
            <div>
              <button
                onClick={() => setOpenProfileFilters(!openProfileFilters)}
                className="text-lg font-semibold mb-4 text-white flex items-center gap-2"
              >
                {tFilters('profileAndPhysique')} {openProfileFilters ? '▲' : '▼'}
              </button>
              {openProfileFilters && (
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-white/80">{tFilters('age')}: {ageRange[0]} - {ageRange[1]} {tFilters('years')}</span>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="range"
                        min="18"
                        max="65"
                        value={ageRange[0]}
                        onChange={(e) => {
                          const min = Number(e.target.value)
                          setAgeRange([Math.min(min, ageRange[1]), ageRange[1]])
                        }}
                        className="flex-1"
                      />
                      <input
                        type="range"
                        min="18"
                        max="65"
                        value={ageRange[1]}
                        onChange={(e) => {
                          const max = Number(e.target.value)
                          setAgeRange([ageRange[0], Math.max(max, ageRange[0])])
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-white/80">{tFilters('height')}: {heightRange[0]} - {heightRange[1]} cm</span>
                    <input
                      type="range"
                      min="150"
                      max="190"
                      value={heightRange[1]}
                      onChange={(e) => setHeightRange([heightRange[0], Number(e.target.value)])}
                      className="w-full mt-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={bodyType}
                      onChange={(e) => setBodyType(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    >
                      <option value="">{tFilters('allBodyTypes')}</option>
                      {bodyTypes.map(type => (
                        <option key={type} value={type}>{bodyTypeLabels[type]}</option>
                      ))}
                    </select>

                    <select
                      value={hairColor}
                      onChange={(e) => setHairColor(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    >
                      <option value="">{tFilters('hair')}</option>
                      {hairColors.map(color => (
                        <option key={color} value={color}>{hairColorLabels[color]}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={eyeColor}
                      onChange={(e) => setEyeColor(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    >
                      <option value="">{tFilters('eyes')}</option>
                      {eyeColors.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>

                    <select
                      value={breastSize}
                      onChange={(e) => setBreastSize(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    >
                      <option value="">{tFilters('bustSize')}</option>
                      {breastSizes.map(size => (
                        <option key={size} value={size}>{tFilters('cup')} {size}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Services & Spécialités - EXACTEMENT COMME DASHBOARD */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">{tFilters('servicesAndSpecialties')}</h4>
              <div className="max-h-60 overflow-y-auto space-y-4">

                {/* Classiques */}
                <div>
                  <h5 className="text-sm font-medium text-cyan-400 mb-2">{tFilters('classic')}</h5>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES_CLASSIQUES.map(service => (
                      <button
                        key={service}
                        onClick={() => toggleArrayItem(services, service, setServices)}
                        className={`px-2 py-1 rounded-lg text-xs transition-all ${
                          services.includes(service)
                            ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50'
                            : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10'
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Oral */}
                <div>
                  <h5 className="text-sm font-medium text-cyan-400 mb-2">{tFilters('oral')}</h5>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES_ORAL.map(service => (
                      <button
                        key={service}
                        onClick={() => toggleArrayItem(services, service, setServices)}
                        className={`px-2 py-1 rounded-lg text-xs transition-all ${
                          services.includes(service)
                            ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50'
                            : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10'
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Anal */}
                <div>
                  <h5 className="text-sm font-medium text-cyan-400 mb-2">{tFilters('anal')}</h5>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES_ANAL.map(service => (
                      <button
                        key={service}
                        onClick={() => toggleArrayItem(services, service, setServices)}
                        className={`px-2 py-1 rounded-lg text-xs transition-all ${
                          services.includes(service)
                            ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50'
                            : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10'
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BDSM & Fétiches */}
                <div>
                  <h5 className="text-sm font-medium text-cyan-400 mb-2">{tFilters('bdsmAndFetish')}</h5>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES_BDSM.map(service => (
                      <button
                        key={service}
                        onClick={() => toggleArrayItem(services, service, setServices)}
                        className={`px-2 py-1 rounded-lg text-xs transition-all ${
                          services.includes(service)
                            ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50'
                            : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10'
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Massages */}
                <div>
                  <h5 className="text-sm font-medium text-cyan-400 mb-2">{tFilters('massages')}</h5>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES_MASSAGE.map(service => (
                      <button
                        key={service}
                        onClick={() => toggleArrayItem(services, service, setServices)}
                        className={`px-2 py-1 rounded-lg text-xs transition-all ${
                          services.includes(service)
                            ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50'
                            : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10'
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Équipements */}
                <div>
                  <h5 className="text-sm font-medium text-cyan-400 mb-2">{tFilters('equipment')}</h5>
                  <div className="flex flex-wrap gap-2">
                    {EQUIPEMENTS.map(service => (
                      <button
                        key={service}
                        onClick={() => toggleArrayItem(services, service, setServices)}
                        className={`px-2 py-1 rounded-lg text-xs transition-all ${
                          services.includes(service)
                            ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50'
                            : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10'
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {services.length > 0 && (
                <p className="text-xs text-white/60 mt-3">
                  {services.length} {services.length > 1 ? tFilters('servicesSelected') : tFilters('serviceSelected')}
                </p>
              )}
            </div>

            {/* Qualité & Vérification */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">{tFilters('qualityAndVerification')}</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setVerified(!verified)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    verified
                      ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50'
                      : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10'
                  }`}
                >
                  {tFilters('verifiedProfile')}
                </button>
              </div>
            </div>

            {/* Communication - EXACTEMENT COMME DASHBOARD */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">{tFilters('communication')}</h4>
              <div className="flex flex-wrap gap-2">
                {LANGUES_DASHBOARD.map(language => (
                  <button
                    key={language}
                    onClick={() => toggleArrayItem(languages, language, setLanguages)}
                    className={`px-3 py-2 rounded-full text-sm transition-all ${
                      languages.includes(language)
                        ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50'
                        : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {language}
                  </button>
                ))}
              </div>
            </div>

            {/* Clientèle Acceptée - NOUVEAU FILTRE DASHBOARD */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">{tFilters('clienteleAndServices')}</h4>
              <div className="flex flex-wrap gap-2">
                {CLIENTELE.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleArrayItem(serviceTypes, type, setServiceTypes)}
                    className={`px-3 py-2 rounded-full text-sm transition-all ${
                      serviceTypes.includes(type)
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 p-6 border-t border-white/10 bg-black/50 backdrop-blur-sm">
          <div className="space-y-4">
            {/* Tri */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">{tFilters('sortBy')}</label>
              <select
                value={filters.sort || 'recent'}
                onChange={(e) => onFiltersChange({ ...filters, sort: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="recent">{tFilters('mostRecent')}</option>
                <option value="price_low">{tFilters('priceAsc')}</option>
                <option value="price_high">{tFilters('priceDesc')}</option>
                <option value="rating">{tFilters('bestRated')}</option>
                <option value="name">{tFilters('nameAZ')}</option>
              </select>
            </div>
            
            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/15 transition-colors font-medium"
              >
                {tFilters('reset')}
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:from-pink-600 hover:to-purple-600 transition-all"
              >
                {tFilters('search')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}