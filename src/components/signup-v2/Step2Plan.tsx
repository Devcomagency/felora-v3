"use client"
import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

type Plan = { id:string; code:string; name:string; priceCents:number; interval:string; popular:boolean }

export default function Step2Plan({ onSelect }:{ onSelect:(plan:Plan)=>void }){
  const t = useTranslations('signup.plans')
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState<{ code:string; type:'percent'|'amount'; value:number; applicablePlans?: string[] }|null>(null)
  const [promoMsg, setPromoMsg] = useState<string>('')
  const [promoErr, setPromoErr] = useState<string>('')

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/signup-v2/plans', { cache:'no-store' })
        const d = await r.json()
        setPlans(d?.items ?? [])
      } finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <div className="text-white/70">{t('loading')}</div>

  const effectivePrice = (p: Plan) => {
    if (!promo) return p.priceCents
    if (promo.applicablePlans && !promo.applicablePlans.includes(p.code)) return p.priceCents
    if (promo.type === 'percent') {
      const cut = Math.round((p.priceCents * promo.value) / 100)
      return Math.max(0, p.priceCents - cut)
    }
    return Math.max(0, p.priceCents - promo.value)
  }

  const labelByCode: Record<string, string> = {
    WEEK: t('week.label'),
    MONTH: t('month.label'),
    QUARTER: t('quarter.label'),
  }
  const descByCode: Record<string, string> = {
    WEEK: t('week.description'),
    MONTH: t('month.description'),
    QUARTER: t('quarter.description'),
  }
  const featuresByCode: Record<string, string[]> = {
    WEEK: [
      t('features.unlimitedPhotos'),
      t('features.unlimitedPlayback'),
      t('features.e2eeMessaging'),
      t('features.giftSystem'),
      t('features.basicPromotion'),
      t('features.standardSupport'),
    ],
    MONTH: [
      t('features.unlimitedPhotos'),
      t('features.unlimitedPlayback'),
      t('features.e2eeMessaging'),
      t('features.giftSystem'),
      t('features.enhancedPromotion'),
      t('features.advancedStats'),
      t('features.standardSupport'),
    ],
    QUARTER: [
      t('features.unlimitedPhotos'),
      t('features.unlimitedPlayback'),
      t('features.e2eeMessaging'),
      t('features.giftSystem'),
      t('features.premiumPromotion'),
      t('features.advancedStats'),
      t('features.prioritySupport'),
    ],
  }

  return (
    <div className="space-y-4">
      {/* Plans — affichage côte à côte (responsive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(p => {
          const price = effectivePrice(p)
          const discounted = price !== p.priceCents
          const displayPrice = `${Math.round(price/100)}.-`
          return (
            <button key={p.id} onClick={()=>onSelect(p)} className={`relative block w-full h-full glass-card rounded-2xl p-5 border ${p.popular ? 'border-pink-400/40' : 'border-white/10'} hover:border-pink-400/60 transition-colors text-left`}>
              {/* Badge Best-seller (30 jours) */}
              {(p.code === 'MONTH' || p.popular) && (
                <span className="absolute top-2 right-2 px-2 py-1 text-[10px] font-semibold rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow">
                  {t('badges.bestseller')}
                </span>
              )}
              {/* Badge Premium (90 jours) */}
              {p.code === 'QUARTER' && (
                <span className="absolute top-2 right-2 px-2 py-1 text-[10px] font-semibold rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow">
                  {t('badges.premium')}
                </span>
              )}
              <div className="flex flex-col gap-1">
                <div className="text-white font-semibold text-base">{labelByCode[p.code] || p.name}</div>
                <div className="text-white/60 text-xs">{p.name}</div>
                <div className="text-white/70 text-xs mt-1">
                  {descByCode[p.code] || ''}
                </div>
                <div className="mt-2">
                  {discounted && (
                    <div className="text-white/50 text-xs line-through">{`${Math.round(p.priceCents/100)}.-`}</div>
                  )}
                  <div className="text-pink-300 text-xl font-bold">{displayPrice}</div>
                </div>
                {/* Avantages */}
                <ul className="mt-3 space-y-1 text-xs text-white/70">
                  {(featuresByCode[p.code] || []).map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-pink-300">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {/* CTA clair dans la carte */}
                <div className="mt-4 flex justify-center">
                  <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow">
                    {t('cta.choosePlan')}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Légende CTA globale */}
      <p className="text-white/70 text-sm">
        {t('cta.description')}
      </p>

      {/* Code promo (placé dessous) */}
      <div className="glass-card rounded-2xl p-4 border border-white/10">
        <div className="flex gap-2 items-center">
          <input
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
            placeholder={t('promo.placeholder')}
            value={promoInput}
            onChange={(e)=>{ setPromoInput(e.target.value.toUpperCase()); setPromoErr(''); setPromoMsg('') }}
          />
          <button
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm"
            onClick={async ()=>{
              setPromoErr(''); setPromoMsg('')
              const code = promoInput.trim().toUpperCase()
              if (!code) { setPromoErr(t('promo.errors.enterCode')); return }
              try {
                const r = await fetch('/api/signup-v2/promo/validate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code }) })
                const d = await r.json()
                if (!r.ok || !d?.success) { setPromo(null); setPromoErr(d?.error || t('promo.errors.invalidCode')); return }
                setPromo({ code: d.promo.code, type: d.promo.type, value: d.promo.value, applicablePlans: d.promo.applicablePlans || null })
                setPromoMsg(d?.message || t('promo.success.applied'))
              } catch { setPromoErr(t('promo.errors.validationFailed')) }
            }}
          >{t('promo.apply')}</button>
        </div>
        {promoErr && (<div className="text-red-400 text-xs mt-2">{promoErr}</div>)}
        {promo && !promoErr && (<div className="text-green-400 text-xs mt-2">{promoMsg || t('promo.success.codeApplied', {code: promo.code})}</div>)}
      </div>
    </div>
  )
}
