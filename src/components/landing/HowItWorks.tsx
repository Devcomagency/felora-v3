'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { User, Zap, TrendingUp, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Créez votre profil',
    description: 'Importez vos visuels, précisez votre ville et votre style.',
    icon: User,
    image: 'https://images.unsplash.com/photo-1580374978635-0cfc8c7ef441',
  },
  {
    number: '02',
    title: 'Activez vos offres',
    description: 'Abonnements, médias privés, cadeaux, demandes personnalisées.',
    icon: Zap,
    image: 'https://images.unsplash.com/photo-1611485988300-f0e8860ab556',
  },
  {
    number: '03',
    title: 'Générez vos revenus',
    description: 'Publiez, engagez, recevez vos paiements via Felora Wallet.',
    icon: TrendingUp,
    image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbfb0e',
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      id="how-it-works"
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
            Comment ça marche
          </h2>
          <div className="w-24 h-px bg-white/20 mx-auto" />
        </motion.div>

        <div className="space-y-16 sm:space-y-24">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                style={{
                  direction: i % 2 === 1 ? 'rtl' : 'ltr',
                }}
              >
                {/* Content */}
                <div style={{ direction: 'ltr' }}>
                  <div className="mb-6">
                    <span className="text-sm font-light text-white/30 tracking-[0.2em] uppercase">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-light mb-4 text-white">
                    {step.title}
                  </h3>
                  <p className="text-lg text-white/50 leading-relaxed font-light max-w-md">
                    {step.description}
                  </p>
                </div>

                {/* Image Section */}
                <div style={{ direction: 'ltr' }}>
                  <motion.div
                    className="relative h-[400px] sm:h-[500px] border overflow-hidden"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.4 }}
                  >
                    <img
                      src={step.image}
                      alt={step.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-25"
                      onError={(e) => {
                        console.error('Step image failed to load:', step.title, e);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0E0E10]/80" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div 
                        className="w-32 h-32 flex items-center justify-center border"
                        style={{
                          borderColor: 'rgba(255, 255, 255, 0.15)',
                          background: 'rgba(255, 255, 255, 0.02)',
                        }}
                      >
                        <Icon className="w-16 h-16 text-white/30" strokeWidth={1.5} />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-20"
        >
          <Link
            href="#early-access"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#early-access')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group inline-flex items-center gap-3 px-12 py-4 border transition-all duration-300"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 107, 157, 0.3)';
              e.currentTarget.style.background = 'rgba(255, 107, 157, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
            }}
          >
            <span className="text-sm font-light text-white/90 uppercase tracking-[0.1em]">
              Rejoindre la liste d&apos;attente
            </span>
            <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white/90 transition-colors" strokeWidth={1.5} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
