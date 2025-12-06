'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Lock, Star, MapPin, CheckCircle, ArrowRight } from 'lucide-react';

export default function EscortPremiumLausannePage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background avec vraies couleurs Felora */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }} />

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4 relative z-10">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">
            Accueil
          </Link>
          <span>›</span>
          <span className="text-white">Lausanne</span>
          <span>›</span>
          <span className="text-white">Escort Premium</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo Felora */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex justify-center"
          >
            <Image
              src="/logo-felora.png"
              alt="Felora Logo"
              width={120}
              height={120}
              className="w-24 h-24 md:w-32 md:h-32"
              priority
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-violet-600/10 border border-white/10 backdrop-blur-xl mb-6"
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-gray-300">Premium Lausanne</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 bg-clip-text text-transparent">
              Escort Premium à Lausanne
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed"
          >
            Sélection exclusive d'escorts haut de gamme vérifiées. Profils authentiques, messagerie sécurisée, discrétion absolue.
          </motion.p>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            {[
              {
                icon: Shield,
                title: 'Profils Vérifiés',
                description: 'Vérification authentique',
                gradient: 'from-pink-500 via-purple-500 to-violet-600',
              },
              {
                icon: Lock,
                title: 'Messagerie E2EE',
                description: 'Chiffrement bout en bout',
                gradient: 'from-purple-500 to-violet-600',
              },
              {
                icon: Star,
                title: 'Service Premium',
                description: 'Haute qualité garantie',
                gradient: 'from-pink-500 to-purple-500',
              },
            ].map((badge, index) => (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.8 + index * 0.15,
                  type: 'spring',
                  stiffness: 100,
                }}
                whileHover={{ scale: 1.05, y: -8 }}
                className="group relative"
              >
                <div className={`absolute -inset-1 bg-gradient-to-br ${badge.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />

                <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all duration-500">
                  <motion.div
                    whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${badge.gradient} p-3 text-white mb-4 mx-auto shadow-xl`}
                    style={{
                      filter: 'drop-shadow(0 0 20px rgba(236,72,153,0.4))',
                    }}
                  >
                    <badge.icon className="w-full h-full" />
                  </motion.div>
                  <div className="text-sm font-medium text-white mb-1">{badge.title}</div>
                  <div className="text-xs text-gray-400">{badge.description}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <Link
              href="/search?city=Lausanne"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(236,72,153,0.4))',
              }}
            >
              <span className="relative z-10">Découvrir les profils</span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="relative z-10"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <article className="prose prose-invert prose-lg max-w-none">
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6 text-white">Escorts Premium à Lausanne : L'Excellence Felora</h2>

              <p className="text-gray-300 leading-relaxed mb-6">
                Lausanne, capitale olympique et ville cosmopolite au bord du lac Léman, mérite une plateforme d'escort à la hauteur de son élégance.
                Felora s'impose comme la référence pour les rencontres premium dans la capitale vaudoise.
              </p>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Vérification d'Identité</h3>

              <p className="text-gray-300 leading-relaxed mb-6">
                Contrairement aux annuaires traditionnels, chaque profil sur Felora passe par un processus de vérification d'identité strict.
                Les escorts premium à Lausanne présentes sur la plateforme sont vérifiées, garantissant l'authenticité des photos et la conformité avec les standards d'excellence de Felora.
              </p>

              <p className="text-gray-300 leading-relaxed mb-6">
                Cette approche unique élimine les faux profils et assure une expérience de rencontre authentique et sécurisée.
                Que vous recherchiez une compagne pour un dîner au Beau-Rivage Palace, une soirée culturelle à l'Opéra,
                ou un moment d'intimité dans votre suite du Lausanne Palace, vous trouverez le profil idéal.
              </p>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Messagerie Sécurisée et Discrète</h3>

              <p className="text-gray-300 leading-relaxed mb-6">
                Votre vie privée est notre priorité absolue. Toutes les conversations sur Felora sont protégées par un
                chiffrement de bout en bout (E2EE), la même technologie utilisée par les applications de messagerie bancaire.
              </p>

              <p className="text-gray-300 leading-relaxed mb-6">
                Vos échanges restent strictement confidentiels, sans aucune possibilité d'interception. Cette discrétion est
                particulièrement appréciée par notre clientèle internationale, qu'il s'agisse de cadres CIO, d'entrepreneurs ou
                de voyageurs d'affaires séjournant à Lausanne.
              </p>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Tous les Quartiers de Lausanne</h3>

              <p className="text-gray-300 leading-relaxed mb-4">
                Les escorts premium présentes sur Felora interviennent dans tous les quartiers prestigieux de Lausanne :
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                {[
                  { name: 'Ouchy', description: 'Quartier chic au bord du lac, hôtels 5 étoiles' },
                  { name: 'Centre-Ville / Flon', description: 'Quartier dynamique, shopping et affaires' },
                  { name: 'Vieux-Lausanne', description: 'Charme historique, cathédrale et ruelles pavées' },
                  { name: 'Montbenon', description: 'Vue panoramique sur le lac, quartier résidentiel élégant' },
                  { name: 'Montoie', description: 'Zone exclusive et verdoyante' },
                  { name: 'Sauvabelin', description: 'Nature et tranquillité, proche du centre' },
                ].map((quartier, index) => (
                  <motion.div
                    key={quartier.name}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group bg-white/[0.03] rounded-xl p-4 border border-white/10 hover:border-pink-500/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-pink-500" />
                      <h4 className="font-semibold text-white">{quartier.name}</h4>
                    </div>
                    <p className="text-sm text-gray-400">{quartier.description}</p>
                  </motion.div>
                ))}
              </div>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Badge Vérifié</h3>

              <p className="text-gray-300 leading-relaxed mb-6">
                Sur Felora, chaque profil dispose d'un badge "Vérifié" après validation de l'identité via vérification vidéo.
                Ce badge indique que la personne a confirmé son identité et que les photos correspondent bien à la réalité.
                Felora ne contrôle pas le contenu des profils ni les services proposés - chaque escort est indépendante
                et définit librement ses tarifs, prestations et disponibilités.
              </p>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Au-Delà de Lausanne</h3>

              <p className="text-gray-300 leading-relaxed mb-6">
                Si vous voyagez en Suisse romande, découvrez également nos sélections premium à Genève, Montreux ou Verbier.
                Felora couvre l'ensemble des destinations prestigieuses de Suisse francophone.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-violet-600/10 border border-white/10 rounded-3xl p-12 backdrop-blur-xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Prêt à découvrir nos profils premium ?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Rejoignez des milliers de clients satisfaits et vivez une expérience d'exception à Lausanne
          </p>
          <Link
            href="/search?city=Lausanne"
            className="group relative inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 text-white font-bold text-xl rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(236,72,153,0.4))',
            }}
          >
            <span className="relative z-10">Voir toutes les escorts à Lausanne</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative z-10"
            >
              <ArrowRight className="w-5 h-5" />
            </motion.span>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
