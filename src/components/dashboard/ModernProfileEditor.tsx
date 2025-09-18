'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { User, Image, Eye, Heart, Clock, Settings as SettingsIcon, CheckCircle2, AlertTriangle, ShieldCheck, Pause, Calendar, Save, X, BadgeCheck, Search, Loader2 } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import AddressAutocomplete from '../ui/AddressAutocomplete'

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

interface ProfileData {
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
    fifteenMin?: number
    thirtyMin?: number
    oneHour: number
    twoHours?: number
    overnight?: number
  }
  paymentMethods: string[]
  paymentCurrencies?: string[]
  availability: string[]
  timeSlots: string[]

  // Localisation
  canton: string
  city: string
  address: string
  coordinates?: { lat: number; lng: number }
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

export default function ModernProfileEditor({ agendaOnly = false }: { agendaOnly?: boolean }) {
  const [activeTab, setActiveTab] = useState('media')
  const fileInputsRef = useRef<Array<HTMLInputElement | null>>([])
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [mandatoryMedia, setMandatoryMedia] = useState<Array<{ file?: File; preview?: string; id?: string; uploading?: boolean }>>(
    () => Array.from({ length: 6 }, () => ({ file: undefined, preview: undefined, id: undefined, uploading: false }))
  )
  // Prix toujours visibles; plus de repli
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [autoSaveMsg, setAutoSaveMsg] = useState<string | null>(null)
  const autoSaveTimer = useRef<any>(null)
  const [status, setStatus] = useState<'PENDING' | 'ACTIVE' | 'PAUSED' | 'VERIFIED'>('PENDING')
  const [kycVerified, setKycVerified] = useState(false)
  const [kycStatus, setKycStatus] = useState<'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NONE')
  const [hasEscortProfile, setHasEscortProfile] = useState<boolean | null>(null)
  const [agendaEnabled, setAgendaEnabled] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const savedSnapshotRef = useRef<Partial<ProfileData>>({})
  const [pauseOpen, setPauseOpen] = useState(false)
  const [pauseReturnAt, setPauseReturnAt] = useState<string>('')
  // Charger les médias existants (positions 1-6)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/escort/profile', { cache: 'no-store', credentials: 'include' })
        const j = await res.json().catch(() => ({}))
        const gallery = j?.profile?.galleryPhotos
        const slots = Array.from({ length: 6 }, () => ({ file: undefined as File|undefined, preview: undefined as string|undefined, id: undefined as string|undefined, uploading: false }))
        if (gallery) {
          let arr: any[] = []
          try { arr = Array.isArray(gallery) ? gallery : JSON.parse(gallery) } catch { arr = [] }
          for (const it of arr) {
            const s = Number(it?.slot)
            if (Number.isFinite(s) && s >= 0 && s < 6 && it?.url) {
              slots[s] = { file: undefined, preview: String(it.url), id: String(it.id || `slot-${s}`), uploading: false }
            }
          }
        }
        // N'écrase pas si aucun média serveur (évite d'annuler un upload en cours)
        const serverCount = slots.filter(s => !!s.preview).length
        if (!cancelled && serverCount > 0) setMandatoryMedia(slots)
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

  // React to ?tab=... changes (e.g., Agenda from footer)
  const searchParams = useSearchParams()
  useEffect(() => {
    try {
      if (agendaOnly) {
        setActiveTab('agenda')
        return
      }
      const tab = searchParams.get('tab')
      if (tab && ['media','basic','appearance','services','pricing','agenda'].includes(tab)) {
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
    languages: [],
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
    paymentMethods: [],
    paymentCurrencies: ['CHF'],
    availability: [],
    timeSlots: [],
    canton: '',
    city: '',
    address: '',
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
        const r = await fetch('/api/escort/profile', { cache: 'no-store', credentials: 'include' })
        const j = await r.json()
        if (!r.ok || !j?.profile || cancelled) return
        const p = j.profile
        setProfileData(prev => ({
          ...prev,
          stageName: p.stageName || '',
          description: p.description || '',
          age: (() => { try { return p.dateOfBirth ? (new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()) : undefined } catch { return undefined } })(),
          languages: (()=>{ try { 
            const raw = String(p.languages||'')
            if (!raw) return []
            if (raw.trim().startsWith('[')) { const L = JSON.parse(raw); return Array.isArray(L)?L:[] }
            return raw.split(',').map((x:string)=>x.trim()).filter(Boolean)
          } catch { return [] } })(),
          serviceType: (()=>{ try { 
            const raw = String(p.services||'')
            if (!raw) return []
            if (raw.trim().startsWith('[')) { const S = JSON.parse(raw); return Array.isArray(S)?S:[] }
            return raw.split(',').map((x:string)=>x.trim()).filter(Boolean)
          } catch { return [] } })(),
          outcall: !!p.outcall,
          incall: !!p.incall,
          prices: { 
            oneHour: p.rate1H || undefined,
            twoHours: p.rate2H || undefined,
            overnight: p.rateOvernight || undefined
          },
          canton: p.canton || '',
          city: p.ville || p.city || '',  // Priorise ville (nouveau) puis city (legacy)
          address: (() => {
            // Reconstituer adresse complète à partir des nouveaux champs si disponibles
            if (p.rue && p.codePostal) {
              return `${p.rue}${p.numero ? ' ' + p.numero : ''}, ${p.codePostal} ${p.ville || p.city || ''}`.trim()
            }
            // Fallback sur workingArea (legacy)
            return p.workingArea || ''
          })(),
          coordinates: (typeof p.latitude === 'number' && typeof p.longitude === 'number') ? { lat: p.latitude, lng: p.longitude } : undefined,
          phone: p.user?.phone || '',
          phoneVisibility: p.phoneVisibility || 'hidden',
          specialties: (()=>{ try { 
            const raw = String(p.practices||'')
            if (!raw) return []
            if (raw.trim().startsWith('[')) { const S = JSON.parse(raw); return Array.isArray(S)?S:[] }
            return raw.split(',').map((x:string)=>x.trim()).filter(Boolean)
          } catch { return [] } })(),
          height: p.height || undefined,
          bodyType: p.bodyType || '',
          hairColor: p.hairColor || '',
          eyeColor: p.eyeColor || '',
          ethnicity: p.ethnicity || '',
          breastSize: p.bustSize || '',
          breastType: p.breastType || undefined,
          pubicHair: p.pubicHair || undefined,
          smoker: typeof p.smoker === 'boolean' ? p.smoker : undefined,
          tattoos: p.tattoos ? p.tattoos === 'true' : false,
          piercings: p.piercings ? p.piercings === 'true' : false,
          acceptsCouples: !!p.acceptsCouples,
          acceptsWomen: !!p.acceptsWomen,
          acceptsHandicapped: !!p.acceptsHandicapped,
          acceptsSeniors: !!p.acceptsSeniors,
        }))

        // Parse agenda (timeSlots JSON)
        try {
          if (p.timeSlots) {
            const sched = typeof p.timeSlots === 'string' ? JSON.parse(p.timeSlots) : p.timeSlots
            // Weekly
            if (sched?.weekly && Array.isArray(sched.weekly)) {
              const mapDays = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche']
              const nextWeekly: any = {}
              for (let i = 0; i < mapDays.length; i++) {
                const w = sched.weekly.find((it: any) => Number(it.weekday) === i)
                nextWeekly[mapDays[i] as any] = {
                  enabled: !!w?.enabled,
                  start: String(w?.start || '10:00'),
                  end: String(w?.end || '22:00')
                }
              }
              setWeekly(nextWeekly)
            }
            // Pause
            if (sched?.pause) {
              setPauseEnabled(true)
              setPauseStart(String(sched.pause.start || ''))
              setPauseEnd(String(sched.pause.end || ''))
            } else {
              setPauseEnabled(false)
              setPauseStart('')
              setPauseEnd('')
            }
            // Absences
            if (Array.isArray(sched?.absences)) {
              setAbsences(sched.absences.map((a: any, idx: number) => ({ id: String(a.id || idx), start: String(a.start || ''), end: String(a.end || '') })))
            }
          }
        } catch {}
      } catch {}
    })()
    return () => { cancelled = true }
  }, [])

  // Language levels (1-5) UI-only for now
  const [languageLevels, setLanguageLevels] = useState<Record<string, number>>({})

  const tabs = [
    { key: 'media', label: 'Médias', icon: Image, description: 'Photos et vidéos' },
    { key: 'basic', label: 'Informations de base', icon: User, description: 'Profil général' },
    { key: 'appearance', label: 'Apparence physique', icon: Eye, description: 'Caractéristiques physiques' },
    { key: 'services', label: 'Clientèle & Services', icon: Heart, description: 'Groupes + tags' },
    { key: 'pricing', label: 'Tarifs & Paiements', icon: Clock, description: 'Prix et horaires' },
    { key: 'agenda', label: 'Agenda', icon: Calendar, description: 'Disponibilités & absences' },
    // Onglet Préférences retiré sur demande
  ]

  const updateProfileData = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateNestedProfileData = (parent: string, field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof ProfileData],
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
          timeSlots: JSON.stringify({ weekly: packed, pause: pauseEnabled ? { start: pauseStart, end: pauseEnd } : null, absences })
        }
        await fetch('/api/escort/profile/update', {
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
          <h3 className="text-xl font-bold text-white mb-4">Agenda</h3>
          <div className="space-y-6">
            <div>
              <label className="inline-flex items-center gap-2 text-sm text-white/90">
                <input type="checkbox" checked={agendaEnabled} onChange={(e)=> setAgendaEnabled(e.target.checked)} /> Activer l'agenda
              </label>
            </div>
            <div className={agendaEnabled ? '' : 'opacity-50'}>
              <div className="text-sm text-white/90 font-medium mb-2">Heures de présence (hebdo)</div>
              <div className="space-y-2">
                {Object.entries(weekly).map(([day, slot]) => (
                  <div key={day} className="flex items-center gap-2">
                    <div className="w-28 text-white/90">{day}</div>
                    <label className="inline-flex items-center gap-2"><input type="checkbox" checked={slot.enabled} disabled={!agendaEnabled} onChange={(e)=> setWeekly(prev => ({ ...prev, [day]: { ...slot, enabled: e.target.checked } }))} /> <span className="text-sm text-white/80">{slot.enabled ? '✅' : '❌'}</span></label>
                    <input type="time" value={slot.start} disabled={!agendaEnabled} onChange={(e)=> setWeekly(prev => ({ ...prev, [day]: { ...slot, start: e.target.value } }))} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm"/>
                    <span className="text-white/60">—</span>
                    <input type="time" value={slot.end} disabled={!agendaEnabled} onChange={(e)=> setWeekly(prev => ({ ...prev, [day]: { ...slot, end: e.target.value } }))} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm"/>
                  </div>
                ))}
              </div>
            </div>
            <div className={`space-y-2 ${agendaEnabled ? '' : 'opacity-50'}`}>
              <label className="inline-flex items-center gap-2 text-sm text-white/90">
                <input type="checkbox" checked={pauseEnabled} disabled={!agendaEnabled} onChange={(e)=> setPauseEnabled(e.target.checked)} /> Mettre mon compte en pause
              </label>
              {pauseEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/70 mb-1">Début de pause</label>
                    <input type="datetime-local" value={pauseStart} disabled={!agendaEnabled} onChange={(e)=> setPauseStart(e.target.value)} className="w-full px-2 py-2 rounded bg-white/5 border border-white/10 text-white text-sm"/>
                  </div>
                  <div>
                    <label className="block text-xs text-white/70 mb-1">Retour</label>
                    <input type="datetime-local" value={pauseEnd} disabled={!agendaEnabled} onChange={(e)=> setPauseEnd(e.target.value)} className="w-full px-2 py-2 rounded bg-white/5 border border-white/10 text-white text-sm"/>
                  </div>
                </div>
              )}
            </div>
            <div className={`space-y-2 ${agendaEnabled ? '' : 'opacity-50'}`}>
              <div className="text-sm text-white/90 font-medium">Jours d'absence exceptionnels</div>
              <button disabled={!agendaEnabled} onClick={()=> setAbsences(prev => [...prev, { id: Math.random().toString(36).slice(2), start: new Date().toISOString().slice(0,10), end: new Date().toISOString().slice(0,10) }])} className={`px-3 py-2 rounded-lg border w-fit ${agendaEnabled ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-white/5 text-white/40 border-white/10 cursor-not-allowed'}`}>Ajouter une absence</button>
              <div className="space-y-2">
                {absences.map((a) => (
                  <div key={a.id} className="flex items-center gap-2">
                    <input type="date" value={a.start} disabled={!agendaEnabled} onChange={(e)=> setAbsences(prev => prev.map(x => x.id===a.id ? { ...x, start: e.target.value } : x))} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm"/>
                    <span className="text-white/60">→</span>
                    <input type="date" value={a.end} disabled={!agendaEnabled} onChange={(e)=> setAbsences(prev => prev.map(x => x.id===a.id ? { ...x, end: e.target.value } : x))} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm"/>
                    <button disabled={!agendaEnabled} onClick={()=> setAbsences(prev => prev.filter(x => x.id!==a.id))} className={`${agendaEnabled ? 'text-white/70 hover:text-white' : 'text-white/40 cursor-not-allowed'}`}>×</button>
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
    const mediasOk = mandatoryMedia.filter(m => !!m.preview).length === 6
    checks.push({ key: 'medias', label: '6 médias requis', ok: mediasOk, targetTab: 'media' })
    checks.push({ key: 'stageName', label: 'Pseudo', ok: !!profileData.stageName, targetTab: 'basic' })
    checks.push({ key: 'category', label: 'Catégorie', ok: (profileData.serviceType||[]).length>0, targetTab: 'basic' })
    checks.push({ key: 'age', label: 'Âge', ok: !!profileData.age, targetTab: 'basic' })
    checks.push({ key: 'description', label: 'Description (≥ 200 car.)', ok: (profileData.description||'').trim().length >= 200, targetTab: 'basic' })
    checks.push({ key: 'languages', label: 'Langues (≥1)', ok: (profileData.languages||[]).length >= 1, targetTab: 'basic' })
    checks.push({ key: 'canton', label: 'Canton', ok: !!profileData.canton, targetTab: 'basic' })
    checks.push({ key: 'city', label: 'Ville principale', ok: !!profileData.city, targetTab: 'basic' })
    checks.push({ key: 'address', label: 'Adresse complète', ok: !!profileData.address && !!profileData.coordinates, targetTab: 'basic' })
    return checks
  }, [mandatoryMedia, profileData.stageName, profileData.serviceType, profileData.age, profileData.description, profileData.languages, profileData.canton, profileData.city, profileData.address, profileData.coordinates])

  const completionPct = useMemo(() => {
    const total = requiredChecks.length
    const ok = requiredChecks.filter(c => c.ok).length
    return Math.round((ok/total)*100)
  }, [requiredChecks])

  // Propagate completion to header (live)
  useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent('profile:progress', { detail: { pct: completionPct } }))
    } catch {}
  }, [completionPct])

  // Autosave (700ms debounce)
  const scheduleToJson = () => {
    const mapDays = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche']
    const packed = mapDays.map((d, idx) => ({ weekday: idx, ...weekly[d as keyof typeof weekly] }))
    return JSON.stringify({ weekly: packed, pause: pauseEnabled ? { start: pauseStart, end: pauseEnd } : null, absences })
  }

  const doSave = async (payload: any, silent = false, retryCount = 0): Promise<boolean> => {
    const maxRetries = 3
    try {
      const res = await fetch('/api/escort/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      const data = await res.json().catch(() => ({}))

      // Si erreur 500 ou 401, on retry automatiquement
      if ((res.status === 500 || res.status === 401) && retryCount < maxRetries) {
        console.log(`🔄 [DASHBOARD] Retry ${retryCount + 1}/${maxRetries} pour erreur ${res.status}`)
        if (!silent) setSaveMsg({ type: 'warning', text: `Retry ${retryCount + 1}/${maxRetries}...` })
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))) // Délai progressif
        return doSave(payload, silent, retryCount + 1)
      }

      if (!res.ok || !data?.success) throw new Error(data?.details || data?.error || 'Échec de la sauvegarde')
      if (!silent) setSaveMsg({ type: 'success', text: data.message || 'Modifications enregistrées' })
      if (!silent) setTimeout(() => setSaveMsg(null), 3000)
      if (silent) {
        setAutoSaveMsg('Disponibilité mise à jour ✓')
        setTimeout(() => setAutoSaveMsg(null), 1200)
      }
      return true
    } catch (err: any) {
      const errorMsg = err?.message || 'Erreur lors de la sauvegarde'
      if (retryCount >= maxRetries) {
        if (!silent) setSaveMsg({ type: 'error', text: `${errorMsg} (échec après ${maxRetries} tentatives)` })
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

  const triggerAutoSave = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      const payload: any = {}
      if (profileData.age !== undefined) payload.age = profileData.age as number
      if (profileData.address !== undefined) payload.address = profileData.address
      if (profileData.stageName !== undefined) payload.stageName = profileData.stageName
      if (profileData.description !== undefined) payload.description = profileData.description
      if (profileData.city !== undefined) payload.city = profileData.city
      if (profileData.canton !== undefined) payload.canton = profileData.canton
      if (profileData.phone !== undefined) payload.phone = profileData.phone
      if (profileData.incall !== undefined) payload.incall = !!profileData.incall
      if (profileData.outcall !== undefined) payload.outcall = !!profileData.outcall
      if (profileData.coordinates) { payload.latitude = profileData.coordinates.lat; payload.longitude = profileData.coordinates.lng }
      if (profileData.languages && profileData.languages.length > 0) payload.languages = JSON.stringify(profileData.languages)
      // Combiner catégorie et services détaillés dans le champ services
      const serviceDetails = (profileData.specialties || []).filter(s => s.startsWith('srv:'))
      const allServices = [
        ...(profileData.serviceType || []), // Catégorie principale (escort, masseuse, etc.)
        ...serviceDetails // Services détaillés uniquement
      ]
      console.log('[DASHBOARD] Saving services:', {
        serviceType: profileData.serviceType,
        specialties: profileData.specialties,
        serviceDetails,
        allServices
      })
      if (allServices.length > 0) payload.services = JSON.stringify(allServices)
      if (profileData.specialties && profileData.specialties.length > 0) payload.practices = JSON.stringify(profileData.specialties)
      if (profileData.prices?.oneHour !== undefined) payload.rate1H = profileData.prices.oneHour
      if (profileData.prices?.twoHours !== undefined) payload.rate2H = profileData.prices.twoHours
      if (profileData.prices?.overnight !== undefined) payload.rateOvernight = profileData.prices.overnight
      if (profileData.height !== undefined) payload.height = profileData.height
      if (profileData.bodyType !== undefined) payload.bodyType = profileData.bodyType
      if (profileData.hairColor !== undefined) payload.hairColor = profileData.hairColor
      if (profileData.eyeColor !== undefined) payload.eyeColor = profileData.eyeColor
      if (profileData.ethnicity !== undefined) payload.ethnicity = profileData.ethnicity
      if (profileData.breastSize !== undefined) payload.bustSize = profileData.breastSize
      if (profileData.tattoos !== undefined) payload.tattoos = String(profileData.tattoos)
      if (profileData.piercings !== undefined) payload.piercings = String(profileData.piercings)
      if (profileData.phoneVisibility) payload.phoneVisibility = profileData.phoneVisibility
      if (profileData.breastType) payload.breastType = profileData.breastType
      if (profileData.pubicHair) payload.pubicHair = profileData.pubicHair  
      if (typeof profileData.smoker === 'boolean') payload.smoker = profileData.smoker
      if (typeof profileData.acceptsCouples === 'boolean') payload.acceptsCouples = profileData.acceptsCouples
      if (typeof profileData.acceptsWomen === 'boolean') payload.acceptsWomen = profileData.acceptsWomen
      if (typeof profileData.acceptsHandicapped === 'boolean') payload.acceptsHandicapped = profileData.acceptsHandicapped
      if (typeof profileData.acceptsSeniors === 'boolean') payload.acceptsSeniors = profileData.acceptsSeniors
      payload.timeSlots = scheduleToJson()
      console.log('[DASHBOARD] Auto-saving agenda data:', payload.timeSlots)
      await doSave(payload, true)
    }, 700)
  }

  useEffect(() => {
    triggerAutoSave()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData.description, profileData.city, profileData.canton, profileData.phone, profileData.phoneVisibility, profileData.incall, profileData.outcall, profileData.languages, profileData.serviceType, profileData.specialties, profileData.prices?.oneHour, profileData.prices?.twoHours, profileData.prices?.overnight, profileData.height, profileData.bodyType, profileData.breastType, profileData.hairColor, profileData.eyeColor, profileData.ethnicity, profileData.breastSize, profileData.pubicHair, profileData.smoker, profileData.tattoos, profileData.piercings, profileData.acceptsCouples, profileData.acceptsWomen, profileData.acceptsHandicapped, profileData.acceptsSeniors, weekly, pauseEnabled, pauseStart, pauseEnd, absences])

  const manualSave = async () => {
    try {
      setSaving(true)
      setSaveMsg(null)
      const payload: any = {}
      if (profileData.age !== undefined) payload.age = profileData.age as number
      if (profileData.address !== undefined) payload.address = profileData.address
      if (profileData.stageName !== undefined) payload.stageName = profileData.stageName
      if (profileData.description !== undefined) payload.description = profileData.description
      if (profileData.city !== undefined) payload.city = profileData.city
      if (profileData.canton !== undefined) payload.canton = profileData.canton
      if (profileData.phone !== undefined) payload.phone = profileData.phone
      if (profileData.incall !== undefined) payload.incall = !!profileData.incall
      if (profileData.outcall !== undefined) payload.outcall = !!profileData.outcall
      if (profileData.coordinates) { payload.latitude = profileData.coordinates.lat; payload.longitude = profileData.coordinates.lng }
      if (profileData.languages && profileData.languages.length > 0) payload.languages = JSON.stringify(profileData.languages)
      // Combiner catégorie et services détaillés dans le champ services
      const serviceDetails = (profileData.specialties || []).filter(s => s.startsWith('srv:'))
      const allServices = [
        ...(profileData.serviceType || []), // Catégorie principale (escort, masseuse, etc.)
        ...serviceDetails // Services détaillés uniquement
      ]
      console.log('[DASHBOARD] Saving services:', {
        serviceType: profileData.serviceType,
        specialties: profileData.specialties,
        serviceDetails,
        allServices
      })
      if (allServices.length > 0) payload.services = JSON.stringify(allServices)
      if (profileData.specialties && profileData.specialties.length > 0) payload.practices = JSON.stringify(profileData.specialties)
      payload.timeSlots = scheduleToJson()
      if (profileData.height !== undefined) payload.height = profileData.height
      if (profileData.bodyType !== undefined) payload.bodyType = profileData.bodyType
      if (profileData.hairColor !== undefined) payload.hairColor = profileData.hairColor
      if (profileData.eyeColor !== undefined) payload.eyeColor = profileData.eyeColor
      if (profileData.ethnicity !== undefined) payload.ethnicity = profileData.ethnicity
      if (profileData.breastSize !== undefined) payload.bustSize = profileData.breastSize
      if (profileData.tattoos !== undefined) payload.tattoos = String(profileData.tattoos)
      if (profileData.piercings !== undefined) payload.piercings = String(profileData.piercings)
      if (profileData.prices?.oneHour !== undefined) payload.rate1H = profileData.prices.oneHour
      if (profileData.prices?.twoHours !== undefined) payload.rate2H = profileData.prices.twoHours
      if (profileData.prices?.overnight !== undefined) payload.rateOvernight = profileData.prices.overnight
      if (profileData.phoneVisibility) payload.phoneVisibility = profileData.phoneVisibility
      if (profileData.breastType) payload.breastType = profileData.breastType
      if (profileData.pubicHair) payload.pubicHair = profileData.pubicHair
      if (typeof profileData.smoker === 'boolean') payload.smoker = profileData.smoker
      if (typeof profileData.acceptsCouples === 'boolean') payload.acceptsCouples = profileData.acceptsCouples
      if (typeof profileData.acceptsWomen === 'boolean') payload.acceptsWomen = profileData.acceptsWomen
      if (typeof profileData.acceptsHandicapped === 'boolean') payload.acceptsHandicapped = profileData.acceptsHandicapped
      if (typeof profileData.acceptsSeniors === 'boolean') payload.acceptsSeniors = profileData.acceptsSeniors
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
    const onCancel = () => { setProfileData(savedSnapshotRef.current); setSaveMsg({ type: 'success', text: 'Modifications annulées' }); setTimeout(()=> setSaveMsg(null), 2000) }
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
      {/* Checklist obligatoire (pills) */}
      <div className="flex flex-wrap gap-2">
        {requiredChecks.map(c => (
          <button key={c.key} onClick={()=> setActiveTab(c.targetTab)} className={`text-xs rounded-full px-2.5 py-1 border ${c.ok ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'}`}>
            {c.ok ? <CheckCircle2 size={12} className="inline mr-1"/> : <AlertTriangle size={12} className="inline mr-1"/>}
            {c.label}
          </button>
        ))}
      </div>
      {/* Barre de progression + KYC (profil uniquement) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-40 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${completionPct}%` }} />
          </div>
          <div className="text-white/80 text-sm">{completionPct}%</div>
        </div>
        <div>
          {kycStatus === 'APPROVED' ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Compte vérifié</span>
          ) : kycStatus === 'PENDING' ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-yellow-500/15 text-yellow-200 border border-yellow-500/30">Vérification en cours…</span>
          ) : (
            <a href="/certification" className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-white/5 text-white/80 border border-white/10 hover:bg-white/10">Certifier mon compte</a>
          )}
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {tabs.map((tab) => {
          const IconComponent = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`p-4 rounded-xl text-left transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 border'
                  : 'bg-gray-800/30 border border-gray-700/50 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <IconComponent size={18} className={activeTab === tab.key ? 'text-purple-400' : 'text-gray-400'} />
                <span className={`font-medium text-sm ${
                  activeTab === tab.key ? 'text-purple-400' : 'text-white'
                }`}>
                  {tab.label}
                </span>
              </div>
              <p className="text-xs text-gray-400">{tab.description}</p>
            </button>
          )
        })}
      </div>

      {/* Contenu des onglets */}
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        {activeTab === 'media' && (
          <div>
            <h3 className="text-xl font-bold text-white">Médias obligatoires</h3>
            <div className="text-xs text-orange-300 mt-1">⚠️ 6 médias requis pour activer le profil</div>
            <div className="text-xs text-purple-300 mb-5">Astuce : les profils avec vidéo sont 3× plus vus.</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* 6 médias obligatoires avec drop/upload par emplacement */}
              {[
                { n: 1, label: 'Photo de profil', accept: 'image/*' },
                { n: 2, label: 'Vidéo de présentation', note: 'Augmente votre visibilité', accept: 'video/*' },
                { n: 3, label: 'Photo', accept: 'image/*' },
                { n: 4, label: 'Vidéo', accept: 'video/*' },
                { n: 5, label: 'Photo', accept: 'image/*' },
                { n: 6, label: 'Photo', accept: 'image/*' }
              ].map((slot, idx) => {
                const media = mandatoryMedia[idx]
                const isVideo = (!!media?.file && media.file.type.startsWith('video/')) || (!!media?.preview && slot.accept.startsWith('video'))
                const isDragging = draggingIndex === idx

                const onFilePicked = async (file: File) => {
                  if (!file) return
                  if (hasEscortProfile === false) { setSaveMsg({ type:'error', text:'Créez d\'abord votre profil (enregistrez vos infos), puis réessayez.' }); setTimeout(()=> setSaveMsg(null), 3000); return }
                  const isValid = slot.accept.startsWith('image') ? file.type.startsWith('image/') : file.type.startsWith('video/')
                  if (!isValid) return
                  let fileToUpload: File = file
                  // Compression vidéo stricte pour éviter 413 sur Vercel
                  if (file.type.startsWith('video/') && file.size > 4 * 1024 * 1024) {
                    try {
                      const result = await videoCompressor.compressVideo(file, { maxSizeMB: 3.5, quality: 0.8 })
                      fileToUpload = result.file
                    } catch (e:any) {
                      setSaveMsg({ type:'error', text: `Compression vidéo échouée: ${e?.message||'inconnue'}` })
                      setTimeout(()=> setSaveMsg(null), 4000)
                      return
                    }
                    if (fileToUpload.size > 4 * 1024 * 1024) {
                      setSaveMsg({ type:'error', text: 'Vidéo trop volumineuse après compression (limite 4MB).' })
                      setTimeout(()=> setSaveMsg(null), 4000)
                      return
                    }
                  }
                  const preview = URL.createObjectURL(fileToUpload)
                  // Upload immédiatement
                  try {
                    setMandatoryMedia(prev => { const next=[...prev]; next[idx] = { ...(next[idx]||{}), uploading: true }; return next })
                    const fd = new FormData()
                    fd.append('file', fileToUpload)
                    // API persistante des slots obligatoires
                    const zeroBasedSlot = Math.max(0, Math.min(5, (slot.n || (idx+1)) - 1))
                    fd.append('slot', String(zeroBasedSlot))
                    fd.append('isPrivate', 'false')
                    const res = await fetch('/api/escort/media/upload', { method: 'POST', body: fd, credentials: 'include' })
                    let data = await res.json().catch(() => ({}))
                    if (!res.ok || !data?.success) {
                      // Fallback to legacy endpoint if new one fails
                      const fd2 = new FormData()
                      fd2.append('file', fileToUpload)
                      fd2.append('type', (fileToUpload.type.startsWith('image/') ? 'IMAGE' : 'VIDEO'))
                      fd2.append('visibility', 'PUBLIC')
                      fd2.append('position', String(slot.n))
                      const res2 = await fetch('/api/media/upload', { method: 'POST', body: fd2, credentials: 'include' })
                      const d2 = await res2.json().catch(() => ({}))
                      if (!res2.ok || !d2?.mediaId) throw new Error(d2?.error || data?.error || 'Upload échoué')
                      data = { success: true, url: (d2?.url || preview), slot: zeroBasedSlot, legacyMediaId: d2.mediaId, slots: undefined }
                    }
                    setMandatoryMedia(prev => {
                      const next = [...prev]
                      // cleanup old preview if exists
                      if (next[idx]?.preview) {
                        try { URL.revokeObjectURL(next[idx]!.preview as string) } catch {}
                      }
                      // Utiliser l'URL serveur pour préserver l'aperçu après refresh
                      const serverUrl = data?.url || preview
                      const returnedSlot = typeof data?.slot === 'number' ? data.slot : zeroBasedSlot
                      const returnedId = (Array.isArray(data?.slots) && data.slots[returnedSlot]?.id) ? String(data.slots[returnedSlot].id) : undefined
                      const id = data?.legacyMediaId ? String(data.legacyMediaId) : (returnedId || `slot-${returnedSlot}`)
                      next[idx] = { file, preview: serverUrl, id, uploading: false }
                      return next
                    })
                    setSaveMsg({ type: 'success', text: 'Média uploadé' })
                    setTimeout(() => setSaveMsg(null), 2500)
                  } catch (e: any) {
                    setSaveMsg({ type: 'error', text: e?.message || 'Échec de l\'upload' })
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
                      isDragging ? 'border-purple-400 bg-purple-500/10' : 'border-gray-600 hover:border-purple-500 bg-gray-700/50'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDraggingIndex(idx) }}
                    onDragLeave={() => setDraggingIndex(null)}
                    onDrop={onDrop}
                    onClick={() => fileInputsRef.current[idx]?.click()}
                  >
                    {/* Header slot */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">{slot.n}</span>
                        <span className="text-[11px] text-purple-300">OBLIGATOIRE</span>
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
                                if (!resp.ok || !d?.success) throw new Error(d?.error || 'Suppression échouée')
                              }
                            } catch (err:any) {
                              setSaveMsg({ type:'error', text: err?.message || 'Impossible de supprimer' })
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
                          Retirer
                        </button>
                      )}
                    </div>

                    {/* Label + note */}
                    <div className="text-sm text-white font-medium flex items-center gap-2">
                      {slot.label}
                      {media?.preview && <span title="OK" className="inline-flex items-center text-emerald-300 text-[11px]"><CheckCircle2 size={14} className="mr-1"/>OK</span>}
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
                          <span className="text-xs">Déposez ou cliquez pour ajouter</span>
                          <span className="text-[10px] text-gray-500 mt-1">{slot.accept.startsWith('image') ? 'Formats: JPG, PNG, WEBP (max 50MB)' : 'Formats: MP4, WEBM, MOV (max 50MB)'}</span>
                        </div>
                      )}
                      {media?.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="flex items-center gap-2 text-white/80 text-xs">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Envoi…</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hidden input */}
                    <input
                      ref={(el) => (fileInputsRef.current[idx] = el)}
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
          </div>
        )}

        {activeTab === 'basic' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Informations de base</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom d'artiste *</label>
                  <input
                    type="text"
                    value={profileData.stageName || ''}
                    onChange={(e) => updateProfileData('stageName', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie *</label>
                  <select
                    value={(profileData.serviceType||[])[0] || ''}
                    onChange={(e) => updateProfileData('serviceType', e.target.value ? [e.target.value] : [])}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Sélectionner</option>
                    <option value="escort">Escort</option>
                    <option value="masseuse-erotique">Masseuse érotique</option>
                    <option value="dominatrice-bdsm">Dominatrice BDSM</option>
                    <option value="transsexuel">Transsexuel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Âge *</label>
                  <select
                    value={profileData.age || ''}
                    onChange={(e) => updateProfileData('age', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Sélectionner</option>
                    <optgroup label="18-25 ans">
                      {Array.from({length: 8}, (_, i) => 18 + i).map(age => (
                        <option key={age} value={age}>{age} ans</option>
                      ))}
                    </optgroup>
                    <optgroup label="26-30 ans">
                      {Array.from({length: 5}, (_, i) => 26 + i).map(age => (
                        <option key={age} value={age}>{age} ans</option>
                      ))}
                    </optgroup>
                    <optgroup label="31-40 ans">
                      {Array.from({length: 10}, (_, i) => 31 + i).map(age => (
                        <option key={age} value={age}>{age} ans</option>
                      ))}
                    </optgroup>
                    <optgroup label="40+ ans">
                      {Array.from({length: 20}, (_, i) => 41 + i).map(age => (
                        <option key={age} value={age}>{age} ans</option>
                      ))}
                    </optgroup>
                  </select>
                  <div className="mt-2 text-xs">
                    <a href="/certification" className="text-purple-300 hover:text-purple-200 inline-flex items-center gap-1"><BadgeCheck size={14}/> Certifier mon âge</a>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                <textarea
                  rows={4}
                  value={profileData.description || ''}
                  onChange={(e) => updateProfileData('description', e.target.value)}
                  placeholder="Décrivez-vous de manière attractive et professionnelle..."
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none resize-none"
                />
                <div className={`mt-1 text-xs ${((profileData.description||'').length>=200)?'text-emerald-300':'text-gray-400'}`}>{(profileData.description||'').length} / 200</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Langues parlées</label>
                <div className="text-xs text-gray-400 mb-2">Sélectionnez au moins une langue. Puis définissez le niveau: 1 Débutant · 3 Intermédiaire · 5 Courant/Fluide.</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Français', 'Anglais', 'Allemand', 'Italien', 'Espagnol', 'Russe', 'Arabe', 'Chinois'].map((lang) => {
                    const selected = profileData.languages?.includes(lang) || false
                    const level = languageLevels[lang] || 3
                    return (
                      <div key={lang} className={`flex items-center justify-between rounded-lg border px-3 py-2 ${selected ? 'border-purple-500/30 bg-purple-500/10' : 'border-white/10 bg-white/5'}`}>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => {
                              toggleArrayItem('languages', lang)
                              if (!selected) setLanguageLevels(prev => ({ ...prev, [lang]: prev[lang] || 3 }))
                            }}
                            className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-300">{lang}</span>
                        </label>
                        {selected && (
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(n => (
                              <button
                                key={n}
                                onClick={()=> setLanguageLevels(prev => ({ ...prev, [lang]: n }))}
                                className={`w-4 h-4 transform rotate-45 border transition-colors focus:outline-none focus:ring-2 ${n <= level ? 'bg-pink-500 border-pink-300 focus:ring-pink-400' : 'bg-transparent border-white/40 hover:bg-white/30'}`}
                                title={`Niveau ${n}`}
                                aria-label={`Niveau ${n}`}
                              />
                            ))}
                            <span className="ml-2 text-[11px] text-white/70">Niv. {level}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Localisation (obligatoire) */}
              <div className="rounded-2xl p-4 border border-pink-500/30 bg-pink-500/5">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-white">Localisation</label>
                  <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-200 border border-pink-500/30">Obligatoire</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Canton <span className="text-red-400">*</span></label>
                    <select
                      value={profileData.canton || ''}
                      onChange={(e) => {
                        const code = e.target.value
                        updateProfileData('canton', code)
                        // Réinitialiser ville si la ville actuelle n'appartient pas au canton choisi
                        const allowed = CITY_BY_CANTON[code] || []
                        if (profileData.city && !allowed.includes(profileData.city)) {
                          updateProfileData('city', '')
                        }
                      }}
                      className={`w-full px-3 py-2 bg-gray-700/50 border rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none ${!profileData.canton ? 'border-red-500/50' : 'border-gray-600/50'}`}
                      aria-invalid={!profileData.canton}
                    >
                      <option value="">Sélectionner</option>
                      <option value="GE">Genève</option>
                      <option value="VD">Vaud</option>
                      <option value="VS">Valais</option>
                      <option value="ZH">Zurich</option>
                      <option value="BE">Berne</option>
                      <option value="BS">Bâle</option>
                    </select>
                    {!profileData.canton && (
                      <div className="text-[11px] text-red-400 mt-1">Champ requis</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Ville principale <span className="text-red-400">*</span></label>
                    <input
                      list="city-list"
                      type="text"
                      value={profileData.city || ''}
                      onChange={(e) => {
                        const v = e.target.value
                        updateProfileData('city', v)
                        // Détecter canton automatiquement si non choisi
                        if (!profileData.canton) {
                          const code = detectCantonFromCity(v)
                          if (code) updateProfileData('canton', code)
                        }
                      }}
                      placeholder="ex: Genève"
                      className={`w-full px-3 py-2 bg-gray-700/50 border rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none ${!profileData.city ? 'border-red-500/50' : 'border-gray-600/50'}`}
                      aria-invalid={!profileData.city}
                    />
                    {!profileData.city && (
                      <div className="text-[11px] text-red-400 mt-1">Champ requis</div>
                    )}
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
                <div className="mt-3">
                  <label className="block text-xs text-gray-400 mb-1">
                    Adresse complète (avec autocomplétion GPS suisse)
                    <span className="text-red-400 ml-1">*</span>
                    <span className="ml-2 text-[11px] text-gray-400">Obligatoire pour l'affichage sur la carte</span>
                  </label>
                  <AddressAutocomplete
                    value={profileData.address || ''}
                    onChange={(address, coordinates) => {
                      updateProfileData('address', address)
                      if (coordinates) {
                        updateProfileData('coordinates', coordinates)
                      }
                    }}
                    placeholder="Tapez votre adresse suisse..."
                    cantonCode={profileData.canton || undefined}
                    cantonName={profileData.canton ? CANTON_MAP[profileData.canton] : undefined}
                    city={profileData.city || undefined}
                    onAddressSelect={(address) => {
                      // Déduire ville depuis le label
                      const parts = address.address.split(', ')
                      if (parts.length >= 2) {
                        const cityPart = parts[parts.length - 1]
                        // ex: "1204 Genève" → enlever code postal
                        const cityName = cityPart.replace(/^\d+\s+/, '')
                        if (cityName) updateProfileData('city', cityName)
                        // Déduire canton si possible
                        const code = detectCantonFromCity(cityName)
                        if (code) updateProfileData('canton', code)
                      }
                    }}
                  />
                  {!profileData.address || !profileData.coordinates ? (
                    <div className="mt-2 text-[11px] text-red-400">Adresse et coordonnées GPS requis</div>
                  ) : (
                    <div className="mt-2 text-xs text-green-400">
                      📍 Coordonnées GPS: {profileData.coordinates.lat.toFixed(6)}, {profileData.coordinates.lng.toFixed(6)}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact téléphonique */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Contact téléphonique</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Numéro de téléphone</label>
                    <input
                      type="tel"
                      value={profileData.phone || ''}
                      onChange={(e) => updateProfileData('phone', e.target.value)}
                      placeholder="+41 79 123 45 67"
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Visibilité du numéro</label>
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
                        <span className="text-sm text-gray-300">📞 Numéro visible (affiché + boutons WhatsApp/SMS/Appel)</span>
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
                        <span className="text-sm text-gray-300">📞 Numéro caché (boutons WhatsApp/SMS/Appel uniquement)</span>
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
                        <span className="text-sm text-gray-300">🔒 Messagerie privée uniquement</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Apparence physique</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Taille (cm)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={140} max={200} step={1} value={profileData.height || 165} onChange={(e)=> updateProfileData('height', parseInt(e.target.value))} className="w-full"/>
                    <div className="w-16 text-right text-white/90">{profileData.height || 165} cm</div>
                  </div>
                  <label className="mt-2 inline-flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" className="rounded" onChange={(e)=> e.target.checked ? updateProfileData('height', 201) : undefined }/>
                    {'> 200 cm'}
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Silhouette</label>
                  <select
                    value={profileData.bodyType || ''}
                    onChange={(e) => updateProfileData('bodyType', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Sélectionner</option>
                    <option value="mince">Mince</option>
                    <option value="sportive">Sportive</option>
                    <option value="pulpeuse">Pulpeuse</option>
                    <option value="ronde">Ronde</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tour de poitrine</label>
                  <select
                    value={profileData.breastSize || ''}
                    onChange={(e) => updateProfileData('breastSize', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Sélectionner</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cheveux — Couleur</label>
                  <select
                    value={profileData.hairColor || ''}
                    onChange={(e) => updateProfileData('hairColor', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Sélectionner</option>
                    <option value="brun">Brun</option>
                    <option value="blond">Blond</option>
                    <option value="chatain">Châtain</option>
                    <option value="gris">Gris</option>
                    <option value="roux">Roux</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Poitrine</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-300"><input type="radio" name="breastType" checked={profileData.breastType==='naturelle'} onChange={()=> updateProfileData('breastType','naturelle')} /> Naturelle</label>
                  <label className="flex items-center gap-2 text-sm text-gray-300"><input type="radio" name="breastType" checked={profileData.breastType==='siliconee'} onChange={()=> updateProfileData('breastType','siliconee')} /> Siliconée</label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cheveux — Longueur</label>
                  <select
                    value={profileData.hairLength || ''}
                    onChange={(e) => updateProfileData('hairLength', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="court">Court</option>
                    <option value="mi-long">Mi-long</option>
                    <option value="long">Long</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Couleur des yeux</label>
                  <select
                    value={profileData.eyeColor || ''}
                    onChange={(e) => updateProfileData('eyeColor', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Sélectionner</option>
                    <option value="noir">Noir</option>
                    <option value="marron">Marron</option>
                    <option value="vert">Vert</option>
                    <option value="bleu">Bleu</option>
                    <option value="gris">Gris</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Origine</label>
                  <select
                    value={profileData.ethnicity || ''}
                    onChange={(e) => updateProfileData('ethnicity', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Sélectionner</option>
                    <option value="suissesse">Suissesse</option>
                    <option value="francaise">Française</option>
                    <option value="espagnole">Espagnole</option>
                    <option value="italienne">Italienne</option>
                    <option value="allemand">Allemand</option>
                    <option value="europeenne">Européenne (autres)</option>
                    <option value="latine">Latine</option>
                    <option value="asiatique">Asiatique</option>
                    <option value="africaine">Africaine</option>
                    <option value="russe">Russe</option>
                    <option value="orientale">Orientale</option>
                    <option value="bresilienne">Brésilienne</option>
                    <option value="moyen-orient">Moyen-Orient</option>
                    <option value="balkanique">Balkanique</option>
                    <option value="nordique">Nordique</option>
                    <option value="metissee">Métissée</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tatouages / Piercings</label>
                  <div className="flex flex-wrap gap-6 items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={profileData.tattoos || false}
                        onChange={(e) => updateProfileData('tattoos', e.target.checked)}
                        className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-300">Tatouages</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={profileData.piercings || false}
                        onChange={(e) => updateProfileData('piercings', e.target.checked)}
                        className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-300">Piercings</span>
                    </label>
                    <div className="h-6 w-px bg-white/10" />
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      Poils pubis:
                      <select value={profileData.pubicHair||''} onChange={(e)=> updateProfileData('pubicHair', e.target.value as any)} className="px-2 py-1 bg-white/5 border border-white/10 rounded">
                        <option value="">Sélectionner</option>
                        <option value="naturel">Naturel</option>
                        <option value="rase">Rasé</option>
                        <option value="partiel">Partiellement rasé</option>
                      </select>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      Fumeuse:
                      <select value={typeof profileData.smoker==='boolean' ? (profileData.smoker?'oui':'non') : ''} onChange={(e)=> updateProfileData('smoker', e.target.value==='oui')} className="px-2 py-1 bg-white/5 border border-white/10 rounded">
                        <option value="">Sélectionner</option>
                        <option value="oui">Oui</option>
                        <option value="non">Non</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Clientèle & Services</h3>
            <div className="text-sm text-white/80 mb-4">Sélectionnez ce que vous proposez. Utilisez la recherche pour filtrer.</div>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Clientèle acceptée</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key:'acceptsCouples', label:'Couples' },
                    { key:'acceptsWomen', label:'Femmes' },
                    { key:'acceptsHandicapped', label:'Personnes handicapées' },
                    { key:'acceptsSeniors', label:'Personnes âgées' },
                  ].map(it => (
                    <label key={it.key} className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" checked={(profileData as any)[it.key]||false} onChange={(e)=> updateProfileData(it.key, e.target.checked)} />
                      <span className="text-sm text-gray-300">{it.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Lieu & Options</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4" checked={!!profileData.incall} onChange={(e)=> updateProfileData('incall', e.target.checked)} /><span className="text-sm text-gray-300">Incall</span></label>
                  <label className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4" checked={!!profileData.outcall} onChange={(e)=> updateProfileData('outcall', e.target.checked)} /><span className="text-sm text-gray-300">Outcall</span></label>
                  {['Douche à deux','Jacuzzi','Sauna','Climatisation','Fumoir','Parking','Accès handicapé','Ambiance musicale','Bar','Pole dance'].map(opt => {
                    const key = `opt:${opt}`
                    const selected = (profileData.specialties||[]).includes(key)
                    return (
                      <button key={key} onClick={()=>{
                        const set = new Set(profileData.specialties||[])
                        if (set.has(key)) set.delete(key); else set.add(key)
                        updateProfileData('specialties', Array.from(set))
                      }} className={`text-xs px-2.5 py-1 rounded-full border ${selected ? 'bg-purple-500/20 text-purple-200 border-purple-500/30' : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'}`}>
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2 p-2 rounded-lg border border-white/10 bg-white/5 max-w-md">
                <Search size={16} className="text-gray-400"/>
                <input placeholder="Rechercher un service…" className="bg-transparent focus:outline-none text-white w-full"/>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { name: 'Classiques', items: ['Rapport', 'French kiss', 'GFE', 'PSE', 'Lingerie', 'Duo/Trio', 'Jeux de rôles', 'Costumes'] },
                { name: 'Oral', items: ['Fellation protégée', 'Fellation nature', 'Gorge profonde', 'Éjac en bouche', 'Éjac sur le corps', 'Éjac sur le visage'] },
                { name: 'Anal', items: ['Sodomie (donne)', 'Sodomie (reçoit)', 'Doigté anal'] },
                { name: 'BDSM & Fétiches', items: ['Domination soft', 'Fessées', 'Donjon SM', 'Fétichisme pieds'] },
                { name: 'Massages', items: ['Tantrique', 'Érotique', 'Corps à corps', 'Nuru', 'Prostate', 'Lingam', 'Yoni', '4 mains', 'Suédois', 'Huiles'] },
              ].map(group => (
                <div key={group.name}>
                  <div className="text-sm text-white/90 font-medium mb-2">{group.name}</div>
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
                          {it}
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
            <h3 className="text-xl font-bold text-white mb-6">Tarifs et disponibilités</h3>
            <div className="space-y-6">
              {/* À partir de */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">À partir de :</label>
                <select
                  value={profileData.prices?.oneHour || ''}
                  onChange={(e) => updateNestedProfileData('prices', 'oneHour', parseInt(e.target.value))}
                  className="w-full md:w-60 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Sélectionner</option>
                  {[100,150,200,250,300,350,400,450,500].map(v => (
                    <option key={v} value={v}>{v} CHF</option>
                  ))}
                </select>
              </div>

              {/* Tarifs détaillés */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-300">Tarifs (en CHF)</label>
                  <label className="flex items-center gap-2 text-xs text-gray-300">
                    <input
                      type="checkbox"
                      checked={profileData.showPrices ?? true}
                      onChange={(e) => updateProfileData('showPrices', e.target.checked)}
                      className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    Afficher mes prix sur mon profil
                  </label>
                </div>
                { (profileData.showPrices ?? true) && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">15 min</label>
                    <input
                      type="number"
                      value={profileData.prices?.fifteenMin || ''}
                      onChange={(e) => updateNestedProfileData('prices', 'fifteenMin', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">30 min</label>
                    <input
                      type="number"
                      value={profileData.prices?.thirtyMin || ''}
                      onChange={(e) => updateNestedProfileData('prices', 'thirtyMin', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">1 heure *</label>
                    <input
                      type="number"
                      value={profileData.prices?.oneHour || ''}
                      onChange={(e) => updateNestedProfileData('prices', 'oneHour', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">2 heures</label>
                    <input
                      type="number"
                      value={profileData.prices?.twoHours || ''}
                      onChange={(e) => updateNestedProfileData('prices', 'twoHours', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nuit</label>
                    <input
                      type="number"
                      value={profileData.prices?.overnight || ''}
                      onChange={(e) => updateNestedProfileData('prices', 'overnight', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Méthodes de paiement acceptées</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'cash', label: 'Cash' },
                    { key: 'twint', label: 'TWINT' },
                    { key: 'crypto', label: 'Crypto' },
                    { key: 'visa', label: 'Visa' },
                    { key: 'mastercard', label: 'Mastercard' },
                    { key: 'amex', label: 'Amex' },
                    { key: 'maestro', label: 'Maestro' },
                    { key: 'postfinance', label: 'PostFinance' }
                  ].map((method) => (
                    <label key={method.key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={profileData.paymentMethods?.includes(method.key) || false}
                        onChange={() => toggleArrayItem('paymentMethods', method.key)}
                        className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-300">{method.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Devises acceptées</label>
                  <div className="flex flex-wrap gap-3">
                    {['CHF', 'EUR', 'USD'].map(cur => (
                      <label key={cur} className="flex items-center space-x-2">
                        <input type="checkbox" checked={profileData.paymentCurrencies?.includes(cur) || false} onChange={()=>{
                          const arr = new Set(profileData.paymentCurrencies||[])
                          if (arr.has(cur)) arr.delete(cur); else arr.add(cur)
                          updateProfileData('paymentCurrencies', Array.from(arr))
                        }} className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"/>
                        <span className="text-sm text-gray-300">{cur}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mt-3 text-xs text-white/80">
                  Besoin d’ajuster vos disponibilités ?
                  <button onClick={()=> setActiveTab('agenda')} className="ml-2 text-purple-300 hover:text-purple-200 underline">Ouvrir l’onglet Agenda</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Préférences supprimé */}
      </div>

      {/* Actions en bas supprimées (gérées par l'entête global) */}

      {/* Agenda Tab */}
      {activeTab === 'agenda' && (
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Agenda</h3>
          <div className="space-y-6">
            <div>
              <label className="inline-flex items-center gap-2 text-sm text-white/90">
                <input type="checkbox" checked={agendaEnabled} onChange={(e)=> setAgendaEnabled(e.target.checked)} /> Activer l'agenda
              </label>
            </div>
            <div className={agendaEnabled ? '' : 'opacity-50'}>
              <div className="text-sm text-white/90 font-medium mb-2">Heures de présence (hebdo)</div>
              <div className="space-y-2">
                {Object.entries(weekly).map(([day, slot]) => (
                  <div key={day} className="flex items-center gap-2">
                    <div className="w-28 text-white/90">{day}</div>
                    <label className="inline-flex items-center gap-2"><input type="checkbox" checked={slot.enabled} disabled={!agendaEnabled} onChange={(e)=> setWeekly(prev => ({ ...prev, [day]: { ...slot, enabled: e.target.checked } }))} /> <span className="text-sm text-white/80">{slot.enabled ? '✅' : '❌'}</span></label>
                    <input type="time" value={slot.start} disabled={!agendaEnabled} onChange={(e)=> setWeekly(prev => ({ ...prev, [day]: { ...slot, start: e.target.value } }))} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm"/>
                    <span className="text-white/60">—</span>
                    <input type="time" value={slot.end} disabled={!agendaEnabled} onChange={(e)=> setWeekly(prev => ({ ...prev, [day]: { ...slot, end: e.target.value } }))} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm"/>
                  </div>
                ))}
              </div>
            </div>
            <div className={`space-y-2 ${agendaEnabled ? '' : 'opacity-50'}`}>
              <label className="inline-flex items-center gap-2 text-sm text-white/90">
                <input type="checkbox" checked={pauseEnabled} disabled={!agendaEnabled} onChange={(e)=> setPauseEnabled(e.target.checked)} /> Mettre mon compte en pause
              </label>
              {pauseEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/70 mb-1">Début de pause</label>
                    <input type="datetime-local" value={pauseStart} disabled={!agendaEnabled} onChange={(e)=> setPauseStart(e.target.value)} className="w-full px-2 py-2 rounded bg-white/5 border border-white/10 text-white text-sm"/>
                  </div>
                  <div>
                    <label className="block text-xs text-white/70 mb-1">Retour</label>
                    <input type="datetime-local" value={pauseEnd} disabled={!agendaEnabled} onChange={(e)=> setPauseEnd(e.target.value)} className="w-full px-2 py-2 rounded bg-white/5 border border-white/10 text-white text-sm"/>
                  </div>
                </div>
              )}
            </div>
            <div className={`space-y-2 ${agendaEnabled ? '' : 'opacity-50'}`}>
              <div className="text-sm text-white/90 font-medium">Jours d'absence exceptionnels</div>
              <button disabled={!agendaEnabled} onClick={()=> setAbsences(prev => [...prev, { id: Math.random().toString(36).slice(2), start: new Date().toISOString().slice(0,10), end: new Date().toISOString().slice(0,10) }])} className={`px-3 py-2 rounded-lg border w-fit ${agendaEnabled ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-white/5 text-white/40 border-white/10 cursor-not-allowed'}`}>Ajouter une absence</button>
              <div className="space-y-2">
                {absences.map((a) => (
                  <div key={a.id} className="flex items-center gap-2">
                    <input type="date" value={a.start} disabled={!agendaEnabled} onChange={(e)=> setAbsences(prev => prev.map(x => x.id===a.id ? { ...x, start: e.target.value } : x))} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm"/>
                    <span className="text-white/60">→</span>
                    <input type="date" value={a.end} disabled={!agendaEnabled} onChange={(e)=> setAbsences(prev => prev.map(x => x.id===a.id ? { ...x, end: e.target.value } : x))} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm"/>
                    <button disabled={!agendaEnabled} onClick={()=> setAbsences(prev => prev.filter(x => x.id!==a.id))} className={` ${agendaEnabled ? 'text-white/70 hover:text-white' : 'text-white/40 cursor-not-allowed'}`}><X size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs text-white/70 border-t border-white/10 pt-3">
              Les changements sont enregistrés automatiquement. {autoSaveMsg && <span className="text-emerald-300 ml-1">{autoSaveMsg}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Barre d'actions en bas et modale de pause retirées (agenda centralise la pause) */}
    </div>
  )
}
