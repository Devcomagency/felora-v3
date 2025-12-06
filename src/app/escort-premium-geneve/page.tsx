'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Lock, Star, MapPin, CheckCircle, ArrowRight } from 'lucide-react';

export default function EscortPremiumGenevePage() {
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
            <span className="text-sm font-medium text-gray-300">Premium Genève</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 bg-clip-text text-transparent">
              Escort Premium à Genève
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
              href="/search?city=Geneva"
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
              <h2 className="text-3xl font-bold mb-6 text-white">Escorts Premium à Genève : L'Excellence Felora</h2>

              <p className="text-gray-300 leading-relaxed mb-6">
                Genève, capitale mondiale de la diplomatie et du luxe, mérite une plateforme d'escort à la hauteur de son prestige.
                Felora s'impose comme la référence pour les rencontres premium dans la cité du bout du lac.
              </p>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Une Sélection Rigoureuse</h3>

              <p className="text-gray-300 leading-relaxed mb-6">
                Contrairement aux annuaires traditionnels, chaque profil sur Felora passe par un processus de vérification strict.
                Nos escorts premium à Genève sont vérifiées, garantissant l'authenticité des photos et la conformité avec nos standards d'excellence.
              </p>

              <p className="text-gray-300 leading-relaxed mb-6">
                Cette approche unique élimine les faux profils et assure une expérience de rencontre authentique et sécurisée.
                Que vous recherchiez une compagne pour un dîner d'affaires au Beau-Rivage, une soirée culturelle au Grand Théâtre,
                ou un moment d'intimité dans votre suite des Bergues, vous trouverez le profil idéal.
              </p>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Messagerie Sécurisée et Discrète</h3>

              <p className="text-gray-300 leading-relaxed mb-6">
                Votre vie privée est notre priorité absolue. Toutes les conversations sur Felora sont protégées par un
                chiffrement de bout en bout (E2EE), la même technologie utilisée par les applications de messagerie bancaire.
              </p>

              <p className="text-gray-300 leading-relaxed mb-6">
                Vos échanges restent strictement confidentiels, sans aucune possibilité d'interception. Cette discrétion est
                particulièrement appréciée par notre clientèle internationale, qu'il s'agisse de diplomates, d'entrepreneurs ou
                de voyageurs d'affaires séjournant à Genève.
              </p>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Tous les Quartiers de Genève</h3>

              <p className="text-gray-300 leading-relaxed mb-4">
                Nos escorts premium interviennent dans tous les quartiers prestigieux de Genève :
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                {[
                  { name: 'Eaux-Vives', description: 'Quartier résidentiel élégant, proche du lac et des parcs' },
                  { name: 'Champel', description: 'Zone exclusive, calme et verdoyante' },
                  { name: 'Centre-Ville', description: 'À proximité des hôtels 5 étoiles et boutiques de luxe' },
                  { name: 'Plainpalais', description: 'Quartier dynamique, idéal pour les soirées culturelles' },
                  { name: 'Carouge', description: 'Charme méditerranéen aux portes de Genève' },
                  { name: 'Pâquis', description: 'Quartier cosmopolite et vivant' },
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

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Comment Ça Fonctionne</h3>

              <div className="space-y-4 my-6">
                {[
                  { title: 'Parcourez les profils vérifiés', description: 'Découvrez notre sélection exclusive d\'escorts premium à Genève' },
                  { title: 'Consultez photos et disponibilités', description: 'Profils détaillés avec photos vérifiées et disponibilités en temps réel' },
                  { title: 'Contactez via messagerie sécurisée', description: 'Échangez en toute confidentialité avec chiffrement E2EE' },
                  { title: 'Organisez votre rencontre', description: 'Planifiez votre rendez-vous en toute discrétion' },
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{step.title}</h4>
                      <p className="text-sm text-gray-400">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Standards Premium</h3>

              <p className="text-gray-300 leading-relaxed mb-4">
                Toutes nos escorts premium à Genève répondent à des critères stricts :
              </p>

              <ul className="space-y-2 my-4">
                {[
                  'Présentation soignée et élégante',
                  'Éducation et savoir-vivre',
                  'Maîtrise du français et souvent de l\'anglais',
                  'Disponibilité confirmée et ponctualité',
                  'Respect absolu de votre vie privée',
                ].map((criteria, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-pink-500 flex-shrink-0" />
                    <span>{criteria}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Au-Delà de Genève</h3>

              <p className="text-gray-300 leading-relaxed mb-6">
                Si vous voyagez en Suisse romande, découvrez également nos sélections premium à Lausanne, Montreux ou Verbier.
                Felora couvre l'ensemble des destinations prestigieuses de Suisse francophone.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Profiles Grid Section */}
      <section className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-pink-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Escorts Premium Disponibles à Genève
            </h2>
          </div>
          <p className="text-gray-400 text-lg mb-8">
            Profils vérifiés et actifs en ce moment
          </p>

          <Link
            href="/search?city=Geneva"
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(236,72,153,0.4))',
            }}
          >
            <span className="relative z-10">Découvrir tous les profils de Genève</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative z-10"
            >
              <ArrowRight className="w-5 h-5" />
            </motion.span>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
            Questions Fréquentes
          </h2>

          <div className="space-y-4">
            {[
              {
                question: 'Comment vérifier l\'authenticité des profils ?',
                answer: 'Tous les profils premium Felora passent par une vérification stricte. L\'escort doit se présenter avec une pièce d\'identité (floutée pour la vie privée) et reproduire les photos de son profil. Ce processus garantit que les photos sont récentes et authentiques.',
              },
              {
                question: 'Quels sont les quartiers couverts à Genève ?',
                answer: 'Nos escorts premium interviennent dans tous les quartiers de Genève : Eaux-Vives, Champel, Centre-Ville, Plainpalais, Pâquis, Carouge, ainsi que les communes limitrophes (Meyrin, Vernier, Lancy). Déplacements possibles dans tout le canton de Genève.',
              },
              {
                question: 'Comment fonctionne la messagerie sécurisée ?',
                answer: 'Toutes les conversations sont chiffrées de bout en bout (E2EE), exactement comme Signal ou WhatsApp. Ni Felora ni personne d\'autre ne peut lire vos messages. Seuls vous et votre interlocutrice avez accès au contenu. Discrétion absolue garantie.',
              },
              {
                question: 'Quels sont les tarifs moyens à Genève ?',
                answer: 'Les tarifs varient selon l\'expérience, les prestations et la durée. Généralement entre 400-800 CHF/heure pour des rencontres premium à Genève. Chaque profil indique ses tarifs de manière transparente. Les paiements se font directement avec l\'escort, Felora ne prélève aucune commission.',
              },
              {
                question: 'Puis-je réserver pour un événement ou un voyage ?',
                answer: 'Absolument ! Beaucoup de nos escorts premium accompagnent leurs clients pour des dîners d\'affaires, événements mondains (salon de l\'auto, montres et merveilles), ou voyages. Contactez directement le profil qui vous intéresse pour discuter de vos besoins spécifiques.',
              },
              {
                question: 'Comment créer un compte sur Felora ?',
                answer: 'L\'inscription est gratuite et prend 2 minutes. Cliquez sur "S\'inscrire", choisissez "Compte Client", renseignez email et mot de passe. Une fois connecté, vous pouvez consulter tous les profils et utiliser la messagerie sécurisée. Aucune carte bancaire requise pour créer un compte.',
              },
            ].map((faq, index) => (
              <details
                key={index}
                className="group bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/[0.05] transition-all"
              >
                <summary className="cursor-pointer font-semibold text-white text-lg list-none flex items-center justify-between">
                  {faq.question}
                  <span className="text-pink-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
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
            Rejoignez des milliers de clients satisfaits et vivez une expérience d'exception à Genève
          </p>
          <Link
            href="/search?city=Geneva"
            className="group relative inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 text-white font-bold text-xl rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(236,72,153,0.4))',
            }}
          >
            <span className="relative z-10">Voir toutes les escorts à Genève</span>
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
