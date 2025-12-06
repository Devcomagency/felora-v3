'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Search,
  MapPin,
  Star,
  Lock,
  Gift,
  Bell,
  Heart,
  Filter,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export function FeaturesClients() {
  const t = useTranslations('landing.featuresClients');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    { key: 'search', icon: <Search className="w-8 h-8" />, gradient: 'from-cyan-500 to-blue-500' },
    { key: 'geolocation', icon: <MapPin className="w-8 h-8" />, gradient: 'from-blue-500 to-cyan-500' },
    { key: 'verified', icon: <Star className="w-8 h-8" />, gradient: 'from-cyan-500 to-blue-500' },
    { key: 'messaging', icon: <Lock className="w-8 h-8" />, gradient: 'from-blue-500 to-cyan-500' },
    { key: 'gifts', icon: <Gift className="w-8 h-8" />, gradient: 'from-cyan-500 to-blue-500' },
    { key: 'notifications', icon: <Bell className="w-8 h-8" />, gradient: 'from-blue-500 to-cyan-500' },
    { key: 'favorites', icon: <Heart className="w-8 h-8" />, gradient: 'from-cyan-500 to-blue-500' },
    { key: 'filters', icon: <Filter className="w-8 h-8" />, gradient: 'from-blue-500 to-cyan-500' },
  ];

  return (
    <section id="clients" ref={ref} className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background avec vraies couleurs Felora */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-black to-black" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('title')}{' '}
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
              {t('titleHighlight')}
            </span>
          </h2>
          <p className="text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.6,
                delay: index * 0.08,
                type: 'spring',
                stiffness: 100,
              }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              <div className={`absolute -inset-1 bg-gradient-to-br ${feature.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />

              <div className="relative p-8 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 h-full">
                <motion.div
                  whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 text-white mb-6 shadow-xl`}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">{t(`features.${feature.key}.title`)}</h3>
                <p className="text-gray-400 leading-relaxed text-lg">{t(`features.${feature.key}.description`)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
