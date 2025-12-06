'use client';

import Link from 'next/link';
import { Heart, Users, Building2, ArrowRight } from 'lucide-react';

export function DualValueProposition() {
  const propositions = [
    {
      icon: Heart,
      title: 'Pour les Indépendantes',
      description:
        'Créez votre profil premium, gérez vos rendez-vous et développez votre activité en toute sécurité.',
      features: [
        'Profil vérifié et premium',
        'Gestion des rendez-vous',
        'Paiements sécurisés',
        'Analytics détaillées',
      ],
      cta: 'Créer mon profil',
      href: '/register/indepandante',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: Users,
      title: 'Pour les Clients',
      description:
        'Découvrez des profils vérifiés, réservez en toute discrétion et profitez d\'une expérience premium.',
      features: [
        'Profils vérifiés',
        'Réservation simple',
        'Messagerie sécurisée',
        'Paiements discrets',
      ],
      cta: 'Découvrir',
      href: '/register/client',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Building2,
      title: 'Pour les Établissements',
      description:
        'Gérez votre établissement, vos employées et développez votre présence en ligne.',
      features: [
        'Gestion multi-profils',
        'Dashboard complet',
        'Statistiques avancées',
        'Support prioritaire',
      ],
      cta: 'En savoir plus',
      href: '/register/club',
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <section id="independantes" className="relative py-32 px-4">
      <div className="container mx-auto">
        {/* Section Title */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Qui êtes-vous ?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Felora s&apos;adapte à votre profil pour vous offrir la meilleure expérience
          </p>
        </div>

        {/* Propositions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {propositions.map((prop, index) => (
            <div
              key={prop.title}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300"
              style={{
                animation: 'fade-in-up 0.6s ease-out forwards',
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
              }}
            >
              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${prop.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`}
              />

              <div className="relative z-10 space-y-6">
                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${prop.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <prop.icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white">{prop.title}</h3>

                {/* Description */}
                <p className="text-gray-300 leading-relaxed">
                  {prop.description}
                </p>

                {/* Features */}
                <ul className="space-y-3">
                  {prop.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center space-x-3 text-gray-300"
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${prop.gradient}`}
                      />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={prop.href}
                  className={`group/btn inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r ${prop.gradient} text-white font-semibold rounded-full hover:scale-105 hover:shadow-xl transition-all duration-300`}
                >
                  <span>{prop.cta}</span>
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
