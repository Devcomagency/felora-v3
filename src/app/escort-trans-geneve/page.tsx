'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Lock, Star, Heart, CheckCircle, ArrowRight } from 'lucide-react';

export default function EscortTransGenevePage() {
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
          <span className="text-white">Genève</span>
          <span>›</span>
          <span className="text-white">Escort Trans Premium</span>
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
            <Heart className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-gray-300">Trans Premium Genève</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 bg-clip-text text-transparent">
              Escort Trans Premium à Genève
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed"
          >
            Sélection exclusive d'escorts trans et transsexuelles haut de gamme. Profils vérifiés, messagerie sécurisée, discrétion absolue.
          </motion.p>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            {[
              {
                icon: Shield,
                title: 'Profils Vérifiés',
                description: 'Authenticité garantie',
                gradient: 'from-pink-500 via-purple-500 to-violet-600',
              },
              {
                icon: Lock,
                title: 'Discrétion Totale',
                description: 'Messagerie E2EE chiffrée',
                gradient: 'from-purple-500 to-violet-600',
              },
              {
                icon: Star,
                title: 'Sélection Premium',
                description: 'Haute qualité exclusive',
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
              href="/search?city=Geneva&gender=TRANS"
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
              <h2 className="text-3xl font-bold mb-6 text-white">Escorts Trans Premium à Genève : Excellence et Discrétion</h2>

              <p className="text-gray-300 leading-relaxed mb-6">
                Genève, ville cosmopolite et ouverte d'esprit, accueille une sélection exclusive d'escorts trans premium.
                Felora s'impose comme la référence pour des rencontres authentiques et haut de gamme avec des transsexuelles et ladyboys vérifiées.
              </p>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Sélection Premium et Vérification Stricte</h3>

              <p className="text-gray-300 leading-relaxed mb-6">
                Chaque profil d'escort trans sur Felora passe par un processus de vérification rigoureux. Les escorts transsexuelles
                premium à Genève présentes sur la plateforme sont vérifiées, garantissant l'authenticité des photos et des informations du profil.
              </p>

              <p className="text-gray-300 leading-relaxed mb-6">
                Cette approche unique vous assure de rencontrer exactement la personne présentée sur le profil, avec une présentation
                soignée et un niveau de service irréprochable. Que vous recherchiez une compagne pour une soirée privée, un dîner élégant
                au Beau-Rivage, ou un moment d'intimité, vous trouverez le profil correspondant à vos attentes.
              </p>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Discrétion et Sécurité Absolues</h3>

              <p className="text-gray-300 leading-relaxed mb-6">
                Nous comprenons l'importance de la discrétion dans vos rencontres. Toutes les conversations sur Felora sont
                protégées par un chiffrement de bout en bout (E2EE), garantissant une confidentialité totale de vos échanges.
              </p>

              <p className="text-gray-300 leading-relaxed mb-6">
                Vos messages, rendez-vous et informations personnelles restent strictement privés. Cette sécurité de niveau bancaire
                est particulièrement appréciée par notre clientèle exigeante qui valorise la discrétion et le respect de la vie privée.
              </p>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Profils Diversifiés</h3>

              <p className="text-gray-300 leading-relaxed mb-4">
                La sélection d'escorts trans premium à Genève sur Felora propose une diversité de profils :
              </p>

              <ul className="space-y-2 my-4">
                {[
                  'Transsexuelles post-opératoires et pré-opératoires',
                  'Ladyboys asiatiques et escorts trans européennes',
                  'Escorts trans actives et passives selon vos préférences',
                  'Accompagnatrices pour soirées mondaines ou moments intimes',
                  'Maîtrise du français, anglais et autres langues',
                ].map((criteria, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-pink-500 flex-shrink-0" />
                    <span>{criteria}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Standards d'Excellence</h3>

              <p className="text-gray-300 leading-relaxed mb-4">
                Pour être acceptées sur Felora, les escorts trans premium à Genève doivent répondre à des critères stricts :
              </p>

              <ul className="space-y-2 my-4">
                {[
                  'Présentation féminine soignée et élégante',
                  'Hygiène irréprochable et soins esthétiques réguliers',
                  'Courtoisie, éducation et savoir-vivre',
                  'Ponctualité et fiabilité confirmées',
                  'Respect absolu de votre vie privée et de vos souhaits',
                ].map((criteria, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-pink-500 flex-shrink-0" />
                    <span>{criteria}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Environnement Inclusif et Respectueux</h3>

              <p className="text-gray-300 leading-relaxed mb-6">
                Felora promeut un environnement inclusif et respectueux pour toutes les identités de genre. Les escorts trans
                premium présentes sur la plateforme bénéficient du même niveau d'excellence et de protection que tous les membres. La plateforme condamne fermement
                toute forme de discrimination et garantit aux escorts trans un espace sûr et professionnel.
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
            Découvrez les escorts trans premium sur Felora
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Sélection exclusive et vérifiée d'escorts transsexuelles à Genève
          </p>
          <Link
            href="/search?city=Geneva&gender=TRANS"
            className="group relative inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 text-white font-bold text-xl rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(236,72,153,0.4))',
            }}
          >
            <span className="relative z-10">Voir les profils trans à Genève</span>
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
