import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de Cookies — Felora',
  description: 'Politique de gestion des cookies de la plateforme Felora'
}

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Politique de Cookies — FELORA
          </h1>
          <p className="text-white/60">Version : novembre 2025</p>
        </div>

        <div className="prose prose-invert prose-pink max-w-none space-y-8 text-white/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p>La présente <strong>Politique de Cookies</strong> explique comment <strong>Felora</strong> (ci-après « <strong>Felora</strong> », « <strong>nous</strong> », « <strong>notre</strong> ») utilise des cookies et des technologies similaires sur la plateforme web et mobile accessible via <a href="https://felora.ch" className="text-pink-400 hover:text-pink-300">felora.ch</a> (la « <strong>Plateforme</strong> »).</p>
            <p className="mt-4">Cette politique complète notre <a href="/legal/privacy" className="text-pink-400 hover:text-pink-300">Déclaration de Protection des Données</a> et nos <a href="/legal/terms" className="text-pink-400 hover:text-pink-300">Conditions Générales d'Utilisation</a>. Elle est conforme à la législation suisse en matière de protection des données, en particulier la Loi fédérale sur la protection des données (LPD, RS 235.1) et son ordonnance (OLPD, RS 235.11).</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Qu'est-ce qu'un cookie ?</h2>
            <p>Un <strong>cookie</strong> est un petit fichier texte déposé et stocké sur votre appareil (ordinateur, smartphone, tablette) lorsque vous visitez un site web. Les cookies permettent au site de reconnaître votre appareil lors de vos visites ultérieures et de mémoriser certaines informations (préférences, paramètres, historique de navigation, etc.).</p>
            <p className="mt-4">Il existe différents types de cookies, en fonction de leur provenance, de leur durée de vie et de leur finalité :</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Cookies de session</strong> : temporaires, supprimés à la fermeture du navigateur,</li>
              <li><strong>Cookies persistants</strong> : restent sur votre appareil pendant une durée déterminée ou jusqu'à suppression manuelle,</li>
              <li><strong>Cookies internes (first-party)</strong> : déposés directement par Felora,</li>
              <li><strong>Cookies tiers (third-party)</strong> : déposés par des partenaires externes (ex. : services d'analyse, publicité).</li>
            </ul>
            <p className="mt-4">Outre les cookies, nous utilisons également des technologies similaires telles que les <strong>pixels de suivi</strong>, les <strong>balises web</strong>, le <strong>stockage local</strong> (localStorage, sessionStorage) et les <strong>identifiants d'appareil</strong>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Pourquoi utilisons-nous des cookies ?</h2>
            <p>Nous utilisons des cookies et des technologies similaires pour plusieurs raisons :</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Assurer le fonctionnement de la Plateforme</strong> : authentification, sécurité, gestion des sessions,</li>
              <li><strong>Améliorer l'expérience utilisateur</strong> : mémorisation de vos préférences (langue, paramètres d'affichage, etc.),</li>
              <li><strong>Analyser l'utilisation de la Plateforme</strong> : statistiques de fréquentation, comportement de navigation, performances,</li>
              <li><strong>Personnaliser le contenu et la publicité</strong> : affichage de contenus et d'annonces adaptés à vos intérêts,</li>
              <li><strong>Prévenir la fraude et assurer la sécurité</strong> : détection d'activités suspectes, protection contre les abus.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Catégories de cookies utilisés</h2>
            <p>Nous utilisons les catégories de cookies suivantes sur la Plateforme :</p>

            <div className="ml-4 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.1. Cookies strictement nécessaires</h3>
                <p><strong>Finalité</strong> : Indispensables au fonctionnement de la Plateforme. Ils permettent la navigation, l'accès aux espaces sécurisés, la gestion des sessions et l'authentification.</p>
                <p><strong>Exemples</strong> :</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Cookie de session utilisateur (pour rester connecté),</li>
                  <li>Cookie de sécurité (protection CSRF, prévention des attaques),</li>
                  <li>Cookie de langue et préférences essentielles.</li>
                </ul>
                <p className="mt-2"><strong>Base juridique</strong> : Intérêt légitime (nécessité technique pour la fourniture du service).</p>
                <p className="mt-2"><strong>Consentement requis</strong> : Non (cookies exemptés car strictement nécessaires).</p>
                <p className="mt-2"><strong>Durée de conservation</strong> : Session (suppression à la fermeture du navigateur) ou durée limitée (ex. : 30 jours pour le maintien de la connexion).</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.2. Cookies de performance et d'analyse</h3>
                <p><strong>Finalité</strong> : Collecter des informations anonymisées ou pseudonymisées sur la manière dont vous utilisez la Plateforme (pages visitées, durée de visite, taux de rebond, etc.) afin d'améliorer les performances et l'expérience utilisateur.</p>
                <p><strong>Exemples</strong> :</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Google Analytics (ou autre outil d'analyse),</li>
                  <li>Pixels de suivi pour mesurer les conversions.</li>
                </ul>
                <p className="mt-2"><strong>Base juridique</strong> : Consentement ou intérêt légitime (si données anonymisées).</p>
                <p className="mt-2"><strong>Consentement requis</strong> : Oui (sauf si totalement anonymisés et sans réidentification possible).</p>
                <p className="mt-2"><strong>Durée de conservation</strong> : Jusqu'à 24 mois (selon les outils utilisés).</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.3. Cookies de fonctionnalité et de préférences</h3>
                <p><strong>Finalité</strong> : Mémoriser vos choix et préférences (langue, région, paramètres d'affichage, filtres de recherche) pour vous offrir une expérience personnalisée et éviter de les redemander à chaque visite.</p>
                <p><strong>Exemples</strong> :</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Cookie de langue sélectionnée,</li>
                  <li>Cookie de préférences d'affichage (thème clair/sombre, tri des résultats).</li>
                </ul>
                <p className="mt-2"><strong>Base juridique</strong> : Consentement ou intérêt légitime (amélioration de l'expérience utilisateur).</p>
                <p className="mt-2"><strong>Consentement requis</strong> : Recommandé (selon l'intensité du traitement).</p>
                <p className="mt-2"><strong>Durée de conservation</strong> : Jusqu'à 12 mois.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.4. Cookies de ciblage et de publicité</h3>
                <p><strong>Finalité</strong> : Afficher des publicités personnalisées et mesurer l'efficacité des campagnes publicitaires. Ces cookies peuvent suivre votre navigation sur différents sites pour créer un profil de vos intérêts.</p>
                <p><strong>Exemples</strong> :</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Cookies publicitaires (Google Ads, Facebook Pixel, etc.),</li>
                  <li>Cookies de remarketing (pour vous montrer des annonces Felora après votre visite).</li>
                </ul>
                <p className="mt-2"><strong>Base juridique</strong> : Consentement explicite (sauf si totalement anonymisés).</p>
                <p className="mt-2"><strong>Consentement requis</strong> : Oui (obligatoire).</p>
                <p className="mt-2"><strong>Durée de conservation</strong> : Jusqu'à 24 mois (selon les partenaires publicitaires).</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.5. Cookies de réseaux sociaux</h3>
                <p><strong>Finalité</strong> : Permettre le partage de contenus sur les réseaux sociaux (Facebook, Instagram, X/Twitter, etc.) et afficher des boutons de partage ou des widgets sociaux.</p>
                <p><strong>Exemples</strong> :</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Cookies Facebook, Instagram, Twitter (si widgets intégrés).</li>
                </ul>
                <p className="mt-2"><strong>Base juridique</strong> : Consentement.</p>
                <p className="mt-2"><strong>Consentement requis</strong> : Oui (sauf si fonctionnalité strictement nécessaire).</p>
                <p className="mt-2"><strong>Durée de conservation</strong> : Variable selon les réseaux sociaux (jusqu'à 24 mois).</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Liste détaillée des cookies utilisés</h2>
            <p>Ci-dessous, un tableau récapitulatif des principaux cookies utilisés sur la Plateforme Felora :</p>

            <div className="overflow-x-auto mt-6">
              <table className="min-w-full border border-white/20 text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="border border-white/20 px-4 py-2 text-left">Nom du cookie</th>
                    <th className="border border-white/20 px-4 py-2 text-left">Type</th>
                    <th className="border border-white/20 px-4 py-2 text-left">Finalité</th>
                    <th className="border border-white/20 px-4 py-2 text-left">Durée</th>
                    <th className="border border-white/20 px-4 py-2 text-left">Consentement</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-white/20 px-4 py-2"><code>session_id</code></td>
                    <td className="border border-white/20 px-4 py-2">Essentiel</td>
                    <td className="border border-white/20 px-4 py-2">Gestion de la session utilisateur</td>
                    <td className="border border-white/20 px-4 py-2">Session</td>
                    <td className="border border-white/20 px-4 py-2">Non requis</td>
                  </tr>
                  <tr>
                    <td className="border border-white/20 px-4 py-2"><code>csrf_token</code></td>
                    <td className="border border-white/20 px-4 py-2">Essentiel</td>
                    <td className="border border-white/20 px-4 py-2">Protection contre les attaques CSRF</td>
                    <td className="border border-white/20 px-4 py-2">Session</td>
                    <td className="border border-white/20 px-4 py-2">Non requis</td>
                  </tr>
                  <tr>
                    <td className="border border-white/20 px-4 py-2"><code>user_lang</code></td>
                    <td className="border border-white/20 px-4 py-2">Fonctionnel</td>
                    <td className="border border-white/20 px-4 py-2">Mémoriser la langue choisie</td>
                    <td className="border border-white/20 px-4 py-2">12 mois</td>
                    <td className="border border-white/20 px-4 py-2">Recommandé</td>
                  </tr>
                  <tr>
                    <td className="border border-white/20 px-4 py-2"><code>_ga, _gid</code></td>
                    <td className="border border-white/20 px-4 py-2">Analyse</td>
                    <td className="border border-white/20 px-4 py-2">Google Analytics (statistiques)</td>
                    <td className="border border-white/20 px-4 py-2">24 mois / 24h</td>
                    <td className="border border-white/20 px-4 py-2">Oui</td>
                  </tr>
                  <tr>
                    <td className="border border-white/20 px-4 py-2"><code>_fbp</code></td>
                    <td className="border border-white/20 px-4 py-2">Publicité</td>
                    <td className="border border-white/20 px-4 py-2">Facebook Pixel (publicités ciblées)</td>
                    <td className="border border-white/20 px-4 py-2">3 mois</td>
                    <td className="border border-white/20 px-4 py-2">Oui</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-6"><em>Note : Cette liste n'est pas exhaustive et peut évoluer. Pour obtenir une liste complète et à jour, vous pouvez utiliser l'outil de gestion des cookies disponible sur la Plateforme ou nous contacter.</em></p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Gestion de vos préférences de cookies</h2>
            <p>Conformément à la législation suisse sur la protection des données, vous avez le droit de contrôler l'utilisation des cookies sur votre appareil. Vous pouvez accepter, refuser ou gérer vos préférences à tout moment.</p>

            <div className="ml-4 space-y-4 mt-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">6.1. Lors de votre première visite</h3>
                <p>Lorsque vous visitez la Plateforme pour la première fois, un <strong>bandeau de consentement</strong> (cookie banner) s'affiche pour vous informer de l'utilisation de cookies et vous permettre de choisir vos préférences.</p>
                <p className="mt-2">Vous pouvez :</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Accepter tous les cookies,</li>
                  <li>Refuser les cookies non essentiels,</li>
                  <li>Personnaliser vos choix par catégorie (essentiel, analyse, publicité, etc.).</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">6.2. Modification de vos préférences à tout moment</h3>
                <p>Vous pouvez modifier vos préférences de cookies à tout moment en cliquant sur le lien <strong>« Gérer mes cookies »</strong> disponible dans le pied de page de la Plateforme ou dans vos paramètres de compte.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">6.3. Paramètres de votre navigateur</h3>
                <p>Vous pouvez également configurer votre navigateur pour bloquer, supprimer ou être alerté lors du dépôt de cookies. Consultez l'aide de votre navigateur pour plus d'informations :</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li><strong>Google Chrome</strong> : Paramètres → Confidentialité et sécurité → Cookies</li>
                  <li><strong>Mozilla Firefox</strong> : Paramètres → Vie privée et sécurité → Cookies et données de sites</li>
                  <li><strong>Safari</strong> : Préférences → Confidentialité → Cookies et données de sites web</li>
                  <li><strong>Microsoft Edge</strong> : Paramètres → Cookies et autorisations de site</li>
                </ul>
                <p className="mt-4"><em>Attention : Bloquer ou supprimer certains cookies peut affecter le bon fonctionnement de la Plateforme (ex. : impossibilité de rester connecté, perte de préférences).</em></p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">6.4. Outils de désactivation tiers</h3>
                <p>Pour désactiver les cookies de certains partenaires publicitaires ou d'analyse, vous pouvez utiliser les liens suivants :</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li><strong>Google Analytics</strong> : <a href="https://tools.google.com/dlpage/gaoptout" className="text-pink-400 hover:text-pink-300" target="_blank" rel="noopener noreferrer">Désactivation Google Analytics</a></li>
                  <li><strong>Facebook</strong> : <a href="https://www.facebook.com/settings?tab=ads" className="text-pink-400 hover:text-pink-300" target="_blank" rel="noopener noreferrer">Paramètres publicitaires Facebook</a></li>
                  <li><strong>Your Online Choices</strong> : <a href="https://www.youronlinechoices.com/ch-fr/" className="text-pink-400 hover:text-pink-300" target="_blank" rel="noopener noreferrer">Gérer les cookies publicitaires</a></li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Cookies de tiers</h2>
            <p>Certains cookies sont déposés par des partenaires tiers pour nous aider à fournir et améliorer la Plateforme (ex. : services d'analyse, publicité, paiement, réseaux sociaux). Ces partenaires collectent et traitent vos données conformément à leurs propres politiques de confidentialité.</p>
            <p className="mt-4"><strong>Principaux partenaires</strong> :</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Google Analytics</strong> : Analyse de l'utilisation du site (<a href="https://policies.google.com/privacy" className="text-pink-400 hover:text-pink-300" target="_blank" rel="noopener noreferrer">Politique de confidentialité Google</a>)</li>
              <li><strong>Stripe</strong> : Traitement des paiements (<a href="https://stripe.com/privacy" className="text-pink-400 hover:text-pink-300" target="_blank" rel="noopener noreferrer">Politique de confidentialité Stripe</a>)</li>
              <li><strong>Facebook / Meta</strong> : Publicités ciblées (<a href="https://www.facebook.com/privacy/explanation" className="text-pink-400 hover:text-pink-300" target="_blank" rel="noopener noreferrer">Politique de confidentialité Meta</a>)</li>
            </ul>
            <p className="mt-4">Nous vous invitons à consulter les politiques de confidentialité de ces partenaires pour en savoir plus sur l'utilisation de vos données.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Durée de conservation des cookies</h2>
            <p>La durée de conservation des cookies varie selon leur type et leur finalité :</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Cookies de session</strong> : supprimés automatiquement à la fermeture du navigateur,</li>
              <li><strong>Cookies persistants</strong> : conservés sur votre appareil jusqu'à leur date d'expiration (de quelques jours à 24 mois maximum) ou jusqu'à suppression manuelle,</li>
              <li><strong>Cookies essentiels</strong> : durée nécessaire au fonctionnement de la Plateforme (généralement session ou 30 jours),</li>
              <li><strong>Cookies d'analyse et de publicité</strong> : jusqu'à 24 mois (durée maximale recommandée).</li>
            </ul>
            <p className="mt-4">À l'expiration ou à la suppression des cookies, les informations qu'ils contiennent ne sont plus accessibles.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Sécurité des cookies</h2>
            <p>Nous mettons en œuvre des mesures de sécurité pour protéger les informations stockées dans les cookies contre tout accès, modification ou divulgation non autorisés :</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Utilisation de cookies <strong>sécurisés</strong> (flag "Secure" pour transmission HTTPS uniquement),</li>
              <li>Attribut <strong>HttpOnly</strong> pour empêcher l'accès aux cookies via JavaScript (protection contre les attaques XSS),</li>
              <li>Attribut <strong>SameSite</strong> pour limiter les requêtes inter-sites (protection CSRF),</li>
              <li>Chiffrement des données sensibles stockées dans les cookies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Modifications de la Politique de Cookies</h2>
            <p>Felora se réserve le droit de modifier ou de mettre à jour la présente Politique de Cookies à tout moment, notamment en cas d'évolution des technologies, de nos pratiques ou de la législation applicable. Toute modification substantielle sera communiquée via :</p>
            <ul className="list-disc pl-6 space-y-1 mt-4">
              <li>Une notification sur la Plateforme (bannière, pop-up, bandeau de cookies mis à jour),</li>
              <li>Un e-mail à l'adresse associée à votre compte (si nécessaire).</li>
            </ul>
            <p className="mt-4">La version mise à jour entrera en vigueur dès sa publication sur la Plateforme. Nous vous invitons à consulter régulièrement cette page. La date de la dernière mise à jour est indiquée en haut de la Politique.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Contact pour toute question sur les cookies</h2>
            <p>Pour toute question, demande d'information ou exercice de vos droits relatifs à l'utilisation des cookies, vous pouvez nous contacter :</p>
            <ul className="list-none space-y-2 mt-4">
              <li><strong>Par e-mail</strong> : <a href="mailto:info@felora.ch" className="text-pink-400 hover:text-pink-300">info@felora.ch</a></li>
              <li><strong>Par courrier postal</strong> : Felora, <em>[Adresse complète]</em></li>
            </ul>
            <p className="mt-4">Nous nous engageons à répondre à vos demandes dans les meilleurs délais et de manière transparente.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex gap-6">
          <a href="/" className="text-pink-400 hover:text-pink-300 transition-colors">
            ← Retour à l'accueil
          </a>
          <a href="/legal/terms" className="text-pink-400 hover:text-pink-300 transition-colors">
            Conditions Générales
          </a>
          <a href="/legal/privacy" className="text-pink-400 hover:text-pink-300 transition-colors">
            Protection des Données
          </a>
        </div>
      </div>
    </main>
  )
}
