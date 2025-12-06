'use client';

import { Heart, Users, Building2, Check } from 'lucide-react';

export function FreeBadges() {
  const features = [
    {
      icon: Heart,
      title: 'Créatrices',
      benefits: ['Profil premium', 'Messagerie privée', 'Gestion rendez-vous', 'Paiements sécurisés'],
    },
    {
      icon: Users,
      title: 'Clients',
      benefits: ['Profils vérifiés', 'Recherche avancée', 'Chat sécurisé', 'Discrétion absolue'],
    },
    {
      icon: Building2,
      title: 'Établissements',
      benefits: ['Multi-profils', 'Dashboard complet', 'Analytics', 'Support prioritaire'],
    },
  ];

  return (
    <section id="features" className="relative py-32 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400">
            100% Gratuit
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold text-white">
            Pour tous les profils
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Aucun abonnement. Aucune commission. Juste les meilleurs outils.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative bg-zinc-950 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500"
              style={{
                animation: 'fade-in-up 0.6s ease-out forwards',
                animationDelay: `${i * 0.1}s`,
                opacity: 0,
              }}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors duration-300">
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-6">
                {feature.title}
              </h3>

              {/* Benefits */}
              <ul className="space-y-3">
                {feature.benefits.map((benefit, j) => (
                  <li key={j} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-400">{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Free badge */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="inline-flex items-center space-x-2 text-pink-400 font-semibold">
                  <span>Gratuit</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-500 font-normal">Pour toujours</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
