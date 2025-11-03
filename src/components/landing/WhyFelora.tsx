'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Shield } from 'lucide-react';

const reasons = [
  'Données hébergées en Suisse',
  'Vérification stricte des profils',
  'Discrétion & anonymat possibles',
  'Interface rapide, sans friction',
];

export default function WhyFelora() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      id="why-felora"
      className="relative py-32 sm:py-40 px-6 sm:px-8 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#0E0E10]" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Section - Silhouette sexy */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1 }}
            className="relative h-[400px] sm:h-[500px] md:h-[600px] border overflow-hidden"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <img
              src="/landing/imagedf.png"
              alt="Sécurité Felora"
              className="absolute inset-0 w-full h-full object-cover opacity-45"
              onError={(e) => {
                console.error('WhyFelora image failed to load:', e);
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0E0E10]/90" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Shield className="w-32 h-32 text-white/10" strokeWidth={1} />
            </div>
          </motion.div>

          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4 sm:mb-6 text-white leading-[1.1]">
                Sécurité suisse.
                <br />
                <span className="text-white/80">Esthétique irréprochable.</span>
                <br />
                <span className="text-white/60">Liberté créative.</span>
              </h2>
              <div className="w-20 sm:w-24 h-px bg-white/20 my-6 sm:my-8" />
              <p className="text-base sm:text-lg md:text-xl text-white/60 leading-relaxed font-light max-w-2xl">
                Chez Felora, la technologie sert votre image. Chaque détail est pensé pour protéger vos données, valoriser votre contenu et augmenter vos revenus — sans compromis sur l&apos;élégance.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              {reasons.map((reason, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-4 group"
                >
                  <div 
                    className="w-6 h-6 flex items-center justify-center border flex-shrink-0"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.02)',
                    }}
                  >
                    <Check className="w-4 h-4 text-white/60" strokeWidth={2} />
                  </div>
                  <p className="text-white/70 font-light">{reason}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
