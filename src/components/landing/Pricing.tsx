'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Pré-inscription',
    price: '0',
    currency: 'CHF',
    period: '3 mois',
    description: 'Idéal pour démarrer au lancement.',
    features: [
      'Profil vérifié',
      'Médias privés',
      'DM & interactions',
      'Felora Wallet',
      'Boost découverte (priorité)',
    ],
    cta: 'Je pré-m\'inscris',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: 'XX',
    currency: 'CHF',
    period: 'mois',
    description: 'Pour créatrices actives.',
    features: [
      'Tout le Pré-inscription',
      'Analytics avancées',
      'Support prioritaire',
      'Badges premium',
      'Outils de monétisation avancés',
    ],
    cta: 'À l\'ouverture',
    highlighted: false,
  },
];

export default function Pricing() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      id="pricing"
      className="relative py-32 sm:py-40 px-6 sm:px-8 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#0E0E10]" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light mb-6 text-white">
            Tarification transparente
          </h2>
          <div className="w-24 h-px bg-white/20 mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative group ${plan.highlighted ? 'lg:scale-105' : ''}`}
            >
              <div 
                className={`relative h-full p-10 border transition-all duration-500 ${
                  plan.highlighted ? 'border-white/15' : 'border-white/8'
                }`}
                style={{
                  background: plan.highlighted 
                    ? 'rgba(255, 255, 255, 0.03)' 
                    : 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = plan.highlighted 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.background = plan.highlighted 
                    ? 'rgba(255, 255, 255, 0.03)' 
                    : 'rgba(255, 255, 255, 0.02)';
                }}
              >
                {plan.highlighted && (
                  <div className="absolute top-6 right-6">
                    <span className="text-xs font-light text-white/30 uppercase tracking-[0.2em]">
                      Offre limitée
                    </span>
                  </div>
                )}

                <div className="relative z-10">
                  <h3 className="text-2xl sm:text-3xl font-light text-white mb-3">
                    {plan.name}
                  </h3>
                  <p className="text-white/50 mb-8 font-light">{plan.description}</p>

                  <div className="mb-10">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl sm:text-6xl font-light text-white">
                        {plan.price}
                      </span>
                      <span className="text-white/40 text-xl font-light">{plan.currency}</span>
                      <span className="text-white/30 ml-4 text-sm font-light">/ {plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature, j) => (
                      <motion.li
                        key={j}
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: i * 0.1 + j * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <Check className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <span className="text-white/60 font-light">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <Link
                    href={plan.highlighted ? '#early-access' : '#contact'}
                    onClick={(e) => {
                      e.preventDefault();
                      const target = plan.highlighted ? '#early-access' : '#contact';
                      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group flex items-center justify-center gap-2 w-full px-8 py-4 border transition-all duration-300 font-light text-sm uppercase tracking-[0.1em]"
                    style={{
                      background: plan.highlighted 
                        ? 'rgba(255, 107, 157, 0.08)' 
                        : 'rgba(255, 255, 255, 0.03)',
                      borderColor: plan.highlighted 
                        ? 'rgba(255, 107, 157, 0.3)' 
                        : 'rgba(255, 255, 255, 0.15)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 107, 157, 0.4)';
                      e.currentTarget.style.background = 'rgba(255, 107, 157, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = plan.highlighted 
                        ? 'rgba(255, 107, 157, 0.3)' 
                        : 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.background = plan.highlighted 
                        ? 'rgba(255, 107, 157, 0.08)' 
                        : 'rgba(255, 255, 255, 0.03)';
                    }}
                  >
                    <span className="text-white/90">{plan.cta}</span>
                    <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white/90 transition-colors" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
