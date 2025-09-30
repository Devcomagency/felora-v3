"use client"

import { useEffect, useMemo, useState, useTransition, useRef, useCallback } from 'react'
import { Building, MapPin, Clock, Globe, Save, Eye, Upload, X, Plus } from 'lucide-react'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete'
import HorairesPanel from '@/components/dashboard/HorairesPanel'

type Club = {
  id: string
  handle: string
  name: string
  description?: string
  address?: string
  openingHours?: string
  avatarUrl?: string
  coverUrl?: string
  websiteUrl?: string
  isActive: boolean
  capacity?: number
}

export default function ClubProfilePage() {
  const [club, setClub] = useState<Club | null>(null)
  const [form, setForm] = useState<Partial<Club> & {
    websiteUrl?: string;
    email?: string;
    phone?: string;
    companyName?: string;
    handle?: string;
    managerName?: string;
  }>({})
  const [loading, setLoading] = useState(true)
  const [saving, startSaving] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'info'|'horaires'|'services'|'medias'>('info')
  const [mediaCount, setMediaCount] = useState<{ count:number; ok:boolean }>({ count: 0, ok: false })
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [toggling, startToggling] = useTransition()

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/clubs/profile/me')
        const data = await res.json()
        if (!cancelled) {
          if (data?.club) {
            setClub(data.club)
            setForm({
              name: data.club.companyName || data.club.name || '',
              description: data.club.description || '',
              address: data.club.address || '',
              openingHours: data.club.openingHours || '',
              avatarUrl: data.club.avatarUrl || '',
              coverUrl: data.club.coverUrl || '',
              isActive: !!data.club.isActive,
              websiteUrl: (data.club as any).websiteUrl || '',
              // Pré-remplir avec les données d'inscription
              email: data.club.user?.email || '',
              phone: data.club.user?.phoneE164 || '',
              handle: data.club.handle || '',
              companyName: data.club.companyName || '',
              managerName: data.club.managerName || ''
            })
          }
        }
      } catch (e) {
        if (!cancelled) setError('Erreur de chargement du profil')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Charger un résumé médias (5/5 requis) pour afficher un pill dans les onglets
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch('/api/clubs/media/my?page=1&pageSize=50', { cache:'no-store' })
        const j = await r.json()
        const items: Array<{ pos?: number|null; type:'IMAGE'|'VIDEO' }> = Array.isArray(j?.items) ? j.items : []
        const byPos = new Map<number, { type:'IMAGE'|'VIDEO' }>()
        for (const m of items) if (typeof m.pos === 'number') byPos.set(m.pos!, { type: (m as any).type })
        const okProfile = byPos.get(0)?.type === 'IMAGE'  // Photo de profil (IMAGE requis)
        const okFooter = byPos.get(1)?.type === 'IMAGE'   // Photo footer (IMAGE requis)
        const okPub1 = byPos.has(2)                       // Média publication 1 (IMAGE ou VIDEO)
        const okPub2 = byPos.has(3)                       // Média publication 2 (IMAGE ou VIDEO)
        const okPub3 = byPos.has(4)                       // Média publication 3 (IMAGE ou VIDEO)
        const count = [okProfile, okFooter, okPub1, okPub2, okPub3].filter(Boolean).length
        if (!cancelled) setMediaCount({ count, ok: count === 5 })
      } catch {}
    })()
    return () => { cancelled = true }
  }, [])

  const infoRequiredCount = useMemo(() => {
    let n = 0
    if (String(form.name||'').trim()) n++
    if (String(form.description||'').trim()) n++
    if (String(form.address||'').trim()) n++
    return n
  }, [form.name, form.description, form.address])

  const autoSave = useCallback(async (updatedForm: typeof form) => {
    try {
      const payload: any = {
        name: updatedForm.name,
        description: updatedForm.description,
        address: updatedForm.address,
        openingHours: updatedForm.openingHours,
        avatarUrl: updatedForm.avatarUrl,
        coverUrl: updatedForm.coverUrl,
        isActive: updatedForm.isActive,
        city: updatedForm.address ? updatedForm.address.split(',')[0] || '' : '',
        websiteUrl: updatedForm.websiteUrl,
        email: updatedForm.email,
        phone: updatedForm.phone,
        capacity: form.capacity ? Number(form.capacity) : null,
        latitude: coordinates?.lat || null,
        longitude: coordinates?.lng || null,
      }

      console.log('📤 Sauvegarde club profile:', { websiteUrl: payload.websiteUrl, payload })
      
      const res = await fetch('/api/clubs/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const j = await res.json()
      if (res.ok && j?.ok) {
        console.log('✅ Club profile auto-saved')
      } else {
        console.log('❌ Club profile auto-save failed:', j?.error)
      }
    } catch (e) {
      console.log('❌ Club profile auto-save failed:', e)
    }
  }, [coordinates])

  const updateField = (key: keyof Club, value: any) => {
    const updatedForm = { ...form, [key]: value }
    setForm(updatedForm)

    // Debounce l'auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave(updatedForm)
    }, 1500) // 1.5 secondes de debounce
  }

  // Auto-save pour les coordonnées
  useEffect(() => {
    if (coordinates && form.name) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSave(form)
      }, 1000)
    }
  }, [coordinates, autoSave])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  const onSave = () => {
    setMessage(null)
    setError(null)
    // Validation côté client: champs requis
    const errs: Record<string, string> = {}
    if (!String(form.name||'').trim()) errs.name = 'Nom requis'
    if (!String(form.description||'').trim()) errs.description = 'Description requise'
    if (!String(form.address||'').trim()) errs.address = 'Adresse requise'
    setFieldErrors(errs)
    if (Object.keys(errs).length) return
    startSaving(async () => {
      try {
        const payload: any = {
          name: form.name,
          description: form.description,
          address: form.address,
          openingHours: form.openingHours,
          avatarUrl: form.avatarUrl,
          coverUrl: form.coverUrl,
          isActive: form.isActive,
        }
        // Note: websiteUrl non persisté pour l'instant côté serveur (champ à ajouter en DB si nécessaire)
        const res = await fetch('/api/clubs/profile/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const j = await res.json()
        if (!res.ok || !j?.ok) throw new Error(j?.error || 'save_failed')
        setMessage('Profil mis à jour')
      } catch (e) {
        setError('Échec de la sauvegarde')
      }
    })
  }

  const toggleProfileStatus = () => {
    setMessage(null)
    setError(null)
    startToggling(async () => {
      try {
        const newStatus = !form.isActive
        const payload = { isActive: newStatus }
        const res = await fetch('/api/clubs/profile/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const result = await res.json()
        if (!res.ok || !result?.ok) throw new Error(result?.error || 'toggle_failed')

        // Mettre à jour l'état local
        setForm(prev => ({ ...prev, isActive: newStatus }))
        setMessage(`Profil ${newStatus ? 'activé' : 'désactivé'} avec succès`)
      } catch (e) {
        setError(`Erreur: ${e instanceof Error ? e.message : 'Unknown error'}`)
      }
    })
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profil Club</h1>
          <p className="text-white/70">Gérez les informations publiques de votre club</p>
        </div>

        {/* Status et progression */}
        <div className="mb-6 p-4 bg-gray-900/50 backdrop-blur border border-gray-700/50 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${form.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-white font-medium">
                {form.isActive ? 'Profil actif' : 'Profil inactif'}
              </span>
              <button
                onClick={toggleProfileStatus}
                disabled={toggling}
                className={`ml-2 px-3 py-1 text-xs rounded-full transition-colors ${
                  form.isActive
                    ? 'bg-red-600/20 text-red-300 hover:bg-red-600/30 disabled:opacity-50'
                    : 'bg-green-600/20 text-green-300 hover:bg-green-600/30 disabled:opacity-50'
                }`}
              >
                {toggling ? 'Chargement...' : (form.isActive ? 'Désactiver' : 'Activer')}
              </button>
            </div>
            <div className="text-sm text-white/70">
              Informations: {infoRequiredCount}/3 • Médias: {mediaCount.count}/5
            </div>
          </div>
        </div>

        {/* Sous-onglets – style segmenté */}
        <div className="mb-6">
          {/* Mobile select for better reachability */}
          <div className="sm:hidden mb-4">
            <select
              value={activeTab}
              onChange={e => setActiveTab(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option value="info">Informations</option>
              <option value="horaires">Horaires</option>
              <option value="services">Services</option>
              <option value="medias">Médias</option>
            </select>
          </div>
          <div className="hidden sm:flex space-x-1 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-1 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 min-w-[180px] sm:min-w-0 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'info'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              <span>Informations</span>
              <span className={`bg-gray-600 text-xs px-2 py-0.5 rounded-full ${infoRequiredCount===3 ? 'bg-emerald-600/30 text-emerald-300' : ''}`}>
                {infoRequiredCount}/3
              </span>
            </button>
            <button
              onClick={() => setActiveTab('horaires')}
              className={`flex-1 min-w-[180px] sm:min-w-0 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'horaires'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Horaires</span>
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex-1 min-w-[180px] sm:min-w-0 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'services'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              <span>Services</span>
              <span className="bg-gray-600 text-xs px-2 py-0.5 rounded-full">Optionnel</span>
            </button>
            <button
              onClick={() => setActiveTab('medias')}
              className={`flex-1 min-w-[160px] sm:min-w-0 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'medias'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              <span>Médias</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${mediaCount.ok ? 'bg-emerald-600/30 text-emerald-300' : 'bg-yellow-600/30 text-yellow-300'}`}>
                {mediaCount.count}/5
              </span>
            </button>
          </div>
        </div>

        {/* Contenu onglets */}
        <div className="grid gap-6 grid-cols-1">
          {/* Onglet: Infos principales */}
          {activeTab === 'info' && (
          <>
          <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">Informations principales</h2>

            {loading ? (
              <div className="space-y-3">
                <div className="h-8 rounded bg-white/5" />
                <div className="h-24 rounded bg-white/5" />
                <div className="h-8 rounded bg-white/5" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="h-8 rounded bg-white/5" />
                  <div className="h-8 rounded bg-white/5" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Nom du club</label>
                  <input
                    value={form.name || ''}
                    onChange={e => updateField('name', e.target.value)}
                    className={`w-full px-3 py-2.5 text-[15px] bg-gray-800/60 border ${fieldErrors.name? 'border-red-500/60':'border-gray-700'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500`}
                    placeholder="Ex. Club Luxe Geneva"
                  />
                  {fieldErrors.name && <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>}
                </div>

                {/* Données d'inscription modifiables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Email</label>
                    <input
                      value={form.email || ''}
                      onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2.5 text-[15px] bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      placeholder="contact@votre-club.ch"
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Téléphone</label>
                    <input
                      value={form.phone || ''}
                      onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2.5 text-[15px] bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      placeholder="+41 XX XXX XX XX"
                      type="tel"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">Description</label>
                  <textarea
                    value={form.description || ''}
                    onChange={e => updateField('description', e.target.value)}
                    className={`w-full px-3 py-2.5 text-[15px] bg-gray-800/60 border ${fieldErrors.description? 'border-red-500/60':'border-gray-700'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 min-h-[110px]`}
                    placeholder="Décrivez votre établissement, ambiance, services, etc."
                  />
                  {fieldErrors.description && <p className="text-xs text-red-400 mt-1">{fieldErrors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">Adresse</label>
                  <AddressAutocomplete
                    value={form.address || ''}
                    onChange={(address) => {
                      updateField('address', address)
                    }}
                    onCoordinatesChange={setCoordinates}
                    className={`w-full px-3 py-2.5 text-[15px] bg-gray-800/60 border ${fieldErrors.address? 'border-red-500/60':'border-gray-700'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500`}
                    placeholder="Commencez à taper votre adresse..."
                  />
                  {coordinates && (
                    <p className="text-xs text-green-400 mt-1">
                      📍 Position: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                    </p>
                  )}
                  {fieldErrors.address && <p className="text-xs text-red-400 mt-1">{fieldErrors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">Site web (facultatif)</label>
                  <input
                    value={form.websiteUrl || ''}
                    onChange={e => updateField('websiteUrl', e.target.value)}
                    className="w-full px-3 py-2.5 text-[15px] bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    placeholder="https://votre-site.ch"
                  />
                </div>

                {(message || error) && (
                  <div className={`text-sm ${error ? 'text-red-400' : 'text-green-400'}`}>{error || message}</div>
                )}

                <div className="h-12" />
              </div>
            )}
          </div>
          </>
          )}

          {/* Onglet: Horaires */}
          {activeTab === 'horaires' && (
            <HorairesPanel />
          )}

          {/* Onglet: Services */}
          {activeTab === 'services' && (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {/* Langues & Paiements */}
              <ServicesPanel />
            </div>
          )}

          {/* Onglet: Médias */}
          {activeTab === 'medias' && (
            <ClubMediaGrid />
          )}
        </div>

        {/* Sticky bottom actions (mobile-first) */}
        {activeTab==='info' && (
          <div className="sticky bottom-3 z-20 flex justify-end">
            <div className="max-w-6xl w-full mx-auto px-4 sm:px-6">
              <div className="ml-auto w-full sm:w-auto inline-flex gap-2 rounded-xl bg-black/60 backdrop-blur border border-white/10 p-2">
                <a
                  href={form.handle ? `/profile-test/club/${form.handle}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-3 py-2 rounded-lg border border-white/10 text-white/80 hover:bg-white/10 ${!form.handle ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Voir profil
                </a>
                <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-60">{saving ? 'Sauvegarde…' : 'Enregistrer'}</button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

// Simple panel component for Services inside profile page
function ServicesPanel(){
  const [languages, setLanguages] = useState<string[]>([])
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [services, setServices] = useState<string[]>([])
  const [equipments, setEquipments] = useState<string[]>([])
  const [saving, startSaving] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const autoSaveServicesTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const DEFAULT_LANGS = ['Français','Anglais','Allemand','Italien','Espagnol','Russe','Arabe','Chinois']
  const DEFAULT_PAYMENTS = ['Cash','Carte','TWINT','Virement']
  const DEFAULT_SERVICES = ['Bar','Privé','Sécurité','Parking','Salle VIP']
  const DEFAULT_EQUIPMENTS = ['Douche','Jacuzzi','Sauna','Climatisation','Fumoir','Parking','Accès handicapé','Ambiance musicale','Bar','Pole dance']

  // Auto-save pour les services
  const autoSaveServices = useCallback(async () => {
    try {
      const body = { languages, paymentMethods, services, equipments }
      const r = await fetch('/api/clubs/services/update', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify(body)
      })
      const d = await r.json()
      if (r.ok && d?.ok) {
        console.log('✅ Club services auto-saved')
      } else {
        console.log('❌ Club services auto-save failed:', d?.error)
      }
    } catch (e) {
      console.log('❌ Club services auto-save failed:', e)
    }
  }, [languages, paymentMethods, services, equipments])

  // Fonction toggle avec auto-save
  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], value: string) => {
    setter(prev => {
      const s = new Set(list)
      if (s.has(value)) s.delete(value); else s.add(value)
      const newArray = Array.from(s)

      // Déclencher l'auto-save après un délai
      if (autoSaveServicesTimeoutRef.current) {
        clearTimeout(autoSaveServicesTimeoutRef.current)
      }

      autoSaveServicesTimeoutRef.current = setTimeout(() => {
        // On ne peut pas utiliser directement autoSaveServices ici car les states ne sont pas encore mis à jour
        // On va déclencher l'auto-save avec un useEffect
      }, 1000)

      return newArray
    })
  }

  // Auto-save quand les états changent
  useEffect(() => {
    // Ne pas auto-save au premier chargement
    if (languages.length === 0 && paymentMethods.length === 0 && services.length === 0 && equipments.length === 0) {
      return
    }

    if (autoSaveServicesTimeoutRef.current) {
      clearTimeout(autoSaveServicesTimeoutRef.current)
    }

    autoSaveServicesTimeoutRef.current = setTimeout(() => {
      autoSaveServices()
    }, 1500)

    // Cleanup timeout
    return () => {
      if (autoSaveServicesTimeoutRef.current) {
        clearTimeout(autoSaveServicesTimeoutRef.current)
      }
    }
  }, [languages, paymentMethods, services, equipments, autoSaveServices])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveServicesTimeoutRef.current) {
        clearTimeout(autoSaveServicesTimeoutRef.current)
      }
    }
  }, [])

  // Charger depuis l'API
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch('/api/clubs/services/get', { cache:'no-store' })
        const d = await r.json().catch(()=>null)
        const s = d?.services || {}
        if (!cancelled) {
          setLanguages(Array.isArray(s.languages)? s.languages: [])
          setPaymentMethods(Array.isArray(s.paymentMethods)? s.paymentMethods: [])
          setServices(Array.isArray(s.services)? s.services: [])
          setEquipments(Array.isArray(s.equipments)? s.equipments: [])
        }
      } catch (e) {
        if (!cancelled) setError('Impossible de charger les services')
      }
    })()
    return () => { cancelled = true }
  }, [])

  const onSave = () => {
    setMessage(null)
    setError(null)
    startSaving(async () => {
      try {
        const body = { languages, paymentMethods, services, equipments }
        const r = await fetch('/api/clubs/services/update', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) })
        const d = await r.json()
        if (!r.ok || !d?.ok) throw new Error(d?.error || 'save_failed')
        setMessage('Paramètres enregistrés')
      } catch (e) {
        setError('Échec de la sauvegarde')
      }
    })
  }

  return (
    <>
      <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
        <h2 className="text-white font-semibold mb-4">Langues parlées</h2>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_LANGS.map(l => (
            <button key={l} onClick={() => toggle(setLanguages, languages, l)} className={`px-3 py-1.5 rounded-lg text-sm border ${languages.includes(l) ? 'bg-purple-500/20 border-purple-500/40 text-purple-200' : 'bg-white/5 border-white/10 text-white'}`}>{l}</button>
          ))}
        </div>
        <h2 className="text-white font-semibold mt-6 mb-4">Moyens de paiement</h2>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_PAYMENTS.map(p => (
            <button key={p} onClick={() => toggle(setPaymentMethods, paymentMethods, p)} className={`px-3 py-1.5 rounded-lg text-sm border ${paymentMethods.includes(p) ? 'bg-purple-500/20 border-purple-500/40 text-purple-200' : 'bg-white/5 border-white/10 text-white'}`}>{p}</button>
          ))}
        </div>
      </div>
      <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
        <h2 className="text-white font-semibold mb-4">Services & Équipements</h2>

        <div className="flex flex-wrap gap-2">
          {/* Services et Équipements unifiés */}
          {[...DEFAULT_SERVICES, ...DEFAULT_EQUIPMENTS].map(item => {
            const isService = DEFAULT_SERVICES.includes(item)
            const isSelected = isService ? services.includes(item) : equipments.includes(item)
            const toggleFunction = isService ? 
              () => toggle(setServices, services, item) : 
              () => toggle(setEquipments, equipments, item)
            
            return (
              <button 
                key={item} 
                onClick={toggleFunction} 
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all duration-200 ${
                  isSelected 
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-200 shadow-lg shadow-purple-500/20' 
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }`}
              >
                {item}
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-60">
            {saving ? 'Sauvegarde…' : 'Enregistrer'}
          </button>
          {message && <div className="text-sm text-green-400">{message}</div>}
          {error && <div className="text-sm text-red-400">{error}</div>}
        </div>
      </div>
    </>
  )
}

// Composant pour la gestion des médias du club
function ClubMediaGrid() {
  const [media, setMedia] = useState<Array<{ pos: number; type: 'IMAGE' | 'VIDEO'; url?: string }>>([])
  const [uploading, setUploading] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaSlots = [
    { pos: 0, label: 'Photo de profil', type: 'IMAGE' as const, required: true, inPublications: false },
    { pos: 1, label: 'Photo du footer', type: 'IMAGE' as const, required: true, inPublications: false },
    { pos: 2, label: 'Média publication 1', type: 'BOTH' as const, required: true, inPublications: true },
    { pos: 3, label: 'Média publication 2', type: 'BOTH' as const, required: true, inPublications: true },
    { pos: 4, label: 'Média publication 3', type: 'BOTH' as const, required: true, inPublications: true },
  ]

  // Charger les médias existants
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch('/api/clubs/media/my?page=1&pageSize=50', { cache: 'no-store' })
        const j = await r.json()
        const items: Array<{ pos?: number | null; type: 'IMAGE' | 'VIDEO'; url?: string }> = Array.isArray(j?.items) ? j.items : []
        const validMedia = items.filter(item => typeof item.pos === 'number' && item.pos >= 0 && item.pos <= 4)
        if (!cancelled) setMedia(validMedia as Array<{ pos: number; type: 'IMAGE' | 'VIDEO'; url?: string }>)
      } catch (e) {
        if (!cancelled) setError('Erreur de chargement des médias')
      }
    })()
    return () => { cancelled = true }
  }, [])

  const getMediaForSlot = (pos: number) => {
    return media.find(m => m.pos === pos)
  }

  const handleFileUpload = async (pos: number, type: 'IMAGE' | 'VIDEO') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = type === 'IMAGE' ? 'image/*' : 'video/*'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setUploading(pos)
      setMessage(null)
      setError(null)

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('slot', type.toLowerCase())
        formData.append('slotIndex', pos.toString())

        const response = await fetch('/api/clubs/media/upload', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Upload failed')
        }

        // Mettre à jour la liste des médias
        setMedia(prev => {
          const filtered = prev.filter(m => m.pos !== pos)
          return [...filtered, { pos, type, url: result.url || 'uploaded' }]
        })

        setMessage(`${type === 'IMAGE' ? 'Photo' : 'Vidéo'} uploadée avec succès`)
      } catch (e) {
        setError(`Erreur d'upload: ${e instanceof Error ? e.message : 'Unknown error'}`)
      } finally {
        setUploading(null)
      }
    }

    input.click()
  }

  const removeMedia = async (pos: number) => {
    setMessage(null)
    setError(null)

    try {
      const response = await fetch(`/api/clubs/media/delete?pos=${pos}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Suppression échouée')
      }

      // Mettre à jour l'état local après succès de l'API
      setMedia(prev => prev.filter(m => m.pos !== pos))
      setMessage('Média supprimé avec succès')
    } catch (e) {
      setError(`Erreur de suppression: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
      <h2 className="text-lg font-semibold text-white mb-4">Gestion des médias</h2>
      <p className="text-white/70 mb-6">5 médias obligatoires : Photo de profil + Photo footer (privées) + 3 médias pour publications (vidéos/photos au choix)</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mediaSlots.map((slot) => {
          const existingMedia = getMediaForSlot(slot.pos)
          const isUploading = uploading === slot.pos

          return (
            <div key={slot.pos} className="border border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">{slot.label}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${slot.required ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-300'}`}>
                  {slot.required ? 'Requis' : 'Optionnel'}
                </span>
              </div>

              <div className="aspect-video bg-gray-800/60 border border-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                {existingMedia && existingMedia.url ? (
                  <div className="w-full h-full relative group">
                    {existingMedia.type === 'IMAGE' ? (
                      <img
                        src={existingMedia.url}
                        alt={slot.label}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <video
                        src={existingMedia.url}
                        className="w-full h-full object-cover rounded-lg"
                        controls={false}
                        muted
                        preload="metadata"
                        onError={(e) => {
                          const target = e.target as HTMLVideoElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    )}
                    {/* Fallback pour les erreurs de chargement */}
                    <div
                      className="w-full h-full bg-gray-700 flex items-center justify-center"
                      style={{ display: 'none' }}
                    >
                      <span className="text-gray-400">
                        {existingMedia.type === 'IMAGE' ? '📷 Image indisponible' : '🎥 Vidéo indisponible'}
                      </span>
                    </div>
                    <button
                      onClick={() => removeMedia(slot.pos)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 backdrop-blur text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {isUploading ? (
                      <div className="space-y-2 text-center">
                        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm text-gray-400">Upload en cours...</p>
                      </div>
                    ) : (
                      <div className="space-y-2 text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                        <p className="text-xs text-gray-400">
                          {slot.type === 'IMAGE' ? 'Cliquez pour ajouter une photo' : 'Cliquez pour ajouter une vidéo'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {(!existingMedia || !existingMedia.url) && !isUploading && (
                <>
                  {slot.type === 'BOTH' ? (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleFileUpload(slot.pos, 'IMAGE')}
                        className="flex-1 px-4 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-200 rounded-lg hover:bg-purple-500/30 transition-colors"
                      >
                        Photo
                      </button>
                      <button
                        onClick={() => handleFileUpload(slot.pos, 'VIDEO')}
                        className="flex-1 px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-200 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        Vidéo
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleFileUpload(slot.pos, slot.type)}
                      className="w-full mt-3 px-4 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-200 rounded-lg hover:bg-purple-500/30 transition-colors"
                    >
                      Ajouter {slot.type === 'IMAGE' ? 'une photo' : 'une vidéo'}
                    </button>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {message && <div className="mt-4 text-sm text-green-400">{message}</div>}
      {error && <div className="mt-4 text-sm text-red-400">{error}</div>}
    </div>
  )
}