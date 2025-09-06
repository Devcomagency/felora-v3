"use client"
import { useState, useEffect } from 'react'
import { Shield, Zap } from 'lucide-react'
import { z } from 'zod'
import { escortPreSignupLite, clientSignupSchema, clubPreSignupSchema } from './validation'

type Mode = 'ESCORT'|'CLIENT'|'CLUB'

export default function Step1PreSignup({ mode = 'ESCORT', onSubmit }:{ mode?:Mode; onSubmit:(data:any)=>Promise<void>|void }){
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const [form, setForm] = useState<any>({ isAdult:false, acceptTos:false, emailVerified:false })
  const [captchaOK, setCaptchaOK] = useState(false)
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailCode, setEmailCode] = useState('')
  const [cooldownSec, setCooldownSec] = useState(0)
  const [devHint, setDevHint] = useState<string>('')
  const [info, setInfo] = useState<string>('')
  // (DOB retirée pour ESCORT à cette étape)
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({})

  const schema = mode === 'ESCORT' ? escortPreSignupLite : mode === 'CLIENT' ? clientSignupSchema : clubPreSignupSchema

  const update = (k:string, v:any) => setForm((f:any)=>({ ...f, [k]: v }))

  function normalizeSwissPhone(input?: string): string | null {
    if (!input) return null
    const trimmed = (input || '').trim()
    // Strip all non-digits
    let n = trimmed.replace(/\D+/g, '')
    // Handle leading 00 for international
    if (n.startsWith('0041')) n = '41' + n.slice(4)
    // +41XXXXXXXXX → becomes 41XXXXXXXXX already
    if (n.startsWith('41')) {
      const rest = n.slice(2)
      if (rest.length === 9) return '+41' + rest
    }
    // Local format 0XXXXXXXXX (10 digits)
    if (n.startsWith('0') && n.length === 10) {
      return '+41' + n.slice(1)
    }
    // Sometimes user enters 9 digits without prefix
    if (n.length === 9) {
      return '+41' + n
    }
    return null
  }

  const submit = async () => {
    setError(null)
    setFieldErrors({})
    const data: any = { ...form, hp: '' }
    const captchaRequired = process.env.NEXT_PUBLIC_CAPTCHA_DISABLED !== 'true'
    if (captchaRequired && !captchaOK) { setError('Vérification “Je ne suis pas un robot” requise'); return }
    // Normalize phone (CH) to E.164 (pas pour CLIENT)
    if (mode !== 'CLIENT') {
      const e164 = normalizeSwissPhone(form.phoneE164 || form.phone)
      if (e164) data.phoneE164 = e164
    }
    // birthDate et handle non requis à ce stade pour ESCORT
    const parsed = schema.safeParse(data)
    if (!parsed.success) {
      // Map errors to fields
      const errs: Record<string,string> = {}
      parsed.error.issues.forEach((i) => {
        const key = (i.path?.[0] as string) || 'form'
        const mapKey = key === 'phoneE164' ? 'phone' : key
        if (!errs[mapKey]) errs[mapKey] = i.message || 'Champ invalide'
      })
      setFieldErrors(errs)
      // Also show a compact top message
      setError('Corrigez les champs indiqués ci‑dessous')
      return
    }
    setLoading(true)
    try { await onSubmit(parsed.data) } finally { setLoading(false) }
  }

  // Cooldown countdown for send-code button
  useEffect(() => {
    if (cooldownSec <= 0) return
    const t = setTimeout(() => setCooldownSec((s) => Math.max(0, s - 1)), 1000)
    return () => clearTimeout(t)
  }, [cooldownSec])

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 bg-white/5">
      {info && (
        <div className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-400 text-sm">{info}</div>
      )}
      {/* Badges d'assurance */}
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80">
          <Shield size={14} className="text-teal-300" />
          <span>Données 100% confidentielles, pas visibles des visiteurs</span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80">
          <Zap size={14} className="text-purple-300" />
          <span>Inscription rapide</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm text-white/80">Email</span>
          <div className="flex gap-2">
            <input className={`flex-1 bg-black/40 rounded-lg px-3 py-2 text-white border ${fieldErrors.email ? 'border-red-500/60' : 'border-white/10'}`} type="email" onChange={e=>{ update('email', e.target.value); setEmailSent(false); update('emailVerified', false); setFieldErrors(prev=>({ ...prev, email: '' })) }} />
            {mode !== 'CLIENT' && (
              <button
                type="button"
                disabled={emailSending || !form.email || cooldownSec > 0}
                onClick={async ()=>{
                  setEmailSending(true)
                  setError(null)
                  setInfo('')
                  try {
                    const res = await fetch('/api/signup-v2/email/send-code', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: form.email }) })
                    const d = await res.json()
                    if (!res.ok || !d?.success) throw new Error(d?.error || 'send_failed')
                    setEmailSent(true)
                    if (d?.devCode) { setEmailCode(d.devCode); setDevHint(`Code dev: ${d.devCode}`) }
                    setInfo('Code envoyé. Consultez votre email et entrez le code ci-dessous.')
                    // Start 5s cooldown
                    setCooldownSec(5)
                  } catch (e:any){
                    const msg = e?.message === 'too_many_requests' ? 'Trop de demandes. Réessayez dans une minute.' : (e?.message || 'Envoi du code impossible')
                    setError(msg)
                  } finally { setEmailSending(false) }
                }}
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {emailSending
                  ? 'Envoi…'
                  : cooldownSec > 0
                    ? `Renvoyer dans ${cooldownSec}s`
                    : emailSent ? 'Renvoyer' : 'Envoyer code'}
              </button>
            )}
          </div>
          {mode === 'CLIENT' && (
            <label className="flex flex-col gap-1 mt-3">
              <span className="text-sm text-white/80">Pseudo (nom affiché)</span>
              <input
                className={`bg-black/40 rounded-lg px-3 py-2 text-white border ${fieldErrors.pseudo ? 'border-red-500/60' : 'border-white/10'}`}
                placeholder="ex: felora_user"
                onChange={e=>{ update('pseudo', e.target.value); setFieldErrors(prev=>({ ...prev, pseudo: '' })) }}
              />
              {fieldErrors.pseudo && (<span className="text-red-400 text-xs mt-1">{fieldErrors.pseudo}</span>)}
            </label>
          )}
          {mode === 'ESCORT' && (
            <>
              <div className="flex gap-2 mt-2 items-center">
                <input
                  className={`flex-1 bg-black/40 rounded-lg px-3 py-2 text-white border ${fieldErrors.emailVerified ? 'border-red-500/60' : 'border-white/10'}`}
                  placeholder="Code de vérification"
                  value={emailCode}
                  onChange={e=>setEmailCode(e.target.value)}
                />
                <button
                  type="button"
                  disabled={!emailCode || !form.email || form.emailVerified}
                  onClick={async ()=>{
                    setError(null)
                    try {
                      const res = await fetch('/api/signup-v2/email/verify-code', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: form.email, code: emailCode }) })
                      const d = await res.json()
                      if (!res.ok || !d?.success) throw new Error(d?.error || 'code_invalid')
                      update('emailVerified', true)
                    } catch (e:any){ setError(e?.message || 'Code invalide') }
                  }}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm disabled:opacity-60"
                >Vérifier</button>
                {form.emailVerified && (<span className="text-green-400 text-sm">Email vérifié ✓</span>)}
                {!form.emailVerified && devHint && (<span className="text-white/60 text-xs">{devHint}</span>)}
              </div>
              {fieldErrors.email && (<span className="text-red-400 text-xs mt-1">{fieldErrors.email}</span>)}
              {fieldErrors.emailVerified && (<span className="text-red-400 text-xs mt-1">{fieldErrors.emailVerified}</span>)}
            </>
          )}
        </div>
        {(mode !== 'CLIENT') && (
          <label className="flex flex-col gap-1">
            <span className="text-sm text-white/80">Téléphone (CH)</span>
            <input className={`bg-black/40 rounded-lg px-3 py-2 text-white border ${fieldErrors.phone ? 'border-red-500/60' : 'border-white/10'}`} placeholder="079 888 88 88 ou +41 79 888 88 88" onChange={e=>{ update('phone', e.target.value); setFieldErrors(prev=>({ ...prev, phone: '' })) }} />
            {fieldErrors.phone && (<span className="text-red-400 text-xs mt-1">{fieldErrors.phone}</span>)}
          </label>
        )}
        {mode === 'CLUB' && (
          <label className="flex flex-col gap-1 md:col-span-1">
            <span className="text-sm text-white/80">Handle</span>
            <input className={`bg-black/40 rounded-lg px-3 py-2 text-white border ${fieldErrors.handle ? 'border-red-500/60' : 'border-white/10'}`} placeholder="club_luxe_geneva" onChange={e=>{ update('handle', e.target.value); setFieldErrors(prev=>({ ...prev, handle: '' })) }} />
            {fieldErrors.handle && (<span className="text-red-400 text-xs mt-1">{fieldErrors.handle}</span>)}
          </label>
        )}
        {mode === 'CLUB' && (
          <>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm text-white/80">Nom de la société</span>
              <input className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="Ma Société SA" onChange={e=>update('companyName', e.target.value)} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-white/80">Numéro IDE</span>
              <input className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="CHE-123.456.789" onChange={e=>update('ideNumber', e.target.value)} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-white/80">Responsable</span>
              <input className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="Nom du responsable" onChange={e=>update('managerName', e.target.value)} />
            </label>
          </>
        )}
        {/* Date de naissance retirée pour ESCORT à cette étape */}

        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm text-white/80">Mot de passe</span>
          <input className={`bg-black/40 rounded-lg px-3 py-2 text-white border ${fieldErrors.password ? 'border-red-500/60' : 'border-white/10'}`} type="password" onChange={e=>{ update('password', e.target.value); setFieldErrors(prev=>({ ...prev, password: '' })) }} />
          {fieldErrors.password && (<span className="text-red-400 text-xs mt-1">{fieldErrors.password}</span>)}
        </label>
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm text-white/80">Confirmation</span>
          <input className={`bg-black/40 rounded-lg px-3 py-2 text-white border ${fieldErrors.confirm ? 'border-red-500/60' : 'border-white/10'}`} type="password" onChange={e=>{ update('confirm', e.target.value); setFieldErrors(prev=>({ ...prev, confirm: '' })) }} />
          {fieldErrors.confirm && (<span className="text-red-400 text-xs mt-1">{fieldErrors.confirm}</span>)}
        </label>

        <label className="flex items-center gap-2 md:col-span-2">
          <input type="checkbox" onChange={e=>{ update('isAdult', e.target.checked); setFieldErrors(prev=>({ ...prev, isAdult: '' })) }} />
          <span className="text-white/80 text-sm">J’ai 18 ans ou plus</span>
          {fieldErrors.isAdult && (<span className="text-red-400 text-xs">{fieldErrors.isAdult}</span>)}
        </label>
        <label className="flex items-center gap-2 md:col-span-2 mt-2">
          <input type="checkbox" onChange={e=>{ update('acceptTos', e.target.checked); setFieldErrors(prev=>({ ...prev, acceptTos: '' })) }} />
          <span className="text-white/80 text-sm">J’accepte les CGU et la Politique de confidentialité</span>
          {fieldErrors.acceptTos && (<span className="text-red-400 text-xs">{fieldErrors.acceptTos}</span>)}
        </label>
      </div>

      {error && <div className="mt-4 text-sm text-red-400">{error}</div>}

      <div className="mt-6 flex justify-end">
        {process.env.NEXT_PUBLIC_CAPTCHA_DISABLED !== 'true' && (
          <label className="mr-auto inline-flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" checked={captchaOK} onChange={e=>setCaptchaOK(e.target.checked)} /> Je ne suis pas un robot
          </label>
        )}
        <button disabled={loading} onClick={submit} className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium disabled:opacity-60">
          {loading ? 'Envoi…' : (mode === 'ESCORT' ? 'Créer mon compte' : 'Continuer')}
        </button>
      </div>
    </div>
  )
}
