"use client"

import { useEffect, useMemo, useState, useTransition } from 'react'
import DashboardLayout from '../../components/dashboard-v2/DashboardLayout'
import ClubMediaManager from '../../components/dashboard-v2/club/ClubMediaManager'
import ClubHeader from '../../components/dashboard-v2/club/ClubHeader'
import AddressAutocomplete from '../../components/ui/AddressAutocomplete'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

type Club = {
  id: string
  handle: string
  name: string
  description?: string
  address?: string
  openingHours?: string
  avatarUrl?: string
  coverUrl?: string
  isActive: boolean
}

// Old club page (V3 original)
function OldClubProfilePage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard Club (Version Originale)</h1>
        <p className="text-gray-400">Cette page utilise l'ancienne interface V3</p>
      </div>
    </div>
  )
}

export default function ClubProfilePage() {
  const isNewClubEnabled = useFeatureFlag('NEXT_PUBLIC_FEATURE_UI_DASHBOARD_CLUB_PROFILE')
  
  if (isNewClubEnabled) {
    return <NewClubProfilePage />
  }
  
  return <OldClubProfilePage />
}

// New club page (V2 design)
function NewClubProfilePage() {
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

  // Charger un résumé médias (4/4 requis) pour afficher un pill dans les onglets
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch('/api/clubs/media/my?page=1&pageSize=50', { cache:'no-store' })
        const j = await r.json()
        const items: Array<{ pos?: number|null; type:'IMAGE'|'VIDEO' }> = Array.isArray(j?.items) ? j.items : []
        const byPos = new Map<number, { type:'IMAGE'|'VIDEO' }>()
        for (const m of items) if (typeof m.pos === 'number') byPos.set(m.pos!, { type: (m as any).type })
        const okProfile = byPos.get(0)?.type === 'IMAGE'
        const okVideo = byPos.get(1)?.type === 'VIDEO'
        const okPhoto1 = byPos.get(2)?.type === 'IMAGE'
        const okPhoto2 = byPos.get(3)?.type === 'IMAGE'
        const count = [okProfile, okVideo, okPhoto1, okPhoto2].filter(Boolean).length
        if (!cancelled) setMediaCount({ count, ok: count === 4 })
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

  const updateField = (key: keyof Club, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const onSave = () => {
    setMessage(null)
    setError(null)
    // Validation côté client: champs requis
    const errs: Record<string, string> = {}
    if (!String(form.name||'').trim()) errs.name = 'Nom requis'
    if (!String(form.description||'').trim()) errs.description = 'Description requise'
    if (!String(form.address||'').trim()) errs.address = 'Adresse requise'
    if (!String(form.openingHours||'').trim()) errs.openingHours = "Horaires d'ouverture requis"
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

  // Écoute le bouton "Enregistrer" du header (club:save)
  useEffect(() => {
    const handler = () => onSave()
    window.addEventListener('club:save' as any, handler)
    return () => window.removeEventListener('club:save' as any, handler)
  }, [form.name, form.description, form.address, form.openingHours, form.avatarUrl, form.coverUrl, form.isActive])

  return (
    <DashboardLayout title="Profil Club" subtitle="Gérez les informations publiques de votre club">
      {/* Header fixe (statut + progression + manquants) - aligné Escort v2 */}
      <ClubHeader />
      {/* Sous-onglets – style segmenté */}
      <div className="mb-4">
        {/* Mobile select for better reachability */}
        <div className="sm:hidden mb-2">
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
        <div 
          className="hidden sm:flex space-x-1 rounded-xl p-1 overflow-x-auto scrollbar-hide"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 min-w-[180px] sm:min-w-0 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'info'
                ? 'text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
            }`}
            style={activeTab === 'info' ? {
              background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
              boxShadow: '0 4px 15px rgba(255, 107, 157, 0.3)'
            } : {}}
          >
            <span>Informations</span>
            <span className={`bg-gray-600 text-xs px-2 py-0.5 rounded-full ${infoRequiredCount===3 ? 'bg-emerald-600/30 text-emerald-300' : ''}`}>
              {infoRequiredCount}/3
            </span>
          </button>
          <button
            onClick={() => setActiveTab('horaires')}
            className={`flex-1 min-w-[160px] sm:min-w-0 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'horaires'
                ? 'text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
            }`}
            style={activeTab === 'horaires' ? {
              background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
              boxShadow: '0 4px 15px rgba(255, 107, 157, 0.3)'
            } : {}}
          >
            <span>Horaires</span>
            <span className="bg-gray-600 text-xs px-2 py-0.5 rounded-full">Requis</span>
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 min-w-[180px] sm:min-w-0 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'services'
                ? 'text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
            }`}
            style={activeTab === 'services' ? {
              background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
              boxShadow: '0 4px 15px rgba(255, 107, 157, 0.3)'
            } : {}}
          >
            <span>Services</span>
            <span className="bg-gray-600 text-xs px-2 py-0.5 rounded-full">Optionnel</span>
          </button>
          <button
            onClick={() => setActiveTab('medias')}
            className={`flex-1 min-w-[160px] sm:min-w-0 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'medias'
                ? 'text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
            }`}
            style={activeTab === 'medias' ? {
              background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
              boxShadow: '0 4px 15px rgba(255, 107, 157, 0.3)'
            } : {}}
          >
            <span>Médias</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${mediaCount.ok ? 'bg-emerald-600/30 text-emerald-300' : 'bg-yellow-600/30 text-yellow-300'}`}>
              {mediaCount.count}/4
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
              {/* Informations d'inscription (lecture seule) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
                <div>
                  <label className="block text-sm text-blue-300 mb-1">Email d'inscription</label>
                  <input
                    value={form.email || ''}
                    disabled
                    className="w-full px-3 py-2.5 text-[15px] bg-gray-800/40 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm text-blue-300 mb-1">Téléphone d'inscription</label>
                  <input
                    value={form.phone || ''}
                    disabled
                    className="w-full px-3 py-2.5 text-[15px] bg-gray-800/40 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Nom du club</label>
                <input
                  value={form.companyName || form.name || ''}
                  onChange={e => updateField('name', e.target.value)}
                  className={`w-full px-3 py-2.5 text-[15px] bg-gray-800/60 border ${fieldErrors.name? 'border-red-500/60':'border-gray-700'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500`}
                  placeholder="Ex. Club Luxe Geneva"
                />
                {fieldErrors.name && <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>}
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
                <label className="block text-sm text-gray-300 mb-1">Adresse avec géolocalisation</label>
                <AddressAutocomplete
                  value={form.address || ''}
                  onChange={(value, coords) => {
                    updateField('address', value)
                    setCoordinates(coords || null)
                  }}
                  placeholder="Rue, numéro, ville (ex: Rue de la Paix 15, Lausanne)"
                  className={fieldErrors.address ? 'border-red-500/60' : ''}
                  onAddressSelect={(address) => {
                    updateField('address', address.address)
                    setCoordinates({ lat: address.latitude, lng: address.longitude })
                  }}
                />
                {fieldErrors.address && <p className="text-xs text-red-400 mt-1">{fieldErrors.address}</p>}
                {coordinates && (
                  <p className="text-xs text-green-400 mt-1">
                    📍 Coordonnées: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                  </p>
                )}
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Avatar URL</label>
                  <input
                    value={form.avatarUrl || ''}
                    onChange={e => updateField('avatarUrl', e.target.value)}
                    className="w-full px-3 py-2.5 text-[15px] bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    placeholder="https://…"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Cover URL (bannière)</label>
                  <input
                    value={form.coverUrl || ''}
                    onChange={e => updateField('coverUrl', e.target.value)}
                    className="w-full px-3 py-2.5 text-[15px] bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    placeholder="https://…"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Site web (facultatif)</label>
                <input
                  value={form.websiteUrl || ''}
                  onChange={e => setForm(prev => ({ ...prev, websiteUrl: e.target.value }))}
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

        {/* Bloc Activation retiré (géré par l'entête ClubHeader) */}
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
          <ClubMediaManager />
        )}
      </div>
      {/* Sticky bottom actions (mobile-first) */}
      {activeTab==='info' && (
        <div className="sticky bottom-3 z-20 flex justify-end">
          <div className="max-w-6xl w-full mx-auto px-4 sm:px-6">
            <div className="ml-auto w-full sm:w-auto inline-flex gap-2 rounded-xl bg-black/60 backdrop-blur border border-white/10 p-2">
              <a href="/club/profile" className="px-3 py-2 rounded-lg border border-white/10 text-white/80 hover:bg-white/10">Voir profil</a>
              <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-60">{saving ? 'Sauvegarde…' : 'Enregistrer'}</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

// Panel component for Club Hours
function HorairesPanel(){
  const [schedule, setSchedule] = useState<Record<string, { open: string; close: string; closed: boolean }>>({
    lundi: { open: '18:00', close: '05:00', closed: false },
    mardi: { open: '18:00', close: '05:00', closed: false },
    mercredi: { open: '18:00', close: '05:00', closed: false },
    jeudi: { open: '18:00', close: '05:00', closed: false },
    vendredi: { open: '18:00', close: '05:00', closed: false },
    samedi: { open: '18:00', close: '05:00', closed: false },
    dimanche: { open: '18:00', close: '05:00', closed: false },
  })
  const [isOpen24_7, setIsOpen24_7] = useState(false)
  const [saving, startSaving] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const days = [
    { key: 'lundi', label: 'Lundi' },
    { key: 'mardi', label: 'Mardi' },
    { key: 'mercredi', label: 'Mercredi' },
    { key: 'jeudi', label: 'Jeudi' },
    { key: 'vendredi', label: 'Vendredi' },
    { key: 'samedi', label: 'Samedi' },
    { key: 'dimanche', label: 'Dimanche' },
  ]

  const updateDaySchedule = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const copyToAllDays = (sourceDay: string) => {
    const source = schedule[sourceDay]
    setSchedule(prev =>
      Object.keys(prev).reduce((acc, day) => ({
        ...acc,
        [day]: { ...source }
      }), {})
    )
  }

  const onSave = () => {
    setMessage(null)
    setError(null)
    startSaving(async () => {
      try {
        const body = { schedule, isOpen24_7 }
        const r = await fetch('/api/clubs/schedule/update', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) })
        const d = await r.json()
        if (!r.ok || !d?.ok) throw new Error(d?.error || 'save_failed')
        setMessage('Horaires enregistrés')
      } catch (e) {
        setError('Échec de la sauvegarde')
      }
    })
  }

  return (
    <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
      <h2 className="text-white font-semibold mb-6">Horaires d'ouverture</h2>

      <div className="mb-6 flex items-center gap-2">
        <input
          id="open247"
          type="checkbox"
          checked={isOpen24_7}
          onChange={e => setIsOpen24_7(e.target.checked)}
          className="rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
        />
        <label htmlFor="open247" className="text-sm text-gray-300">Ouvert 24h/24, 7j/7</label>
      </div>

      {!isOpen24_7 && (
        <div className="space-y-4">
          {days.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-4 p-4 bg-gray-800/40 rounded-lg">
              <div className="w-20 text-sm text-gray-300 font-medium">{label}</div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={schedule[key].closed}
                  onChange={e => updateDaySchedule(key, 'closed', e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-red-500"
                />
                <span className="text-xs text-gray-400">Fermé</span>
              </div>

              {!schedule[key].closed && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">De</span>
                    <input
                      type="time"
                      value={schedule[key].open}
                      onChange={e => updateDaySchedule(key, 'open', e.target.value)}
                      className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">à</span>
                    <input
                      type="time"
                      value={schedule[key].close}
                      onChange={e => updateDaySchedule(key, 'close', e.target.value)}
                      className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToAllDays(key)}
                    className="text-xs px-2 py-1 bg-purple-600/20 text-purple-300 rounded hover:bg-purple-600/30 transition-colors"
                  >
                    Copier à tous
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-60 hover:from-purple-600 hover:to-pink-600 transition-colors"
        >
          {saving ? 'Sauvegarde…' : 'Enregistrer les horaires'}
        </button>
        {message && <div className="text-sm text-green-400">{message}</div>}
        {error && <div className="text-sm text-red-400">{error}</div>}
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
  const [isOpen24_7, setIsOpen24_7] = useState(false)
  const [openingHours, setOpeningHours] = useState('')
  const [saving, startSaving] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const DEFAULT_LANGS = ['Français','Anglais','Allemand','Italien','Espagnol']
  const DEFAULT_PAYMENTS = ['Cash','Carte','TWINT','Virement']
  const DEFAULT_SERVICES = ['Bar','Privé','Sécurité','Parking','Salle VIP']
  const DEFAULT_EQUIPMENTS = ['Douche à deux','Jacuzzi','Sauna','Climatisation','Fumoir','Parking','Accès handicapé','Ambiance musicale','Bar','Pole dance']

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], value: string) => {
    setter(prev => {
      const s = new Set(list)
      if (s.has(value)) s.delete(value); else s.add(value)
      return Array.from(s)
    })
  }

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
          setIsOpen24_7(!!s.isOpen24_7)
          setOpeningHours(typeof s.openingHours === 'string' ? s.openingHours : '')
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
        const body = { languages, paymentMethods, services, equipments, isOpen24_7, openingHours }
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
        <h2 className="text-white font-semibold mb-4">Services</h2>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_SERVICES.map(s => (
            <button key={s} onClick={() => toggle(setServices, services, s)} className={`px-3 py-1.5 rounded-lg text-sm border ${services.includes(s) ? 'bg-purple-500/20 border-purple-500/40 text-purple-200' : 'bg-white/5 border-white/10 text-white'}`}>{s}</button>
          ))}
        </div>

        <h2 className="text-white font-semibold mt-6 mb-4">Équipements</h2>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_EQUIPMENTS.map(eq => (
            <button key={eq} onClick={() => toggle(setEquipments, equipments, eq)} className={`px-3 py-1.5 rounded-lg text-sm border ${equipments.includes(eq) ? 'bg-purple-500/20 border-purple-500/40 text-purple-200' : 'bg-white/5 border-white/10 text-white'}`}>{eq}</button>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-2">
          <input id="open247" type="checkbox" checked={isOpen24_7} onChange={e => setIsOpen24_7(e.target.checked)} />
          <label htmlFor="open247" className="text-sm text-gray-300">Ouvert 24/24</label>
        </div>
        <div className="mt-3">
          <label className="block text-sm text-gray-300 mb-1">Horaires détaillés</label>
          <input
            value={openingHours}
            onChange={e => setOpeningHours(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            placeholder="Lun-Dim 18:00–05:00"
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
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
