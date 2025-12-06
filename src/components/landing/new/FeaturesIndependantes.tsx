'use client';

import {
  Camera,
  Calendar,
  Shield,
  DollarSign,
  MessageCircle,
  BarChart3,
} from 'lucide-react';

export function FeaturesIndependantes() {
  const features = [
    {
      icon: Camera,
      title: 'Profil Premium',
      description: 'Créez un profil attractif avec photos, vidéos et description détaillée',
    },
    {
      icon: Calendar,
      title: 'Gestion des Rendez-vous',
      description: 'Gérez votre agenda et vos disponibilités en temps réel',
    },
    {
      icon: Shield,
      title: 'Sécurité Maximale',
      description: 'Vérification d\'identité et protection de vos données personnelles',
    },
    {
      icon: DollarSign,
      title: 'Paiements Sécurisés',
      description: 'Acceptez les paiements en ligne en toute sécurité',
    },
    {
      icon: MessageCircle,
      title: 'Messagerie Privée',
      description: 'Communiquez avec vos clients de manière sécurisée et discrète',
    },
    {
      icon: BarChart3,
      title: 'Analytics Avancées',
      description: 'Suivez vos performances et optimisez votre visibilité',
    },
  ];

  return (
    <section className="relative py-32 px-4 bg-gradient-to-b from-black to-zinc-950">
      <div className="container mx-auto">
        {/* Section Title */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Tout Pour Réussir en Ligne
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Des outils professionnels pour développer votre activité en toute sérénité
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:scale-105 hover:-translate-y-2 transition-all duration-300"
              style={{
                animation: 'fade-in-up 0.6s ease-out forwards',
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
              }}
            >
              {/* Gradient Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-purple-500/0 group-hover:from-pink-500/10 group-hover:to-purple-500/10 rounded-3xl transition-all duration-300" />

              <div className="relative z-10 space-y-4">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-300 leading-relaxed">
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
