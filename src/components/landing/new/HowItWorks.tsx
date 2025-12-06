'use client';

import { UserPlus, Search, MessageCircle } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      number: '01',
      title: 'Créez votre compte',
      description: 'Inscrivez-vous gratuitement en quelques clics et complétez votre profil',
    },
    {
      icon: Search,
      number: '02',
      title: 'Explorez',
      description: 'Découvrez des profils vérifiés et trouvez ce qui vous correspond',
    },
    {
      icon: MessageCircle,
      number: '03',
      title: 'Connectez',
      description: 'Échangez et réservez en toute sécurité et discrétion',
    },
  ];

  return (
    <section className="relative py-32 px-4">
      <div className="container mx-auto">
        {/* Section Title */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Rejoignez Felora en 3 étapes simples
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-6xl mx-auto">
          {/* Animated Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 -translate-y-1/2 opacity-20" />
          <div
            className="hidden lg:block absolute top-1/2 left-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 -translate-y-1/2 animate-[width-grow_2s_ease-out_forwards]"
            style={{ width: 0 }}
          />

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="group relative"
                style={{
                  animation: 'fade-in-up 0.6s ease-out forwards',
                  animationDelay: `${index * 0.2}s`,
                  opacity: 0,
                }}
              >
                {/* Card */}
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  {/* Gradient Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-purple-500/0 group-hover:from-pink-500/10 group-hover:to-purple-500/10 rounded-3xl transition-all duration-300" />

                  <div className="relative z-10 space-y-6">
                    {/* Number Badge */}
                    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white font-bold text-xl">
                        {step.number}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <step.icon className="w-10 h-10 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-300 leading-relaxed text-lg">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Arrow (Desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-8 w-12 lg:w-16 h-1 bg-gradient-to-r from-pink-500 to-purple-500 -translate-y-1/2 z-20">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-purple-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
