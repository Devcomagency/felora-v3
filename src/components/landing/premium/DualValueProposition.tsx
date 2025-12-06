'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Building2, UserCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function DualValueProposition() {
  const t = useTranslations('landing.dualValue');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const propositions = [
    {
      key: 'independantes',
      icon: <UserCheck className="w-12 h-12" />,
      href: '/register/indepandante',
      gradient: 'from-pink-500 via-purple-500 to-violet-600',
      bgGradient: 'from-pink-500/10 via-purple-500/5 to-transparent',
    },
    {
      key: 'clients',
      icon: <Users className="w-12 h-12" />,
      href: '/register/client',
      gradient: 'from-cyan-500 to-blue-500',
      bgGradient: 'from-cyan-500/10 via-blue-500/5 to-transparent',
    },
    {
      key: 'etablissements',
      icon: <Building2 className="w-12 h-12" />,
      href: '/register/salon',
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-500/10 via-purple-500/5 to-transparent',
    },
  ];

  return (
    <section id="independantes" ref={ref} className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background avec vraies couleurs Felora */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl animate-pulse delay-700" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('title')}{' '}
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 bg-clip-text text-transparent">
              {t('titleHighlight')}
            </span>
          </h2>
          <p className="text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {propositions.map((prop, index) => (
            <motion.div
              key={prop.key}
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.7,
                delay: index * 0.2,
                type: 'spring',
                stiffness: 100,
              }}
              whileHover={{ y: -12, scale: 1.02 }}
              className="group relative"
            >
              <div className={`absolute -inset-1 bg-gradient-to-br ${prop.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />

              <div className={`relative p-8 lg:p-10 rounded-3xl bg-gradient-to-br ${prop.bgGradient} backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 h-full flex flex-col`}>
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${prop.gradient} p-5 text-white mb-8 shadow-2xl`}
                  style={{
                    filter: 'drop-shadow(0 0 30px rgba(236,72,153,0.5)) drop-shadow(0 0 60px rgba(139,92,246,0.3))',
                  }}
                >
                  {prop.icon}
                </motion.div>

                <div className="flex-1">
                  <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">{t(`propositions.${prop.key}.title`)}</h3>
                  <p className="text-gray-400 mb-8 leading-relaxed text-lg">{t(`propositions.${prop.key}.description`)}</p>
                </div>

                <Link
                  href={prop.href}
                  className={`group relative inline-flex items-center gap-2 px-6 py-4 bg-gradient-to-r ${prop.gradient} text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105`}
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(236,72,153,0.4))',
                  }}
                >
                  <span className="relative z-10">{t(`propositions.${prop.key}.cta`)}</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="relative z-10"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                  <div className={`absolute inset-0 bg-gradient-to-r ${prop.gradient.split(' ').reverse().join(' ')} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
