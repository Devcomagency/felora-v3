'use client'

import React, { useState, useEffect } from 'react'
import { X, MapPin, Filter } from 'lucide-react'

interface SearchFiltersProps {
  filters: {
    q: string
    city: string
    canton: string
    services: string[]
    languages: string[]
    status: string
    sort: string
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

export default function SearchFilters({ filters, onFiltersChange, onClose, isOpen }: SearchFiltersProps) {
  // États des filtres basés sur les vrais champs de la base de données
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCanton, setSelectedCanton] = useState(filters.canton || '')
  const [selectedCity, setSelectedCity] = useState(filters.city || '')
  const [radius, setRadius] = useState(10)
  const [availableNow, setAvailableNow] = useState(false)
  const [outcall, setOutcall] = useState(false)
  const [incall, setIncall] = useState(false)
  
  // Profil & Physique (basé sur les vrais champs)
  const [ageRange, setAgeRange] = useState([18, 65])
  const [heightRange, setHeightRange] = useState([150, 180])
  const [bodyType, setBodyType] = useState('')
  const [hairColor, setHairColor] = useState('')
  const [eyeColor, setEyeColor] = useState('')
  const [ethnicity, setEthnicity] = useState('')
  const [breastSize, setBreastSize] = useState('')
  const [hasTattoos, setHasTattoos] = useState('')
  
  // Services & Types (basé sur les vrais champs)
  const [services, setServices] = useState<string[]>(filters.services || [])
  const [serviceTypes, setServiceTypes] = useState<string[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  
  // Expériences & Rôles
  const [experienceTypes, setExperienceTypes] = useState<string[]>([])
  const [roleTypes, setRoleTypes] = useState<string[]>([])
  
  // Tarifs
  const [budgetRange, setBudgetRange] = useState([0, 2000])
  const [minDuration, setMinDuration] = useState('')
  const [acceptsCards, setAcceptsCards] = useState(false)
  
  // Disponibilité
  const [availability, setAvailability] = useState<string[]>([])
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [weekendAvailable, setWeekendAvailable] = useState(false)
  
  // Qualité
  const [verified, setVerified] = useState(false)
  const [minRating, setMinRating] = useState(0)
  const [minReviews, setMinReviews] = useState(0)
  
  // Communication
  const [languages, setLanguages] = useState<string[]>(filters.languages || [])
  
  // Premium
  const [premiumContent, setPremiumContent] = useState(false)
  const [liveCam, setLiveCam] = useState(false)
  const [premiumMessaging, setPremiumMessaging] = useState(false)
  const [privatePhotos, setPrivatePhotos] = useState(false)
  const [exclusiveVideos, setExclusiveVideos] = useState(false)
  
  // États géolocalisation
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null)
  const [locationEnabled, setLocationEnabled] = useState(false)

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

  // Données pour les dropdowns (basées sur les vrais champs de la DB)
  const bodyTypes = ["Mince", "Normale", "Pulpeuse", "Athlétique", "Courbes", "Grande"]
  const hairColors = ["Blonde", "Brune", "Châtain", "Rousse", "Noir", "Gris", "Autre"]
  const eyeColors = ["Bleus", "Verts", "Marrons", "Noisette", "Gris", "Autre"]
  const ethnicities = ["Européenne", "Africaine", "Asiatique", "Latine", "Arabe", "Métisse", "Autre"]
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
      ...filters,
      city: selectedCity,
      canton: selectedCanton,
      services: services,
      languages: languages,
      status: verified ? 'VERIFIED' : '',
      sort: 'recent'
    }
    onFiltersChange(newFilters)
    onClose()
  }

  // Reset tous les filtres
  const resetFilters = () => {
    setSelectedCategories([])
    setSelectedCity('')
    setSelectedCanton('')
    setRadius(10)
    setAvailableNow(false)
    setOutcall(false)
    setIncall(false)
    setAgeRange([18, 65])
    setHeightRange([150, 180])
    setBodyType('')
    setHairColor('')
    setEyeColor('')
    setBreastSize('')
    setServices([])
    setAcceptsCards(false)
    setVerified(false)
    setLanguages([])
    setLocationEnabled(false)
    setUserLocation(null)
    setServiceTypes([])
    setExperienceTypes([])
    setSelectedCategories([])
  }

  // Fonction pour obtenir la géolocalisation
  const requestLocation = () => {
    if (!navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lon: longitude })
        setLocationEnabled(true)
      },
      (error) => {
        console.log('Erreur géolocalisation:', error.message)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
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
          <h2 className="text-2xl font-bold text-white">Filtres de recherche</h2>
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
            <h4 className="text-lg font-semibold mb-4 text-white">Catégories</h4>
            <div className="flex flex-wrap gap-2">
              {['Escorte', 'Salon', 'Massage', 'VIP', 'BDSM', 'Médias privés'].map((category) => {
                const isSelected = selectedCategories.includes(category.toLowerCase())
                return (
                  <button 
                    key={category}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCategories(prev => prev.filter(cat => cat !== category.toLowerCase()))
                      } else {
                        setSelectedCategories(prev => [...prev, category.toLowerCase()])
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isSelected 
                        ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50' 
                        : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {category}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Géolocalisation */}
          <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
            <h4 className="text-lg font-semibold mb-4 text-cyan-400 flex items-center gap-2">
              <MapPin size={20} />
              Localisation
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Bouton Autour de moi */}
              <button
                onClick={requestLocation}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  locationEnabled 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20'
                }`}
              >
                {locationEnabled ? '📍 Activé' : '📍 Près de moi'}
              </button>

              <select
                value={selectedCanton}
                onChange={(e) => {
                  setSelectedCanton(e.target.value)
                  if (e.target.value) setSelectedCity('')
                }}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
              >
                <option value="">Canton</option>
                <option value="ALL">Tous</option>
                {Object.keys(swissCities).map(canton => (
                  <option key={canton} value={canton}>{canton}</option>
                ))}
              </select>
              
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value)
                  if (e.target.value) setSelectedCanton('')
                }}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
              >
                <option value="">Ville</option>
                {Object.entries(swissCities).map(([canton, cities]) => (
                  <optgroup key={canton} label={canton}>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </optgroup>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/70">{radius}km</span>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            
            {/* Options de service */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { key: 'availableNow', label: 'Dispo maintenant', value: availableNow, setter: setAvailableNow },
                { key: 'outcall', label: 'Se déplace', value: outcall, setter: setOutcall },
                { key: 'incall', label: 'Reçoit', value: incall, setter: setIncall }
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
            {/* Types de Service */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Types de Service</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  'Escorte indépendante', 'Escorte d\'agence', 'Escorte VIP', 
                  'Compagnon/Accompagnement', 'Rendez-vous dîner', 'Compagnon voyage',
                  'Service discret', 'Massage sensuel', 'Webcam / Appel vidéo'
                ].map(serviceType => (
                  <button
                    key={serviceType}
                    onClick={() => toggleArrayItem(serviceTypes, serviceType, setServiceTypes)}
                    className={`px-3 py-2 rounded-full text-sm transition-all ${
                      serviceTypes.includes(serviceType)
                        ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50'
                        : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {serviceType}
                  </button>
                ))}
              </div>
            </div>

            {/* Expériences & Styles */}
            <div>
              <button
                onClick={() => setOpenExperienceFilters(!openExperienceFilters)}
                className="text-lg font-semibold mb-4 text-white flex items-center gap-2"
              >
                Expériences & Styles {openExperienceFilters ? '▲' : '▼'}
              </button>
              {openExperienceFilters && (
                <div className="flex flex-wrap gap-2">
                  {[
                    'GFE (Girlfriend Experience)', 'PSE (Porn Star Experience)', 
                    'Dominant(e)', 'Soumis(e)', 'Switch', 'BDSM friendly',
                    'Jeu de rôle', 'Sensuel/Doux', 'Business/Social'
                  ].map(experience => (
                    <button
                      key={experience}
                      onClick={() => toggleArrayItem(experienceTypes, experience, setExperienceTypes)}
                      className={`px-3 py-2 rounded-full text-sm transition-all ${
                        experienceTypes.includes(experience)
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                          : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10'
                      }`}
                    >
                      {experience}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profil & Physique */}
            <div>
              <button
                onClick={() => setOpenProfileFilters(!openProfileFilters)}
                className="text-lg font-semibold mb-4 text-white flex items-center gap-2"
              >
                Profil & Physique {openProfileFilters ? '▲' : '▼'}
              </button>
              {openProfileFilters && (
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-white/80">Âge: {ageRange[0]} - {ageRange[1]} ans</span>
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
                    <span className="text-sm text-white/80">Taille: {heightRange[0]} - {heightRange[1]} cm</span>
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
                      <option value="">Toutes corpulences</option>
                      {bodyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    
                    <select
                      value={hairColor}
                      onChange={(e) => setHairColor(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    >
                      <option value="">Cheveux</option>
                      {hairColors.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={eyeColor}
                      onChange={(e) => setEyeColor(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    >
                      <option value="">Yeux</option>
                      {eyeColors.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                    
                    <select
                      value={breastSize}
                      onChange={(e) => setBreastSize(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    >
                      <option value="">Taille poitrine</option>
                      {breastSizes.map(size => (
                        <option key={size} value={size}>Bonnet {size}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Services & Spécialités */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Services & Spécialités</h4>
              <div className="max-h-48 overflow-y-auto p-3 border border-white/10 rounded-lg bg-white/2">
                <div className="flex flex-wrap gap-2">
                  {servicesList.map(service => (
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
              {services.length > 0 && (
                <p className="text-xs text-white/60 mt-2">
                  {services.length} service{services.length > 1 ? 's' : ''} sélectionné{services.length > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Qualité & Vérification */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Qualité & Vérification</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setVerified(!verified)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    verified
                      ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50'
                      : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10'
                  }`}
                >
                  Profil vérifié
                </button>
              </div>
            </div>

            {/* Communication */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Communication</h4>
              <div className="flex flex-wrap gap-2">
                {languagesList.map(language => (
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
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 p-6 border-t border-white/10 bg-black/50 backdrop-blur-sm">
          <div className="flex justify-between items-center gap-4">
            <select
              value={filters.sort || 'recent'}
              onChange={(e) => onFiltersChange({ ...filters, sort: e.target.value })}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option value="recent">Plus récent</option>
              <option value="price_low">Prix croissant</option>
              <option value="price_high">Prix décroissant</option>
              <option value="rating">Mieux notées</option>
              <option value="name">Nom A-Z</option>
            </select>
            
            <div className="flex gap-3">
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/15 transition-colors"
              >
                Réinitialiser
              </button>
              <button
                onClick={applyFilters}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:from-pink-600 hover:to-purple-600 transition-all"
              >
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}