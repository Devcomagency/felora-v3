"use client"

import { useEffect, useState, useTransition } from 'react'
import DashboardLayout from '../../../../components/dashboard-v2/DashboardLayout'

type ServicesForm = {
  languages: string[]
  paymentMethods: string[]
  services: string[]
  isOpen24_7: boolean
  openingHours: string
}

const DEFAULT_LANGS = ['Français','Anglais','Allemand','Italien','Espagnol']
const DEFAULT_PAYMENTS = ['Cash','Carte','TWINT','Virement']
const DEFAULT_SERVICES = ['Bar','Champagne','Privé','Sécurité','Parking','Salle VIP']

export default function ClubServicesPage(){
  const [form, setForm] = useState<ServicesForm>({
    languages: [],
    paymentMethods: [],
    services: [],
    isOpen24_7: false,
    openingHours: ''
  })
  const [saving, startSaving] = useTransition()
  const [message, setMessage] = useState<string| null>(null)

  useEffect(() => {
    // TODO: Charger depuis l'API quand le schéma sera prêt
  }, [])

  const toggle = (key: keyof ServicesForm, value: string) => {
    setForm(prev => {
      const arr = new Set((prev[key] as string[]) || [])
      if (arr.has(value)) arr.delete(value); else arr.add(value)
      return { ...prev, [key]: Array.from(arr) as string[] }
    })
  }

  const onSave = () => {
    setMessage(null)
    startSaving(async () => {
      // TODO: POST /api/clubs/services/update
      await new Promise(r => setTimeout(r, 400))
      setMessage('Enregistré (stockage à venir)')
    })
  }

  return (
    <DashboardLayout title="Services" subtitle="Langues, paiements, prestations et horaires">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Langues & Moyens de paiement */}
        <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
          <h2 className="text-white font-semibold mb-4">Langues parlées</h2>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_LANGS.map(l => (
              <button key={l} onClick={() => toggle('languages', l)} className={`px-3 py-1.5 rounded-lg text-sm border ${form.languages.includes(l) ? 'bg-purple-500/20 border-purple-500/40 text-purple-200' : 'bg-white/5 border-white/10 text-white'}`}>{l}</button>
            ))}
          </div>
          <h2 className="text-white font-semibold mt-6 mb-4">Moyens de paiement</h2>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_PAYMENTS.map(p => (
              <button key={p} onClick={() => toggle('paymentMethods', p)} className={`px-3 py-1.5 rounded-lg text-sm border ${form.paymentMethods.includes(p) ? 'bg-purple-500/20 border-purple-500/40 text-purple-200' : 'bg-white/5 border-white/10 text-white'}`}>{p}</button>
            ))}
          </div>
        </div>

        {/* Services & horaires */}
        <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
          <h2 className="text-white font-semibold mb-4">Services</h2>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_SERVICES.map(s => (
              <button key={s} onClick={() => toggle('services', s)} className={`px-3 py-1.5 rounded-lg text-sm border ${form.services.includes(s) ? 'bg-purple-500/20 border-purple-500/40 text-purple-200' : 'bg-white/5 border-white/10 text-white'}`}>{s}</button>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2">
            <input id="open247" type="checkbox" checked={form.isOpen24_7} onChange={e => setForm(prev => ({ ...prev, isOpen24_7: e.target.checked }))} />
            <label htmlFor="open247" className="text-sm text-gray-300">Ouvert 24/24</label>
          </div>
          <div className="mt-3">
            <label className="block text-sm text-gray-300 mb-1">Horaires détaillés</label>
            <input
              value={form.openingHours}
              onChange={e => setForm(prev => ({ ...prev, openingHours: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="Lun-Dim 18:00–05:00"
            />
          </div>
        </div>

        <div className="lg:col-span-2 flex items-center gap-3">
          <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-60">
            {saving ? 'Sauvegarde…' : 'Enregistrer'}
          </button>
          {message && <div className="text-sm text-green-400">{message}</div>}
        </div>
      </div>
    </DashboardLayout>
  )
}

