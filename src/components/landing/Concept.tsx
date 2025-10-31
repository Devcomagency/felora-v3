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
    image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65',
  },
  {
    title: 'Contrôle total',
    description: 'Vous choisissez ce que vous montrez, à qui, et à quel prix.',
    icon: Eye,
    accent: '#B794F6',
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db',
  },
  {
    title: 'Écosystème suisse',
    description: 'Hébergement local, conformité et support francophone.',
    icon: Shield,
    accent: '#4FD1C7',
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e',
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
        {/* Section Hero Concept avec silhouette sexy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="relative mb-32 h-[500px] sm:h-[600px] border overflow-hidden"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04"
            alt="Felora - Plateforme premium"
            className="absolute inset-0 w-full h-full object-cover opacity-25"
            loading="eager"
            onError={(e) => {
              console.error('Image failed to load:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E0E10]/60 via-transparent to-[#0E0E10]/80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-5xl px-8 z-10">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light mb-10 leading-[1.1] text-white">
                Felora, l&apos;élégance d&apos;un réseau social,
                <br />
                <span className="text-white/80">la puissance d&apos;une plateforme.</span>
              </h2>
              <div className="w-32 h-px bg-white/20 mx-auto mb-10" />
              <p className="text-lg sm:text-xl text-white/60 max-w-4xl mx-auto leading-relaxed font-light">
                Felora réunit le meilleur d&apos;Instagram et des plateformes privées : un espace visuel, fluide et sécurisé où les créatrices, escorts et agences présentent leur univers, partagent des médias privés et interagissent avec un public adulte vérifié. Conçu en Suisse, Felora privilégie la discrétion, la qualité et le respect des créatrices.
              </p>
            </div>
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
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:opacity-25 transition-opacity duration-500"
                      onError={(e) => {
                        console.error('Card image failed to load:', card.title, e);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  
                  <div className="relative z-10 p-10">
                    <div 
                      className="w-14 h-14 mb-8 flex items-center justify-center border"
                      style={{
                        borderColor: `${card.accent}30`,
                        background: `${card.accent}10`,
                      }}
                    >
                      <Icon className="w-7 h-7" style={{ color: card.accent }} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-light mb-4 text-white">
                      {card.title}
                    </h3>
                    <p className="text-white/50 leading-relaxed font-light">
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
