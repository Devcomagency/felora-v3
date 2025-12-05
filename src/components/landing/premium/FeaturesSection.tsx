'use client';

import { Camera, MessageCircle, Calendar, Shield, DollarSign, Sparkles } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Camera,
      title: 'Profil Premium',
      description: 'Photos HD, vidéos, portfolio complet',
    },
    {
      icon: MessageCircle,
      title: 'Messagerie Cryptée',
      description: 'Chat privé et sécurisé',
    },
    {
      icon: Calendar,
      title: 'Gestion Rendez-vous',
      description: 'Planning intelligent intégré',
    },
    {
      icon: Shield,
      title: 'Profils Vérifiés',
      description: '100% sécurisé et authentifié',
    },
    {
      icon: DollarSign,
      title: 'Paiements Sécurisés',
      description: 'Transactions instantanées',
    },
    {
      icon: Sparkles,
      title: 'Analytics Pro',
      description: 'Statistiques en temps réel',
    },
  ];

  return (
    <section id="discover" className="relative py-32 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Tout pour réussir
          </h2>
          <p className="text-xl text-gray-400">
            Les meilleurs outils pour les professionnels exigeants
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-pink-500/50 transition-all duration-500"
              style={{
                animation: 'fade-in-up 0.6s ease-out forwards',
                animationDelay: `${i * 0.1}s`,
                opacity: 0,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-purple-500/0 group-hover:from-pink-500/10 group-hover:to-purple-500/10 rounded-3xl transition-all duration-500" />

              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
