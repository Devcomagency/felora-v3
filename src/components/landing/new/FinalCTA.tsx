'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Lock, Award } from 'lucide-react';

export function FinalCTA() {
  const badges = [
    { icon: Shield, text: 'Sécurisé' },
    { icon: Lock, text: 'Confidentiel' },
    { icon: Award, text: 'Vérifié' },
  ];

  return (
    <section className="relative py-32 px-6 bg-black">
      <div className="max-w-5xl mx-auto text-center space-y-12">
        {/* Main CTA */}
        <div className="space-y-6">
          <h2 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
            Rejoignez Felora
            <br />
            <span className="text-transparent bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text">
              dès aujourd&apos;hui
            </span>
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Créez votre compte gratuitement et découvrez la plateforme premium suisse
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="group px-10 py-5 bg-white text-black font-bold text-lg rounded-full hover:scale-105 transition-all duration-300 shadow-2xl shadow-white/10 flex items-center space-x-2"
          >
            <span>Créer mon compte</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-8 pt-8">
          {badges.map((badge, i) => (
            <div key={i} className="flex items-center space-x-2 text-gray-500">
              <badge.icon className="w-5 h-5" />
              <span className="text-sm">{badge.text}</span>
            </div>
          ))}
        </div>

        {/* Fine print */}
        <p className="text-sm text-gray-600">
          Gratuit pour tous • Aucune carte bancaire requise • Plateforme suisse
        </p>
      </div>
    </section>
  );
}
