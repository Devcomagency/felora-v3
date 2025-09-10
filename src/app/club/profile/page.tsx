"use client"

import { useEffect, useMemo, useState, useTransition } from 'react'
import { Building, MapPin, Clock, Globe, Save, Eye, Upload, X } from 'lucide-react'

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

export default function ClubProfilePage() {
  const [club, setClub] = useState<Club | null>(null)
  const [form, setForm] = useState<Partial<Club> & { websiteUrl?: string }>({})
  const [loading, setLoading] = useState(true)
  const [saving, startSaving] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'info'|'services'|'medias'>('info')
  const [mediaCount, setMediaCount] = useState<{ count:number; ok:boolean }>({ count: 0, ok: false })

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
              name: data.club.name || '',
              description: data.club.description || '',
              address: data.club.address || '',
              openingHours: data.club.openingHours || '',
              avatarUrl: data.club.avatarUrl || '',
              coverUrl: data.club.coverUrl || '',
              isActive: !!data.club.isActive,
              websiteUrl: (data.club as any).websiteUrl || ''
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
    if (String(form.openingHours||'').trim()) n++
    return n
  }, [form.name, form.description, form.address, form.openingHours])

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
            </div>
            <div className="text-sm text-white/70">
              Informations: {infoRequiredCount}/4 • Médias: {mediaCount.count}/4
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
              <span className={`bg-gray-600 text-xs px-2 py-0.5 rounded-full ${infoRequiredCount===4 ? 'bg-emerald-600/30 text-emerald-300' : ''}`}>
                {infoRequiredCount}/4
              </span>
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
                  <input
                    value={form.address || ''}
                    onChange={e => updateField('address', e.target.value)}
                    className={`w-full px-3 py-2.5 text-[15px] bg-gray-800/60 border ${fieldErrors.address? 'border-red-500/60':'border-gray-700'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500`}
                    placeholder="Rue, ville…"
                  />
                  {fieldErrors.address && <p className="text-xs text-red-400 mt-1">{fieldErrors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">Horaires d'ouverture</label>
                  <input
                    value={form.openingHours || ''}
                    onChange={e => updateField('openingHours', e.target.value)}
                    className={`w-full px-3 py-2.5 text-[15px] bg-gray-800/60 border ${fieldErrors.openingHours? 'border-red-500/60':'border-gray-700'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500`}
                    placeholder="Lun-Dim 18:00–05:00"
                  />
                  {fieldErrors.openingHours && <p className="text-xs text-red-400 mt-1">{fieldErrors.openingHours}</p>}
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
          </>
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
            <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
              <h2 className="text-lg font-semibold text-white mb-4">Gestion des médias</h2>
              <p className="text-white/70 mb-6">Uploadez vos photos et vidéos pour attirer plus de clients</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-800/60 border border-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Média {i}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
      </div>
    </div>
  )
}

// Simple panel component for Services inside profile page
function ServicesPanel(){
  const [languages, setLanguages] = useState<string[]>([])
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [services, setServices] = useState<string[]>([])
  const [isOpen24_7, setIsOpen24_7] = useState(false)
  const [openingHours, setOpeningHours] = useState('')
  const [saving, startSaving] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const DEFAULT_LANGS = ['Français','Anglais','Allemand','Italien','Espagnol']
  const DEFAULT_PAYMENTS = ['Cash','Carte','TWINT','Virement']
  const DEFAULT_SERVICES = ['Bar','Champagne','Privé','Sécurité','Parking','Salle VIP']

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
        const body = { languages, paymentMethods, services, isOpen24_7, openingHours }
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