'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Crown, User, Building, Check, BadgeCheck, MessageCircle, Shield, Star } from 'lucide-react'

type AccountType = 'client' | 'escort' | 'salon'

export default function RegisterPage() {
  const router = useRouter()

  const cards: Array<{
    id: AccountType
    title: string
    description: string
    gradient: string
    Icon: React.ComponentType<any>
    features: string[]
    href: string
    popular?: boolean
  }> = [
    {
      id: 'client',
      title: 'Client',
      description: 'Recherchez et contactez en toute discrétion',
      gradient: 'from-teal-400 to-cyan-400',
      Icon: User,
      features: ['Navigation privée', 'Messagerie sécurisée', 'Favoris et historique'],
      href: '/register/client'
    },
    {
      id: 'escort',
      title: 'Indépendante',
      description: 'Créez votre profil premium et recevez des clients',
      gradient: 'from-pink-500 to-violet-500',
      Icon: Crown,
      features: ['Badge vérifié', 'Mise en avant premium', 'Statistiques détaillées'],
      href: '/register/indepandante',
      popular: true
    },
    {
      id: 'salon',
      title: 'Salon',
      description: 'Gérez votre établissement et vos profils',
      gradient: 'from-purple-400 to-fuchsia-500',
      Icon: Building,
      features: ['Multi-profils', 'Réservations', 'Statistiques avancées'],
      href: '/register/salon'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0D0D0D] to-[#1A1A1A] text-white px-6 py-6 flex flex-col">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-6">
        <div className="mx-auto mb-4">
          <img
            src="/logo-principal.png"
            alt="FELORA"
            className="w-20 h-20 object-contain mx-auto filter drop-shadow-2xl"
            style={{ filter: 'drop-shadow(0 0 30px rgba(255,107,157,0.8)) drop-shadow(0 0 60px rgba(183,148,246,0.6))' }}
          />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">Rejoignez FELORA</h1>
        <p className="text-white/70 text-sm mt-1">Choisissez votre type de compte</p>
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-white/60">
          <Shield className="w-3.5 h-3.5 text-teal-300" /> Données protégées
          <span>•</span>
          <BadgeCheck className="w-3.5 h-3.5 text-[#4FD1C7]" /> Profil vérifié
          <span>•</span>
          <Star className="w-3.5 h-3.5 text-pink-300" /> Premium
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        {cards.map((card, idx) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(card.href)}
            className="group relative text-left rounded-2xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.08] transition-colors overflow-hidden h-fit"
          >
            {card.popular && (
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-pink-500 to-violet-600">Populaire</span>
            )}

            <div className="p-5">
              {/* Icon wrapper with gradient */}
              <div className={`w-12 h-12 rounded-xl grid place-items-center shadow mb-3 bg-gradient-to-r ${card.gradient}`}>
                <card.Icon className="w-6 h-6 text-white drop-shadow" />
              </div>

              <h3 className="text-lg font-bold mb-1">{card.title}</h3>
              <p className="text-xs text-white/70 mb-3">{card.description}</p>

              <ul className="space-y-1.5 text-xs text-white/80">
                {card.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-[10px] bg-gradient-to-r ${card.gradient}`}>
                      <Check className="w-3 h-3" />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                <span className={`inline-block w-full text-center text-xs font-semibold rounded-lg py-2 bg-gradient-to-r ${card.gradient} shadow-lg group-hover:shadow-xl transition-shadow`}>
                  Continuer comme {card.title}
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto text-center mt-6 text-xs text-white/60">
        Déjà un compte ?
        <button onClick={() => router.push('/login')} className="ml-2 text-[#4FD1C7] underline hover:text-teal-300">
          Se connecter
        </button>
      </div>
    </div>
  )
}