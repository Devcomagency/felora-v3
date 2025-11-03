'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2, ImageIcon, Gift, MessageCircle, Wallet, TrendingUp } from 'lucide-react';

const features = [
  {
    title: 'Profils vérifiés',
    description: 'Confiance et crédibilité, badge vérifié pour rassurer vos fans.',
    icon: CheckCircle2,
    accent: '#FF6B9D',
  },
  {
    title: 'Médias privés & stories',
    description: 'Photos, vidéos, contenus exclusifs, accès contrôlé.',
    icon: ImageIcon,
    accent: '#B794F6',
  },
  {
    title: 'Abonnements & cadeaux',
    description: 'Revenus récurrents, tips, listes de souhaits.',
    icon: Gift,
    accent: '#4FD1C7',
  },
  {
    title: 'Messagerie & interactions',
    description: 'DM, demandes personnalisées, réponses rapides.',
    icon: MessageCircle,
    accent: '#FF6B9D',
  },
  {
    title: 'Felora Wallet',
    description: 'Paiements sécurisés, suivi clair, retraits simples.',
    icon: Wallet,
    accent: '#B794F6',
  },
  {
    title: 'Boost découverte',
    description: 'Mises en avant éditoriales et algorithme qualité.',
    icon: TrendingUp,
    accent: '#4FD1C7',
  },
];

export default function Features() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section
      ref={ref}
      id="features"
      className="relative py-32 sm:py-40 px-6 sm:px-8 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#0E0E10]" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4 sm:mb-6 text-white">
            Tout pour créer, publier et monétiser
          </h2>
          <div className="w-24 h-px bg-white/20 mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: i * 0.08,
                }}
                className="group relative"
              >
                <div 
                  className="relative h-full p-6 sm:p-7 md:p-8 border transition-all duration-500"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${feature.accent}40`;
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  }}
                >
                  {/* Top accent line */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(to right, transparent, ${feature.accent}80, transparent)`,
                    }}
                  />

                  <div className="relative z-10">
                    <div 
                      className="w-10 h-10 mb-6 flex items-center justify-center border"
                      style={{
                        borderColor: `${feature.accent}30`,
                        background: `${feature.accent}10`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: feature.accent }} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-light mb-2 sm:mb-3 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-white/60 leading-relaxed font-light text-xs sm:text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
