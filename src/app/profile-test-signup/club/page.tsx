"use client"
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState, Suspense } from 'react'
import Stepper from '@/components/signup-v2/Stepper'
import Step1PreSignup from '@/components/signup-v2/Step1PreSignup'
import SalonPreSignupQuick from '@/components/signup-v2/SalonPreSignupQuick'
import Step2Plan from '@/components/signup-v2/Step2Plan'
// Pas de KYC pour Club selon consigne

function ClubSignupContent(){
  const sp = useSearchParams()
  const router = useRouter()
  const [userId, setUserId] = useState<string>('')
  const stepParam = Number(sp.get('step') || '1')
  const [step, setStep] = useState<number>(stepParam)
  const steps = useMemo(()=>[
    { id:1, label:'Inscription' },
    { id:2, label:'Offre' },
  ],[])

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-white text-2xl font-bold mb-2">Inscription salon</h1>
      <Stepper steps={steps} current={step} />
      {step === 1 && (
        <SalonPreSignupQuick onSubmitted={(ok, uid)=>{ if (ok) { setUserId(uid||''); setStep(2); router.push('/register/salon?step=2') } }} />
      )}
      {step === 2 && (
        <SalonPlansStep />
      )}
    </main>
  )
}

export default function ClubSignupPage(){
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto p-4 text-white">Loading...</div>}>
      <ClubSignupContent />
    </Suspense>
  )
}

function SalonPlansStep() {
  const router = useRouter()
  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState<{ code:string; type:'percent'|'amount'; value:number; applicablePlans?: string[] }|null>(null)
  const [promoMsg, setPromoMsg] = useState('')
  const [promoErr, setPromoErr] = useState('')
  const [loading, setLoading] = useState(false)

  const basePrices = { MONTH: 9900, QUARTER: 24900 } // en centimes CHF
  const effective = (planCode:'MONTH'|'QUARTER') => {
    const base = basePrices[planCode]
    if (!promo) return base
    if (promo.applicablePlans && !promo.applicablePlans.includes(planCode)) return base
    if (promo.type === 'percent') return Math.max(0, base - Math.round((base * promo.value) / 100))
    return Math.max(0, base - promo.value)
  }

  const onChoose = async (planCode: 'MONTH' | 'QUARTER') => {
    setLoading(true)
    try {
      const msg = encodeURIComponent('Félicitations, votre compte salon est créé')
      // Redirige vers le profil club (route existante)
      router.push(`/club/profile?message=${msg}`)
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* Best-seller 30 jours */}
        <div className="relative rounded-2xl border border-pink-500/40 bg-white/5 hover:bg-white/10 transition-colors p-5 h-full flex flex-col">
          <h3 className="text-white font-semibold text-lg">30 jours — <span className="text-pink-300">{Math.round(effective('MONTH')/100)}.-</span></h3>
          <p className="text-white/70 text-sm mb-3">L’option la plus choisie par les salons.</p>
          <ul className="text-white/80 text-sm space-y-1 mb-4">
            <li>✓ 15 profils filles inclus</li>
            <li>✓ Statistiques visiteurs</li>
            <li>✓ Boost visibilité (page régionale + recherche prioritaire)</li>
            <li>✓ Cadeaux virtuels débloqués</li>
          </ul>
          <button disabled={loading} onClick={()=>onChoose('MONTH')} className={`mt-auto w-full rounded-lg py-2 font-semibold ${loading ? 'bg-white/10 opacity-70 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-500'}`}>Je choisis cette offre</button>
        </div>

        {/* Premium 90 jours */}
        <div className="relative rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors p-5 h-full flex flex-col">
          <h3 className="text-white font-semibold text-lg">Premium 90 jours — <span className="text-pink-300">{Math.round(effective('QUARTER')/100)}.-</span></h3>
          <p className="text-white/70 text-sm mb-3">Idéal pour les agences qui veulent s’imposer.</p>
          <ul className="text-white/80 text-sm space-y-1 mb-4">
            <li>✓ Profils illimités</li>
            <li>✓ Mise en avant premium (homepage + stories vidéos illimitées)</li>
            <li>✓ Statistiques détaillées</li>
            <li>✓ Support prioritaire</li>
          </ul>
          <button disabled={loading} onClick={()=>onChoose('QUARTER')} className={`mt-auto w-full rounded-lg py-2 font-semibold ${loading ? 'bg-white/10 opacity-70 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-500'}`}>Je choisis cette offre</button>
        </div>
      </div>

      {/* Code promo */}
      <div className="glass-card rounded-2xl p-4 border border-white/10">
        <div className="flex gap-2 items-center">
          <input className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="Code promo (ex: WELCOME10, PROMO50)" value={promoInput} onChange={(e)=>{ setPromoInput(e.target.value.toUpperCase()); setPromoErr(''); setPromoMsg('') }} />
          <button className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm" onClick={async ()=>{
            setPromoErr(''); setPromoMsg('')
            const code = promoInput.trim().toUpperCase()
            if (!code) { setPromoErr('Entrez un code'); return }
            try {
              const r = await fetch('/api/signup-v2/promo/validate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code }) })
              const d = await r.json()
              if (!r.ok || !d?.success) { setPromo(null); setPromoErr(d?.error || 'Code invalide'); return }
              setPromo({ code: d.promo.code, type: d.promo.type, value: d.promo.value, applicablePlans: d.promo.applicablePlans || null })
              setPromoMsg(d?.message || 'Code appliqué')
            } catch { setPromoErr('Impossible de valider le code') }
          }}>Appliquer</button>
        </div>
        {promoErr && (<div className="text-red-400 text-xs mt-2">{promoErr}</div>)}
        {promo && !promoErr && (<div className="text-green-400 text-xs mt-2">{promoMsg || `Code ${promo.code} appliqué`}</div>)}
      </div>

      <p className="text-white/60 text-sm">Pas de KYC pour les salons. Vous pourrez compléter votre profil ensuite.</p>
    </div>
  )
}
