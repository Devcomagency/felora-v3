import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Escort Premium à Genève — Profils Vérifiés | Felora',
  description: 'Découvrez des escorts premium vérifiées à Genève. Messagerie sécurisée E2EE, profils authentiques. Eaux-Vives, Champel, Plainpalais. Discrétion garantie.',
  keywords: [
    'escort premium genève',
    'escort genève vérifiée',
    'escort de luxe genève',
    'escort haut de gamme genève',
    'escort discrète genève',
    'escort vip genève',
    'accompagnatrice genève',
    'escort eaux-vives',
    'escort champel',
  ],
  openGraph: {
    title: 'Escort Premium à Genève — Profils Vérifiés | Felora',
    description: 'Découvrez des escorts premium vérifiées à Genève. Messagerie sécurisée E2EE, profils authentiques. Discrétion garantie.',
    url: '/escort-premium-geneve',
    type: 'website',
  },
  alternates: {
    canonical: '/escort-premium-geneve',
  },
};

export default function EscortPremiumGenevePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0D0D0D] to-black">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
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
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-[#FF6B9D]/20 to-[#B794F6]/20 border border-[#FF6B9D]/30 text-[#FF6B9D] text-sm font-medium">
              💎 Premium Genève
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#FF6B9D] via-[#B794F6] to-[#4FD1C7] bg-clip-text text-transparent">
            Escort Premium à Genève
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Sélection exclusive d'escorts haut de gamme vérifiées. Profils authentiques, messagerie sécurisée, discrétion absolue.
          </p>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-sm font-medium text-white mb-1">Vérification Vidéo</div>
              <div className="text-xs text-gray-400">Profils authentiques</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="text-2xl mb-2">🔒</div>
              <div className="text-sm font-medium text-white mb-1">Messagerie E2EE</div>
              <div className="text-xs text-gray-400">Chiffrement bout en bout</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="text-2xl mb-2">🌟</div>
              <div className="text-sm font-medium text-white mb-1">Service Premium</div>
              <div className="text-xs text-gray-400">Haute qualité garantie</div>
            </div>
          </div>

          <Link
            href="/search?city=Geneva"
            className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] text-white font-semibold text-lg hover:shadow-2xl hover:shadow-[#FF6B9D]/50 transition-all duration-300 hover:scale-105"
          >
            Découvrir les profils →
          </Link>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <article className="prose prose-invert prose-lg max-w-none">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6 text-white">Escorts Premium à Genève : L'Excellence Felora</h2>

              <p className="text-gray-300 leading-relaxed mb-6">
                Genève, capitale mondiale de la diplomatie et du luxe, mérite une plateforme d'escort à la hauteur de son prestige.
                Felora s'impose comme la référence pour les rencontres premium dans la cité du bout du lac.
              </p>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Une Sélection Rigoureuse</h3>

              <p className="text-gray-300 leading-relaxed mb-6">
                Contrairement aux annuaires traditionnels, chaque profil sur Felora passe par un processus de vérification strict.
                Nos escorts premium à Genève sont vérifiées par vidéo en direct, garantissant l'authenticité des photos et la
                conformité avec nos standards d'excellence.
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
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="font-semibold text-white mb-2">📍 Eaux-Vives</h4>
                  <p className="text-sm text-gray-400">Quartier résidentiel élégant, proche du lac et des parcs</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="font-semibold text-white mb-2">📍 Champel</h4>
                  <p className="text-sm text-gray-400">Zone exclusive, calme et verdoyante</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="font-semibold text-white mb-2">📍 Centre-Ville</h4>
                  <p className="text-sm text-gray-400">À proximité des hôtels 5 étoiles et boutiques de luxe</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="font-semibold text-white mb-2">📍 Plainpalais</h4>
                  <p className="text-sm text-gray-400">Quartier dynamique, idéal pour les soirées culturelles</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="font-semibold text-white mb-2">📍 Carouge</h4>
                  <p className="text-sm text-gray-400">Charme méditerranéen aux portes de Genève</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="font-semibold text-white mb-2">📍 Pâquis</h4>
                  <p className="text-sm text-gray-400">Quartier cosmopolite et vivant</p>
                </div>
              </div>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Comment Ça Fonctionne</h3>

              <div className="space-y-4 my-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] flex items-center justify-center text-white font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Parcourez les profils vérifiés</h4>
                    <p className="text-sm text-gray-400">Découvrez notre sélection exclusive d'escorts premium à Genève</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] flex items-center justify-center text-white font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Consultez photos et disponibilités</h4>
                    <p className="text-sm text-gray-400">Profils détaillés avec photos vérifiées et disponibilités en temps réel</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] flex items-center justify-center text-white font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Contactez via messagerie sécurisée</h4>
                    <p className="text-sm text-gray-400">Échangez en toute confidentialité avec chiffrement E2EE</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] flex items-center justify-center text-white font-bold">4</div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Organisez votre rencontre</h4>
                    <p className="text-sm text-gray-400">Planifiez votre rendez-vous en toute discrétion</p>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-semibold mb-4 text-white mt-8">Standards Premium</h3>

              <p className="text-gray-300 leading-relaxed mb-4">
                Toutes nos escorts premium à Genève répondent à des critères stricts :
              </p>

              <ul className="space-y-2 my-4">
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-[#FF6B9D]">✓</span> Présentation soignée et élégante
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-[#FF6B9D]">✓</span> Éducation et savoir-vivre
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-[#FF6B9D]">✓</span> Maîtrise du français et souvent de l'anglais
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-[#FF6B9D]">✓</span> Disponibilité confirmée et ponctualité
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-[#FF6B9D]">✓</span> Respect absolu de votre vie privée
                </li>
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
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            💎 Escorts Premium Disponibles à Genève
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Profils vérifiés et actifs en ce moment
          </p>

          <Link
            href="/search?city=Geneva"
            className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] text-white font-semibold text-lg hover:shadow-2xl hover:shadow-[#FF6B9D]/50 transition-all duration-300 hover:scale-105"
          >
            Découvrir tous les profils de Genève →
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
            ❓ Questions Fréquentes
          </h2>

          <div className="space-y-4">
            <details className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <summary className="cursor-pointer font-semibold text-white text-lg list-none flex items-center justify-between">
                Comment vérifier l'authenticité des profils ?
                <span className="text-[#FF6B9D] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-300 leading-relaxed">
                Tous les profils premium Felora passent par une vérification vidéo en direct. L'escort doit se présenter face caméra
                avec une pièce d'identité (floutée pour la vie privée) et reproduire les photos de son profil. Ce processus garantit
                que les photos sont récentes et authentiques.
              </p>
            </details>

            <details className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <summary className="cursor-pointer font-semibold text-white text-lg list-none flex items-center justify-between">
                Quels sont les quartiers couverts à Genève ?
                <span className="text-[#FF6B9D] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-300 leading-relaxed">
                Nos escorts premium interviennent dans tous les quartiers de Genève : Eaux-Vives, Champel, Centre-Ville, Plainpalais,
                Pâquis, Carouge, ainsi que les communes limitrophes (Meyrin, Vernier, Lancy). Déplacements possibles dans tout le
                canton de Genève.
              </p>
            </details>

            <details className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <summary className="cursor-pointer font-semibold text-white text-lg list-none flex items-center justify-between">
                Comment fonctionne la messagerie sécurisée ?
                <span className="text-[#FF6B9D] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-300 leading-relaxed">
                Toutes les conversations sont chiffrées de bout en bout (E2EE), exactement comme Signal ou WhatsApp. Ni Felora ni
                personne d'autre ne peut lire vos messages. Seuls vous et votre interlocutrice avez accès au contenu. Discrétion
                absolue garantie.
              </p>
            </details>

            <details className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <summary className="cursor-pointer font-semibold text-white text-lg list-none flex items-center justify-between">
                Quels sont les tarifs moyens à Genève ?
                <span className="text-[#FF6B9D] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-300 leading-relaxed">
                Les tarifs varient selon l'expérience, les prestations et la durée. Généralement entre 400-800 CHF/heure pour des
                rencontres premium à Genève. Chaque profil indique ses tarifs de manière transparente. Les paiements se font
                directement avec l'escort, Felora ne prélève aucune commission.
              </p>
            </details>

            <details className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <summary className="cursor-pointer font-semibold text-white text-lg list-none flex items-center justify-between">
                Puis-je réserver pour un événement ou un voyage ?
                <span className="text-[#FF6B9D] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-300 leading-relaxed">
                Absolument ! Beaucoup de nos escorts premium accompagnent leurs clients pour des dîners d'affaires, événements mondains
                (salon de l'auto, montres et merveilles), ou voyages. Contactez directement le profil qui vous intéresse pour discuter
                de vos besoins spécifiques.
              </p>
            </details>

            <details className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <summary className="cursor-pointer font-semibold text-white text-lg list-none flex items-center justify-between">
                Comment créer un compte sur Felora ?
                <span className="text-[#FF6B9D] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-300 leading-relaxed">
                L'inscription est gratuite et prend 2 minutes. Cliquez sur "S'inscrire", choisissez "Compte Client", renseignez
                email et mot de passe. Une fois connecté, vous pouvez consulter tous les profils et utiliser la messagerie sécurisée.
                Aucune carte bancaire requise pour créer un compte.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-[#FF6B9D]/10 to-[#B794F6]/10 border border-[#FF6B9D]/30 rounded-3xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Prêt à découvrir nos profils premium ?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Rejoignez des milliers de clients satisfaits et vivez une expérience d'exception à Genève
          </p>
          <Link
            href="/search?city=Geneva"
            className="inline-block px-10 py-5 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] text-white font-bold text-xl hover:shadow-2xl hover:shadow-[#FF6B9D]/50 transition-all duration-300 hover:scale-105"
          >
            Voir toutes les escorts à Genève →
          </Link>
        </div>
      </section>
    </div>
  );
}
