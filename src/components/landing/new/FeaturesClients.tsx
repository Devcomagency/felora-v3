'use client';

import {
  Search,
  Shield,
  Heart,
  MapPin,
  Star,
  Lock,
  Filter,
  MessageSquare,
  CreditCard,
} from 'lucide-react';

export function FeaturesClients() {
  const features = [
    {
      icon: Search,
      title: 'Recherche Avancée',
      description: 'Trouvez la personne idéale grâce à nos filtres détaillés',
    },
    {
      icon: Shield,
      title: 'Profils Vérifiés',
      description: 'Tous les profils sont vérifiés pour votre sécurité',
    },
    {
      icon: Heart,
      title: 'Favoris',
      description: 'Sauvegardez vos profils préférés pour y revenir',
    },
    {
      icon: MapPin,
      title: 'Géolocalisation',
      description: 'Découvrez les profils proches de vous',
    },
    {
      icon: Star,
      title: 'Avis & Notes',
      description: 'Consultez les avis des autres membres',
    },
    {
      icon: Lock,
      title: 'Discrétion Absolue',
      description: 'Vos données et activités restent 100% confidentielles',
    },
    {
      icon: Filter,
      title: 'Filtres Personnalisés',
      description: 'Affinez votre recherche selon vos préférences',
    },
    {
      icon: MessageSquare,
      title: 'Chat Instantané',
      description: 'Échangez directement et en toute sécurité',
    },
    {
      icon: CreditCard,
      title: 'Paiements Discrets',
      description: 'Transactions sécurisées et anonymes',
    },
  ];

  return (
    <section id="clients" className="relative py-32 px-4">
      <div className="container mx-auto">
        {/* Section Title */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Une Expérience Client Premium
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Découvrez, connectez et réservez en toute simplicité et discrétion
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:scale-105 hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20"
              style={{
                animation: 'fade-in-up 0.6s ease-out forwards',
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
              }}
            >
              {/* Gradient Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 rounded-3xl transition-all duration-300" />

              <div className="relative z-10 space-y-4">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
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
