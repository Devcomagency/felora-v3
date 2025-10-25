"use client"
import { useEffect, useMemo, useState, useRef } from 'react'
import { Check, Star, Zap, Crown, Gift, Shield, ArrowRight, Sparkles, Tag } from 'lucide-react'
import { motion } from 'framer-motion'

type Plan = { id:string; code:string; name:string; priceCents:number; interval:string; popular:boolean }

export default function Step2PlanMobile({ onSelect }:{ onSelect:(plan:Plan)=>void }){
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // États pour le code promo
  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState<{ code:string; type:'percent'|'amount'; value:number; applicablePlans?: string[] }|null>(null)
  const [promoMsg, setPromoMsg] = useState<string>('')
  const [promoErr, setPromoErr] = useState<string>('')

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/signup-v2/plans', { cache:'no-store' })
        const d = await r.json()
        const loadedPlans = d?.items ?? []
        setPlans(loadedPlans)

        // Auto-scroll vers l'offre populaire (milieu) après chargement
        setTimeout(() => {
          if (scrollContainerRef.current && loadedPlans.length > 0) {
            const popularIndex = loadedPlans.findIndex((p: Plan) => p.popular || p.code === 'MONTH')
            if (popularIndex !== -1) {
              const cardWidth = 288 // w-72 = 288px
              const gap = 16 // gap-4 = 16px
              const scrollLeft = popularIndex * (cardWidth + gap) - (scrollContainerRef.current.offsetWidth / 2 - cardWidth / 2)
              scrollContainerRef.current.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' })
            }
          }
        }, 300)
      } finally { setLoading(false) }
    })()
  }, [])

  const effectivePrice = (p: Plan) => {
    if (!promo) return p.priceCents
    if (promo.applicablePlans && !promo.applicablePlans.includes(p.code)) return p.priceCents
    if (promo.type === 'percent') {
      const cut = Math.round((p.priceCents * promo.value) / 100)
      return Math.max(0, p.priceCents - cut)
    }
    return Math.max(0, p.priceCents - promo.value)
  }

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

  const labelByCode: Record<string, string> = {
    WEEK: 'Découverte',
    MONTH: 'Premium',
    QUARTER: 'Elite',
  }

  const descByCode: Record<string, string> = {
    WEEK: "Pour démarrer sur Felora",
    MONTH: "Le plus populaire",
    QUARTER: "Pour les professionnels",
  }

  const featuresByCode: Record<string, string[]> = {
    WEEK: ['Profil vérifié', 'Photos illimitées', 'Messagerie sécurisée'],
    MONTH: ['Badge vérifié', 'Vidéos illimitées', 'Statistiques'],
    QUARTER: ['Badge Premium', 'Mise en avant', 'Support VIP']
  }

  const getPlanIcon = (code: string) => {
    switch (code) {
      case 'WEEK': return Zap
      case 'MONTH': return Star
      case 'QUARTER': return Crown
      default: return Gift
    }
  }

  const getPlanGradient = (code: string) => {
    switch (code) {
      case 'WEEK': return 'from-cyan-500 to-blue-500'
      case 'MONTH': return 'from-pink-500 via-purple-500 to-violet-600'
      case 'QUARTER': return 'from-violet-500 to-purple-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getPlanBgGradient = (code: string) => {
    switch (code) {
      case 'WEEK': return 'from-cyan-500/10 via-blue-500/5 to-transparent'
      case 'MONTH': return 'from-pink-500/10 via-purple-500/5 to-transparent'
      case 'QUARTER': return 'from-violet-500/10 via-purple-500/5 to-transparent'
      default: return 'from-gray-500/10 to-transparent'
    }
  }

  const getPlanAccent = (code: string) => {
    switch (code) {
      case 'WEEK': return '#06B6D4'
      case 'MONTH': return '#EC4899'
      case 'QUARTER': return '#8B5CF6'
      default: return '#6B7280'
    }
  }

  const formatPrice = (cents: number) => {
    return `${(cents / 100).toFixed(0)} CHF`
  }

  const getDuration = (code: string) => {
    switch (code) {
      case 'WEEK': return '7 jours'
      case 'MONTH': return '30 jours'
      case 'QUARTER': return '90 jours'
      default: return ''
    }
  }

  const renderPlanCard = (plan: Plan, idx: number) => {
    const Icon = getPlanIcon(plan.code)
    const gradient = getPlanGradient(plan.code)
    const bgGradient = getPlanBgGradient(plan.code)
    const accentColor = getPlanAccent(plan.code)
    const isHovered = hoveredPlan === plan.id
    const isSelected = selectedPlan?.id === plan.id

    const price = effectivePrice(plan)
    const discounted = price !== plan.priceCents

    return (
      <motion.div
        key={plan.id}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 + idx * 0.1 }}
        onHoverStart={() => setHoveredPlan(plan.id)}
        onHoverEnd={() => setHoveredPlan(null)}
        className="relative flex-shrink-0 w-72 md:w-full snap-center p-3"
      >
        {/* Card - hauteur fixe pour uniformité */}
        <button
          onClick={() => {
            // Si déjà sélectionné, valider directement
            if (isSelected) {
              onSelect(plan)
            } else {
              // Sinon, juste sélectionner
              setSelectedPlan(plan)
            }
          }}
          className={`group relative w-full h-[480px] rounded-3xl border transition-all duration-500 ${
            isHovered || isSelected
              ? 'border-white/30 shadow-2xl scale-105'
              : 'border-white/10 hover:border-white/20'
          } ${plan.popular ? 'ring-2 ring-pink-500/30' : ''}`}
          style={{
            background: isHovered || isSelected
              ? `linear-gradient(135deg, ${accentColor}15 0%, rgba(0,0,0,0.8) 100%)`
              : 'rgba(255,255,255,0.03)'
          }}
        >
          {/* Popular Badge - Tag en haut à droite */}
          {plan.popular && (
            <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-md bg-pink-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
              Populaire
            </div>
          )}

          {/* Gradient overlay on hover */}
          <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${bgGradient}`} />

          <div className="relative px-6 pt-10 pb-6 flex flex-col h-full">
            {/* Icon */}
            <div className="mb-4">
              <div
                className="inline-flex p-3 rounded-2xl border shadow-lg transition-transform group-hover:scale-110 duration-500"
                style={{
                  background: `linear-gradient(to bottom right, ${accentColor}20, ${accentColor}15)`,
                  borderColor: `${accentColor}30`,
                  boxShadow: `0 4px 12px ${accentColor}10`
                }}
              >
                <Icon className="w-8 h-8" style={{ color: accentColor }} strokeWidth={2} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              {/* Subtitle */}
              <div className="mb-1">
                <span className={`text-xs font-semibold uppercase tracking-wider bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                  {descByCode[plan.code]}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold mb-1 text-white group-hover:text-white transition-colors">
                {labelByCode[plan.code]}
              </h2>

              {/* Duration */}
              <p className="text-white/50 text-sm mb-3 group-hover:text-white/70 transition-colors">
                {getDuration(plan.code)}
              </p>

              {/* Price */}
              <div className="mb-4">
                {discounted && (
                  <div className="text-white/50 text-lg line-through mb-1">
                    {formatPrice(plan.priceCents)}
                  </div>
                )}
                <div className="text-3xl font-bold text-white">
                  {formatPrice(price)}
                </div>
              </div>

              {/* Benefits */}
              <ul className="space-y-2 mb-4">
                {featuresByCode[plan.code]?.map((benefit, i) => (
                  <motion.li
                    key={i}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + idx * 0.1 + i * 0.1 }}
                    className="flex items-center gap-2 text-sm text-white/70 group-hover:text-white/90 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`} />
                    {benefit}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-500"
              style={{
                background: isHovered || isSelected
                  ? `linear-gradient(to right, ${accentColor}30, ${accentColor}20)`
                  : `linear-gradient(to right, ${accentColor}15, ${accentColor}10)`,
                borderColor: isHovered || isSelected ? `${accentColor}50` : `${accentColor}30`,
                boxShadow: isHovered || isSelected ? `0 8px 16px ${accentColor}20` : 'none'
              }}
            >
              <span className="font-semibold text-white text-sm">
                {isSelected ? 'Cliquer pour valider' : 'Choisir'}
              </span>
              {isSelected ? (
                <Check className="w-5 h-5 text-white animate-pulse" />
              ) : (
                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
              )}
            </div>
          </div>
        </button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-500/15 to-violet-600/20 border border-pink-500/30 shadow-lg shadow-pink-500/10">
            <Crown className="w-10 h-10 text-pink-300" strokeWidth={2} />
          </div>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-3 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
            Choisissez votre offre
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto font-light">
            Sélectionnez le plan qui correspond le mieux à vos besoins
          </p>
        </motion.div>
      </motion.div>

      {/* Plans - horizontal scroll on mobile, grid on desktop */}
      <div className="w-full max-w-6xl mx-auto">
        {/* Mobile: Horizontal scroll with snap */}
        <div
          ref={scrollContainerRef}
          className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollPaddingLeft: '1rem' }}
        >
          <div className="flex gap-4 pb-4">
            {plans.map((plan, idx) => renderPlanCard(plan, idx))}
          </div>
        </div>

        {/* Desktop: Grid 3 columns */}
        <div className="hidden md:grid grid-cols-3 gap-4 lg:gap-6">
          {plans.map((plan, idx) => renderPlanCard(plan, idx))}
        </div>
      </div>

      {/* Code Promo Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-5 h-5 text-pink-300" />
            <h3 className="text-white font-semibold">Code promo</h3>
          </div>
          <div className="flex gap-2 items-center">
            <input
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/40 focus:border-pink-500/50 focus:outline-none transition-colors"
              placeholder="Entrez votre code (ex: WELCOME10)"
              value={promoInput}
              onChange={(e)=>{ setPromoInput(e.target.value.toUpperCase()); setPromoErr(''); setPromoMsg('') }}
            />
            <button
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 hover:border-pink-500/50 text-white text-sm font-semibold transition-all"
              onClick={async ()=>{
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
              }}
            >
              Appliquer
            </button>
          </div>
          {promoErr && (<div className="text-red-400 text-sm mt-2 flex items-center gap-1">❌ {promoErr}</div>)}
          {promo && !promoErr && (<div className="text-green-400 text-sm mt-2 flex items-center gap-1">✓ {promoMsg || `Code ${promo.code} appliqué`}</div>)}
        </div>
      </motion.div>

      {/* Hint pour double-clic */}
      {selectedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-white/50 text-sm flex items-center justify-center gap-2">
            <Shield size={16} />
            Cliquez à nouveau sur votre sélection pour continuer
          </p>
        </motion.div>
      )}
    </div>
  )
}
