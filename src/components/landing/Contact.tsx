'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';

export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      id="contact"
      className="relative py-32 sm:py-40 px-6 sm:px-8 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#0E0E10]" />

      <div className="container mx-auto max-w-4xl relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light mb-6 text-white">
            Une question ?
          </h2>
          <div className="w-24 h-px bg-white/20 mx-auto mb-12" />
          <p className="text-lg sm:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Une question sur l&apos;onboarding ou l&apos;offre 3 mois offerts ? Écrivez-nous.
          </p>

          <motion.a
            href="mailto:support@felora.ch"
            className="group inline-flex items-center gap-4 px-10 py-5 border transition-all duration-300"
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Mail className="w-5 h-5 text-white/60 group-hover:text-white/90 transition-colors" strokeWidth={1.5} />
            <span className="text-sm font-light text-white/90 uppercase tracking-[0.1em]">
              support@felora.ch
            </span>
            <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" strokeWidth={1.5} />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
