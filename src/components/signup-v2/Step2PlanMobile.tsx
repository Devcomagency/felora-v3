"use client"
import { useEffect, useMemo, useState } from 'react'
import { Check, Star, Zap, Crown, Gift, Shield } from 'lucide-react'

type Plan = { id:string; code:string; name:string; priceCents:number; interval:string; popular:boolean }

export default function Step2PlanMobile({ onSelect }:{ onSelect:(plan:Plan)=>void }){
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState<{ code:string; type:'percent'|'amount'; value:number; applicablePlans?: string[] }|null>(null)
  const [promoMsg, setPromoMsg] = useState<string>('')
  const [promoErr, setPromoErr] = useState<string>('')
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/signup-v2/plans', { cache:'no-store' })
        const d = await r.json()
        setPlans(d?.items ?? [])
      } finally { setLoading(false) }
    })()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-white/70">Chargement des offres…</p>
        </div>
      </div>
    )
  }

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
    WEEK: '7 jours',
    MONTH: '30 jours',
    QUARTER: '90 jours',
  }

  const descByCode: Record<string, string> = {
    WEEK: "Idéal pour démarrer et tester la plateforme en 7 jours.",
    MONTH: "Le meilleur équilibre visibilité/prix pour progresser rapidement.",
    QUARTER: "Parfait pour une présence continue et des résultats durables.",
  }

  const featuresByCode: Record<string, string[]> = {
    WEEK: [
      'Photos illimitées',
      'Lecture / Play‑Pause illimitée',
      'Messagerie chiffrée de bout en bout (E2EE)',
      'Géolocalisation et recherche avancée',
      'Support client prioritaire',
      'Statistiques de base'
    ],
    MONTH: [
      'Tout du plan 7 jours',
      'Vidéos illimitées',
      'Badge "Vérifié" visible',
      'Statistiques avancées',
      'Notifications push',
      'Cadeaux virtuels'
    ],
    QUARTER: [
      'Tout du plan 30 jours',
      'Badge "Premium" doré',
      'Mise en avant dans les résultats',
      'Analytics détaillés',
      'Support client dédié',
      'Fonctionnalités exclusives'
    ]
  }

  const getPlanIcon = (code: string) => {
    switch (code) {
      case 'WEEK': return Zap
      case 'MONTH': return Star
      case 'QUARTER': return Crown
      default: return Gift
    }
  }

  const getPlanColor = (code: string) => {
    switch (code) {
      case 'WEEK': return 'from-blue-500 to-cyan-500'
      case 'MONTH': return 'from-purple-500 to-pink-500'
      case 'QUARTER': return 'from-yellow-500 to-orange-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const formatPrice = (cents: number) => {
    return `CHF ${(cents / 100).toFixed(2)}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Crown className="text-white" size={32} />
          </div>
        </div>
        <div>
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-2">Choisissez votre offre</h2>
          <p className="text-white/70 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Sélectionnez le plan qui correspond le mieux à vos besoins
          </p>
        </div>
      </div>

      {/* Promo code */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Gift className="text-purple-400" size={20} />
          Code promotionnel
        </h3>
        
        <div className="flex gap-3">
          <input
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 text-base"
            placeholder="Entrez votre code promo"
            value={promoInput}
            onChange={e => setPromoInput(e.target.value)}
          />
          <button
            onClick={async () => {
              if (!promoInput.trim()) return
              setPromoErr('')
              setPromoMsg('')
              try {
                const r = await fetch('/api/signup-v2/promo/validate', { 
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify({ code: promoInput.trim() }) 
                })
                const d = await r.json()
                if (!r.ok || !d?.success) { 
                  setPromo(null)
                  setPromoErr(d?.error || 'Code invalide')
                  return 
                }
                setPromo({ 
                  code: d.promo.code, 
                  type: d.promo.type, 
                  value: d.promo.value, 
                  applicablePlans: d.promo.applicablePlans || null 
                })
                setPromoMsg(`Code appliqué ! Réduction de ${d.promo.type === 'percent' ? d.promo.value + '%' : formatPrice(d.promo.value)}`)
              } catch (e) {
                setPromoErr('Erreur de validation')
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Appliquer
          </button>
        </div>
        
        {promoMsg && <p className="text-green-400 text-sm mt-2">{promoMsg}</p>}
        {promoErr && <p className="text-red-400 text-sm mt-2">{promoErr}</p>}
      </div>

      {/* Plans */}
      <div className="space-y-4">
        {plans.map((plan) => {
          const Icon = getPlanIcon(plan.code)
          const isSelected = selectedPlan?.id === plan.id
          const effectivePriceValue = effectivePrice(plan)
          const hasDiscount = effectivePriceValue < plan.priceCents
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${
                isSelected 
                  ? 'border-purple-500/50 bg-purple-500/10' 
                  : 'border-white/10 hover:border-white/20'
              }`}
              onClick={() => setSelectedPlan(plan)}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                    <Star size={12} />
                    Populaire
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${getPlanColor(plan.code)} rounded-xl flex items-center justify-center`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold">{plan.name}</h3>
                    <p className="text-white/60 text-sm">{labelByCode[plan.code]}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white text-2xl font-bold">
                    {formatPrice(effectivePriceValue)}
                  </div>
                  {hasDiscount && (
                    <div className="text-white/60 text-sm line-through">
                      {formatPrice(plan.priceCents)}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-white/70 text-sm mb-4">{descByCode[plan.code]}</p>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {featuresByCode[plan.code]?.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="text-green-400" size={16} />
                    <span className="text-white/80 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="flex items-center justify-center gap-2 p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl">
                  <Check className="text-purple-400" size={16} />
                  <span className="text-purple-400 text-sm font-medium">Sélectionné</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* CTA */}
      {selectedPlan && (
        <div className="sticky bottom-0 bg-black/80 backdrop-blur-sm border-t border-white/10 p-4 -mx-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm">Plan sélectionné</p>
                <p className="text-white font-semibold">{selectedPlan.name}</p>
              </div>
              <div className="text-right">
                <p className="text-white text-lg font-bold">{formatPrice(effectivePrice(selectedPlan))}</p>
                {effectivePrice(selectedPlan) < selectedPlan.priceCents && (
                  <p className="text-green-400 text-sm">Économie incluse</p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => onSelect(selectedPlan)}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
            >
              <Shield size={20} />
              Valider ma vérification
            </button>
          </div>
        </div>
      )}

      {/* No selection message */}
      {!selectedPlan && (
        <div className="text-center py-8">
          <p className="text-white/60 text-sm">Sélectionnez un plan pour continuer</p>
        </div>
      )}
    </div>
  )
}
