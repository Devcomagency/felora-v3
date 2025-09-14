"use client"
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState, Suspense } from 'react'
import { Crown, Building2, CheckCircle, Gift, AlertCircle } from 'lucide-react'
import Stepper from '@/components/signup-v2/Stepper'
import SalonPreSignupQuick from '@/components/signup-v2/SalonPreSignupQuick'

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
    <main className="min-h-screen bg-black">
      {/* Header mobile-first */}
      <div className="sticky top-0 z-10 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-xl sm:text-2xl font-bold">Inscription Salon</h1>
              <p className="text-white/60 text-sm">Rejoignez la communauté Felora</p>
            </div>
            <div className="text-right ml-16">
              <div className="text-white/80 text-sm">Étape {step}/2</div>
              <div className="w-16 h-1 bg-white/20 rounded-full mt-1">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 2) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Stepper steps={steps} current={step} />
        
        {step === 1 && (
          <SalonPreSignupQuick onSubmitted={(ok, uid)=>{ 
            if (ok) { 
              setUserId(uid||''); 
              setStep(2); 
              router.push('/register/salon?step=2') 
            } 
          }} />
        )}
        
        {step === 2 && (
          <SalonPlansStepMobile />
        )}
      </div>
    </main>
  )
}

export default function ClubSignupPage(){
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    }>
      <ClubSignupContent />
    </Suspense>
  )
}

function SalonPlansStepMobile() {
  const router = useRouter()
  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState<{ code:string; type:'percent'|'amount'; value:number; applicablePlans?: string[] }|null>(null)
  const [promoMsg, setPromoMsg] = useState('')
  const [promoErr, setPromoErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'MONTH' | 'QUARTER' | null>(null)

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

  const plans = [
    {
      code: 'MONTH' as const,
      name: '30 jours',
      price: effective('MONTH'),
      originalPrice: basePrices.MONTH,
      description: 'L\'option la plus choisie par les salons',
      features: [
        '15 profils filles inclus',
        'Statistiques visiteurs',
        'Boost visibilité (page régionale + recherche prioritaire)',
        'Cadeaux virtuels débloqués'
      ],
      popular: true,
      icon: Building2
    },
    {
      code: 'QUARTER' as const,
      name: 'Premium 90 jours',
      price: effective('QUARTER'),
      originalPrice: basePrices.QUARTER,
      description: 'Idéal pour les agences qui veulent s\'imposer',
      features: [
        'Profils illimités',
        'Mise en avant premium (homepage + stories vidéos illimitées)',
        'Statistiques détaillées',
        'Support prioritaire'
      ],
      popular: false,
      icon: Crown
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header mobile-first */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Crown className="text-white" size={32} />
          </div>
        </div>
        <div>
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-2">Choisissez votre offre salon</h2>
          <p className="text-white/70 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Sélectionnez le plan qui correspond le mieux à votre établissement
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
            onChange={e => {
              setPromoInput(e.target.value.toUpperCase())
              setPromoErr('')
              setPromoMsg('')
            }}
          />
          <button
            onClick={async () => {
              setPromoErr('')
              setPromoMsg('')
              const code = promoInput.trim().toUpperCase()
              if (!code) { 
                setPromoErr('Entrez un code')
                return 
              }
              try {
                const r = await fetch('/api/signup-v2/promo/validate', { 
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify({ code }) 
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
                setPromoMsg(d?.message || 'Code appliqué')
              } catch { 
                setPromoErr('Impossible de valider le code') 
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
          const Icon = plan.icon
          const isSelected = selectedPlan === plan.code
          const hasDiscount = plan.price < plan.originalPrice
          
          return (
            <div
              key={plan.code}
              className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${
                isSelected 
                  ? 'border-purple-500/50 bg-purple-500/10' 
                  : 'border-white/10 hover:border-white/20'
              }`}
              onClick={() => setSelectedPlan(plan.code)}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                    <Crown size={12} />
                    Populaire
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${
                    plan.popular ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-cyan-500'
                  } rounded-xl flex items-center justify-center`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold">{plan.name}</h3>
                    <p className="text-white/60 text-sm">{plan.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white text-2xl font-bold">
                    CHF {Math.round(plan.price / 100)}.-
                  </div>
                  {hasDiscount && (
                    <div className="text-white/60 text-sm line-through">
                      CHF {Math.round(plan.originalPrice / 100)}.-
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="text-green-400" size={16} />
                    <span className="text-white/80 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="flex items-center justify-center gap-2 p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl">
                  <CheckCircle className="text-purple-400" size={16} />
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
                <p className="text-white font-semibold">{plans.find(p => p.code === selectedPlan)?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-white text-lg font-bold">
                  CHF {Math.round(effective(selectedPlan) / 100)}.-
                </p>
                {effective(selectedPlan) < basePrices[selectedPlan] && (
                  <p className="text-green-400 text-sm">Économie incluse</p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => onChoose(selectedPlan)}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Crown size={20} />
                  Créer mon salon
                </>
              )}
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

      {/* Info message */}
      <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-400 mt-0.5" size={16} />
          <div>
            <p className="text-blue-400 text-sm font-medium">Pas de KYC requis</p>
            <p className="text-blue-300 text-xs mt-1">
              Vous pourrez compléter votre profil salon après la création de votre compte.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}