'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Shield, Eye } from 'lucide-react';

const cards = [
  {
    title: 'Identité premium',
    description: 'Design soigné, profils sublimes, expérience mobile parfaite.',
    icon: Sparkles,
    accent: '#FF6B9D',
    image: '/landing/file_00000000508062089d15a0bc3c8f09e4.png',
  },
  {
    title: 'Contrôle total',
    description: 'Vous choisissez ce que vous montrez, à qui, et à quel prix.',
    icon: Eye,
    accent: '#B794F6',
    image: '/landing/generated-image-12631365-54a1-4698-8211-c58727999f94.jpg',
  },
  {
    title: 'Écosystème suisse',
    description: 'Hébergement local, conformité et support francophone.',
    icon: Shield,
    accent: '#4FD1C7',
    image: '/landing/image-5fbf27f1-d243-4939-b103-a50f7cfdc797.png',
  },
];

export default function Concept() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      id="concept"
      className="relative py-32 sm:py-40 px-6 sm:px-8 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#0E0E10]" />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Hero Concept */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="relative mb-32"
        >
          <div className="text-center max-w-5xl mx-auto px-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light mb-6 sm:mb-8 md:mb-10 leading-[1.1] text-white px-2 sm:px-0">
              Felora, l&apos;élégance d&apos;un réseau social,
              <br />
              <span className="text-white/80">la puissance d&apos;une plateforme.</span>
            </h2>
            <div className="w-24 sm:w-32 h-px bg-white/20 mx-auto mb-6 sm:mb-8 md:mb-10" />
            <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-4xl mx-auto leading-relaxed font-light px-2 sm:px-0">
              Felora réunit le meilleur d&apos;Instagram et des plateformes privées : un espace visuel, fluide et sécurisé où les créatrices, escorts et agences présentent leur univers, partagent des médias privés et interagissent avec un public adulte vérifié. Conçu en Suisse, Felora privilégie la discrétion, la qualité et le respect des créatrices.
            </p>
          </div>
        </motion.div>

        {/* Cards avec silhouettes sexy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                className="relative group"
              >
                <div 
                  className="relative h-full border transition-all duration-500 overflow-hidden"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${card.accent}40`;
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  }}
                >
                  {/* Image de fond */}
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                      onError={(e) => {
                        console.error('Card image failed to load:', card.title, e);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  
                  <div className="relative z-10 p-6 sm:p-8 md:p-10">
                    <div 
                      className="w-14 h-14 mb-8 flex items-center justify-center border"
                      style={{
                        borderColor: `${card.accent}30`,
                        background: `${card.accent}10`,
                      }}
                    >
                      <Icon className="w-7 h-7" style={{ color: card.accent }} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-light mb-3 sm:mb-4 text-white">
                      {card.title}
                    </h3>
                    <p className="text-sm sm:text-base text-white/60 leading-relaxed font-light">
                      {card.description}
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
