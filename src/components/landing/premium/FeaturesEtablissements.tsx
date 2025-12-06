'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Settings, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function FeaturesEtablissements() {
  const t = useTranslations('landing.featuresEtablissements');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    {
      key: 'management',
      icon: <Users className="w-10 h-10" />,
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      key: 'configuration',
      icon: <Settings className="w-10 h-10" />,
      gradient: 'from-purple-500 to-violet-600',
    },
  ];

  return (
    <section id="etablissements" ref={ref} className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background avec vraies couleurs Felora */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/10 via-black to-black" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('title')}{' '}
            <span className="bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
              {t('titleHighlight')}
            </span>
          </h2>
          <p className="text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-10 mb-16 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.7,
                delay: index * 0.15,
                type: 'spring',
                stiffness: 100,
              }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              <div className={`absolute -inset-1 bg-gradient-to-br ${feature.gradient} rounded-3xl blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />

              <div className="relative p-10 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 h-full">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.15 }}
                  transition={{ duration: 0.6 }}
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} p-5 text-white mb-8 shadow-2xl`}
                  style={{
                    filter: 'drop-shadow(0 0 30px rgba(139,92,246,0.5))',
                  }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-3xl font-bold text-white mb-4">{t(`features.${feature.key}.title`)}</h3>
                <p className="text-gray-400 leading-relaxed text-lg">{t(`features.${feature.key}.description`)}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <Link
            href="/register/salon"
            className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold text-lg rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(139,92,246,0.5))',
            }}
          >
            <span className="relative z-10">{t('cta')}</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative z-10"
            >
              <ArrowRight className="w-5 h-5" />
            </motion.span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
