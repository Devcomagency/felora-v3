'use client';

import Link from 'next/link';
import { Building2, Users, BarChart3, Settings } from 'lucide-react';

export function FeaturesEtablissements() {
  const features = [
    {
      icon: Building2,
      title: 'Page Établissement',
      description: 'Créez une vitrine attractive pour votre établissement avec photos, services et informations',
    },
    {
      icon: Users,
      title: 'Gestion Multi-Profils',
      description: 'Gérez tous les profils de vos employées depuis un seul tableau de bord',
    },
    {
      icon: BarChart3,
      title: 'Statistiques Détaillées',
      description: 'Suivez les performances de votre établissement et de chaque profil en temps réel',
    },
    {
      icon: Settings,
      title: 'Administration Simplifiée',
      description: 'Outils professionnels pour gérer rendez-vous, planning et paiements',
    },
  ];

  return (
    <section
      id="etablissements"
      className="relative py-32 px-4 bg-gradient-to-b from-zinc-950 to-black"
    >
      <div className="container mx-auto">
        {/* Section Title */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Solutions Professionnelles pour Établissements
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Gérez votre établissement et développez votre présence en ligne avec nos outils dédiés
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 hover:bg-white/10 hover:scale-105 hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"
              style={{
                animation: 'fade-in-up 0.6s ease-out forwards',
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
              }}
            >
              {/* Gradient Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 rounded-3xl transition-all duration-300" />

              <div className="relative z-10 space-y-4">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-300 leading-relaxed text-lg">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/register/club"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg rounded-full hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
          >
            <span>En savoir plus sur les solutions établissements</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
