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
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0D0D0D] to-[#1A1A1A] text-white px-6 py-12">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="mx-auto mb-6 w-20 h-20 rounded-2xl p-[2px]"
             style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 50%, #4FD1C7 100%)' }}>
          <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center text-3xl font-bold">F</div>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Rejoignez FELORA</h1>
        <p className="text-white/70 mt-2">Choisissez votre type de compte</p>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/60">
          <Shield className="w-4 h-4 text-teal-300" /> Données protégées
          <span>•</span>
          <BadgeCheck className="w-4 h-4 text-[#4FD1C7]" /> Profil vérifié possible
          <span>•</span>
          <Star className="w-4 h-4 text-pink-300" /> Expérience premium
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((card, idx) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(card.href)}
            className="group relative text-left rounded-2xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.08] transition-colors overflow-hidden"
          >
            {card.popular && (
              <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-semibold bg-gradient-to-r from-pink-500 to-violet-600">Populaire</span>
            )}

            <div className="p-6">
              {/* Icon wrapper with gradient */}
              <div className={`w-14 h-14 rounded-xl grid place-items-center shadow mb-4 bg-gradient-to-r ${card.gradient}`}>
                <card.Icon className="w-7 h-7 text-white drop-shadow" />
              </div>

              <h3 className="text-xl font-bold mb-1">{card.title}</h3>
              <p className="text-sm text-white/70 mb-4">{card.description}</p>

              <ul className="space-y-2 text-sm text-white/80">
                {card.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] bg-gradient-to-r ${card.gradient}`}>
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <span className={`inline-block w-full text-center text-sm font-semibold rounded-lg py-2 bg-gradient-to-r ${card.gradient} shadow-lg group-hover:shadow-xl transition-shadow`}>
                  Continuer comme {card.title}
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto text-center mt-10 text-sm text-white/60">
        Déjà un compte ?
        <button onClick={() => router.push('/login')} className="ml-2 text-[#4FD1C7] underline hover:text-teal-300">
          Se connecter
        </button>
      </div>
    </div>
  )
}