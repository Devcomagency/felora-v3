'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, User, Building, ArrowRight, Sparkles, Lock, TrendingUp, Users } from 'lucide-react'

type AccountType = 'client' | 'escort' | 'salon'

export default function RegisterPage() {
  const router = useRouter()
  const [hoveredCard, setHoveredCard] = useState<AccountType | null>(null)

  const cards: Array<{
    id: AccountType
    title: string
    subtitle: string
    description: string
    gradient: string
    bgGradient: string
    Icon: React.ComponentType<any>
    benefits: string[]
    href: string
    accentColor: string
    popular?: boolean
  }> = [
    {
      id: 'client',
      title: 'Client',
      subtitle: 'Accès discret',
      description: 'Explorez en toute confidentialité',
      gradient: 'from-cyan-500 to-blue-500',
      bgGradient: 'from-cyan-500/10 via-blue-500/5 to-transparent',
      accentColor: '#06B6D4',
      Icon: User,
      benefits: ['Anonymat total', 'Chat sécurisé', 'Profils vérifiés'],
      href: '/register/client'
    },
    {
      id: 'escort',
      title: 'Indépendante',
      subtitle: 'Compte Pro',
      description: 'Développez votre activité',
      gradient: 'from-pink-500 via-purple-500 to-violet-600',
      bgGradient: 'from-pink-500/10 via-purple-500/5 to-transparent',
      accentColor: '#EC4899',
      Icon: Crown,
      benefits: ['Badge vérifié', 'Contrôle géographique', 'Visibilité max'],
      href: '/register/indepandante'
    },
    {
      id: 'salon',
      title: 'Établissement',
      subtitle: 'Gestion Pro',
      description: 'Gérez votre entreprise',
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-500/10 via-purple-500/5 to-transparent',
      accentColor: '#8B5CF6',
      Icon: Building,
      benefits: ['Gestion équipe', 'Galerie média', 'Profil premium'],
      href: '/register/salon'
    }
  ]

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col min-h-screen">
        {/* Header */}
        <div className="text-center mb-16">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-3"
          >
            <img
              src="/logo-principal.png"
              alt="FELORA"
              className="w-32 h-32 md:w-40 md:h-40 object-contain mx-auto"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(255,107,157,0.5)) drop-shadow(0 0 60px rgba(183,148,246,0.3))'
              }}
            />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-3 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
              Bienvenue sur FELORA
            </h1>
            <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto font-light">
              La plateforme premium suisse. Choisissez votre expérience.
            </p>
          </motion.div>
        </div>

        {/* Cards Grid */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-6xl space-y-4">
            {cards.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                onHoverStart={() => setHoveredCard(card.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className="relative"
              >
                {/* Popular Badge */}
                {card.popular && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                    className="absolute -top-3 left-8 z-20"
                  >
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 text-white text-xs font-bold shadow-lg shadow-pink-500/50">
                      <Sparkles className="w-3 h-3" />
                      Populaire
                    </div>
                  </motion.div>
                )}

                {/* Card */}
                <button
                  onClick={() => router.push(card.href)}
                  className={`group relative w-full rounded-2xl border transition-all duration-500 ${
                    hoveredCard === card.id
                      ? 'border-white/30 shadow-2xl scale-[1.02]'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  style={{
                    background: hoveredCard === card.id
                      ? `linear-gradient(135deg, ${card.accentColor}15 0%, rgba(0,0,0,0.8) 100%)`
                      : 'rgba(255,255,255,0.03)'
                  }}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${card.bgGradient}`} />

                  <div className="relative p-5 lg:p-6 flex flex-col md:flex-row items-center gap-6">
                    {/* Icon */}
                    <div className="shrink-0">
                      <div
                        className="inline-flex p-3 lg:p-4 rounded-2xl border shadow-lg transition-transform group-hover:scale-110 duration-500"
                        style={{
                          background: `linear-gradient(to bottom right, ${card.accentColor}20, ${card.accentColor}15)`,
                          borderColor: `${card.accentColor}30`,
                          boxShadow: `0 4px 12px ${card.accentColor}10`
                        }}
                      >
                        <card.Icon className="w-7 h-7 lg:w-8 lg:h-8" style={{ color: `${card.accentColor}` }} strokeWidth={2} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="mb-1">
                        <span className={`text-xs font-semibold uppercase tracking-wider bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                          {card.subtitle}
                        </span>
                      </div>
                      <h2 className="text-xl lg:text-2xl font-bold mb-1 text-white group-hover:text-white transition-colors">
                        {card.title}
                      </h2>
                      <p className="text-white/50 text-sm group-hover:text-white/70 transition-colors">
                        {card.description}
                      </p>
                    </div>

                    {/* Benefits */}
                    <div className="hidden lg:flex items-center gap-4">
                      {card.benefits.map((benefit, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.5 + idx * 0.1 + i * 0.1 }}
                          className="flex items-center gap-2 text-xs text-white/70 group-hover:text-white/90 transition-colors"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${card.gradient}`} />
                          {benefit}
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div className="shrink-0">
                      <div
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all duration-500"
                        style={{
                          background: hoveredCard === card.id
                            ? `linear-gradient(to right, ${card.accentColor}30, ${card.accentColor}20)`
                            : `linear-gradient(to right, ${card.accentColor}15, ${card.accentColor}10)`,
                          borderColor: hoveredCard === card.id ? `${card.accentColor}50` : `${card.accentColor}30`,
                          boxShadow: hoveredCard === card.id ? `0 8px 16px ${card.accentColor}20` : 'none'
                        }}
                      >
                        <span className="font-semibold text-white text-sm">Continuer</span>
                        <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 pb-4"
        >
          <div className="text-sm text-white/40">
            Vous avez déjà un compte ?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 transition-colors"
            >
              Se connecter
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
