"use client"

import { useState, useTransition, useEffect, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'

export default function HorairesPanel(){
  const t = useTranslations('schedule')
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
  const [loading, setLoading] = useState(true)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()

  // Chargement des données au montage
  useEffect(() => {
    const loadScheduleData = async () => {
      try {
        const res = await fetch('/api/clubs/services/get')
        const data = await res.json()
        if (data.success && data.services) {
          setIsOpen24_7(data.services.isOpen24_7 || false)
          if (data.services.openingHours) {
            const parsedSchedule = parseOpeningHours(data.services.openingHours)
            setSchedule(parsedSchedule)
          }
        }
      } catch (e) {
        console.log('❌ Erreur chargement horaires:', e)
      } finally {
        setLoading(false)
      }
    }
    loadScheduleData()
  }, [])

  const days = [
    { key: 'lundi', label: t('days.lundi') },
    { key: 'mardi', label: t('days.mardi') },
    { key: 'mercredi', label: t('days.mercredi') },
    { key: 'jeudi', label: t('days.jeudi') },
    { key: 'vendredi', label: t('days.vendredi') },
    { key: 'samedi', label: t('days.samedi') },
    { key: 'dimanche', label: t('days.dimanche') },
  ]

  // Fonction pour parser les horaires depuis la string openingHours
  const parseOpeningHours = (openingHours: string): Record<string, { open: string; close: string; closed: boolean }> => {
    try {
      return JSON.parse(openingHours)
    } catch {
      // Si parsing échoue, retourner le schedule par défaut
      return {
        lundi: { open: '18:00', close: '05:00', closed: false },
        mardi: { open: '18:00', close: '05:00', closed: false },
        mercredi: { open: '18:00', close: '05:00', closed: false },
        jeudi: { open: '18:00', close: '05:00', closed: false },
        vendredi: { open: '18:00', close: '05:00', closed: false },
        samedi: { open: '18:00', close: '05:00', closed: false },
        dimanche: { open: '18:00', close: '05:00', closed: false },
      }
    }
  }

  // Auto-save function
  const autoSave = useCallback(async () => {
    try {
      const openingHours = JSON.stringify(schedule)
      const payload = { isOpen24_7, openingHours }
      const res = await fetch('/api/clubs/services/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (!res.ok || !result?.ok) throw new Error(result?.error || 'auto_save_failed')
      console.log('✅ Horaires auto-sauvegardés')
    } catch (e) {
      console.log('❌ Auto-save horaires échoué:', e)
    }
  }, [schedule, isOpen24_7])

  // Auto-save avec debounce quand les données changent
  useEffect(() => {
    if (loading) return // Pas d'auto-save pendant le chargement
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave()
    }, 1500) // Debounce de 1.5 secondes
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [schedule, isOpen24_7, loading, autoSave])

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
        const openingHours = JSON.stringify(schedule)
        const body = { isOpen24_7, openingHours }
        const r = await fetch('/api/clubs/services/update', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) })
        const d = await r.json()
        if (!r.ok || !d?.ok) throw new Error(d?.error || 'save_failed')
        setMessage('Horaires enregistrés')
      } catch (e) {
        setError('Échec de la sauvegarde')
      }
    })
  }

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
        <h2 className="text-white font-semibold mb-6">Horaires d'ouverture</h2>
        <div className="text-center text-gray-400 py-8">Chargement des horaires...</div>
      </div>
    )
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
        <label htmlFor="open247" className="text-sm text-gray-300">{t('open247')}</label>
      </div>

      {!isOpen24_7 && (
        <div className="space-y-4">
          {days.map(({ key, label }) => (
            <div key={key} className="p-3 sm:p-4 bg-gray-800/40 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="w-full sm:w-20 text-sm text-gray-300 font-medium">{label}</div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={schedule[key].closed}
                    onChange={e => updateDaySchedule(key, 'closed', e.target.checked)}
                    className="rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs text-gray-400">{t('closed')}</span>
                </div>

                {!schedule[key].closed && (
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2 flex-1">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-xs text-gray-400">{t('from')}</span>
                      <input
                        type="time"
                        value={schedule[key].open}
                        onChange={e => updateDaySchedule(key, 'open', e.target.value)}
                        className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-purple-500 focus:border-purple-500 w-[100px]"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-xs text-gray-400">{t('to')}</span>
                      <input
                        type="time"
                        value={schedule[key].close}
                        onChange={e => updateDaySchedule(key, 'close', e.target.value)}
                        className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-purple-500 focus:border-purple-500 w-[100px]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToAllDays(key)}
                      className="text-xs px-2 py-1 bg-purple-600/20 text-purple-300 rounded hover:bg-purple-600/30 transition-colors whitespace-nowrap"
                    >
                      {t('copyToAll')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-[#FF6B9D] hover:bg-[#FF6B9D]/90 text-white disabled:opacity-60 transition-all"
        >
          {saving ? 'Sauvegarde…' : 'Enregistrer'}
        </button>
        {message && <div className="text-sm text-green-400">{message}</div>}
        {error && <div className="text-sm text-red-400">{error}</div>}
      </div>
    </div>
  )
}