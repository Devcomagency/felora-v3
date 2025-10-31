'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: 'On se sent enfin respectées et mises en valeur.',
    author: 'Ambassadrice Felora',
  },
  {
    quote: 'Monétisation simple, belle, efficace.',
    author: 'Créatrice pilote',
  },
  {
    quote: 'L\'appli la plus élégante qu\'on ait testée.',
    author: 'Studio partenaire',
  },
];

export default function Showcase() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      id="showcase"
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
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light mb-6 text-white">
            Conçu avec les créatrices,
            <br />
            <span className="text-white/80">pour les créatrices</span>
          </h2>
          <div className="w-24 h-px bg-white/20 mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative"
            >
              <div 
                className="relative h-full p-10 border transition-all duration-500"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                }}
              >
                <div className="relative z-10">
                  <Quote className="w-8 h-8 text-white/20 mb-6" strokeWidth={1.5} />

                  <p className="text-xl sm:text-2xl text-white/80 font-light mb-8 leading-relaxed">
                    &quot;{testimonial.quote}&quot;
                  </p>

                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 border"
                      style={{
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.03)',
                      }}
                    />
                    <p className="text-white/50 font-light text-sm uppercase tracking-wide">
                      {testimonial.author}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
