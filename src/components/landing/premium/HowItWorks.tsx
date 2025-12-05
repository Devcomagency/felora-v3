'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { UserPlus, Search, MessageCircle } from 'lucide-react';

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [
    {
      number: '1',
      icon: <UserPlus className="w-10 h-10" />,
      title: 'Créez votre compte',
      description: 'Inscrivez-vous en quelques minutes et complétez votre profil avec vos informations.',
      gradient: 'from-pink-500 via-purple-500 to-violet-600',
    },
    {
      number: '2',
      icon: <Search className="w-10 h-10" />,
      title: 'Explorez et découvrez',
      description: 'Parcourez les profils vérifiés et utilisez les filtres pour trouver ce qui vous correspond.',
      gradient: 'from-purple-500 to-violet-600',
    },
    {
      number: '3',
      icon: <MessageCircle className="w-10 h-10" />,
      title: 'Connectez-vous',
      description: 'Entrez en contact via la messagerie sécurisée et planifiez vos rencontres.',
      gradient: 'from-violet-500 to-purple-600',
    },
  ];

  return (
    <section ref={ref} className="py-32 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
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
            Comment ça{' '}
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 bg-clip-text text-transparent">
              fonctionne
            </span>
          </h2>
          <p className="text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Trois étapes simples pour commencer votre expérience Felora
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.7, 
                delay: index * 0.2,
                type: 'spring',
                stiffness: 100,
              }}
              className="relative group"
            >
              <div className="flex flex-col items-center text-center">
                {/* Numéro avec gradient */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 shadow-2xl`}
                  style={{
                    filter: 'drop-shadow(0 0 30px rgba(236,72,153,0.5)) drop-shadow(0 0 60px rgba(139,92,246,0.3))',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                  <span className="relative text-white text-3xl font-black">{step.number}</span>
                </motion.div>
                
                {/* Icône */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.gradient} p-4 text-white mb-6 shadow-xl`}
                >
                  {step.icon}
                </motion.div>

                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed text-lg max-w-xs">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
