'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Lock, Star, Hand, CheckCircle, ArrowRight } from 'lucide-react';

export default function MassageErotiqueGenevePage() {
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
          <span className="text-white">Massage Érotique</span>
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
            <Hand className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-gray-300">Massage Sensuel Premium</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 bg-clip-text text-transparent">
              Massage Érotique à Genève
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed"
          >
            Masseuses érotiques premium vérifiées. Expérience sensuelle raffinée, discrétion absolue, relaxation ultime.
          </motion.p>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            {[
              {
                icon: Shield,
                title: 'Masseuses Vérifiées',
                description: 'Profils authentiques',
                gradient: 'from-pink-500 via-purple-500 to-violet-600',
              },
              {
                icon: Lock,
                title: 'Discrétion Garantie',
                description: 'Confidentialité totale',
                gradient: 'from-purple-500 to-violet-600',
              },
              {
                icon: Star,
                title: 'Qualité Premium',
                description: 'Expérience exceptionnelle',
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
              href="/search?city=Geneva&service=massage"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(236,72,153,0.4))',
              }}
            >
              <span className="relative z-10">Découvrir les masseuses</span>
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
              <h2 className="text-3xl font-bold mb-6 text-white">Massage Érotique à Genève : Sensualité et Raffinement</h2>

              <p className="text-gray-300 leading-relaxed mb-6">
                Le massage érotique combine relaxation profonde et éveil des sens pour une expérience unique de bien-être sensuel.
                À Genève, Felora vous propose une sélection exclusive de masseuses érotiques professionnelles, vérifiées et
                expertes dans l'art du massage sensuel haut de gamme.
              </p>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Qu'est-ce qu'un Massage Érotique ?</h3>

              <p className="text-gray-300 leading-relaxed mb-6">
                Le massage érotique est un massage complet qui inclut des zones érogènes, procurant à la fois détente musculaire
                et plaisir sensoriel. Contrairement au massage classique, il intègre une dimension sensuelle et intime, tout en
                respectant vos limites et préférences. C'est une expérience personnalisée, réalisée dans un cadre professionnel
                et discret.
              </p>

              <p className="text-gray-300 leading-relaxed mb-6">
                Nos masseuses érotiques à Genève proposent différentes techniques : massage body body (corps à corps), massage
                naturiste, massage à quatre mains, et massages sensuels sur mesure. Chaque séance commence par une discussion
                pour établir vos attentes et garantir votre confort.
              </p>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Masseuses Professionnelles et Vérifiées</h3>

              <p className="text-gray-300 leading-relaxed mb-6">
                Toutes nos masseuses érotiques passent par un processus de vérification strict. Nous contrôlons l'authenticité
                des profils, des photos et de l'expérience professionnelle. Vous êtes assuré de rencontrer exactement la personne
                présentée, dans un cadre sûr et respectueux.
              </p>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Types de Massages Proposés</h3>

              <ul className="space-y-2 my-4">
                {[
                  'Massage Érotique Classique - Relaxation et sensualité combinées',
                  'Massage Body Body - Corps à corps sensuel avec huiles',
                  'Massage Naturiste - Expérience complète sans vêtements',
                  'Massage 4 Mains - Deux masseuses pour sensations décuplées',
                  'Massage Prostate - Pour hommes recherchant plaisir intense',
                  'Massage Couples - Expérience sensuelle à deux',
                ].map((criteria, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-pink-500 flex-shrink-0" />
                    <span>{criteria}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Cadre et Atmosphère</h3>

              <p className="text-gray-300 leading-relaxed mb-6">
                Les massages érotiques sont proposés dans des espaces privés et discrets à Genève : appartements de standing,
                salons de massage professionnels, ou dans le confort de votre hôtel. L'ambiance est soigneusement préparée
                pour favoriser la relaxation : éclairage tamisé, musique douce, huiles de massage premium, serviettes chaudes.
              </p>

              <p className="text-gray-300 leading-relaxed mb-6">
                Chaque détail est pensé pour votre confort et votre plaisir. Les masseuses prennent le temps nécessaire pour
                créer une atmosphère propice à la détente, sans précipitation ni stress.
              </p>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Discrétion Absolue</h3>

              <p className="text-gray-300 leading-relaxed mb-6">
                Votre vie privée est notre priorité. Toutes les conversations via Felora sont chiffrées de bout en bout (E2EE).
                Aucune information personnelle n'est partagée. Les rendez-vous sont organisés en toute discrétion, et les
                masseuses respectent scrupuleusement votre confidentialité.
              </p>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Bienfaits du Massage Érotique</h3>

              <ul className="space-y-2 my-4">
                {[
                  'Réduction du stress et des tensions musculaires',
                  'Éveil de la sensualité et plaisir sensoriel',
                  'Amélioration de la circulation sanguine',
                  'Libération d\'endorphines (hormones du bien-être)',
                  'Augmentation de la confiance en soi',
                  'Expérience relaxante et ressourçante',
                ].map((criteria, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-pink-500 flex-shrink-0" />
                    <span>{criteria}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Tarifs et Durée</h3>

              <p className="text-gray-300 leading-relaxed mb-6">
                Les séances de massage érotique à Genève durent généralement entre 1h et 2h. Les tarifs varient selon la
                masseuse, la durée et le type de massage (200-500 CHF en moyenne). Chaque profil indique clairement ses
                prestations et tarifs. Les paiements se font directement avec la masseuse, Felora ne prélève aucune commission.
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
            Offrez-vous un moment de pure détente
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Découvrez nos masseuses érotiques premium à Genève
          </p>
          <Link
            href="/search?city=Geneva&service=massage"
            className="group relative inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 text-white font-bold text-xl rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(236,72,153,0.4))',
            }}
          >
            <span className="relative z-10">Réserver un massage érotique</span>
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
