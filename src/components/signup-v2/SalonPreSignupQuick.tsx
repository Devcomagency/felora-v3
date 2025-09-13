"use client"
import { useEffect, useState } from 'react'

export default function SalonPreSignupQuick({ onSubmitted }:{ onSubmitted:(ok:boolean,userId?:string)=>void }){
  const [companyName, setCompanyName] = useState('')
  const [city, setCity] = useState('')
  const [cities, setCities] = useState<Array<string|{name:string}>>([])
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isAdult, setIsAdult] = useState(false)
  const [acceptTos, setAcceptTos] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const [captchaOK, setCaptchaOK] = useState(false)

  // Charger les villes suisses prédéfinies pour normaliser la saisie
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/geo/geocode', { cache: 'force-cache' })
        const d = await r.json()
        if (Array.isArray(d?.cities)) setCities(d.cities)
      } catch {}
    })()
  }, [])

  function normalizeSwissPhone(input?: string): string | null {
    if (!input) return null
    let n = String(input).replace(/\D+/g, '')
    if (n.startsWith('0041')) n = '41' + n.slice(4)
    if (n.startsWith('41') && n.length === 11) return '+' + n
    if (n.startsWith('41') && n.length === 9) return '+41' + n.slice(2)
    if (n.startsWith('0') && n.length === 10) return '+41' + n.slice(1)
    if (n.length === 9) return '+41' + n
    return null
  }

  const submit = async () => {
    setError(null)
    if (!companyName.trim()) { setError('Nom du salon requis'); return }
    if (!email || !email.includes('@')) { setError('Email obligatoire et valide'); return }
    const e164 = normalizeSwissPhone(phone)
    if (!e164) { setError('Téléphone CH invalide'); return }
    if (!password || password.length < 6) { setError('Mot de passe trop court'); return }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    if (!isAdult || !acceptTos) { setError('Veuillez confirmer 18+ et CGU'); return }
    const captchaRequired = process.env.NEXT_PUBLIC_CAPTCHA_DISABLED !== 'true'
    if (captchaRequired && !captchaOK) { setError('Vérification “Je ne suis pas un robot” requise'); return }

    // Vérifier que la ville correspond à la liste (si disponible)
    const hasCanonicalCities = Array.isArray(cities) && cities.length > 0
    if (hasCanonicalCities) {
      const cityNames = cities.map((c:any) => typeof c === 'string' ? c : (c?.name || '')).filter(Boolean)
      const match = cityNames.find((n:string) => n.toLowerCase() === String(city).trim().toLowerCase())
      if (!match) { setError('Veuillez sélectionner une ville de la liste'); return }
    }
    setLoading(true)
    try {
      // Générer handle à partir du nom
      const handleBase = companyName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0,24) || 'salon'
      const payload = {
        email,
        phoneE164: e164,
        password,
        confirm,
        isAdult,
        acceptTos,
        hp: '',
        handle: handleBase,
        companyName,
        ideNumber: 'PENDING',
        managerName: companyName
      }
      const r = await fetch('/api/signup-v2/club', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      const d = await r.json()
      if (!r.ok || !d?.ok) throw new Error(d?.error || 'Inscription échouée')
      onSubmitted(true, d.userId)
    } catch (e:any) {
      setError(e?.message || 'Erreur serveur')
      onSubmitted(false)
    } finally { setLoading(false) }
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 bg-white/5">
      <h2 className="text-white text-lg font-semibold mb-4">Inscription</h2>

      <div className="space-y-3">
        <label className="block">
          <span className="text-sm text-white/80">Nom du salon / agence</span>
          <input className="mt-1 w-full bg-black/40 rounded-lg px-3 py-2 text-white border border-white/10" value={companyName} onChange={e=>setCompanyName(e.target.value)} placeholder="ex: Salon Luxe Genève" />
        </label>
        <label className="block">
          <span className="text-sm text-white/80">Ville</span>
          <input list="city-list" className="mt-1 w-full bg-black/40 rounded-lg px-3 py-2 text-white border border-white/10" value={city} onChange={e=>setCity(e.target.value)} placeholder="ex: Genève" />
          <datalist id="city-list">
            {cities.map((c:any) => {
              const name = typeof c === 'string' ? c : (c?.name || '')
              return name ? <option key={name} value={name} /> : null
            })}
          </datalist>
        </label>
        <label className="block">
          <span className="text-sm text-white/80">Téléphone CH (obligatoire)</span>
          <input className="mt-1 w-full bg-black/40 rounded-lg px-3 py-2 text-white border border-white/10" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="079 888 88 88 ou +41 79 888 88 88" />
        </label>
        <label className="block">
          <span className="text-sm text-white/80">Email (obligatoire)</span>
          <input className="mt-1 w-full bg-black/40 rounded-lg px-3 py-2 text-white border border-white/10" value={email} onChange={e=>setEmail(e.target.value)} placeholder="contact@votre-salon.ch" />
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm text-white/80">Mot de passe</span>
            <input type="password" className="mt-1 w-full bg-black/40 rounded-lg px-3 py-2 text-white border border-white/10" value={password} onChange={e=>setPassword(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm text-white/80">Confirmation</span>
            <input type="password" className="mt-1 w-full bg-black/40 rounded-lg px-3 py-2 text-white border border-white/10" value={confirm} onChange={e=>setConfirm(e.target.value)} />
          </label>
        </div>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={isAdult} onChange={e=>setIsAdult(e.target.checked)} />
          <span className="text-white/80 text-sm">J’ai 18 ans ou plus</span>
        </label>
        <label className="inline-flex items-center gap-2 mt-2">
          <input type="checkbox" checked={acceptTos} onChange={e=>setAcceptTos(e.target.checked)} />
          <span className="text-white/80 text-sm">J’accepte les CGU et la Politique de confidentialité</span>
        </label>
      </div>

      {error && (<div className="mt-3 text-sm text-red-400">{error}</div>)}

      <div className="mt-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          {process.env.NEXT_PUBLIC_CAPTCHA_DISABLED !== 'true' && (
            <label className="inline-flex items-center gap-2 text-sm text-white/80">
              <input type="checkbox" checked={captchaOK} onChange={e=>setCaptchaOK(e.target.checked)} /> Je ne suis pas un robot
            </label>
          )}
        </div>
        <button disabled={loading} onClick={submit} className={`w-full px-4 py-3 rounded-lg ${loading ? 'bg-white/10 opacity-70 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-500'} text-white font-semibold`}>
          {loading ? 'Création…' : 'Créer mon compte salon'}
        </button>
        <p className="text-center text-white/60 text-sm mt-2">Gagnez en visibilité dès aujourd’hui.</p>
      </div>
    </div>
  )
}
