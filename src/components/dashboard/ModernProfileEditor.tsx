'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { User, Image, Eye, Heart, Clock, Settings as SettingsIcon, CheckCircle2, AlertTriangle, ShieldCheck, Pause, Calendar, Save, X, BadgeCheck, Search, Loader2, Star, MapPin, ExternalLink, Zap, Trash2 } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { useTranslations } from 'next-intl'
import AddressAutocomplete from '../ui/AddressAutocomplete'
import PremiumAddressAutocomplete from '../ui/PremiumAddressAutocomplete'
import LocationPreviewMap from '../ui/LocationPreviewMap'
import AddressValidator from '../ui/AddressValidator'
import NetworkIndicator from '../ui/NetworkIndicator'
import SimpleRichTextEditor from '../ui/SimpleRichTextEditor'
import { logger } from '@/utils/logger'
import { uploadWithProgress } from '@/utils/uploadWithProgress'
import { SWISS_CANTONS, SWISS_MAJOR_CITIES } from '@/constants/geography'
import { AccountCert } from '@/app/dashboard-escort/HeaderClient'
// import ModernMediaManager from './ModernMediaManager'

const CANTON_MAP: Record<string, string> = {
  GE: 'Genève', VD: 'Vaud', VS: 'Valais', ZH: 'Zurich', BE: 'Berne', BS: 'Bâle',
  FR: 'Fribourg', NE: 'Neuchâtel', LU: 'Lucerne', TI: 'Tessin', SG: 'Saint-Gall',
}

const CITY_BY_CANTON: Record<string, string[]> = {
  GE: ['Genève', 'Carouge', 'Meyrin', 'Vernier', 'Lancy'],
  VD: ['Lausanne', 'Vevey', 'Montreux', 'Yverdon-les-Bains', 'Nyon'],
  ZH: ['Zurich', 'Winterthur', 'Uster', 'Dübendorf'],
  BE: ['Berne', 'Biel/Bienne', 'Thoune'],
  BS: ['Bâle', 'Riehen'],
  VS: ['Sion', 'Sierre', 'Monthey'],
  FR: ['Fribourg', 'Bulle'],
  NE: ['Neuchâtel', 'La Chaux-de-Fonds'],
  LU: ['Lucerne', 'Kriens'],
  TI: ['Lugano', 'Bellinzona', 'Locarno'],
  SG: ['Saint-Gall', 'Rapperswil-Jona'],
}

function detectCantonFromCity(city: string): string | null {
  const c = city.trim().toLowerCase()
  for (const [code, list] of Object.entries(CITY_BY_CANTON)) {
    if (list.some(v => v.toLowerCase() === c)) return code
  }
  return null
}
import { videoCompressor } from '@/lib/video-compression'
import { normalizeScheduleData } from '@/lib/availability-calculator'

interface ProfileData {
  // Informations de base
  stageName: string
  age: number
  description: string
  languages: Record<string, number> // Langue -> niveau (0-5 étoiles)
  
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
  breastType?: 'naturelle' | 'siliconee'
  pubicHair?: 'naturel' | 'rase' | 'partiel'
  smoker?: boolean

  // Services proposés
  serviceType: string[]
  specialties: string[]
  outcall: boolean
  incall: boolean

  // Tarifs et disponibilités
  prices: {
    fifteenMin?: number // Tarif 15 minutes
    thirtyMin?: number // Tarif 30 minutes
    oneHour: number
    twoHours?: number
    halfDay?: number // Demi-journée
    fullDay?: number // Journée complète
    overnight?: number
  }
  availability: string[]
  timeSlots: string[]

  // Localisation
  canton: string
  city: string
  address: string
  coordinates?: { lat: number; lng: number }
  addressPrivacy: 'precise' | 'approximate' // Affichage précis ou zone approximative (150m)
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

// Composant StarRating pour les langues avec checkbox
const StarRating = ({ 
  language, 
  rating, 
  isSelected,
  onToggleLanguage,
  onRatingChange, 
  disabled = false 
}: { 
  language: string
  rating: number
  isSelected: boolean
  onToggleLanguage: (selected: boolean) => void
  onRatingChange: (rating: number) => void
  disabled?: boolean
}) => {
  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isSelected}
          disabled={disabled}
          onChange={(e) => onToggleLanguage(e.target.checked)}
          className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
        />
        <span className="text-sm text-gray-300 w-20">{language}</span>
      </label>
      
