'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { Shield, Lock, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

export function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const badges = [
    { icon: <Shield className="w-5 h-5" />, text: '100% Sécurisé' },
    { icon: <Lock className="w-5 h-5" />, text: 'Données protégées' },
    { icon: <CheckCircle className="w-5 h-5" />, text: 'Profils vérifiés' },
  ];

  return (
    <section ref={ref} className="py-40 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background avec vraies couleurs Felora */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="max-w-5xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="space-y-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/10"
          >
            <Sparkles className="w-5 h-5 text-pink-500" />
            <span className="text-sm font-medium text-gray-300">Rejoignez la communauté Felora dès aujourd'hui</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight">
            Prêt à commencer votre{' '}
            <span className="block mt-4 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 bg-clip-text text-transparent">
              aventure Felora ?
            </span>
          </h2>

          <p className="text-xl sm:text-2xl lg:text-3xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            Rejoignez la communauté Felora et découvrez une nouvelle façon de vous connecter
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link
              href="/register"
              className="group relative px-10 py-5 sm:px-12 sm:py-6 overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 text-white font-semibold text-lg sm:text-xl flex items-center gap-3">
                S'inscrire maintenant
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.span>
              </span>
              <div className="absolute inset-0 rounded-2xl shadow-[0_0_80px_rgba(236,72,153,0.5)] opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            </Link>

            <Link
              href="#features"
              className="group px-10 py-5 sm:px-12 sm:py-6 border-2 border-white/20 text-white font-semibold text-lg sm:text-xl rounded-2xl hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative z-10">Découvrir les fonctionnalités</span>
            </Link>
          </div>

          {/* Badges de confiance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-12"
          >
            {badges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="text-pink-500">{badge.icon}</div>
                <span className="text-white text-sm font-semibold">{badge.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
