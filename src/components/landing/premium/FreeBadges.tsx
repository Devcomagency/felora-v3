'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';

export function FreeBadges() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const badges = [
    {
      title: 'Clients',
      description: '100% Gratuit',
      icon: <CheckCircle2 className="w-8 h-8" />,
      gradient: 'from-[#FF6B9D] to-[#FF6B9D]/80',
      glow: '#FF6B9D',
    },
    {
      title: 'Indépendantes',
      description: '100% Gratuit',
      icon: <CheckCircle2 className="w-8 h-8" />,
      gradient: 'from-[#B794F6] to-[#B794F6]/80',
      glow: '#B794F6',
    },
    {
      title: 'Établissements',
      description: '100% Gratuit',
      icon: <CheckCircle2 className="w-8 h-8" />,
      gradient: 'from-[#4FD1C7] to-[#4FD1C7]/80',
      glow: '#4FD1C7',
    },
  ];

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
      {/* Background subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0A0A0A] to-black" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF6B9D]/10 via-[#B794F6]/10 to-[#FF6B9D]/10 border border-white/10 backdrop-blur-xl mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#FF6B9D]" />
            <span className="text-sm font-medium text-gray-300">Sans engagement</span>
          </motion.div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              100% Gratuit
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Pour tous, sans frais cachés ni abonnement
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.15,
                type: 'spring',
                stiffness: 100,
              }}
              whileHover={{ scale: 1.05, y: -8 }}
              className="group relative"
            >
              {/* Glow effect */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${badge.gradient} rounded-3xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
                style={{ filter: `blur(40px)` }}
              />
              
              <div className="relative p-8 lg:p-10 rounded-3xl bg-gradient-to-br from-white/5 via-white/3 to-white/5 backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all duration-500 h-full">
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Icon container */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`relative p-6 rounded-2xl bg-gradient-to-br ${badge.gradient} shadow-2xl`}
                    style={{ 
                      boxShadow: `0 20px 60px ${badge.glow}40`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                    <div className="relative text-white">
                      {badge.icon}
                    </div>
                  </motion.div>
                  
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">{badge.title}</h3>
                    <p className={`text-xl lg:text-2xl font-bold bg-gradient-to-r ${badge.gradient} bg-clip-text text-transparent`}>
                      {badge.description}
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