      {isSelected && (
        <>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                disabled={disabled}
                onClick={() => onRatingChange(star)}
                className={`transition-colors ${
                  disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                }`}
              >
                <Star
                  size={18}
                  className={`${
                    star <= rating
                      ? 'text-pink-400 fill-pink-400'
                      : 'text-gray-500 hover:text-pink-300'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Composant pour l'onglet Mes Clubs
function MyClubsTab() {
  const t = useTranslations('dashboardEscort.profil')
  const [invitations, setInvitations] = useState<any[]>([])
  const [clubs, setClubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [subTab, setSubTab] = useState<'invitations' | 'clubs'>('invitations')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Charger les invitations reçues
      const invRes = await fetch('/api/club-escort-invitations?type=received')
      const invData = await invRes.json()
      if (invData.success) {
        setInvitations(invData.data || [])
      }

      // Charger les clubs liés
      const clubsRes = await fetch('/api/escort/my-clubs')
      const clubsData = await clubsRes.json()
      if (clubsData.success) {
        setClubs(clubsData.data || [])
      }
    } catch (error) {
      console.error('Error loading clubs data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvitation = async (invitationId: string, action: 'accept' | 'decline') => {
    try {
      const res = await fetch(`/api/club-escort-invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      const data = await res.json()
      if (data.success) {
        loadData()
      }
    } catch (error) {
      console.error('Error handling invitation:', error)
    }
  }

  const handleRemoveClub = async (linkId: string, clubName: string) => {
    if (!confirm(t('clubs.myClubs.leaveConfirm', { clubName }))) return

    try {
      const res = await fetch(`/api/club-escort-links/${linkId}`, {
        method: 'DELETE'
      })

      const data = await res.json()
      if (data.success) {
        loadData()
      }
    } catch (error) {
      console.error('Error removing club:', error)
    }
  }

  const pendingInvitations = invitations.filter(inv => inv.status === 'PENDING')
  const processedInvitations = invitations.filter(inv => inv.status !== 'PENDING')

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
      {/* Header avec onglets */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setSubTab('invitations')}
          className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            subTab === 'invitations'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700/50 text-gray-400 hover:text-white'
          }`}
        >
          {t('clubs.tabs.invitations')} ({pendingInvitations.length})
        </button>
        <button
          onClick={() => setSubTab('clubs')}
          className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            subTab === 'clubs'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700/50 text-gray-400 hover:text-white'
          }`}
        >
          {t('clubs.tabs.myClubs')} ({clubs.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-purple-400" size={32} />
        </div>
      ) : (
        <>
          {/* Onglet Invitations */}
          {subTab === 'invitations' && (
            <div className="space-y-3">
              {pendingInvitations.length > 0 ? (
                pendingInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20"
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                      {inv.club?.avatar ? (
                        <img
                          src={inv.club.avatar}
                          alt={inv.club.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <BadgeCheck size={20} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium text-lg truncate">
                        {inv.club?.name || 'Club'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {t('clubs.invitations.received')} {new Date(inv.sentAt).toLocaleDateString('fr-FR')}
                      </div>
                      {inv.message && (
                        <div className="text-sm text-gray-300 mt-1 italic line-clamp-2">
                          "{inv.message}"
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {t('clubs.invitations.expires')} {new Date(inv.expiresAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleInvitation(inv.id, 'accept')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                      >
                        <CheckCircle2 size={18} />
                        {t('clubs.invitations.accept')}
                      </button>
                      <button
                        onClick={() => handleInvitation(inv.id, 'decline')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
                      >
                        <X size={18} />
                        {t('clubs.invitations.decline')}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <Clock size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">{t('clubs.invitations.noInvitations')}</p>
                  <p className="text-sm mt-2">
                    {t('clubs.invitations.noInvitationsDescription')}
                  </p>
                </div>
              )}

              {/* Historique des invitations traitées */}
              {processedInvitations.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-white font-semibold mb-3">{t('clubs.invitations.history')}</h3>
                  <div className="space-y-2">
                    {processedInvitations.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                          {inv.club?.avatar ? (
                            <img
                              src={inv.club.avatar}
                              alt={inv.club.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <BadgeCheck size={16} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="text-white text-sm font-medium">
                            {inv.club?.name || 'Club'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(inv.sentAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>

                        <div>
                          {inv.status === 'ACCEPTED' && (
                            <span className="text-green-400 text-sm">{t('clubs.invitations.accepted')}</span>
                          )}
                          {inv.status === 'DECLINED' && (
                            <span className="text-red-400 text-sm">{t('clubs.invitations.declined')}</span>
                          )}
                          {inv.status === 'EXPIRED' && (
                            <span className="text-gray-400 text-sm">{t('clubs.invitations.expired')}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Onglet Mes Clubs */}
          {subTab === 'clubs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubs.length > 0 ? (
                clubs.map((club) => (
                  <div
                    key={club.id}
                    className="rounded-xl overflow-hidden bg-gray-700/30 border border-gray-600/50 hover:border-purple-500/50 transition-all"
                  >
                    {/* Header avec image */}
                    <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 relative">
                      {club.avatar ? (
                        <img
                          src={club.avatar}
                          alt={club.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BadgeCheck size={48} className="text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-lg mb-1 truncate">{club.name}</h3>
                      <p className="text-gray-400 text-sm mb-3">@{club.handle}</p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <a
                          href={`/profile-test/club/${club.handle}`}
                          target="_blank"
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm font-medium"
                        >
                          <ExternalLink size={14} />
                          {t('clubs.myClubs.viewProfile')}
                        </a>
                        <button
                          onClick={() => handleRemoveClub(club.linkId, club.name)}
                          className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          title={t('clubs.myClubs.leaveClub')}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-400 py-12">
                  <BadgeCheck size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">{t('clubs.myClubs.noClubs')}</p>
                  <p className="text-sm mt-2">
                    {t('clubs.myClubs.noClubsDescription')}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function ModernProfileEditor({ agendaOnly = false }: { agendaOnly?: boolean }) {
  const t = useTranslations('dashboardEscort.profil')
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('basic')
  const fileInputsRef = useRef<Array<HTMLInputElement | null>>([])
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [mandatoryMedia, setMandatoryMedia] = useState<Array<{ file?: File; preview?: string; id?: string; uploading?: boolean }>>(
    () => Array.from({ length: 1 }, () => ({ file: undefined, preview: undefined, id: undefined, uploading: false }))
  )
  // Prix toujours visibles; plus de repli
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null)
  const [autoSaveMsg, setAutoSaveMsg] = useState<string | null>(null)
  const autoSaveTimer = useRef<any>(null)
  const [status, setStatus] = useState<'PENDING' | 'ACTIVE' | 'PAUSED' | 'VERIFIED'>('PENDING')
  const [kycVerified, setKycVerified] = useState(false)
  const [kycStatus, setKycStatus] = useState<'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NONE')
  const [hasEscortProfile, setHasEscortProfile] = useState<boolean | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const savedSnapshotRef = useRef<Partial<ProfileData>>({})
  const [pauseOpen, setPauseOpen] = useState(false)
  const [pauseReturnAt, setPauseReturnAt] = useState<string>('')

  // 🆕 Nouveaux états pour améliorations
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({}) // Progress par slot
  const [selectedMediaForBulk, setSelectedMediaForBulk] = useState<Set<number>>(new Set()) // Bulk management
  const [selectionMode, setSelectionMode] = useState(false) // Mode sélection multiple
  const [customPrices, setCustomPrices] = useState<Array<{ id: string; label: string; duration: string; price: number }>>([]) // Custom pricing
  const [blockedCountries, setBlockedCountries] = useState<Set<string>>(new Set()) // Pays bloqués
  // Charger les médias existants (positions 1-6)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/profile/unified/me', { cache: 'no-store', credentials: 'include' })
        const j = await res.json().catch(() => ({}))
        const gallery = j?.profile?.galleryPhotos
        const slots = Array.from({ length: 1 }, () => ({ file: undefined as File|undefined, preview: undefined as string|undefined, id: undefined as string|undefined, uploading: false }))
        if (gallery) {
          let arr: any[] = []
          try { arr = Array.isArray(gallery) ? gallery : JSON.parse(gallery) } catch { arr = [] }
          for (const it of arr) {
            const s = Number(it?.slot)
            // Ne charger que le premier slot (photo de profil)
            if (Number.isFinite(s) && s === 0 && it?.url) {
              slots[s] = { file: undefined, preview: String(it.url), id: String(it.id || `slot-${s}`), uploading: false }
            }
          }
        }
        // N'écrase pas si aucun média serveur (évite d'annuler un upload en cours)
        const serverCount = slots.filter(s => !!s.preview).length
        if (!cancelled && serverCount > 0) setMandatoryMedia(slots)

        // Charger les pays bloqués
        if (j?.profile?.blockedCountries) {
          const blocked = Array.isArray(j.profile.blockedCountries)
            ? j.profile.blockedCountries
            : JSON.parse(j.profile.blockedCountries || '[]')
          if (!cancelled) setBlockedCountries(new Set(blocked))
        }
      } catch (e) {
        // ignore erreurs silencieusement
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Initial snapshot (after first paint)
  useEffect(() => {
    savedSnapshotRef.current = profileData
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Écouter les événements de détection de ville depuis la géolocalisation
  useEffect(() => {
    const handleAddressCityDetected = (event: any) => {
      const { city, canton } = event.detail
      if (city) {
        updateProfileData('city', city)
      }
      if (canton) {
        updateProfileData('canton', canton)
      }
    }

    window.addEventListener('addressCityDetected', handleAddressCityDetected)
    
    return () => {
      window.removeEventListener('addressCityDetected', handleAddressCityDetected)
    }
  }, [])

  // React to ?tab=... changes (e.g., Agenda from footer)
  const searchParams = useSearchParams()
  useEffect(() => {
    try {
      if (agendaOnly) {
        setActiveTab('agenda')
        return
      }
      const tab = searchParams.get('tab')
      if (tab && ['basic','appearance','services','pricing','agenda','clubs'].includes(tab)) {
        setActiveTab(tab)
      }
    } catch {}
  }, [searchParams, agendaOnly])

  // (moved agendaOnly rendering below after weekly/pause state declarations)

  // Keyboard shortcut: Cmd/Ctrl+S to save
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        manualSave()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Charger statut (badge KYC + statut)
  useEffect(() => {
    let cancelled = false
    const loadStatus = async () => {
      try {
        // Ensure escort profile exists
        const m = await fetch('/api/me/escort-profile', { cache: 'no-store', credentials:'include' }).then(r=>r.json()).catch(()=>({hasEscortProfile:false}))
        if (!cancelled) setHasEscortProfile(!!m?.hasEscortProfile)
        if (m && !m.hasEscortProfile) {
          await fetch('/api/escort/profile/init', { method:'POST', credentials:'include' }).catch(()=>{})
          setHasEscortProfile(true)
        }
        const r = await fetch('/api/escort/profile/status', { cache: 'no-store', credentials: 'include' })
        const d = await r.json().catch(() => null)
        if (!cancelled && d) {
          if (d.status) setStatus(d.status)
          if (typeof d.isVerifiedBadge === 'boolean') setKycVerified(!!d.isVerifiedBadge)
        }
        // KYC status (optional)
        try {
          const rk = await fetch('/api/kyc-v2/status', { cache: 'no-store', credentials: 'include' })
          const dk = await rk.json().catch(() => null)
          if (!cancelled && dk?.status) setKycStatus(dk.status)
        } catch {}
      } catch {}
    }
    loadStatus()
    return () => { cancelled = true }
  }, [])
  const [profileData, setProfileData] = useState<Partial<ProfileData>>({
    stageName: '',
    age: undefined as any,
    description: '',
    languages: {},
    height: undefined as any,
    weight: undefined as any,
    bodyType: '',
    breastSize: '',
    hairColor: '',
    hairLength: '',
    eyeColor: '',
    ethnicity: '',
    tattoos: false,
    piercings: false,
    breastType: undefined,
    pubicHair: undefined,
    smoker: undefined,
    serviceType: [],
    specialties: [],
    outcall: false,
    incall: false,
    prices: { oneHour: undefined as any },
    availability: [],
    timeSlots: [],
    canton: '',
    city: '',
    address: '',
    addressPrivacy: 'precise' as 'precise' | 'approximate',
    phoneVisibility: 'hidden',
    acceptsCouples: false,
    acceptsWomen: false,
    acceptsHandicapped: false,
    acceptsSeniors: false,
    gfe: false,
    pse: false,
    duoTrio: false,
    showPrices: true
  })

  // Load persisted profile data into editor on mount
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch('/api/profile/unified/me', { cache: 'no-store', credentials: 'include' })
        const j = await r.json()
        if (!r.ok || !j?.profile || cancelled) return
        const p = j.profile
        logger.log('🔄 [PHYSICAL DEBUG] Données reçues de l\'API unified:', {
          physical: p.physical,
          hasPhysical: !!p.physical,
          physicalKeys: p.physical ? Object.keys(p.physical) : 'undefined'
        })
        const processedPrices = {
          fifteenMin: p.rates?.fifteenMin !== null && p.rates?.fifteenMin !== undefined && p.rates?.fifteenMin > 0 ? p.rates.fifteenMin : null,
          thirtyMin: p.rates?.thirtyMin !== null && p.rates?.thirtyMin !== undefined && p.rates?.thirtyMin > 0 ? p.rates.thirtyMin : null,
          oneHour: p.rates?.oneHour !== null && p.rates?.oneHour !== undefined && p.rates?.oneHour > 0 ? p.rates.oneHour : null,
          twoHours: p.rates?.twoHours !== null && p.rates?.twoHours !== undefined && p.rates?.twoHours > 0 ? p.rates.twoHours : null,
          halfDay: p.rates?.halfDay !== null && p.rates?.halfDay !== undefined && p.rates?.halfDay > 0 ? p.rates.halfDay : null,
          fullDay: p.rates?.fullDay !== null && p.rates?.fullDay !== undefined && p.rates?.fullDay > 0 ? p.rates.fullDay : null,
          overnight: p.rates?.overnight !== null && p.rates?.overnight !== undefined && p.rates?.overnight > 0 ? p.rates.overnight : null
        }
        setProfileData(prev => ({
          ...prev,
          stageName: p.stageName || '',
          description: p.description || '',
          age: p.age || undefined, // Déjà calculé par l'API unifiée
          languages: p.languages || {}, // Déjà parsé par l'API unifiée
          serviceType: p.category ? [p.category] : [], // Catégorie déjà extraite par l'API
          outcall: p.availability?.outcall || false,
          incall: p.availability?.incall || false,
          prices: processedPrices,
          canton: p.canton || '',
          city: p.city || '',
          address: p.address || '', // Adresse unifiée déjà construite par l'API
          coordinates: p.coordinates || undefined,
          addressPrivacy: p.addressPrivacy || 'precise',
          phone: p.user?.phone || '',
          phoneVisibility: p.phoneVisibility || 'hidden',
          height: (() => {
            const height = p.physical?.height || undefined
            logger.log('🔄 [PHYSICAL DEBUG] Chargement height depuis API:', { raw: p.physical?.height, processed: height })
            return height
          })(),
          bodyType: (() => {
            const bodyType = p.physical?.bodyType || ''
            logger.log('🔄 [PHYSICAL DEBUG] Chargement bodyType depuis API:', { raw: p.physical?.bodyType, processed: bodyType })
            return bodyType
          })(),
          hairColor: (() => {
            const hairColor = p.physical?.hairColor || ''
            logger.log('🔄 [PHYSICAL DEBUG] Chargement hairColor depuis API:', { raw: p.physical?.hairColor, processed: hairColor })
            return hairColor
          })(),
          hairLength: '', // hairLength n'est pas encore disponible dans l'API unifiée
          eyeColor: (() => {
            const eyeColor = p.physical?.eyeColor || ''
            logger.log('🔄 [PHYSICAL DEBUG] Chargement eyeColor depuis API:', { raw: p.physical?.eyeColor, processed: eyeColor })
            return eyeColor
          })(),
          ethnicity: (() => {
            const ethnicity = p.physical?.ethnicity || ''
            logger.log('🔄 [PHYSICAL DEBUG] Chargement ethnicity depuis API:', { raw: p.physical?.ethnicity, processed: ethnicity })
            return ethnicity
          })(),
          breastSize: (() => {
            const breastSize = p.physical?.bustSize || ''
            logger.log('🔄 [PHYSICAL DEBUG] Chargement breastSize depuis API (bustSize):', { raw: p.physical?.bustSize, processed: breastSize })
            return breastSize
          })(),
          breastType: p.physical?.breastType || undefined,
          pubicHair: p.physical?.pubicHair || undefined,
          smoker: p.physical?.smoker,
          tattoos: p.physical?.tattoos || false,
          piercings: p.physical?.piercings || false,
          acceptsCouples: (() => {
            const acceptsCouples = p.clientele?.acceptsCouples || false
            logger.log('🔄 [CLIENTELE DEBUG] Chargement acceptsCouples depuis API:', { raw: p.clientele?.acceptsCouples, processed: acceptsCouples })
            return acceptsCouples
          })(),
          acceptsWomen: (() => {
            const acceptsWomen = p.clientele?.acceptsWomen || false
            logger.log('🔄 [CLIENTELE DEBUG] Chargement acceptsWomen depuis API:', { raw: p.clientele?.acceptsWomen, processed: acceptsWomen })
            return acceptsWomen
          })(),
          acceptsHandicapped: (() => {
            const acceptsHandicapped = p.clientele?.acceptsHandicapped || false
            logger.log('🔄 [CLIENTELE DEBUG] Chargement acceptsHandicapped depuis API:', { raw: p.clientele?.acceptsHandicapped, processed: acceptsHandicapped })
            return acceptsHandicapped
          })(),
          acceptsSeniors: (() => {
            const acceptsSeniors = p.clientele?.acceptsSeniors || false
            logger.log('🔄 [CLIENTELE DEBUG] Chargement acceptsSeniors depuis API:', { raw: p.clientele?.acceptsSeniors, processed: acceptsSeniors })
            return acceptsSeniors
          })(),
          specialties: (() => {
            // Récupérer les specialties existantes (depuis practices filtrées)
            const existingSpecialties = (p.specialties || [])
            
            // Récupérer les amenities (opt:)
            const amenities = (p.options?.amenities || []).map((item: string) =>
              item.startsWith('opt:') || item.startsWith('srv:') ? item : `opt:${item}`
            )
            
            // IMPORTANT: Récupérer les services depuis p.services et ajouter le préfixe srv: s'il n'existe pas
            const services = (p.services || []).map((item: string) =>
              item.startsWith('srv:') ? item : `srv:${item}`
            )
            
            // Combiner tout
            const allSpecialties = [...existingSpecialties, ...amenities, ...services]
            
            logger.log('[DASHBOARD] Chargement specialties:', {
              existingSpecialties,
              amenities,
              services,
              allSpecialties
            })
            
            return allSpecialties
          })(),
        }))


        // Parse agenda (timeSlots JSON) - Garde la logique actuelle car l'API unifiée ne transforme pas les timeSlots
        try {
          // Utiliser les données brutes pour l'agenda car c'est spécifique au dashboard
          const rawTimeSlots = p.timeSlots // L'API unifiée en mode dashboard inclut ce champ
          logger.log('🔄 [AGENDA DEBUG] Chargement agenda depuis API:', {
            rawTimeSlots,
            type: typeof rawTimeSlots,
            isEmpty: rawTimeSlots === '' || rawTimeSlots === null || rawTimeSlots === undefined
          })
          const sched = normalizeScheduleData(rawTimeSlots)
          logger.log('🔄 [AGENDA DEBUG] Schedule normalisé:', sched)
          
          if (sched?.weekly && Array.isArray(sched.weekly)) {
            const mapDays = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche']
            const nextWeekly: Record<string, DaySlot> = {} as Record<string, DaySlot>
            for (let i = 0; i < mapDays.length; i++) {
              const w = sched.weekly.find((it: any) => Number(it.weekday) === i)
              const dayKey = mapDays[i]
              nextWeekly[dayKey] = {
                enabled: !!w?.enabled,
                start: String(w?.start || '10:00'),
                end: String(w?.end || '22:00')
              }
            }
            logger.log('[DASHBOARD] Setting weekly schedule:', nextWeekly)
            setWeekly(nextWeekly)
          }

          if (sched?.pause) {
            logger.log('[DASHBOARD] Setting pause:', sched.pause)
            setPauseEnabled(true)
            setPauseStart(String(sched.pause.start || ''))
            setPauseEnd(String(sched.pause.end || ''))
          } else {
            logger.log('[DASHBOARD] No pause, resetting')
            setPauseEnabled(false)
            setPauseStart('')
            setPauseEnd('')
          }

          if (Array.isArray(sched?.absences)) {
            logger.log('[DASHBOARD] Setting absences:', sched.absences)
            setAbsences(sched.absences.map((a: any, idx: number) => ({ id: String(a.id || idx), start: String(a.start || ''), end: String(a.end || '') })))
          } else {
            logger.log('[DASHBOARD] No absences, resetting')
            setAbsences([])
          }
        } catch (error) {
          console.error('[DASHBOARD] Error parsing agenda:', error)
        }

        // 🆕 Charger les tarifs personnalisés
        try {
          if (p.customPrices) {
            const parsed = typeof p.customPrices === 'string' ? JSON.parse(p.customPrices) : p.customPrices
            if (Array.isArray(parsed)) {
              setCustomPrices(parsed)
              logger.log('💰 [CUSTOM PRICING] Tarifs personnalisés chargés:', parsed)
            }
          }
        } catch (error) {
          logger.warn('[DASHBOARD] Error parsing customPrices:', error)
        }

        // Ce code n'est plus nécessaire - le blocage géographique est chargé dans le premier useEffect

      } catch {}
    })()
    return () => { cancelled = true }
  }, [])


  const tabs = [
    { key: 'basic', label: t('tabs.basic.label'), icon: User, description: t('tabs.basic.description') },
    { key: 'appearance', label: t('tabs.appearance.label'), icon: Eye, description: t('tabs.appearance.description') },
    { key: 'services', label: t('tabs.services.label'), icon: Heart, description: t('tabs.services.description') },
    { key: 'pricing', label: t('tabs.pricing.label'), icon: Clock, description: t('tabs.pricing.description') },
    { key: 'agenda', label: t('tabs.agenda.label'), icon: Calendar, description: t('tabs.agenda.description') },
    { key: 'clubs', label: t('tabs.clubs.label'), icon: BadgeCheck, description: t('tabs.clubs.description') },
  ]

  const updateProfileData = (field: string, value: any) => {
    logger.log(`🔄 [PHYSICAL DEBUG] updateProfileData appelé:`, { field, value, type: typeof value })
    setProfileData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }
      logger.log(`📝 [PHYSICAL DEBUG] Nouveau profileData après update:`, {
        field,
        oldValue: prev[field as keyof ProfileData],
        newValue: value,
        physicalFields: {
          bodyType: newData.bodyType,
          hairColor: newData.hairColor,
          eyeColor: newData.eyeColor,
          ethnicity: newData.ethnicity,
          breastSize: newData.breastSize,
          height: newData.height
        }
      })
      return newData
    })
  }

  const updateNestedProfileData = (parent: string, field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof ProfileData] as any || {}),
        [field]: value
      }
    }))
  }

  const toggleArrayItem = (field: string, item: string) => {
    const currentArray = profileData[field as keyof ProfileData] as string[] || []
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item]
    updateProfileData(field, newArray)
  }

  const updateLanguageRating = (language: string, rating: number) => {
    const currentLanguages = profileData.languages || {}
    const newLanguages = { ...currentLanguages, [language]: rating }
    logger.log('🔄 [DASHBOARD] Updating language rating:', { language, rating, newLanguages })
    updateProfileData('languages', newLanguages)
  }

  const toggleLanguageSelection = (language: string, selected: boolean) => {
    const currentLanguages = profileData.languages || {}
    if (selected) {
      // Si on sélectionne la langue, on met 5 étoiles par défaut
      const newLanguages = { ...currentLanguages, [language]: 5 }
      updateProfileData('languages', newLanguages)
    } else {
      // Si on désélectionne, on supprime la langue
      const newLanguages = { ...currentLanguages }
      delete newLanguages[language]
      updateProfileData('languages', newLanguages)
    }
  }

  // Agenda (drawer) state
  type DaySlot = { enabled: boolean; start: string; end: string }
  const [weekly, setWeekly] = useState<Record<string, DaySlot>>({
    Lundi:   { enabled: false, start: '10:00', end: '22:00' },
    Mardi:   { enabled: false, start: '10:00', end: '22:00' },
    Mercredi:{ enabled: false, start: '10:00', end: '22:00' },
    Jeudi:   { enabled: false, start: '10:00', end: '22:00' },
    Vendredi:{ enabled: false, start: '10:00', end: '22:00' },
    Samedi:  { enabled: false, start: '10:00', end: '02:00' },
    Dimanche:{ enabled: false, start: '14:00', end: '02:00' },
  })
  const [pauseEnabled, setPauseEnabled] = useState(false)
  const [pauseStart, setPauseStart] = useState<string>('')
  const [pauseEnd, setPauseEnd] = useState<string>('')
  const [absences, setAbsences] = useState<Array<{ id: string; start: string; end: string }>>([])

  // Persist agenda when in agendaOnly mode (debounced)
  useEffect(() => {
    if (!agendaOnly) return
    const timer = setTimeout(async () => {
      try {
        const mapDays = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche']
        const packed = mapDays.map((d, idx) => ({ weekday: idx, ...weekly[d as keyof typeof weekly] }))
        const body = {
          timeSlots: JSON.stringify({ weekly: packed, pause: pauseEnabled ? { start: pauseStart, end: pauseEnd } : null, absences }),
        }
        await fetch('/api/profile/unified/me', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body)
        })
      } catch {}
    }, 700)
    return () => clearTimeout(timer)
  }, [agendaOnly, weekly, pauseEnabled, pauseStart, pauseEnd, absences])

  // If agendaOnly, render only the Agenda section (after state is initialized)
  if (agendaOnly) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">{t('agenda.title')}</h3>
          <div className="space-y-6">
            <div>
              <label className="inline-flex items-center gap-2 text-sm text-white/90">
              </label>
            </div>
            <div>
              <div className="text-sm text-white/90 font-medium mb-2">{t('agenda.weeklySchedule')}</div>
              <div className="space-y-2">
                {Object.entries(weekly).map(([day, slot]) => (
                  <div key={day} className="flex items-center gap-2">
                    <div className="w-28 text-white/90">{day}</div>
                    <label className="inline-flex items-center gap-2"><input type="checkbox" checked={slot.enabled} onChange={(e)=> setWeekly(prev => ({ ...prev, [day]: { ...slot, enabled: e.target.checked } }))} /> <span className="text-sm text-white/80">{slot.enabled ? '✅' : '❌'}</span></label>
                    <input type="time" value={slot.start} onChange={(e)=> setWeekly(prev => ({ ...prev, [day]: { ...slot, start: e.target.value } }))} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm"/>
                    <span className="text-white/60">-</span>
                    <input type="time" value={slot.end} onChange={(e)=> setWeekly(prev => ({ ...prev, [day]: { ...slot, end: e.target.value } }))} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm"/>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 text-sm text-white/90">
                <input type="checkbox" checked={pauseEnabled} onChange={(e)=> setPauseEnabled(e.target.checked)} /> {t('agenda.pause')}
              </label>
              {pauseEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/70 mb-1">{t('agenda.pauseStart')}</label>
                    <input type="datetime-local" value={pauseStart} onChange={(e)=> setPauseStart(e.target.value)} className="w-full px-2 py-2 rounded bg-white/5 border border-white/10 text-white text-sm"/>
                  </div>
                  <div>
                    <label className="block text-xs text-white/70 mb-1">{t('agenda.pauseReturn')}</label>
                    <input type="datetime-local" value={pauseEnd} onChange={(e)=> setPauseEnd(e.target.value)} className="w-full px-2 py-2 rounded bg-white/5 border border-white/10 text-white text-sm"/>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-sm text-white/90 font-medium">{t('agenda.absences')}</div>
              <button onClick={()=> setAbsences(prev => [...prev, { id: Math.random().toString(36).slice(2), start: new Date().toISOString().slice(0,10), end: new Date().toISOString().slice(0,10) }])} className="px-3 py-2 rounded-lg border w-fit bg-white/5 hover:bg-white/10 text-white border-white/10">{t('agenda.addAbsence')}</button>
              <div className="space-y-2">
                {absences.map((a) => (
                  <div key={a.id} className="flex items-center gap-2">
                    <input type="date" value={a.start} onChange={(e)=> setAbsences(prev => prev.map(x => x.id===a.id ? { ...x, start: e.target.value } : x))} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm"/>
                    <span className="text-white/60">→</span>
                    <input type="date" value={a.end} onChange={(e)=> setAbsences(prev => prev.map(x => x.id===a.id ? { ...x, end: e.target.value } : x))} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm"/>
                    <button onClick={()=> setAbsences(prev => prev.filter(x => x.id!==a.id))} className="text-white/70 hover:text-white">×</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs text-white/70 border-t border-white/10 pt-3">
              Les changements sont enregistrés automatiquement. {autoSaveMsg && <span className="text-emerald-300 ml-1">{autoSaveMsg}</span>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Checks & completion
  const requiredChecks = useMemo(() => {
    const checks: Array<{ key: string; label: string; ok: boolean; targetTab: string }> = []
    const mediasOk = mandatoryMedia.filter(m => !!m.preview).length === 1
    checks.push({ key: 'medias', label: t('requiredChecks.profilePhoto'), ok: mediasOk, targetTab: 'basic' })
    checks.push({ key: 'stageName', label: t('requiredChecks.stageName'), ok: !!profileData.stageName, targetTab: 'basic' })
    checks.push({ key: 'age', label: t('requiredChecks.age'), ok: profileData.age !== undefined && profileData.age > 0, targetTab: 'basic' })
    checks.push({ key: 'description', label: t('requiredChecks.description'), ok: (profileData.description||'').trim().length >= 200, targetTab: 'basic' })
    return checks
  }, [mandatoryMedia, profileData.stageName, profileData.age, profileData.description])

  const completionPct = useMemo(() => {
    const total = requiredChecks.length
    const ok = requiredChecks.filter(c => c.ok).length
    return Math.round((ok/total)*100)
  }, [requiredChecks])

  // Propagate completion to header (live)
  useEffect(() => {
    try {
      // Only emit event if completionPct is a valid number to avoid 'pct' undefined errors
      if (typeof completionPct === 'number' && !isNaN(completionPct)) {
        window.dispatchEvent(new CustomEvent('profile:progress', { detail: { pct: completionPct } }))
      }
    } catch {}
  }, [completionPct])

  // Autosave (700ms debounce)
  const scheduleToJson = () => {
    const mapDays = [t('agenda.days.Lundi'),t('agenda.days.Mardi'),t('agenda.days.Mercredi'),t('agenda.days.Jeudi'),t('agenda.days.Vendredi'),t('agenda.days.Samedi'),t('agenda.days.Dimanche')]
    const packed = mapDays.map((d, idx) => ({ weekday: idx, ...weekly[d as keyof typeof weekly] }))
    const result = { weekly: packed, pause: pauseEnabled ? { start: pauseStart, end: pauseEnd } : null, absences }
    logger.log('🔄 [AGENDA DEBUG] Conversion schedule vers JSON:', result)
    
    // Vérifier si l'agenda a des données valides
    const hasValidData = packed.some(day => day.enabled) || 
                        (pauseEnabled && pauseStart && pauseEnd) || 
                        (absences && absences.length > 0)
    
    logger.log('🔄 [AGENDA DEBUG] Agenda a des données valides:', hasValidData)
    
    if (!hasValidData) {
      logger.log('⚠️ [AGENDA DEBUG] Aucune donnée valide dans l\'agenda, retourne null')
      return null
    }
    
    return JSON.stringify(result)
  }

  // Fonction pour éviter le sur-échappement JSON
  const safeStringify = (data: any) => {
    if (Array.isArray(data)) return JSON.stringify(data)
    if (typeof data === 'string') return data
    return JSON.stringify(data)
  }

  const doSave = async (payload: any, silent = false, retryCount = 0): Promise<boolean> => {
    const maxRetries = 3
    logger.log('🚀 [DEBUG] doSave appelée avec payload:', payload)
    logger.log('🔍 [PHYSICAL DEBUG] Payload physical dans doSave:', {
      hasPhysical: !!payload.physical,
      physical: payload.physical,
      physicalKeys: payload.physical ? Object.keys(payload.physical) : 'undefined'
    })
    try {
      logger.log('🌐 [DEBUG] Envoi requête à /api/profile/unified/me')
      const res = await fetch('/api/profile/unified/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      logger.log('📡 [DEBUG] Réponse reçue, status:', res.status)
      const data = await res.json().catch(() => ({}))
      logger.log('📦 [DEBUG] Données de réponse API:', data)

      // Si erreur 500 ou 401, on retry automatiquement
      if ((res.status === 500 || res.status === 401) && retryCount < maxRetries) {
        logger.log(`🔄 [DASHBOARD] Retry ${retryCount + 1}/${maxRetries} pour erreur ${res.status}`)
        if (!silent) setSaveMsg({ type: 'warning', text: `Retry ${retryCount + 1}/${maxRetries}...` })
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))) // Délai progressif
        return doSave(payload, silent, retryCount + 1)
      }

      if (!res.ok || !data?.success) throw new Error(data?.message || data?.error || t('save.error'))
      if (!silent) setSaveMsg({ type: 'success', text: data.message || t('save.saved') })
      if (!silent) setTimeout(() => setSaveMsg(null), 3000)
      if (silent) {
        setAutoSaveMsg(t('save.saved') + ' ✓')
        setTimeout(() => setAutoSaveMsg(null), 1200)
      }
      return true
    } catch (err: any) {
      const errorMsg = err?.message || t('save.error')
      if (retryCount >= maxRetries) {
        if (!silent) setSaveMsg({ type: 'error', text: t('save.retryFailed', { error: errorMsg, max: maxRetries }) })
      } else if (!silent) {
        setSaveMsg({ type: 'error', text: errorMsg })
      }
      return false
    }
  }

  // Auto-save quand l'agenda change
  useEffect(() => {
    triggerAutoSave()
  }, [weekly, pauseEnabled, pauseStart, pauseEnd, absences])

  // 🆕 Auto-save quand les tarifs personnalisés ou le blocage géo change
  useEffect(() => {
    triggerAutoSave()
  }, [customPrices, blockedCountries])

  const triggerAutoSave = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      logger.log('🔄 [PHYSICAL DEBUG] triggerAutoSave appelé - État des champs physiques:', {
        height: profileData.height,
        bodyType: profileData.bodyType,
        hairColor: profileData.hairColor,
        eyeColor: profileData.eyeColor,
        ethnicity: profileData.ethnicity,
        breastSize: profileData.breastSize,
        tattoos: profileData.tattoos,
        piercings: profileData.piercings,
        breastType: profileData.breastType,
        pubicHair: profileData.pubicHair,
        smoker: profileData.smoker
      })
      const payload: any = {}
      if (profileData.age !== undefined) payload.age = profileData.age as number
      if (profileData.address !== undefined) payload.address = profileData.address
      if (profileData.stageName !== undefined && profileData.stageName.trim() !== '') payload.stageName = profileData.stageName
      if (profileData.description !== undefined && profileData.description.trim() !== '') payload.description = profileData.description
      if (profileData.city !== undefined) payload.city = profileData.city
      if (profileData.canton !== undefined) payload.canton = profileData.canton
      if (profileData.phone !== undefined) payload.phone = profileData.phone
      if (profileData.incall !== undefined) payload.incall = !!profileData.incall
      if (profileData.outcall !== undefined) payload.outcall = !!profileData.outcall
      logger.log('💾 [AUTOSAVE] incall/outcall:', { incall: profileData.incall, outcall: profileData.outcall, payloadIncall: payload.incall, payloadOutcall: payload.outcall })
      if (profileData.coordinates) {
        payload.coordinates = profileData.coordinates
      }
      if (profileData.addressPrivacy) payload.addressPrivacy = profileData.addressPrivacy
      if (profileData.languages && Object.keys(profileData.languages).length > 0) payload.languages = safeStringify(profileData.languages)
      // Combiner catégorie et services détaillés dans le champ services
      const serviceDetails = (profileData.specialties || []).filter(s => s.startsWith('srv:'))
      const allServices = [
        ...(profileData.serviceType || []), // Catégorie principale (escort, masseuse, etc.)
        ...serviceDetails // Services détaillés uniquement
      ]
      logger.log('[DASHBOARD] Saving services:', {
        serviceType: profileData.serviceType,
        specialties: profileData.specialties,
        serviceDetails,
        allServices
      })
      if (allServices.length > 0) payload.services = safeStringify(allServices)
      if (profileData.specialties && profileData.specialties.length > 0) payload.specialties = safeStringify(profileData.specialties)
      if (profileData.serviceType && profileData.serviceType.length > 0) payload.category = profileData.serviceType[0]

      // Tarifs - Toujours sauvegarder pour permettre de désactiver tous les tarifs
      payload.rates = {
        fifteenMin: profileData.prices?.fifteenMin,
        thirtyMin: profileData.prices?.thirtyMin,
        oneHour: profileData.prices?.oneHour,
        twoHours: profileData.prices?.twoHours,
        halfDay: profileData.prices?.halfDay,
        fullDay: profileData.prices?.fullDay,
        overnight: profileData.prices?.overnight
      }
      // Physique - Format unifié avec objet physical
      logger.log('🔍 [PHYSICAL DEBUG] Vérification des champs physiques pour autosave:', {
        height: profileData.height,
        bodyType: profileData.bodyType,
        hairColor: profileData.hairColor,
        eyeColor: profileData.eyeColor,
        ethnicity: profileData.ethnicity,
        breastSize: profileData.breastSize,
        tattoos: profileData.tattoos,
        piercings: profileData.piercings,
        breastType: profileData.breastType,
        pubicHair: profileData.pubicHair,
        smoker: profileData.smoker,
        smokerType: typeof profileData.smoker
      })
      
      const hasPhysicalData = profileData.height !== undefined || 
          (profileData.bodyType !== undefined && profileData.bodyType !== '') || 
          (profileData.hairColor !== undefined && profileData.hairColor !== '') || 
          (profileData.eyeColor !== undefined && profileData.eyeColor !== '') || 
          (profileData.ethnicity !== undefined && profileData.ethnicity !== '') || 
          (profileData.breastSize !== undefined && profileData.breastSize !== '') ||
          profileData.tattoos !== undefined || profileData.piercings !== undefined || 
          profileData.breastType !== undefined || profileData.pubicHair !== undefined || 
          typeof profileData.smoker === 'boolean'
      
      logger.log('🔍 [PHYSICAL DEBUG] hasPhysicalData:', hasPhysicalData)
      
      if (hasPhysicalData) {
        payload.physical = {}
        logger.log('📦 [PHYSICAL DEBUG] Création de l\'objet physical pour autosave')
        
        if (profileData.height !== undefined) {
          payload.physical.height = profileData.height
          logger.log('📦 [PHYSICAL DEBUG] Ajout height:', profileData.height)
        }
        if (profileData.bodyType !== undefined && profileData.bodyType !== '') {
          payload.physical.bodyType = profileData.bodyType
          logger.log('📦 [PHYSICAL DEBUG] Ajout bodyType:', profileData.bodyType)
        }
        if (profileData.hairColor !== undefined && profileData.hairColor !== '') {
          payload.physical.hairColor = profileData.hairColor
          logger.log('📦 [PHYSICAL DEBUG] Ajout hairColor:', profileData.hairColor)
        }
        if (profileData.eyeColor !== undefined && profileData.eyeColor !== '') {
          payload.physical.eyeColor = profileData.eyeColor
          logger.log('📦 [PHYSICAL DEBUG] Ajout eyeColor:', profileData.eyeColor)
        }
        if (profileData.ethnicity !== undefined && profileData.ethnicity !== '') {
          payload.physical.ethnicity = profileData.ethnicity
          logger.log('📦 [PHYSICAL DEBUG] Ajout ethnicity:', profileData.ethnicity)
        }
        if (profileData.breastSize !== undefined && profileData.breastSize !== '') {
          payload.physical.bustSize = profileData.breastSize
          logger.log('📦 [PHYSICAL DEBUG] Ajout breastSize -> bustSize:', profileData.breastSize)
        }
        if (profileData.tattoos !== undefined) {
          payload.physical.tattoos = profileData.tattoos
          logger.log('📦 [PHYSICAL DEBUG] Ajout tattoos:', profileData.tattoos)
        }
        if (profileData.piercings !== undefined) {
          payload.physical.piercings = profileData.piercings
          logger.log('📦 [PHYSICAL DEBUG] Ajout piercings:', profileData.piercings)
        }
        if (profileData.breastType !== undefined) {
          payload.physical.breastType = profileData.breastType
          logger.log('📦 [PHYSICAL DEBUG] Ajout breastType:', profileData.breastType)
        }
        if (profileData.pubicHair !== undefined) {
          payload.physical.pubicHair = profileData.pubicHair
          logger.log('📦 [PHYSICAL DEBUG] Ajout pubicHair:', profileData.pubicHair)
        }
        if (typeof profileData.smoker === 'boolean') {
          payload.physical.smoker = profileData.smoker
          logger.log('📦 [PHYSICAL DEBUG] Ajout smoker:', profileData.smoker)
        }
        
        logger.log('📦 [PHYSICAL DEBUG] Objet physical final pour autosave:', payload.physical)
      } else {
        logger.log('⚠️ [PHYSICAL DEBUG] Aucune donnée physique détectée pour autosave')
      }
      if (profileData.phoneVisibility) payload.phoneVisibility = profileData.phoneVisibility
      
      // Clientèle
      logger.log('🔍 [CLIENTELE DEBUG] Vérification des champs clientèle pour autosave:', {
        acceptsCouples: profileData.acceptsCouples,
        acceptsWomen: profileData.acceptsWomen,
        acceptsHandicapped: profileData.acceptsHandicapped,
        acceptsSeniors: profileData.acceptsSeniors,
        types: {
          acceptsCouples: typeof profileData.acceptsCouples,
          acceptsWomen: typeof profileData.acceptsWomen,
          acceptsHandicapped: typeof profileData.acceptsHandicapped,
          acceptsSeniors: typeof profileData.acceptsSeniors
        }
      })
      
      const hasClienteleData = typeof profileData.acceptsCouples === 'boolean' || 
                              typeof profileData.acceptsWomen === 'boolean' || 
                              typeof profileData.acceptsHandicapped === 'boolean' || 
                              typeof profileData.acceptsSeniors === 'boolean'
      
      logger.log('🔍 [CLIENTELE DEBUG] hasClienteleData:', hasClienteleData)
      
      if (hasClienteleData) {
        payload.clientele = {}
        logger.log('📦 [CLIENTELE DEBUG] Création de l\'objet clientele pour autosave')
        
        if (typeof profileData.acceptsCouples === 'boolean') {
          payload.clientele.acceptsCouples = profileData.acceptsCouples
          logger.log('📦 [CLIENTELE DEBUG] Ajout acceptsCouples:', profileData.acceptsCouples)
        }
        if (typeof profileData.acceptsWomen === 'boolean') {
          payload.clientele.acceptsWomen = profileData.acceptsWomen
          logger.log('📦 [CLIENTELE DEBUG] Ajout acceptsWomen:', profileData.acceptsWomen)
        }
        if (typeof profileData.acceptsHandicapped === 'boolean') {
          payload.clientele.acceptsHandicapped = profileData.acceptsHandicapped
          logger.log('📦 [CLIENTELE DEBUG] Ajout acceptsHandicapped:', profileData.acceptsHandicapped)
        }
        if (typeof profileData.acceptsSeniors === 'boolean') {
          payload.clientele.acceptsSeniors = profileData.acceptsSeniors
          logger.log('📦 [CLIENTELE DEBUG] Ajout acceptsSeniors:', profileData.acceptsSeniors)
        }
        
        logger.log('📦 [CLIENTELE DEBUG] Objet clientele final pour autosave:', payload.clientele)
      } else {
        logger.log('⚠️ [CLIENTELE DEBUG] Aucune donnée clientèle détectée pour autosave')
      }

      // 🆕 Custom Prices - Tarifs personnalisés
      if (customPrices.length > 0) {
        payload.customPrices = JSON.stringify(customPrices)
        logger.log('💰 [CUSTOM PRICING] Ajout customPrices:', customPrices)
      }

      // 🆕 Blocage géographique par pays
      if (blockedCountries.size > 0) {
        payload.blockedCountries = safeStringify(Array.from(blockedCountries))
        logger.log('🌍 [GEO BLOCKING] Ajout blocage pays:', Array.from(blockedCountries))
      }

      const timeSlotsJson = scheduleToJson()
      if (timeSlotsJson !== null) {
        payload.timeSlots = timeSlotsJson
        logger.log('🔄 [AGENDA DEBUG] Ajout timeSlots à l\'autosave:', timeSlotsJson)
      } else {
        logger.log('⚠️ [AGENDA DEBUG] Pas de timeSlots valides, non inclus dans l\'autosave')
      }

      // Inclure les médias dans l'autosave
      const galleryMedia = mandatoryMedia.filter(m => m.preview && m.id).map((m, idx) => ({
        id: m.id,
        url: m.preview,
        slot: idx,
        type: idx === 0 ? 'profile' : 'gallery'
      }))
      if (galleryMedia.length > 0) {
        // Inclure seulement les URLs courtes (pas de base64 volumineux)
        const safeMedia = galleryMedia.filter(m => m.url && !m.url.startsWith('data:')).map(m => ({
          ...m,
          url: m.url // Pas de limite pour URLs Cloudflare R2 signées
        })).filter(m => m.url)
        if (safeMedia.length > 0) {
          payload.galleryPhotos = safeStringify(safeMedia)
        }
        // Photo de profil séparée (slot 0)
        const profilePhoto = galleryMedia.find(m => m.slot === 0)
        if (profilePhoto && profilePhoto.url && !profilePhoto.url.startsWith('data:')) {
          payload.profilePhoto = profilePhoto.url
        }
      }

      const safeMediaCount = galleryMedia.filter(m => m.url && !m.url.startsWith('data:')).length
      logger.log('[DASHBOARD] Auto-saving agenda + safe media:', { timeSlots: payload.timeSlots, safeMediaCount })
      logger.log('📦 [AUTOSAVE] Payload complet avant doSave:', payload)
      await doSave(payload, true)
    }, 700)
  }

  useEffect(() => {
    triggerAutoSave()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData.stageName, profileData.age, profileData.description, profileData.address, profileData.coordinates, profileData.addressPrivacy, profileData.city, profileData.canton, profileData.phone, profileData.phoneVisibility, profileData.incall, profileData.outcall, profileData.languages, profileData.serviceType, profileData.specialties, profileData.prices?.fifteenMin, profileData.prices?.thirtyMin, profileData.prices?.oneHour, profileData.prices?.twoHours, profileData.prices?.halfDay, profileData.prices?.fullDay, profileData.prices?.overnight, profileData.height, profileData.bodyType, profileData.breastType, profileData.hairColor, profileData.eyeColor, profileData.ethnicity, profileData.breastSize, profileData.pubicHair, profileData.smoker, profileData.tattoos, profileData.piercings, profileData.acceptsCouples, profileData.acceptsWomen, profileData.acceptsHandicapped, profileData.acceptsSeniors, weekly, pauseEnabled, pauseStart, pauseEnd, absences])

  const manualSave = async () => {
    try {
      setSaving(true)
      setSaveMsg(null)
      const payload: any = {}
      if (profileData.age !== undefined) payload.age = profileData.age as number
      if (profileData.address !== undefined) payload.address = profileData.address
      if (profileData.stageName !== undefined && profileData.stageName.trim() !== '') payload.stageName = profileData.stageName
      if (profileData.description !== undefined && profileData.description.trim() !== '') payload.description = profileData.description
      if (profileData.city !== undefined) payload.city = profileData.city
      if (profileData.canton !== undefined) payload.canton = profileData.canton
      if (profileData.phone !== undefined) payload.phone = profileData.phone
      if (profileData.incall !== undefined) payload.incall = !!profileData.incall
      if (profileData.outcall !== undefined) payload.outcall = !!profileData.outcall
      logger.log('💾 [AUTOSAVE] incall/outcall:', { incall: profileData.incall, outcall: profileData.outcall, payloadIncall: payload.incall, payloadOutcall: payload.outcall })
      if (profileData.coordinates) {
        payload.coordinates = profileData.coordinates
      }
      if (profileData.addressPrivacy) payload.addressPrivacy = profileData.addressPrivacy
      if (profileData.languages && Object.keys(profileData.languages).length > 0) payload.languages = safeStringify(profileData.languages)
      // Combiner catégorie et services détaillés dans le champ services
      const serviceDetails = (profileData.specialties || []).filter(s => s.startsWith('srv:'))
      const allServices = [
        ...(profileData.serviceType || []), // Catégorie principale (escort, masseuse, etc.)
        ...serviceDetails // Services détaillés uniquement
      ]
      logger.log('[DASHBOARD] Saving services:', {
        serviceType: profileData.serviceType,
        specialties: profileData.specialties,
        serviceDetails,
        allServices
      })
      if (allServices.length > 0) payload.services = safeStringify(allServices)
      if (profileData.specialties && profileData.specialties.length > 0) payload.specialties = safeStringify(profileData.specialties)
      if (profileData.serviceType && profileData.serviceType.length > 0) payload.category = profileData.serviceType[0]
      const timeSlotsJsonManual = scheduleToJson()
      if (timeSlotsJsonManual !== null) {
        payload.timeSlots = timeSlotsJsonManual
        logger.log('🔄 [AGENDA DEBUG] Ajout timeSlots au manual save:', timeSlotsJsonManual)
      } else {
        logger.log('⚠️ [AGENDA DEBUG] Pas de timeSlots valides pour manual save')
      }
      // Physique - Format unifié avec objet physical
      const hasPhysicalDataManual = profileData.height !== undefined || 
          (profileData.bodyType !== undefined && profileData.bodyType !== '') || 
          (profileData.hairColor !== undefined && profileData.hairColor !== '') || 
          (profileData.eyeColor !== undefined && profileData.eyeColor !== '') || 
          (profileData.ethnicity !== undefined && profileData.ethnicity !== '') || 
          (profileData.breastSize !== undefined && profileData.breastSize !== '') ||
          profileData.tattoos !== undefined || profileData.piercings !== undefined || 
          profileData.breastType !== undefined || profileData.pubicHair !== undefined || 
          typeof profileData.smoker === 'boolean'
      
      if (hasPhysicalDataManual) {
        payload.physical = {}
        if (profileData.height !== undefined) payload.physical.height = profileData.height
        if (profileData.bodyType !== undefined && profileData.bodyType !== '') payload.physical.bodyType = profileData.bodyType
        if (profileData.hairColor !== undefined && profileData.hairColor !== '') payload.physical.hairColor = profileData.hairColor
        if (profileData.eyeColor !== undefined && profileData.eyeColor !== '') payload.physical.eyeColor = profileData.eyeColor
        if (profileData.ethnicity !== undefined && profileData.ethnicity !== '') payload.physical.ethnicity = profileData.ethnicity
        if (profileData.breastSize !== undefined && profileData.breastSize !== '') payload.physical.bustSize = profileData.breastSize
        if (profileData.tattoos !== undefined) payload.physical.tattoos = profileData.tattoos
        if (profileData.piercings !== undefined) payload.physical.piercings = profileData.piercings
        if (profileData.breastType !== undefined) payload.physical.breastType = profileData.breastType
        if (profileData.pubicHair !== undefined) payload.physical.pubicHair = profileData.pubicHair
        if (typeof profileData.smoker === 'boolean') payload.physical.smoker = profileData.smoker
      }

      // Tarifs - Toujours sauvegarder pour permettre de désactiver tous les tarifs
      payload.rates = {
        fifteenMin: profileData.prices?.fifteenMin,
        thirtyMin: profileData.prices?.thirtyMin,
        oneHour: profileData.prices?.oneHour,
        twoHours: profileData.prices?.twoHours,
        halfDay: profileData.prices?.halfDay,
        fullDay: profileData.prices?.fullDay,
        overnight: profileData.prices?.overnight
      }
      if (profileData.phoneVisibility) payload.phoneVisibility = profileData.phoneVisibility
      
      // Clientèle
      logger.log('🔍 [CLIENTELE DEBUG] Vérification des champs clientèle pour autosave:', {
        acceptsCouples: profileData.acceptsCouples,
        acceptsWomen: profileData.acceptsWomen,
        acceptsHandicapped: profileData.acceptsHandicapped,
        acceptsSeniors: profileData.acceptsSeniors,
        types: {
          acceptsCouples: typeof profileData.acceptsCouples,
          acceptsWomen: typeof profileData.acceptsWomen,
          acceptsHandicapped: typeof profileData.acceptsHandicapped,
          acceptsSeniors: typeof profileData.acceptsSeniors
        }
      })
      
      const hasClienteleData = typeof profileData.acceptsCouples === 'boolean' || 
                              typeof profileData.acceptsWomen === 'boolean' || 
                              typeof profileData.acceptsHandicapped === 'boolean' || 
                              typeof profileData.acceptsSeniors === 'boolean'
      
      logger.log('🔍 [CLIENTELE DEBUG] hasClienteleData:', hasClienteleData)
      
      if (hasClienteleData) {
        payload.clientele = {}
        logger.log('📦 [CLIENTELE DEBUG] Création de l\'objet clientele pour autosave')
        
        if (typeof profileData.acceptsCouples === 'boolean') {
          payload.clientele.acceptsCouples = profileData.acceptsCouples
          logger.log('📦 [CLIENTELE DEBUG] Ajout acceptsCouples:', profileData.acceptsCouples)
        }
        if (typeof profileData.acceptsWomen === 'boolean') {
          payload.clientele.acceptsWomen = profileData.acceptsWomen
          logger.log('📦 [CLIENTELE DEBUG] Ajout acceptsWomen:', profileData.acceptsWomen)
        }
        if (typeof profileData.acceptsHandicapped === 'boolean') {
          payload.clientele.acceptsHandicapped = profileData.acceptsHandicapped
          logger.log('📦 [CLIENTELE DEBUG] Ajout acceptsHandicapped:', profileData.acceptsHandicapped)
        }
        if (typeof profileData.acceptsSeniors === 'boolean') {
          payload.clientele.acceptsSeniors = profileData.acceptsSeniors
          logger.log('📦 [CLIENTELE DEBUG] Ajout acceptsSeniors:', profileData.acceptsSeniors)
        }
        
        logger.log('📦 [CLIENTELE DEBUG] Objet clientele final pour autosave:', payload.clientele)
      } else {
        logger.log('⚠️ [CLIENTELE DEBUG] Aucune donnée clientèle détectée pour autosave')
      }

      // Inclure les médias dans la sauvegarde manuelle aussi
      const galleryMedia = mandatoryMedia.filter(m => m.preview && m.id).map((m, idx) => ({
        id: m.id,
        url: m.preview,
        slot: idx,
        type: idx === 0 ? 'profile' : 'gallery'
      }))
      if (galleryMedia.length > 0) {
        // Inclure seulement les URLs courtes (pas de base64 volumineux)
        const safeMedia = galleryMedia.filter(m => m.url && !m.url.startsWith('data:')).map(m => ({
          ...m,
          url: m.url // Pas de limite pour URLs Cloudflare R2 signées
        })).filter(m => m.url)
        if (safeMedia.length > 0) {
          payload.galleryPhotos = safeStringify(safeMedia)
        }
        // Photo de profil séparée (slot 0)
        const profilePhoto = galleryMedia.find(m => m.slot === 0)
        if (profilePhoto && profilePhoto.url && !profilePhoto.url.startsWith('data:')) {
          payload.profilePhoto = profilePhoto.url
        }
      }

      // Pays bloqués
      if (blockedCountries.size > 0) {
        payload.blockedCountries = safeStringify(Array.from(blockedCountries))
      }

      const ok = await doSave(payload, false)
      if (ok) {
        // actualiser le snapshot après sauvegarde
        savedSnapshotRef.current = { ...profileData }
      }
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(null), 4000)
    }
  }

  // Listen to top header actions (event bus)
  useEffect(() => {
    const onSave = () => { manualSave() }
    const onCancel = () => { setProfileData(savedSnapshotRef.current); setSaveMsg({ type: 'success', text: t('common.cancel') }); setTimeout(()=> setSaveMsg(null), 2000) }
    const onAgenda = () => { setActiveTab('agenda') }
    const onPause = () => { setPauseOpen(true) }
    window.addEventListener('profile:save' as any, onSave)
    window.addEventListener('profile:cancel' as any, onCancel)
    window.addEventListener('profile:open-agenda' as any, onAgenda)
    window.addEventListener('profile:pause' as any, onPause)
    return () => {
      window.removeEventListener('profile:save' as any, onSave)
      window.removeEventListener('profile:cancel' as any, onCancel)
      window.removeEventListener('profile:open-agenda' as any, onAgenda)
      window.removeEventListener('profile:pause' as any, onPause)
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* 🆕 Indicateur de connexion réseau */}
      <NetworkIndicator />

      {/* Messages de sauvegarde */}
      {saveMsg && (
        <div className={`p-3 rounded-xl ${saveMsg.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'}`}>
          {saveMsg.text}
        </div>
      )}
      {autoSaveMsg && (
        <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-sm">
          {autoSaveMsg}
        </div>
      )}

      {/* Carte de progression compacte */}
      <div className="w-full md:w-80 bg-neutral-800/50 rounded-xl p-4 border border-white/5 backdrop-blur-sm">
        <div className="flex justify-between items-center text-xs font-medium mb-2">
          <span className="text-white">{t('completion.title')}</span>
          <span className="text-purple-400">{completionPct}%</span>
        </div>
        <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 transition-all duration-500 ease-out"
            style={{
              width: `${completionPct}%`,
              boxShadow: completionPct > 0 ? '0 0 10px rgba(168,85,247,0.4)' : 'none'
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center justify-between">
          {/* Actions requises */}
          <div className="flex flex-wrap gap-2">
            {requiredChecks.filter(c => !c.ok).length > 0 ? (
              requiredChecks.filter(c => !c.ok).map(c => (
                <button
                  key={c.key}
                  onClick={() => setActiveTab(c.targetTab)}
                  className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 flex items-center gap-1 hover:bg-red-500/20 transition-colors"
                >
                  <AlertTriangle className="w-3 h-3" />
                  {c.label}
                </button>
              ))
            ) : (
              <span className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {t('completion.complete')}
              </span>
            )}
          </div>

          {/* Badge de certification en bas à droite */}
          <div className="ml-auto">
            {kycStatus === 'APPROVED' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium uppercase tracking-wide">
                <BadgeCheck className="w-3 h-3" /> Vérifié
              </span>
            ) : kycStatus === 'PENDING' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-medium uppercase tracking-wide">
                <Loader2 className="w-3 h-3 animate-spin" /> En cours…
              </span>
            ) : (
              <a
                href="/profile-test-signup/escort?step=3"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 font-medium uppercase tracking-wide transition-colors"
              >
                <AlertTriangle className="w-3 h-3" /> Certifier
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Navigation par onglets - Design premium */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tabs.map((tab) => {
          const IconComponent = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`group relative p-4 rounded-2xl text-left transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-purple-500/30 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20'
                  : 'bg-gray-800/40 border border-gray-700/50 hover:border-gray-600/70 hover:bg-gray-800/60'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 animate-pulse" />
              )}
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg transition-all ${
                    isActive ? 'bg-purple-500/20' : 'bg-gray-700/50 group-hover:bg-gray-700'
                  }`}>
                    <IconComponent size={18} className={isActive ? 'text-purple-400' : 'text-gray-400 group-hover:text-gray-300'} />
                  </div>
                  <span className={`font-semibold text-sm transition-all ${
                    isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {tab.label}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Contenu des onglets */}
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        {activeTab === 'basic' && (
          <div>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white">{t('basic.profilePhoto')}</h3>
              <div className="text-xs text-orange-300 mt-1">{t('basic.profilePhotoRequired')}</div>
            </div>
            <div className="max-w-md mx-auto">
              {/* 1 photo de profil obligatoire */}
              {[
                { n: 1, label: t('basic.profilePhoto'), accept: 'image/*', note: t('basic.notePhotoOnly') }
              ].map((slot, idx) => {
                const media = mandatoryMedia[idx]
                // Détection vidéo : vérifier le type du fichier, pas le slot.accept
                const isVideo = (!!media?.file && media.file.type.startsWith('video/')) ||
                                (!!media?.preview && (media.preview.endsWith('.mp4') || media.preview.endsWith('.webm') || media.preview.endsWith('.mov') || media.preview.includes('video')))
                const isDragging = draggingIndex === idx

                const onFilePicked = async (file: File) => {
                  if (!file) return
                  if (hasEscortProfile === false) { setSaveMsg({ type:'error', text: t('basic.profileRequired') }); setTimeout(()=> setSaveMsg(null), 3000); return }
                  // Validation : slot 0 = image only, slots 1-3 = image ou video
                  const isValid = slot.accept.includes('image/*,video/*')
                    ? (file.type.startsWith('image/') || file.type.startsWith('video/'))
                    : slot.accept.startsWith('image') ? file.type.startsWith('image/') : file.type.startsWith('video/')
                  if (!isValid) return
                  let fileToUpload: File = file
                  // Compression vidéo stricte pour éviter 413 sur Vercel
                  if (file.type.startsWith('video/') && file.size > 4 * 1024 * 1024) {
                    try {
                      const result = await videoCompressor.compressVideo(file, { maxSizeMB: 3.5, quality: 0.8 })
                      fileToUpload = result.file
                    } catch (e:any) {
                      setSaveMsg({ type:'error', text: t('basic.compressionFailed', { error: e?.message || 'inconnue' }) })
                      setTimeout(()=> setSaveMsg(null), 4000)
                      return
                    }
                    if (fileToUpload.size > 500 * 1024 * 1024) {
                      setSaveMsg({ type:'error', text: t('basic.fileTooLarge') })
                      setTimeout(()=> setSaveMsg(null), 4000)
                      return
                    }
                  }
                  const preview = URL.createObjectURL(fileToUpload)
                  // Upload direct vers R2 (contourne limite Vercel 4.5MB)
                  try {
                    setMandatoryMedia(prev => { const next=[...prev]; next[idx] = { ...(next[idx]||{}), uploading: true }; return next })

                    const zeroBasedSlot = Math.max(0, Math.min(5, (slot.n || (idx+1)) - 1))

                    // 1. Obtenir presigned URL
                    const presignedRes = await fetch('/api/escort/media/presigned-upload', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        fileName: fileToUpload.name,
                        fileType: fileToUpload.type,
                        fileSize: fileToUpload.size,
                        slot: zeroBasedSlot
                      })
                    })

                    if (!presignedRes.ok) {
                      const error = await presignedRes.json()
                      throw new Error(error.error || t('basic.uploadFailed'))
                    }

                    const { presignedUrl, publicUrl } = await presignedRes.json()

                    // 2. Upload direct vers R2 avec progress bar
                    const uploadId = `media-${idx}-${Date.now()}`

                    await uploadWithProgress({
                      url: presignedUrl,
                      file: fileToUpload,
                      method: 'PUT',
                      headers: { 'Content-Type': fileToUpload.type },
                      onProgress: (progress) => {
                        setUploadProgress(prev => ({ ...prev, [idx]: progress }))
                      }
                    })

                    // Nettoyer le progress après upload
                    setUploadProgress(prev => {
                      const next = { ...prev }
                      delete next[idx]
                      return next
                    })

                    // 3. Confirmer et sauvegarder métadonnées
                    const confirmRes = await fetch('/api/escort/media/confirm-upload', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        publicUrl,
                        slot: zeroBasedSlot,
                        isPrivate: false,
                        fileType: fileToUpload.type
                      })
                    })

                    if (!confirmRes.ok) {
                      const error = await confirmRes.json()
                      throw new Error(error.error || t('basic.uploadFailed'))
                    }

                    const data = await confirmRes.json()

                    setMandatoryMedia(prev => {
                      const next = [...prev]
                      if (next[idx]?.preview) {
                        try { URL.revokeObjectURL(next[idx]!.preview as string) } catch {}
                      }
                      const serverUrl = data?.url || publicUrl
                      const returnedSlot = typeof data?.slot === 'number' ? data.slot : zeroBasedSlot
                      const returnedId = (Array.isArray(data?.slots) && data.slots[returnedSlot]?.id) ? String(data.slots[returnedSlot].id) : undefined
                      const id = data?.legacyMediaId ? String(data.legacyMediaId) : (returnedId || `slot-${returnedSlot}`)
                      next[idx] = { file, preview: serverUrl, id, uploading: false }
                      return next
                    })
                    setSaveMsg({ type: 'success', text: t('basic.mediaUploaded') })
                    setTimeout(() => setSaveMsg(null), 2500)
                  } catch (e: any) {
                    setSaveMsg({ type: 'error', text: e?.message || t('basic.uploadFailed') })
                    setTimeout(() => setSaveMsg(null), 4000)
                    setMandatoryMedia(prev => { const next=[...prev]; next[idx] = { ...(next[idx]||{}), uploading: false }; return next })
                  }
                }

                const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setDraggingIndex(null)
                  const file = e.dataTransfer.files && e.dataTransfer.files[0]
                  if (file) onFilePicked(file)
                }

                const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files && e.target.files[0]
                  if (file) onFilePicked(file)
                }

                return (
                  <div
                    key={slot.n}
                    className={`relative aspect-square rounded-xl border-2 border-dashed transition-colors p-3 text-center flex flex-col ${
                      isDragging ? 'border-purple-400 bg-purple-500/10' :
                      selectionMode && selectedMediaForBulk.has(idx) ? 'border-purple-500 bg-purple-500/20' :
                      'border-gray-600 hover:border-purple-500 bg-gray-700/50'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDraggingIndex(idx) }}
                    onDragLeave={() => setDraggingIndex(null)}
                    onDrop={onDrop}
                    onClick={() => {
                      if (selectionMode && media?.id) {
                        // Mode sélection : toggle selection
                        setSelectedMediaForBulk(prev => {
                          const next = new Set(prev)
                          if (next.has(idx)) {
                            next.delete(idx)
                          } else {
                            next.add(idx)
                          }
                          return next
                        })
                      } else if (!selectionMode) {
                        // Mode normal : ouvrir file picker
                        fileInputsRef.current[idx]?.click()
                      }
                    }}
                  >
                    {/* 🆕 Checkbox overlay en mode sélection */}
                    {/* Header slot */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">{slot.n}</span>
                        <span className="text-[11px] text-purple-300">{t('basic.mandatory')}</span>
                      </div>
                      {media?.id && (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const id = mandatoryMedia[idx]?.id
                            try {
                              if (id) {
                                const isProfile = idx === 0
                                const resp = await fetch(`/api/escort/media/delete`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ mediaId: id, type: isProfile ? 'profile' : 'gallery' }) })
                                const d = await resp.json().catch(()=> ({}))
                                if (!resp.ok || !d?.success) throw new Error(d?.error || t('basic.uploadFailed'))
                              }
                            } catch (err:any) {
                              setSaveMsg({ type:'error', text: err?.message || t('basic.uploadFailed') })
                              setTimeout(() => setSaveMsg(null), 3000)
                            } finally {
                              setMandatoryMedia(prev => {
                                const next=[...prev];
                                if (next[idx]?.preview) { try{ URL.revokeObjectURL(next[idx]!.preview as string) } catch {} }
                                next[idx] = { file: undefined, preview: undefined, id: undefined, uploading: false };
                                return next
                              })
                            }
                          }}
                          className="text-xs text-gray-300 hover:text-white"
                        >
                          {t('basic.remove')}
                        </button>
                      )}
                    </div>

                    {/* Label + note */}
                    <div className="text-sm text-white font-medium flex items-center gap-2">
                      {slot.label}
                      {media?.preview && <span title={t('basic.ok')} className="inline-flex items-center text-emerald-300 text-[11px]"><CheckCircle2 size={14} className="mr-1"/>{t('basic.ok')}</span>}
                    </div>
                    {slot.note && (
                      <div className="text-[11px] text-purple-300/80 bg-purple-500/10 border border-purple-500/20 rounded px-2 py-0.5 mt-1 inline-block">
                        {slot.note}
                      </div>
                    )}

                    {/* Preview / placeholder */}
                    <div className="mt-2 flex-1 flex items-center justify-center w-full overflow-hidden rounded-lg relative">
                      {media?.preview ? (
                        isVideo ? (
                          <video src={media.preview} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                        ) : (
                          <img src={media.preview} className="w-full h-full object-cover" alt={slot.label} />
                        )
                      ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <Image className="text-gray-500 mb-1" size={24} />
                          <span className="text-xs">{t('basic.dropOrClick')}</span>
                          <span className="text-[10px] text-gray-500 mt-1">
                            {slot.accept.includes('image/*,video/*')
                              ? t('basic.photoOrVideo')
                              : slot.accept.startsWith('image')
                                ? t('basic.photoOnly')
                                : t('basic.photoOnly')}
                          </span>
                        </div>
                      )}
                      {media?.uploading && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4">
                          {uploadProgress[idx] !== undefined ? (
                            <>
                              <div className="w-full bg-gray-700 rounded-full h-2 mb-2 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300 ease-out"
                                  style={{ width: `${uploadProgress[idx]}%` }}
                                />
                              </div>
                              <span className="text-white text-sm font-semibold">{uploadProgress[idx]}%</span>
                              <span className="text-gray-300 text-xs mt-1">{t('basic.uploadProgress')}</span>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 text-white/80 text-xs">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>{t('basic.preparing')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Hidden input */}
                    <input
                      ref={(el) => { fileInputsRef.current[idx] = el; }}
                      id={`slot-file-${slot.n}`}
                      type="file"
                      accept={slot.accept}
                      className="hidden"
                      onChange={onChange}
                    />
                  </div>
                )
              })}
            </div>

            {/* Séparateur */}
            <div className="my-8 border-t border-gray-700"></div>

            <h3 className="text-xl font-bold text-white mb-6">{t('basic.title')}</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('basic.stageName')} *</label>
                  <input
                    type="text"
                    value={profileData.stageName || ''}
                    onChange={(e) => updateProfileData('stageName', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('basic.category')} *</label>
                  <select
                    value={(profileData.serviceType||[])[0] || ''}
                    onChange={(e) => updateProfileData('serviceType', e.target.value ? [e.target.value] : [])}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">{t('basic.selectCategory')}</option>
                    <option value="ESCORT">{t('basic.categories.escort')}</option>
                    <option value="MASSEUSE">{t('basic.categories.masseuse')}</option>
                    <option value="DOMINATRICE">{t('basic.categories.dominatrice')}</option>
                    <option value="TRANSSEXUELLE">{t('basic.categories.transsexuelle')}</option>
                    <option value="AUTRE">{t('basic.categories.other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Âge *
                  </label>
                  <select
                    value={profileData.age || ''}
                    onChange={(e) => updateProfileData('age', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">{t('basic.selectCategory')}</option>
                    <optgroup label={t('basic.ageGroups.18-25')}>
                      {Array.from({length: 8}, (_, i) => 18 + i).map(age => (
                        <option key={age} value={age}>{age} {t('basic.years')}</option>
                      ))}
                    </optgroup>
                    <optgroup label={t('basic.ageGroups.26-30')}>
                      {Array.from({length: 5}, (_, i) => 26 + i).map(age => (
                        <option key={age} value={age}>{age} {t('basic.years')}</option>
                      ))}
                    </optgroup>
                    <optgroup label={t('basic.ageGroups.31-40')}>
                      {Array.from({length: 10}, (_, i) => 31 + i).map(age => (
                        <option key={age} value={age}>{age} {t('basic.years')}</option>
                      ))}
                    </optgroup>
                    <optgroup label={t('basic.ageGroups.40plus')}>
                      {Array.from({length: 20}, (_, i) => 41 + i).map(age => (
                        <option key={age} value={age}>{age} {t('basic.years')}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('basic.description')} *</label>
                {/* 🆕 Rich Text Editor avec formatage */}
                <SimpleRichTextEditor
                  value={profileData.description || ''}
                  onChange={(value) => updateProfileData('description', value)}
                  placeholder={t('basic.descriptionPlaceholder')}
                  minLength={200}
                  rows={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('basic.languages')}</label>
                <div className="text-xs text-gray-400 mb-3">{t('basic.languagesHelp')}</div>
                <div className="bg-gray-700/20 rounded-xl p-4 space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {[
                      'Français',
                      'English',
                      'Deutsch',
                      'Italiano',
                      'Español',
                      'Arabe'
                    ].map((lang) => (
                      <StarRating
                        key={lang}
                        language={lang}
                        rating={profileData.languages?.[lang] || 0}
                        isSelected={!!profileData.languages?.[lang]}
                        onToggleLanguage={(selected) => toggleLanguageSelection(lang, selected)}
                        onRatingChange={(rating) => updateLanguageRating(lang, rating)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Localisation - Design Compact Premium */}
              <div className="p-6 bg-gray-800/40 rounded-xl border border-gray-700/50">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="text-purple-400" size={20} />
                  <h4 className="text-lg font-semibold text-white">{t('basic.location.title')}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">{t('basic.location.required')}</span>
                </div>

                {/* Grille compacte */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Canton */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('basic.location.canton')} <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={profileData.canton || ''}
                      onChange={(e) => {
                        const code = e.target.value
                        updateProfileData('canton', code)
                        const allowed = CITY_BY_CANTON[code] || []
                        if (profileData.city && !allowed.includes(profileData.city)) {
                          updateProfileData('city', '')
                        }
                      }}
                      className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white focus:border-purple-500 focus:outline-none ${!profileData.canton ? 'border-red-500/50' : 'border-gray-600/50'}`}
                    >
                      <option value="">{t('basic.selectCategory')}</option>
                      <option value="GE">{CANTON_MAP['GE']}</option>
                      <option value="VD">{CANTON_MAP['VD']}</option>
                      <option value="VS">{CANTON_MAP['VS']}</option>
                      <option value="ZH">{CANTON_MAP['ZH']}</option>
                      <option value="BE">{CANTON_MAP['BE']}</option>
                      <option value="BS">{CANTON_MAP['BS']}</option>
                    </select>
                  </div>

                  {/* Ville */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('basic.location.city')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      list="city-list"
                      type="text"
                      value={profileData.city || ''}
                      onChange={(e) => {
                        const v = e.target.value
                        updateProfileData('city', v)
                        if (!profileData.canton) {
                          const code = detectCantonFromCity(v)
                          if (code) updateProfileData('canton', code)
                        }
                      }}
                      placeholder={t('basic.location.cityPlaceholder')}
                      className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white focus:border-purple-500 focus:outline-none ${!profileData.city ? 'border-red-500/50' : 'border-gray-600/50'}`}
                    />
                    <datalist id="city-list">
                      {((CITY_BY_CANTON[profileData.canton || ''] || []).length > 0
                        ? CITY_BY_CANTON[profileData.canton || '']
                        : ['Genève','Lausanne','Zurich','Berne','Bâle','Lugano','Fribourg','Neuchâtel','Lucerne','Sion']
                      ).map(c => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Adresse complète */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('basic.location.fullAddress')} <span className="text-red-400">*</span>
                  </label>
                  <PremiumAddressAutocomplete
                    value={profileData.address || ''}
                    onChange={(address, coordinates) => {
                      updateProfileData('address', address)
                      if (coordinates) {
                        updateProfileData('coordinates', coordinates)
                      }
                    }}
                    onCoordinatesChange={(coordinates) => {
                      if (coordinates) {
                        updateProfileData('coordinates', coordinates)
                      }
                    }}
                    placeholder={t('basic.location.addressPlaceholder')}
                    cantonCode={profileData.canton || undefined}
                    cantonName={profileData.canton ? CANTON_MAP[profileData.canton] : undefined}
                    city={profileData.city || undefined}
                    onAddressSelect={(address) => {
                      const parts = address.address.split(', ')
                      if (parts.length >= 2) {
                        const cityPart = parts[parts.length - 1]
                        const cityName = cityPart.replace(/^\d+\s+/, '')
                        if (cityName) updateProfileData('city', cityName)
                        const code = detectCantonFromCity(cityName)
                        if (code) updateProfileData('canton', code)
                      }
                    }}
                  />

                  {profileData.address && (
                    <AddressValidator
                      address={profileData.address}
                      coordinates={profileData.coordinates}
                    />
                  )}

                  {/* Carte + Confidentialité (compact) */}
                  {profileData.address && profileData.coordinates && (
                    <div className="mt-4 space-y-3">
                      {/* LocationPreviewMap retiré pour simplifier l'UI */}

                      {/* Confidentialité en ligne */}
                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                        <label className="flex items-center gap-2 flex-1 cursor-pointer">
                          <input
                            type="radio"
                            name="addressPrivacy"
                            value="precise"
                            checked={profileData.addressPrivacy === 'precise'}
                            onChange={(e) => updateProfileData('addressPrivacy', e.target.value as 'precise' | 'approximate')}
                            className="text-purple-500"
                          />
                          <span className="text-sm text-white">{t('basic.location.privacy.precise')}</span>
                        </label>
                        <label className="flex items-center gap-2 flex-1 cursor-pointer">
                          <input
                            type="radio"
                            name="addressPrivacy"
                            value="approximate"
                            checked={profileData.addressPrivacy === 'approximate'}
                            onChange={(e) => updateProfileData('addressPrivacy', e.target.value as 'precise' | 'approximate')}
                            className="text-purple-500"
                          />
                          <span className="text-sm text-white">{t('basic.location.privacy.approximate')}</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact téléphonique */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">{t('basic.phone.title')}</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">{t('basic.phone.number')}</label>
                    <input
                      type="tel"
                      value={profileData.phone || ''}
                      onChange={(e) => updateProfileData('phone', e.target.value)}
                      placeholder={t('basic.phone.numberPlaceholder')}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">{t('basic.phone.visibility')}</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="phoneVisibility"
                          value="visible"
                          checked={profileData.phoneVisibility === 'visible'}
                          onChange={(e) => updateProfileData('phoneVisibility', e.target.value)}
                          className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-300">{t('basic.phone.visible')}</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="phoneVisibility"
                          value="hidden"
                          checked={profileData.phoneVisibility === 'hidden'}
                          onChange={(e) => updateProfileData('phoneVisibility', e.target.value)}
                          className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-300">{t('basic.phone.hidden')}</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="phoneVisibility"
                          value="none"
                          checked={profileData.phoneVisibility === 'none'}
                          onChange={(e) => updateProfileData('phoneVisibility', e.target.value)}
                          className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-300">{t('basic.phone.none')}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blocage géographique - Design Premium Compact */}
              <div className="p-6 bg-gray-800/40 rounded-xl border border-gray-700/50">
                <div className="flex items-center gap-2 mb-6">
                  <ShieldCheck className="text-red-400" size={20} />
                  <h4 className="text-lg font-semibold text-white">{t('basic.geoBlocking.title')}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-600/30 text-gray-400 border border-gray-600/30">{t('basic.geoBlocking.optional')}</span>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-gray-400">{t('basic.geoBlocking.description')}</p>

                  {/* Sélection pays */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {[
                      { code: 'FR', name: 'France', flag: '🇫🇷' },
                      { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
                      { code: 'IT', name: 'Italie', flag: '🇮🇹' },
                      { code: 'AT', name: 'Autriche', flag: '🇦🇹' },
                      { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
                      { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
                      { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' },
                      { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱' },
                      { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
                      { code: 'PL', name: 'Pologne', flag: '🇵🇱' },
                      { code: 'RO', name: 'Roumanie', flag: '🇷🇴' },
                      { code: 'CZ', name: 'Tchéquie', flag: '🇨🇿' },
                    ].map((country) => {
                      const isBlocked = blockedCountries.has(country.code)
                      return (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setBlockedCountries(prev => {
                              const next = new Set(prev)
                              if (next.has(country.code)) {
                                next.delete(country.code)
                              } else {
                                next.add(country.code)
                              }
                              return next
                            })
                          }}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            isBlocked
                              ? 'bg-red-500/20 text-red-200 border border-red-500/50'
                              : 'bg-gray-700/50 text-gray-300 border border-gray-600/50 hover:bg-gray-700'
                          }`}
                        >
                          <span className="mr-1">{country.flag}</span>
                          {country.name}
                        </button>
                      )
                    })}
                  </div>

                  {blockedCountries.size > 0 && (
                    <div className="text-xs text-red-300 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                      {t(blockedCountries.size > 1 ? 'basic.geoBlocking.blockedCountPlural' : 'basic.geoBlocking.blockedCount', { count: blockedCountries.size })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-6">{t('appearance.title')}</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('appearance.height')}</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={140} max={200} step={1} value={profileData.height || 165} onChange={(e)=> updateProfileData('height', parseInt(e.target.value))} className="w-full"/>
                    <div className="w-16 text-right text-white/90">{profileData.height || 165} cm</div>
                  </div>
                  <label className="mt-2 inline-flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" className="rounded" onChange={(e)=> e.target.checked ? updateProfileData('height', 201) : undefined }/>
                    {t('appearance.heightOver')}
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('appearance.bodyType')}</label>
                  <select
                    value={profileData.bodyType || ''}
                    onChange={(e) => updateProfileData('bodyType', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">{t('appearance.bodyTypes.select')}</option>
                    <option value="mince">{t('appearance.bodyTypes.mince')}</option>
                    <option value="sportive">{t('appearance.bodyTypes.sportive')}</option>
                    <option value="pulpeuse">{t('appearance.bodyTypes.pulpeuse')}</option>
                    <option value="ronde">{t('appearance.bodyTypes.ronde')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('appearance.breastSize')}</label>
                  <select
                    value={profileData.breastSize || ''}
                    onChange={(e) => updateProfileData('breastSize', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">{t('appearance.breastSizes.select')}</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('appearance.hairColor')}</label>
                  <select
                    value={profileData.hairColor || ''}
                    onChange={(e) => updateProfileData('hairColor', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">{t('appearance.hairColors.select')}</option>
                    <option value="brun">{t('appearance.hairColors.brun')}</option>
                    <option value="blond">{t('appearance.hairColors.blond')}</option>
                    <option value="chatain">{t('appearance.hairColors.chatain')}</option>
                    <option value="gris">{t('appearance.hairColors.gris')}</option>
                    <option value="roux">{t('appearance.hairColors.roux')}</option>
                    <option value="autre">{t('appearance.hairColors.autre')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('appearance.breastType')}</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-300"><input type="radio" name="breastType" checked={profileData.breastType==='naturelle'} onChange={()=> updateProfileData('breastType','naturelle')} /> {t('appearance.breastTypes.naturelle')}</label>
                  <label className="flex items-center gap-2 text-sm text-gray-300"><input type="radio" name="breastType" checked={profileData.breastType==='siliconee'} onChange={()=> updateProfileData('breastType','siliconee')} /> {t('appearance.breastTypes.siliconee')}</label>
                </div>
              </div>

              <div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('appearance.eyeColor')}</label>
                  <select
                    value={profileData.eyeColor || ''}
                    onChange={(e) => updateProfileData('eyeColor', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">{t('appearance.eyeColors.select')}</option>
                    <option value="noir">Noir</option>
                    <option value="marron">{t('appearance.eyeColors.marron')}</option>
                    <option value="vert">{t('appearance.eyeColors.vert')}</option>
                    <option value="bleu">{t('appearance.eyeColors.bleu')}</option>
                    <option value="gris">{t('appearance.eyeColors.gris')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('appearance.ethnicity')}</label>
                  <select
                    value={profileData.ethnicity || ''}
                    onChange={(e) => updateProfileData('ethnicity', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">{t('appearance.ethnicities.select')}</option>
                    <option value="suissesse">Suissesse</option>
                    <option value="francaise">Française</option>
                    <option value="espagnole">Espagnole</option>
                    <option value="italienne">Italienne</option>
                    <option value="allemand">Allemand</option>
                    <option value="europeenne">{t('appearance.ethnicities.europeenne')}</option>
                    <option value="latine">{t('appearance.ethnicities.latine')}</option>
                    <option value="asiatique">{t('appearance.ethnicities.asiatique')}</option>
                    <option value="africaine">{t('appearance.ethnicities.africaine')}</option>
                    <option value="russe">Russe</option>
                    <option value="orientale">Orientale</option>
                    <option value="bresilienne">Brésilienne</option>
                    <option value="moyen-orient">Moyen-Orient</option>
                    <option value="balkanique">Balkanique</option>
                    <option value="nordique">Nordique</option>
                    <option value="metissee">{t('appearance.ethnicities.metisse')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{t('services.title')}</h3>
            <div className="text-sm text-white/80 mb-4">{t('services.description')}</div>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('services.clientele')}</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { key:'acceptsCouples', label: t('services.clienteleTypes.couples') },
                    { key:'acceptsWomen', label: t('services.clienteleTypes.women') },
                    { key:'acceptsHandicapped', label: t('services.clienteleTypes.handicapped') },
                    { key:'acceptsSeniors', label: t('services.clienteleTypes.seniors') },
                  ].map(it => (
                    <label key={it.key} className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" checked={(profileData as any)[it.key]||false} onChange={(e)=> updateProfileData(it.key, e.target.checked)} />
                      <span className="text-sm text-gray-300">{it.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('services.serviceMode')}</label>
                <div className="grid grid-cols-1 gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={profileData.incall || false}
                      onChange={(e) => {
                        logger.log('✅ [INCALL CHANGE]', e.target.checked)
                        updateProfileData('incall', e.target.checked)
                      }}
                    />
                    <span className="text-sm text-gray-300">{t('services.incall')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={profileData.outcall || false}
                      onChange={(e) => {
                        logger.log('✅ [OUTCALL CHANGE]', e.target.checked)
                        updateProfileData('outcall', e.target.checked)
                      }}
                    />
                    <span className="text-sm text-gray-300">{t('services.outcall')}</span>
                  </label>
                </div>
              </div>
            </div>


            <div className="space-y-4">
              {[
                { nameKey: 'classics', items: ['Rapport', 'French kiss', 'GFE', 'PSE', 'Lingerie', 'Duo/Trio', 'Jeux de rôles', 'Costumes'] },
                { nameKey: 'oral', items: ['Fellation protégée', 'Fellation nature', 'Gorge profonde', 'Éjac en bouche', 'Éjac sur le corps', 'Éjac sur le visage'] },
                { nameKey: 'anal', items: ['Sodomie (donne)', 'Sodomie (reçoit)', 'Doigté anal'] },
                { nameKey: 'bdsm', items: ['Domination soft', 'Fessées', 'Donjon SM', 'Fétichisme pieds'] },
                { nameKey: 'massages', items: ['Tantrique', 'Érotique', 'Corps à corps', 'Nuru', 'Prostate', 'Lingam', 'Yoni', '4 mains', 'Suédois', 'Huiles'] },
              ].map(group => (
                <div key={group.nameKey}>
                  <div className="text-sm text-white/90 font-medium mb-2">{t(`services.categories.${group.nameKey}`)}</div>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map(it => {
                      const key = `srv:${it}`
                      const selected = (profileData.specialties||[]).includes(key)
                      return (
                        <button key={key} onClick={()=>{
                          const arr = new Set(profileData.specialties||[])
                          if (arr.has(key)) arr.delete(key); else arr.add(key)
                          updateProfileData('specialties', Array.from(arr))
                        }} className={`text-xs px-2.5 py-1 rounded-full border ${selected ? 'bg-purple-500/20 text-purple-200 border-purple-500/30' : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'}`}>
                          {t(`services.items.${it}`)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-6">{t('pricing.title')}</h3>
            <div className="space-y-6">
              {/* À partir de */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t('pricing.startingFrom')} :</label>
                <select
                  value={profileData.prices?.oneHour || ''}
                  onChange={(e) => updateNestedProfileData('prices', 'oneHour', parseInt(e.target.value))}
                  className="w-full md:w-60 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                >
                  <option value="">{t('basic.selectCategory')}</option>
                  {[100,150,200,250,300,350,400,450,500].map(v => (
                    <option key={v} value={v}>{v} CHF</option>
                  ))}
                </select>
              </div>

              {/* Tarifs détaillés */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">{t('pricing.detailedRates')}</label>
                <div className="space-y-4">
                  {/* 15 minutes */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <input
                        type="checkbox"
                        id="rate-15min"
                        checked={!!(profileData.prices?.fifteenMin && profileData.prices.fifteenMin !== null)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateNestedProfileData('prices', 'fifteenMin', 100)
                          } else {
                            updateNestedProfileData('prices', 'fifteenMin', null)
                          }
                        }}
                        className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="rate-15min" className="text-sm text-gray-300 cursor-pointer">{t('pricing.durations.15min')}</label>
                    </div>
                    {profileData.prices?.fifteenMin && profileData.prices.fifteenMin !== null && (
                      <div className="flex-1">
                        <select
                          value={profileData.prices.fifteenMin}
                          onChange={(e) => updateNestedProfileData('prices', 'fifteenMin', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                        >
                          {[50,80,100,120,150,180,200,250].map(v => (
                            <option key={v} value={v}>{v} CHF</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* 30 minutes */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <input
                        type="checkbox"
                        id="rate-30min"
                        checked={!!(profileData.prices?.thirtyMin && profileData.prices.thirtyMin !== null)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateNestedProfileData('prices', 'thirtyMin', 150)
                          } else {
                            updateNestedProfileData('prices', 'thirtyMin', null)
                          }
                        }}
                        className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="rate-30min" className="text-sm text-gray-300 cursor-pointer">{t('pricing.durations.30min')}</label>
                    </div>
                    {profileData.prices?.thirtyMin && profileData.prices.thirtyMin !== null && (
                      <div className="flex-1">
                        <select
                          value={profileData.prices.thirtyMin}
                          onChange={(e) => updateNestedProfileData('prices', 'thirtyMin', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                        >
                          {[80,100,120,150,180,200,250,300].map(v => (
                            <option key={v} value={v}>{v} CHF</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* 2 heures */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <input
                        type="checkbox"
                        id="rate-2hours"
                        checked={!!(profileData.prices?.twoHours && profileData.prices.twoHours !== null)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateNestedProfileData('prices', 'twoHours', 600)
                          } else {
                            updateNestedProfileData('prices', 'twoHours', null)
                          }
                        }}
                        className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="rate-2hours" className="text-sm text-gray-300 cursor-pointer">{t('pricing.durations.2hours')}</label>
                    </div>
                    {profileData.prices?.twoHours && profileData.prices.twoHours !== null && (
                      <div className="flex-1">
                        <select
                          value={profileData.prices.twoHours}
                          onChange={(e) => updateNestedProfileData('prices', 'twoHours', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                        >
                          {[400,500,600,700,800,900,1000,1200].map(v => (
                            <option key={v} value={v}>{v} CHF</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Demi-journée */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <input
                        type="checkbox"
                        id="rate-halfday"
                        checked={!!(profileData.prices?.halfDay && profileData.prices.halfDay !== null)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateNestedProfileData('prices', 'halfDay', 1500)
                          } else {
                            updateNestedProfileData('prices', 'halfDay', null)
                          }
                        }}
                        className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="rate-halfday" className="text-sm text-gray-300 cursor-pointer">{t('pricing.durations.halfDay')}</label>
                    </div>
                    {profileData.prices?.halfDay && profileData.prices.halfDay !== null && (
                      <div className="flex-1">
                        <select
                          value={profileData.prices.halfDay}
                          onChange={(e) => updateNestedProfileData('prices', 'halfDay', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                        >
                          {[800,1000,1200,1500,1800,2000,2500,3000].map(v => (
                            <option key={v} value={v}>{v} CHF</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Journée complète */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <input
                        type="checkbox"
                        id="rate-fullday"
                        checked={!!(profileData.prices?.fullDay && profileData.prices.fullDay !== null)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateNestedProfileData('prices', 'fullDay', 3000)
                          } else {
                            updateNestedProfileData('prices', 'fullDay', null)
                          }
                        }}
                        className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="rate-fullday" className="text-sm text-gray-300 cursor-pointer">{t('pricing.durations.fullDay')}</label>
                    </div>
                    {profileData.prices?.fullDay && profileData.prices.fullDay !== null && (
                      <div className="flex-1">
                        <select
                          value={profileData.prices.fullDay}
                          onChange={(e) => updateNestedProfileData('prices', 'fullDay', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                        >
                          {[1500,2000,2500,3000,3500,4000,5000,6000].map(v => (
                            <option key={v} value={v}>{v} CHF</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Nuit complète */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <input
                        type="checkbox"
                        id="rate-overnight"
                        checked={!!(profileData.prices?.overnight && profileData.prices.overnight !== null)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateNestedProfileData('prices', 'overnight', 2000)
                          } else {
                            updateNestedProfileData('prices', 'overnight', null)
                          }
                        }}
                        className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="rate-overnight" className="text-sm text-gray-300 cursor-pointer">{t('pricing.durations.overnight')}</label>
                    </div>
                    {profileData.prices?.overnight && profileData.prices.overnight !== null && (
                      <div className="flex-1">
                        <select
                          value={profileData.prices.overnight}
                          onChange={(e) => updateNestedProfileData('prices', 'overnight', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                        >
                          {[800,1000,1200,1500,2000,2500,3000,4000].map(v => (
                            <option key={v} value={v}>{v} CHF</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500 flex items-start gap-2">
                  <span className="text-purple-400">💡</span>
                  <span>{t('pricing.tip')}</span>
                </div>
              </div>

              {/* 🆕 Tarifs personnalisés */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-300">{t('pricing.customDurations')}</label>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `custom-${Date.now()}`
                      setCustomPrices(prev => [...prev, {
                        id: newId,
                        label: '',
                        duration: '',
                        price: 0
                      }])
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30"
                  >
                    <Zap className="w-3 h-3" />
                    {t('pricing.addCustom')}
                  </button>
                </div>

                {customPrices.length > 0 && (
                  <div className="space-y-3">
                    {customPrices.map((customPrice) => (
                      <div key={customPrice.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                        <input
                          type="text"
                          placeholder={t('pricing.customDurationPlaceholder')}
                          value={customPrice.label}
                          onChange={(e) => {
                            setCustomPrices(prev => prev.map(cp =>
                              cp.id === customPrice.id ? { ...cp, label: e.target.value } : cp
                            ))
                          }}
                          className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm placeholder:text-gray-500 focus:border-purple-500 focus:outline-none"
                        />
                        <div className="flex items-center gap-2 sm:gap-3">
                          <input
                            type="number"
                            placeholder={t('pricing.priceCHF')}
                            value={customPrice.price || ''}
                            onChange={(e) => {
                              setCustomPrices(prev => prev.map(cp =>
                                cp.id === customPrice.id ? { ...cp, price: parseInt(e.target.value) || 0 } : cp
                              ))
                            }}
                            className="flex-1 sm:w-28 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm placeholder:text-gray-500 focus:border-purple-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCustomPrices(prev => prev.filter(cp => cp.id !== customPrice.id))
                            }}
                            className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex-shrink-0"
                            title={t('pricing.delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {customPrices.length === 0 && (
                  <div className="text-xs text-gray-500 italic">
                    {t('pricing.customNote')}
                  </div>
                )}

                <div className="mt-3 text-xs text-orange-300 flex items-start gap-2">
                  <span>⚠️</span>
                  <span>{t('pricing.customNote')}</span>
                </div>
              </div>

              <div className="mt-3 text-xs text-white/80">
                {t('pricing.availability')}
                <button onClick={()=> setActiveTab('agenda')} className="ml-2 text-purple-300 hover:text-purple-200 underline">{t('pricing.agendaTab')}</button>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Préférences supprimé */}
      </div>

      {/* Actions en bas supprimées (gérées par l'entête global) */}

      {/* Agenda Tab - Mobile First Responsive */}
      {activeTab === 'agenda' && (
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-3 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">{t('agenda.title')}</h3>
          <div className="space-y-4 sm:space-y-6">

            {/* Horaires hebdomadaires */}
            <div className="transition-opacity duration-200">
              <div className="bg-gray-700/20 rounded-xl p-3 sm:p-4">
                <h4 className="text-sm sm:text-base text-white/90 font-medium mb-3 sm:mb-4 flex items-center gap-2">
                  📅 Heures de présence
                  <span className="text-xs text-white/60 font-normal">(hebdomadaire)</span>
                </h4>

                {/* 🆕 Templates d'agenda rapides */}
                <div className="mb-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Template "Lun-Ven 10h-22h"
                      setWeekly({
                        Lundi: { enabled: true, start: '10:00', end: '22:00' },
                        Mardi: { enabled: true, start: '10:00', end: '22:00' },
                        Mercredi: { enabled: true, start: '10:00', end: '22:00' },
                        Jeudi: { enabled: true, start: '10:00', end: '22:00' },
                        Vendredi: { enabled: true, start: '10:00', end: '22:00' },
                        Samedi: { enabled: false, start: '10:00', end: '02:00' },
                        Dimanche: { enabled: false, start: '14:00', end: '02:00' },
                      })
                      setSaveMsg({ type: 'success', text: t('agenda.templates.applied', { template: t('agenda.templates.weekdays') }) })
                      setTimeout(() => setSaveMsg(null), 2000)
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30"
                  >
                    <Zap className="w-3 h-3" />
                    {t('agenda.templates.weekdays')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Template "Week-end only"
                      setWeekly({
                        Lundi: { enabled: false, start: '10:00', end: '22:00' },
                        Mardi: { enabled: false, start: '10:00', end: '22:00' },
                        Mercredi: { enabled: false, start: '10:00', end: '22:00' },
                        Jeudi: { enabled: false, start: '10:00', end: '22:00' },
                        Vendredi: { enabled: true, start: '18:00', end: '02:00' },
                        Samedi: { enabled: true, start: '14:00', end: '02:00' },
                        Dimanche: { enabled: true, start: '14:00', end: '23:00' },
                      })
                      setSaveMsg({ type: 'success', text: t('agenda.templates.applied', { template: t('agenda.templates.weekend') }) })
                      setTimeout(() => setSaveMsg(null), 2000)
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/30"
                  >
                    <Zap className="w-3 h-3" />
                    {t('agenda.templates.weekend')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Template "24/7"
                      setWeekly({
                        Lundi: { enabled: true, start: '00:00', end: '23:59' },
                        Mardi: { enabled: true, start: '00:00', end: '23:59' },
                        Mercredi: { enabled: true, start: '00:00', end: '23:59' },
                        Jeudi: { enabled: true, start: '00:00', end: '23:59' },
                        Vendredi: { enabled: true, start: '00:00', end: '23:59' },
                        Samedi: { enabled: true, start: '00:00', end: '23:59' },
                        Dimanche: { enabled: true, start: '00:00', end: '23:59' },
                      })
                      setSaveMsg({ type: 'success', text: t('agenda.templates.applied', { template: t('agenda.templates.allDay') }) })
                      setTimeout(() => setSaveMsg(null), 2000)
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30"
                  >
                    <Zap className="w-3 h-3" />
                    {t('agenda.templates.allDay')}
                  </button>
                </div>

                {/* Mobile: Stack vertically, Desktop: More compact */}
                <div className="space-y-3 sm:space-y-2">
                {Object.entries(weekly).map(([day, slot]) => (
                    <div key={day} className="bg-gray-600/20 rounded-lg p-3 sm:p-2">
                      {/* Mobile Layout */}
                      <div className="block sm:hidden space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white/90 capitalize">{t(`agenda.days.${day}`)}</span>
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={slot.enabled} 
                              onChange={(e)=> setWeekly(prev => ({ ...prev, [day]: { ...slot, enabled: e.target.checked } }))} 
                              className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                            /> 
                            <span className="text-sm">{slot.enabled ? `✅ ${t('agenda.open')}` : `❌ ${t('agenda.closed')}`}</span>
                          </label>
                        </div>
                        {slot.enabled && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-white/70 mb-1">{t('agenda.opening')}</label>
                              <input 
                                type="time" 
                                value={slot.start} 
                                onChange={(e)=> setWeekly(prev => ({ ...prev, [day]: { ...slot, start: e.target.value } }))} 
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-white/70 mb-1">{t('agenda.closing')}</label>
                              <input 
                                type="time" 
                                value={slot.end} 
                                onChange={(e)=> setWeekly(prev => ({ ...prev, [day]: { ...slot, end: e.target.value } }))} 
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex sm:items-center sm:gap-3">
                        <div className="w-20 text-white/90 font-medium capitalize">{t(`agenda.days.${day}`)}</div>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={slot.enabled} 
                            onChange={(e)=> setWeekly(prev => ({ ...prev, [day]: { ...slot, enabled: e.target.checked } }))} 
                            className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                          /> 
                          <span className="text-sm text-white/80">{slot.enabled ? '✅' : '❌'}</span>
                        </label>
                        <input 
                          type="time" 
                          value={slot.start} 
                          onChange={(e)=> setWeekly(prev => ({ ...prev, [day]: { ...slot, start: e.target.value } }))} 
                          className="px-3 py-1 rounded bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    <span className="text-white/60">—</span>
                        <input 
                          type="time" 
                          value={slot.end} 
                          onChange={(e)=> setWeekly(prev => ({ ...prev, [day]: { ...slot, end: e.target.value } }))} 
                          className="px-3 py-1 rounded bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                  </div>
                ))}
              </div>
            </div>
            </div>

            {/* Pause du compte */}
            <div className="transition-opacity duration-200">
              <div className="bg-gray-700/20 rounded-xl p-3 sm:p-4">
                <label className="inline-flex items-center gap-3 text-sm sm:text-base text-white/90 cursor-pointer mb-3">
                  <input 
                    type="checkbox" 
                    checked={pauseEnabled} 
                    onChange={(e)=> setPauseEnabled(e.target.checked)} 
                    className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  /> 
                  <span className="font-medium">{t('agenda.pause')}</span>
              </label>
                
              {pauseEnabled && (
                  <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                  <div>
                      <label className="block text-xs text-white/70 mb-2 font-medium">{t('agenda.pauseStart')}</label>
                      <input 
                        type="datetime-local" 
                        value={pauseStart} 
                        onChange={(e)=> setPauseStart(e.target.value)} 
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                  </div>
                  <div>
                      <label className="block text-xs text-white/70 mb-2 font-medium">{t('agenda.pauseReturn')}</label>
                      <input 
                        type="datetime-local" 
                        value={pauseEnd} 
                        onChange={(e)=> setPauseEnd(e.target.value)} 
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                  </div>
                </div>
              )}
            </div>
            </div>

            {/* Absences exceptionnelles */}
            <div className="transition-opacity duration-200">
              <div className="bg-gray-700/20 rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h4 className="text-sm sm:text-base text-white/90 font-medium flex items-center gap-2">
                    🚫 {t('agenda.absences')}
                  </h4>
                  <button
                    onClick={()=> setAbsences(prev => [...prev, { id: Math.random().toString(36).slice(2), start: new Date().toISOString().slice(0,10), end: new Date().toISOString().slice(0,10) }])}
                    className="px-3 py-2 rounded-lg border text-sm font-medium transition-colors bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border-purple-500/30"
                  >
                    {t('agenda.addAbsence')}
                  </button>
                </div>
                
                <div className="space-y-3">
                {absences.map((a) => (
                    <div key={a.id} className="bg-gray-600/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 items-center">
                          <div className="sm:col-span-1">
                            <label className="block text-xs text-white/70 mb-1 sm:hidden">Du</label>
                            <input 
                              type="date" 
                              value={a.start} 
                              onChange={(e)=> setAbsences(prev => prev.map(x => x.id===a.id ? { ...x, start: e.target.value } : x))} 
                              className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <span className="text-white/60 text-center hidden sm:block">→</span>
                          <div className="sm:col-span-1">
                            <label className="block text-xs text-white/70 mb-1 sm:hidden">Au</label>
                            <input 
                              type="date" 
                              value={a.end} 
                              onChange={(e)=> setAbsences(prev => prev.map(x => x.id===a.id ? { ...x, end: e.target.value } : x))} 
                              className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <button 
                          onClick={()=> setAbsences(prev => prev.filter(x => x.id!==a.id))} 
                          className="p-2 rounded-lg transition-colors text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X size={16}/>
                        </button>
                      </div>
                  </div>
                ))}
                  {absences.length === 0 && (
                    <div className="text-center py-4 text-white/50 text-sm">
                      {t('agenda.noAbsences')}
              </div>
                  )}
            </div>
              </div>
            </div>

            {/* Status message */}
            <div className="text-xs sm:text-sm text-white/70 border-t border-white/10 pt-3 sm:pt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>{t('agenda.autoSave')}</span>
              </div>
              {autoSaveMsg && <div className="text-emerald-300 mt-1">{autoSaveMsg}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Onglet Mes Clubs */}
      {activeTab === 'clubs' && <MyClubsTab />}

      {/* Barre d'actions en bas et modale de pause retirées (agenda centralise la pause) */}
    </div>
  )
}
