"use client"

import { useEffect, useMemo, useState, useTransition, useRef, useCallback } from 'react'
import { Building, MapPin, Clock, Globe, Save, Eye, Upload, X, Plus, UserPlus, UserMinus, Search, Check, XCircle } from 'lucide-react'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete'
import HorairesPanel from '@/components/dashboard/HorairesPanel'
import { useTranslations } from 'next-intl'

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
  establishmentType?: 'institut_massage' | 'agence_escorte' | 'salon_erotique' | 'club'
}

export default function ClubProfilePage() {
  const t = useTranslations('club.profile')
  const [club, setClub] = useState<Club | null>(null)
  const [form, setForm] = useState<Partial<Club> & {
    websiteUrl?: string;
    email?: string;
    phone?: string;
    companyName?: string;
    handle?: string;
    managerName?: string;
    establishmentType?: 'institut_massage' | 'agence_escorte' | 'salon_erotique' | 'club';
  }>({})
  const [loading, setLoading] = useState(true)
  const [saving, startSaving] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'info'|'horaires'|'services'|'escorts'>('info')
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
              establishmentType: data.club.establishmentType || 'club',
              email: data.club.email || data.club.user?.email || '',
              phone: data.club.phone || data.club.user?.phoneE164 || '',
              handle: data.club.handle || '',
              companyName: data.club.companyName || '',
              managerName: data.club.managerName || ''
            })
            if (data.club.latitude && data.club.longitude) {
              setCoordinates({
                lat: data.club.latitude,
                lng: data.club.longitude
              })
            }
          }
        }
      } catch (e) {
        if (!cancelled) setError(t('info.errors.loadingError'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [t])

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
        const count = okProfile ? 1 : 0
        if (!cancelled) setMediaCount({ count, ok: count === 1 })
      } catch {}
    })()
    return () => { cancelled = true }
  }, [])

  const infoRequiredCount = useMemo(() => {
    let n = 0
    if (String(form.name||'').trim()) n++
    if (form.establishmentType) n++
    if (String(form.description||'').trim()) n++
    if (String(form.address||'').trim()) n++
    return n
  }, [form.name, form.establishmentType, form.description, form.address])

  const autoSave = useCallback(async (updatedForm: typeof form) => {
    try {
      const payload: any = {
        name: updatedForm.name,
        description: updatedForm.description,
        address: updatedForm.address,
        openingHours: updatedForm.openingHours,
        avatarUrl: updatedForm.avatarUrl,
        coverUrl: updatedForm.coverUrl,
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

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave(updatedForm)
    }, 1500)
  }

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
    const errs: Record<string, string> = {}
    if (!String(form.name||'').trim()) errs.name = t('info.errors.nameRequired')
    if (!String(form.description||'').trim()) errs.description = t('info.errors.descriptionRequired')
    if (!String(form.address||'').trim()) errs.address = t('info.errors.addressRequired')
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
          city: form.address ? form.address.split(',')[0] || '' : '',
          websiteUrl: form.websiteUrl,
          email: form.email,
          phone: form.phone,
          capacity: form.capacity ? Number(form.capacity) : null,
          latitude: coordinates?.lat || null,
          longitude: coordinates?.lng || null,
          establishmentType: form.establishmentType,
        }
        const res = await fetch('/api/clubs/profile/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const j = await res.json()
        if (!res.ok || !j?.ok) throw new Error(j?.error || 'save_failed')
        setMessage(t('info.messages.profileUpdated'))
      } catch (e) {
        setError(t('info.errors.savingError'))
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

        setForm(prev => ({ ...prev, isActive: newStatus }))
        setMessage(newStatus ? t('status.profileActivated') : t('status.profileDeactivated'))
      } catch (e) {
        setError(t('status.toggleError', { error: e instanceof Error ? e.message : 'Unknown error' }))
      }
    })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

        {/* Status et progression */}
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-gray-900/60 to-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex flex-col gap-4">
            {/* Status */}
            <div className="flex items-center gap-3 pr-12 sm:pr-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${form.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <div className={`absolute inset-0 w-3 h-3 rounded-full ${form.isActive ? 'bg-emerald-500' : 'bg-red-500'} animate-ping opacity-75`}></div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-white font-semibold text-sm sm:text-base truncate">
                    {form.isActive ? t('status.active') : t('status.inactive')}
                  </span>
                  <span className="text-xs text-gray-400 truncate">
                    {form.isActive ? t('status.visibleToUsers') : t('status.hiddenFromUsers')}
                  </span>
                </div>
              </div>
              <button
                onClick={toggleProfileStatus}
                disabled={toggling}
                className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  form.isActive
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 disabled:opacity-50'
                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 disabled:opacity-50'
                }`}
              >
                {toggling ? t('status.activating') : (form.isActive ? t('status.deactivate') : t('status.activate'))}
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10"></div>

            {/* Progression */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${infoRequiredCount === 4 ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-xs sm:text-sm text-gray-300 whitespace-nowrap">{t('progress.information')}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${infoRequiredCount===4 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'}`}>
                  {t('progress.informationCount', { count: infoRequiredCount })}
                </span>
              </div>
              <div className="w-px h-5 bg-white/10 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${mediaCount.ok ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-xs sm:text-sm text-gray-300 whitespace-nowrap">{t('progress.photo')}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${mediaCount.ok ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'}`}>
                  {t('progress.photoCount', { count: mediaCount.count })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets Premium */}
        <div className="mb-0">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('info')}
              className={`relative flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'info'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <span className="whitespace-nowrap">{t('tabs.information')}</span>
              <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${infoRequiredCount===4 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/10 text-gray-300 border border-white/10'}`}>
                {t('progress.informationCount', { count: infoRequiredCount })}
              </span>
              {activeTab === 'info' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF6B9D] via-[#B794F6] to-[#FF6B9D]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`relative flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'services'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <span className="whitespace-nowrap">{t('tabs.services')}</span>
              <span className="hidden lg:inline bg-white/10 text-xs px-1.5 sm:px-2 py-0.5 rounded-full text-gray-300 border border-white/10">{t('tabs.optional')}</span>
              {activeTab === 'services' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF6B9D] via-[#B794F6] to-[#FF6B9D]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('horaires')}
              className={`relative flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'horaires'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <span className="whitespace-nowrap">{t('tabs.schedule')}</span>
              {activeTab === 'horaires' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF6B9D] via-[#B794F6] to-[#FF6B9D]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('escorts')}
              className={`relative flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'escorts'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <span className="whitespace-nowrap">{t('tabs.myTeam')}</span>
              {activeTab === 'escorts' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF6B9D] via-[#B794F6] to-[#FF6B9D]"></div>
              )}
            </button>
          </div>
        </div>

        {/* Contenu onglets */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1">
          {/* Onglet: Infos principales */}
          {activeTab === 'info' && (
          <>
          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gray-900/60 border border-gray-800">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-4">{t('info.title')}</h2>

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
                  <div className="flex items-center gap-2 mb-1">
                    <label className="block text-sm text-gray-300">{t('info.clubName')}</label>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">{t('info.required')}</span>
                  </div>
                  <input
                    value={form.name || ''}
                    onChange={e => updateField('name', e.target.value)}
                    className={`w-full px-3 py-2.5 text-[15px] bg-gray-800/60 border ${fieldErrors.name? 'border-red-500/60':'border-gray-700'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500`}
                    placeholder={t('info.clubNamePlaceholder')}
                  />
                  {fieldErrors.name && <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="block text-sm text-gray-300">{t('info.establishmentType')}</label>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">{t('info.required')}</span>
                  </div>
                  <select
                    value={form.establishmentType || 'club'}
                    onChange={e => updateField('establishmentType', e.target.value as any)}
                    className="w-full px-3 py-2.5 text-[15px] bg-gray-800/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="institut_massage">{t('info.establishmentTypes.institut_massage')}</option>
                    <option value="agence_escorte">{t('info.establishmentTypes.agence_escorte')}</option>
                    <option value="salon_erotique">{t('info.establishmentTypes.salon_erotique')}</option>
                    <option value="club">{t('info.establishmentTypes.club')}</option>
                  </select>
                </div>

                {/* Données d'inscription modifiables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">{t('info.email')}</label>
                    <input
                      value={form.email || ''}
                      onChange={e => {
                        const updatedForm = { ...form, email: e.target.value }
                        setForm(updatedForm)
                        if (autoSaveTimeoutRef.current) {
                          clearTimeout(autoSaveTimeoutRef.current)
                        }
                        autoSaveTimeoutRef.current = setTimeout(() => {
                          autoSave(updatedForm)
                        }, 1500)
                      }}
                      className="w-full px-3 py-2.5 text-[15px] bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      placeholder={t('info.emailPlaceholder')}
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">{t('info.phone')}</label>
                    <input
                      value={form.phone || ''}
                      onChange={e => {
                        const updatedForm = { ...form, phone: e.target.value }
                        setForm(updatedForm)
                        if (autoSaveTimeoutRef.current) {
                          clearTimeout(autoSaveTimeoutRef.current)
                        }
                        autoSaveTimeoutRef.current = setTimeout(() => {
                          autoSave(updatedForm)
                        }, 1500)
                      }}
                      className="w-full px-3 py-2.5 text-[15px] bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      placeholder={t('info.phonePlaceholder')}
                      type="tel"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="block text-sm text-gray-300">{t('info.description')}</label>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">{t('info.required')}</span>
                  </div>
                  <textarea
                    value={form.description || ''}
                    onChange={e => updateField('description', e.target.value)}
                    className={`w-full px-3 py-2.5 text-[15px] bg-gray-800/60 border ${fieldErrors.description? 'border-red-500/60':'border-gray-700'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 min-h-[110px]`}
                    placeholder={t('info.descriptionPlaceholder')}
                  />
                  {fieldErrors.description && <p className="text-xs text-red-400 mt-1">{fieldErrors.description}</p>}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="block text-sm text-gray-300">{t('info.address')}</label>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">{t('info.required')}</span>
                  </div>
                  <AddressAutocomplete
                    value={form.address || ''}
                    onChange={(address) => {
                      updateField('address', address)
                    }}
                    onCoordinatesChange={setCoordinates}
                    className={`w-full px-3 py-2.5 text-[15px] bg-gray-800/60 border ${fieldErrors.address? 'border-red-500/60':'border-gray-700'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500`}
                    placeholder={t('info.addressPlaceholder')}
                  />
                  {coordinates && (
                    <p className="text-xs text-green-400 mt-1">
                      {t('info.positionFound', { lat: coordinates.lat.toFixed(4), lng: coordinates.lng.toFixed(4) })}
                    </p>
                  )}
                  {fieldErrors.address && <p className="text-xs text-red-400 mt-1">{fieldErrors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">{t('info.website')}</label>
                  <input
                    value={form.websiteUrl || ''}
                    onChange={e => {
                      const updatedForm = { ...form, websiteUrl: e.target.value }
                      setForm(updatedForm)
                      if (autoSaveTimeoutRef.current) {
                        clearTimeout(autoSaveTimeoutRef.current)
                      }
                      autoSaveTimeoutRef.current = setTimeout(() => {
                        autoSave(updatedForm)
                      }, 1500)
                    }}
                    className="w-full px-3 py-2.5 text-[15px] bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    placeholder={t('info.websitePlaceholder')}
                  />
                </div>

                {(message || error) && (
                  <div className={`text-sm ${error ? 'text-red-400' : 'text-green-400'}`}>{error || message}</div>
                )}
              </div>
            )}
          </div>

          {/* Photo de profil */}
          <ClubMediaGrid />
          </>
          )}

          {/* Onglet: Horaires */}
          {activeTab === 'horaires' && (
            <HorairesPanel />
          )}

          {/* Onglet: Services */}
          {activeTab === 'services' && (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
              {/* Langues & Paiements */}
              <ServicesPanel />
            </div>
          )}

          {/* Onglet: Mes Escorts */}
          {activeTab === 'escorts' && (
            <EscortsPanel />
          )}
        </div>

        {/* Sticky bottom actions (mobile-first) */}
        {activeTab==='info' && (
          <div className="sticky bottom-2 sm:bottom-3 z-20 flex justify-end">
            <div className="max-w-6xl w-full mx-auto px-4 sm:px-6">
              <div className="ml-auto w-full sm:w-auto inline-flex gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-black/60 backdrop-blur border border-white/10 p-1.5 sm:p-2">
                <a
                  href={form.handle ? `/profile-test/club/${form.handle}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 sm:flex-none px-3 py-2 text-sm rounded-lg border border-white/10 text-white/80 hover:bg-white/10 text-center ${!form.handle ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {t('actions.viewProfile')}
                </a>
                <button onClick={onSave} disabled={saving} className="flex-1 sm:flex-none px-4 py-2 text-sm rounded-lg bg-[#FF6B9D] hover:bg-[#FF6B9D]/90 text-white disabled:opacity-60 transition-all whitespace-nowrap">{saving ? t('actions.saving') : t('actions.save')}</button>
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
  const t = useTranslations('club.profile.services')
  const [languages, setLanguages] = useState<string[]>([])
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [services, setServices] = useState<string[]>([])
  const [equipments, setEquipments] = useState<string[]>([])
  const [saving, startSaving] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const autoSaveServicesTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const DEFAULT_LANGS = [
    t('languages.french'),
    t('languages.english'),
    t('languages.german'),
    t('languages.italian'),
    t('languages.spanish'),
    t('languages.russian'),
    t('languages.arabic'),
    t('languages.chinese')
  ]
  const DEFAULT_PAYMENTS = [
    t('paymentMethods.cash'),
    t('paymentMethods.card'),
    t('paymentMethods.twint'),
    t('paymentMethods.transfer')
  ]
  const DEFAULT_SERVICES = [
    t('servicesList.bar'),
    t('servicesList.private'),
    t('servicesList.security'),
    t('servicesList.parking'),
    t('servicesList.vipRoom')
  ]
  const DEFAULT_EQUIPMENTS = [
    t('equipmentsList.shower'),
    t('equipmentsList.jacuzzi'),
    t('equipmentsList.sauna'),
    t('equipmentsList.airConditioning'),
    t('equipmentsList.smokingArea'),
    t('equipmentsList.handicapAccess'),
    t('equipmentsList.musicAmbiance'),
    t('equipmentsList.poleDance')
  ]

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

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>, _list: string[], value: string) => {
    setter(prev => {
      const s = new Set(prev)
      if (s.has(value)) s.delete(value); else s.add(value)
      const newArray = Array.from(s)

      if (autoSaveServicesTimeoutRef.current) {
        clearTimeout(autoSaveServicesTimeoutRef.current)
      }

      autoSaveServicesTimeoutRef.current = setTimeout(() => {
      }, 1000)

      return newArray
    })
  }

  useEffect(() => {
    if (languages.length === 0 && paymentMethods.length === 0 && services.length === 0 && equipments.length === 0) {
      return
    }

    if (autoSaveServicesTimeoutRef.current) {
      clearTimeout(autoSaveServicesTimeoutRef.current)
    }

    autoSaveServicesTimeoutRef.current = setTimeout(() => {
      autoSaveServices()
    }, 1500)

    return () => {
      if (autoSaveServicesTimeoutRef.current) {
        clearTimeout(autoSaveServicesTimeoutRef.current)
      }
    }
  }, [languages, paymentMethods, services, equipments, autoSaveServices])

  useEffect(() => {
    return () => {
      if (autoSaveServicesTimeoutRef.current) {
        clearTimeout(autoSaveServicesTimeoutRef.current)
      }
    }
  }, [])

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
        if (!cancelled) setError(t('loadingError'))
      }
    })()
    return () => { cancelled = true }
  }, [t])

  const onSave = () => {
    setMessage(null)
    setError(null)
    startSaving(async () => {
      try {
        const body = { languages, paymentMethods, services, equipments }
        const r = await fetch('/api/clubs/services/update', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) })
        const d = await r.json()
        if (!r.ok || !d?.ok) throw new Error(d?.error || 'save_failed')
        setMessage(t('settingsSaved'))
      } catch (e) {
        setError(t('savingError'))
      }
    })
  }

  return (
    <>
      <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gray-900/60 border border-gray-800">
        <h2 className="text-base sm:text-lg text-white font-semibold mb-3 sm:mb-4">{t('languagesTitle')}</h2>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {DEFAULT_LANGS.map(l => (
            <button key={l} onClick={() => toggle(setLanguages, languages, l)} className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm border transition-all ${languages.includes(l) ? 'bg-purple-500/20 border-purple-500/40 text-purple-200' : 'bg-white/5 border-white/10 text-white'}`}>{l}</button>
          ))}
        </div>
        <h2 className="text-base sm:text-lg text-white font-semibold mt-5 sm:mt-6 mb-3 sm:mb-4">{t('paymentMethodsTitle')}</h2>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {DEFAULT_PAYMENTS.map(p => (
            <button key={p} onClick={() => toggle(setPaymentMethods, paymentMethods, p)} className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm border transition-all ${paymentMethods.includes(p) ? 'bg-purple-500/20 border-purple-500/40 text-purple-200' : 'bg-white/5 border-white/10 text-white'}`}>{p}</button>
          ))}
        </div>
      </div>
      <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gray-900/60 border border-gray-800">
        <h2 className="text-base sm:text-lg text-white font-semibold mb-3 sm:mb-4">{t('servicesEquipmentsTitle')}</h2>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {[...DEFAULT_SERVICES, ...DEFAULT_EQUIPMENTS].map((item, index) => {
            const isService = DEFAULT_SERVICES.includes(item)
            const isSelected = isService ? services.includes(item) : equipments.includes(item)
            const toggleFunction = isService ?
              () => toggle(setServices, services, item) :
              () => toggle(setEquipments, equipments, item)

            return (
              <button
                key={`${isService ? 'service' : 'equipment'}-${item}-${index}`}
                onClick={toggleFunction}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm border transition-all duration-200 ${
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

        <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <button onClick={onSave} disabled={saving} className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#FF6B9D] hover:bg-[#FF6B9D]/90 text-white text-sm disabled:opacity-60 transition-all">
            {saving ? t('saving') : t('save')}
          </button>
          {message && <div className="text-xs sm:text-sm text-green-400">{message}</div>}
          {error && <div className="text-xs sm:text-sm text-red-400">{error}</div>}
        </div>
      </div>
    </>
  )
}

// Composant pour la gestion des médias du club
function ClubMediaGrid() {
  const t = useTranslations('club.profile.media')
  const [media, setMedia] = useState<Array<{ pos: number; type: 'IMAGE' | 'VIDEO'; url?: string }>>([])
  const [uploading, setUploading] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaSlots = [
    { pos: 0, label: t('coverPhoto'), type: 'IMAGE' as const, required: true, inPublications: false },
  ]

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch('/api/clubs/media/my?page=1&pageSize=50', { cache: 'no-store' })
        const j = await r.json()
        const items: Array<{ pos?: number | null; type: 'IMAGE' | 'VIDEO'; url?: string }> = Array.isArray(j?.items) ? j.items : []
        const validMedia = items.filter(item => typeof item.pos === 'number' && item.pos === 0)
        if (!cancelled) setMedia(validMedia as Array<{ pos: number; type: 'IMAGE' | 'VIDEO'; url?: string }>)
      } catch (e) {
        if (!cancelled) setError(t('loadingError'))
      }
    })()
    return () => { cancelled = true }
  }, [t])

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

        setMedia(prev => {
          const filtered = prev.filter(m => m.pos !== pos)
          return [...filtered, { pos, type, url: result.url || 'uploaded' }]
        })

        setMessage(t('uploadSuccess', { type: type === 'IMAGE' ? 'Photo' : 'Vidéo' }))
      } catch (e) {
        setError(t('uploadError', { error: e instanceof Error ? e.message : 'Unknown error' }))
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

      setMedia(prev => prev.filter(m => m.pos !== pos))
      setMessage(t('deleteSuccess'))
    } catch (e) {
      setError(t('deleteError', { error: e instanceof Error ? e.message : 'Unknown error' }))
    }
  }

  return (
    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gray-900/60 border border-gray-800">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-white">{t('title')}</h2>
        <span className="text-xs px-2 py-0.5 sm:py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">Requis</span>
      </div>
      <p className="text-sm sm:text-base text-white/70 mb-4 sm:mb-6">{t('subtitle')}</p>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {mediaSlots.map((slot) => {
          const existingMedia = getMediaForSlot(slot.pos)
          const isUploading = uploading === slot.pos

          return (
            <div key={slot.pos} className="border border-gray-700 rounded-lg sm:rounded-xl p-3 sm:p-4">

              <div className="aspect-video bg-gray-800/60 border border-gray-700 rounded-md sm:rounded-lg flex items-center justify-center relative overflow-hidden">
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
                    <div
                      className="w-full h-full bg-gray-700 flex items-center justify-center"
                      style={{ display: 'none' }}
                    >
                      <span className="text-gray-400">
                        {existingMedia.type === 'IMAGE' ? t('imageUnavailable') : t('videoUnavailable')}
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
                        <p className="text-sm text-gray-400">{t('uploadInProgress')}</p>
                      </div>
                    ) : (
                      <div className="space-y-2 text-center">
                        <Upload className="w-6 sm:w-8 h-6 sm:h-8 text-gray-400 mx-auto" />
                        <p className="text-xs sm:text-sm text-gray-400 px-2">
                          {slot.type === 'IMAGE' ? t('clickToAddPhoto') : t('clickToAddVideo')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {(!existingMedia || !existingMedia.url) && !isUploading && (
                <button
                  onClick={() => handleFileUpload(slot.pos, slot.type)}
                  className="w-full mt-2 sm:mt-3 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-purple-500/20 border border-purple-500/40 text-purple-200 rounded-lg hover:bg-purple-500/30 transition-colors"
                >
                  {slot.type === 'IMAGE' ? t('addPhoto') : t('addVideo')}
                </button>
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

// Composant pour la gestion des escorts du club
function EscortsPanel() {
  const t = useTranslations('club.profile.team')
  const [linkedEscorts, setLinkedEscorts] = useState<Array<{
    id: string
    linkId?: string
    name: string
    city?: string
    avatar?: string
    verified?: boolean
    joinedAt?: string
  }>>([])
  const [sentInvitations, setSentInvitations] = useState<Array<{
    id: string
    escortId: string
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED'
    sentAt: string
    message?: string
    escort?: {
      id: string
      name: string
      city?: string
      avatar?: string
    }
  }>>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{
    id: string
    name: string
    city?: string
    avatar?: string
  }>>([])
  const [searching, setSearching] = useState(false)
  const [subTab, setSubTab] = useState<'linked' | 'invitations'>('linked')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const meRes = await fetch('/api/clubs/profile/me')
      const meData = await meRes.json()
      const myClubId = meData?.club?.id

      if (!myClubId) return

      const escortsRes = await fetch(`/api/clubs/${myClubId}/escorts`)
      const escortsData = await escortsRes.json()

      if (escortsData.success) {
        setLinkedEscorts(escortsData.data || [])
      }

      const invitationsRes = await fetch('/api/club-escort-invitations?type=sent')
      const invitationsData = await invitationsRes.json()

      if (invitationsData.success) {
        setSentInvitations(invitationsData.data || [])
      }
    } catch (error) {
      console.error('Error loading escorts:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchEscorts = async (term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      const res = await fetch(`/api/search/escorts?q=${encodeURIComponent(term)}`)
      const data = await res.json()

      if (data.success) {
        const linkedIds = linkedEscorts.map(e => e.id)
        const invitedIds = sentInvitations
          .filter(inv => inv.status === 'PENDING')
          .map(inv => inv.escortId)

        const filtered = (data.data || []).filter(
          (e: any) => !linkedIds.includes(e.id) && !invitedIds.includes(e.id)
        )

        setSearchResults(filtered)
      }
    } catch (error) {
      console.error('Error searching escorts:', error)
    } finally {
      setSearching(false)
    }
  }

  const sendInvitation = async (escortId: string) => {
    try {
      const res = await fetch('/api/club-escort-invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escortId })
      })

      const data = await res.json()

      if (data.success) {
        await loadData()
        setShowInviteModal(false)
        setSearchTerm('')
        setSearchResults([])
        setSubTab('invitations')
        alert(t('inviteModal.invitationSent'))
      } else {
        alert(data.error || t('inviteModal.invitationError'))
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      alert(t('inviteModal.invitationError'))
    }
  }

  const cancelInvitation = async (invitationId: string) => {
    if (!confirm(t('cancelInvitation'))) return

    try {
      const res = await fetch(`/api/club-escort-invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
      })

      const data = await res.json()

      if (data.success) {
        await loadData()
      } else {
        alert(data.error || t('inviteModal.cancelError'))
      }
    } catch (error) {
      console.error('Error canceling invitation:', error)
      alert(t('inviteModal.cancelError'))
    }
  }

  const removeEscort = async (linkId: string, escortName: string) => {
    if (!confirm(t('removeConfirm', { name: escortName }))) return

    try {
      const res = await fetch(`/api/club-escort-links/${linkId}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        await loadData()
      } else {
        alert(data.error || t('inviteModal.removeError'))
      }
    } catch (error) {
      console.error('Error removing escort:', error)
      alert(t('inviteModal.removeError'))
    }
  }

  const pendingInvitations = sentInvitations.filter(inv => inv.status === 'PENDING')

  return (
    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gray-900/60 border border-gray-800">
      {/* Header avec sous-onglets */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSubTab('linked')}
            className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              subTab === 'linked'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {t('activeTeam', { count: linkedEscorts.length })}
          </button>
          <button
            onClick={() => setSubTab('invitations')}
            className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              subTab === 'invitations'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {t('invitations', { count: pendingInvitations.length })}
          </button>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-[#FF6B9D] hover:bg-[#FF6B9D]/90 text-white text-xs sm:text-sm rounded-lg transition-all"
        >
          <UserPlus size={16} />
          {t('inviteGirl')}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm text-center py-8">{t('loading')}</div>
      ) : (
        <>
          {/* Sous-onglet: Escorts liées */}
          {subTab === 'linked' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {linkedEscorts.map((escort, index) => (
                <div key={`escort-${escort.id}-${index}`} className="rounded-lg sm:rounded-xl overflow-hidden bg-gray-900/60 border border-gray-800 group relative">
                  <div className="aspect-square bg-black/30">
                    <img
                      src={escort.avatar || 'https://placehold.co/400x400?text=Escort'}
                      alt={escort.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-2 sm:p-3">
                    <div className="text-white font-medium text-xs sm:text-sm truncate">{escort.name}</div>
                    <div className="text-gray-400 text-xs truncate">{escort.city || '—'}</div>
                  </div>

                  <button
                    onClick={() => {
                      if (escort.linkId) {
                        removeEscort(escort.linkId, escort.name)
                      } else {
                        alert(t('inviteModal.cannotRemove'))
                      }
                    }}
                    className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 p-1.5 sm:p-2 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title={t('removeFromClub')}
                  >
                    <UserMinus size={14} className="text-white" />
                  </button>
                </div>
              ))}

              {linkedEscorts.length === 0 && (
                <div className="col-span-full text-center text-gray-400 text-sm py-8">
                  {t('noTeamMembers')}
                </div>
              )}
            </div>
          )}

          {/* Sous-onglet: Invitations */}
          {subTab === 'invitations' && (
            <div className="space-y-2 sm:space-y-3">
              {sentInvitations.map(invitation => (
                <div
                  key={invitation.id}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-800/40 rounded-lg border border-gray-700"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                    {invitation.escort?.avatar ? (
                      <img
                        src={invitation.escort.avatar}
                        alt={invitation.escort.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm sm:text-base">
                        {invitation.escort?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm sm:text-base truncate">{invitation.escort?.name || 'Escort'}</div>
                    <div className="text-xs text-gray-400 truncate">
                      {t('sentOn', { date: new Date(invitation.sentAt).toLocaleDateString('fr-FR') })}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {invitation.status === 'PENDING' && (
                      <span className="flex items-center gap-1 text-yellow-400 text-xs sm:text-sm whitespace-nowrap">
                        <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">{t('invitationStatus.pending')}</span>
                      </span>
                    )}
                    {invitation.status === 'ACCEPTED' && (
                      <span className="flex items-center gap-1 text-green-400 text-xs sm:text-sm whitespace-nowrap">
                        <Check size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">{t('invitationStatus.accepted')}</span>
                      </span>
                    )}
                    {invitation.status === 'DECLINED' && (
                      <span className="flex items-center gap-1 text-red-400 text-xs sm:text-sm whitespace-nowrap">
                        <XCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">{t('invitationStatus.declined')}</span>
                      </span>
                    )}
                    {invitation.status === 'CANCELLED' && (
                      <span className="flex items-center gap-1 text-gray-400 text-xs sm:text-sm whitespace-nowrap">
                        <X size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">{t('invitationStatus.cancelled')}</span>
                      </span>
                    )}
                    {invitation.status === 'EXPIRED' && (
                      <span className="flex items-center gap-1 text-gray-400 text-xs sm:text-sm whitespace-nowrap">
                        <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">{t('invitationStatus.expired')}</span>
                      </span>
                    )}
                  </div>

                  {invitation.status === 'PENDING' && (
                    <button
                      onClick={() => cancelInvitation(invitation.id)}
                      className="flex-shrink-0 px-2 sm:px-3 py-1 text-xs sm:text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                    >
                      {t('cancel')}
                    </button>
                  )}
                </div>
              ))}

              {sentInvitations.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8">
                  {t('noInvitations')}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal d'invitation */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-800 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-800">
              <h2 className="text-lg sm:text-xl font-bold text-white">{t('inviteModal.title')}</h2>
              <button
                onClick={() => {
                  setShowInviteModal(false)
                  setSearchTerm('')
                  setSearchResults([])
                }}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-4 sm:p-6 border-b border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    searchEscorts(e.target.value)
                  }}
                  placeholder={t('inviteModal.searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {searching ? (
                <div className="text-center text-gray-400 py-8">{t('inviteModal.searching')}</div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {searchResults.map(escort => (
                    <div
                      key={escort.id}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-800/40 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                        {escort.avatar ? (
                          <img
                            src={escort.avatar}
                            alt={escort.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm sm:text-lg font-bold">
                            {escort.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm sm:text-base truncate">{escort.name}</div>
                        <div className="text-xs sm:text-sm text-gray-400 truncate">{escort.city || t('inviteModal.cityNotSpecified')}</div>
                      </div>

                      <button
                        onClick={() => sendInvitation(escort.id)}
                        className="flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#FF6B9D] hover:bg-[#FF6B9D]/90 text-white text-xs sm:text-sm rounded-lg transition-all"
                      >
                        {t('inviteModal.invite')}
                      </button>
                    </div>
                  ))}
                </div>
              ) : searchTerm.length >= 2 ? (
                <div className="text-center text-gray-400 py-8">
                  {t('inviteModal.noResults')}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  {t('inviteModal.minCharacters')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
