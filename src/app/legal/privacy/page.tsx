import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Déclaration de Protection des Données — Felora',
  description: 'Politique de confidentialité de la plateforme Felora'
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Déclaration de Protection des Données — FELORA
          </h1>
          <p className="text-white/60">Version : novembre 2025</p>
        </div>

        <div className="prose prose-invert prose-pink max-w-none space-y-8 text-white/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Identité du responsable du traitement</h2>
            <p><strong>Nom</strong> : Felora</p>
            <p><strong>Adresse</strong> : <em>[Adresse complète à insérer]</em></p>
            <p><strong>Représentant légal</strong> : [Nom du responsable]</p>
            <p><strong>Courriel</strong> : <a href="mailto:info@felora.ch" className="text-pink-400 hover:text-pink-300">info@felora.ch</a></p>
            <p>Felora (ci-après « <strong>Felora</strong> », « <strong>nous</strong> », « <strong>notre</strong> ») exploite la plateforme web et mobile accessible via <a href="https://felora.ch" className="text-pink-400 hover:text-pink-300">felora.ch</a> (la « <strong>Plateforme</strong> »).</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Objet et portée de la déclaration</h2>
            <p>La présente <strong>Déclaration de Protection des Données</strong> (ci-après la « <strong>Déclaration</strong> ») décrit comment Felora collecte, utilise, stocke, transfère et protège les données personnelles que vous nous fournissez ou que nous collectons à travers la Plateforme, en conformité avec le droit suisse sur la protection des données, en particulier :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La <strong>Loi fédérale sur la protection des données</strong> (LPD, RS 235.1),</li>
              <li>L'<strong>Ordonnance relative à la loi fédérale sur la protection des données</strong> (OLPD, RS 235.11).</li>
            </ul>
            <p>La nouvelle version de la LPD (nLPD), entrée en vigueur le 1er septembre 2023, renforce les exigences en matière d'information, de consentement, de transparence et de droits des personnes concernées. Felora s'engage à respecter ces dispositions.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Données personnelles collectées</h2>
            <p>Nous collectons plusieurs types de données personnelles, en fonction de votre utilisation de la Plateforme :</p>

            <div className="ml-4 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">3.1. Données d'identification et de contact</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Prénom et nom (ou pseudonyme),</li>
                  <li>Adresse e-mail,</li>
                  <li>Numéro de téléphone (le cas échéant),</li>
                  <li>Identifiant unique de compte (généré automatiquement).</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">3.2. Données de profil et préférences</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Photos et/ou vidéos de présentation,</li>
                  <li>Description personnelle (biographie, centres d'intérêt),</li>
                  <li>Paramètres de recherche et filtres appliqués (localisation, âge, préférences, etc.),</li>
                  <li>Informations relatives à votre statut (Utilisateur simple, Prestataire vérifié, etc.).</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">3.3. Données de vérification d'identité (KYC)</h3>
                <p>Pour les Prestataires, afin de garantir la sécurité et la conformité :</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Copie d'une pièce d'identité officielle (carte d'identité, passeport),</li>
                  <li>Photo selfie de vérification (pour contrôle d'authenticité),</li>
                  <li>Données biométriques ou autres informations liées à la vérification d'âge et d'identité.</li>
                </ul>
                <p className="mt-2"><em>Ces documents sont traités de manière confidentielle, conservés uniquement le temps nécessaire à la vérification, puis supprimés ou anonymisés conformément à nos politiques de conservation.</em></p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">3.4. Données de paiement et transactions</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Informations relatives aux moyens de paiement (gérées par des prestataires de paiement tiers sécurisés, tels que Stripe),</li>
                  <li>Historique des transactions (achat de crédits virtuels, abonnements premium, envoi de cadeaux),</li>
                  <li>Relevés bancaires ou informations de compte (si nécessaire pour des virements de revenus aux Prestataires).</li>
                </ul>
                <p className="mt-2"><em>Felora ne conserve pas directement les numéros de cartes bancaires complètes : ces données sont traitées par nos prestataires de services de paiement certifiés PCI-DSS.</em></p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">3.5. Données de géolocalisation</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Localisation approximative (ville, région) basée sur votre adresse IP ou vos paramètres de profil,</li>
                  <li>Avec votre consentement explicite, localisation précise (GPS) pour afficher les Prestataires à proximité.</li>
                </ul>
                <p className="mt-2"><em>Vous pouvez à tout moment refuser ou désactiver la géolocalisation depuis les paramètres de votre appareil ou de votre profil.</em></p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">3.6. Données de navigation et techniques</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Adresse IP, type de navigateur, système d'exploitation,</li>
                  <li>Identifiant unique de l'appareil (Device ID),</li>
                  <li>Pages visitées, durée de visite, interactions sur la Plateforme,</li>
                  <li>Cookies et technologies similaires (voir notre Politique de Cookies).</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">3.7. Données de messagerie et d'interactions</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Messages échangés via la messagerie interne (entre Utilisateurs et Prestataires),</li>
                  <li>Signalements et contenus modérés (en cas de plainte ou de violation des CGU),</li>
                  <li>Historique des interactions (likes, commentaires, cadeaux envoyés ou reçus).</li>
                </ul>
                <p className="mt-2"><em>Ces données peuvent être analysées à des fins de modération, de prévention d'abus ou de fraude, et pour assurer la sécurité de la communauté.</em></p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Finalités du traitement des données</h2>
            <p>Felora traite vos données personnelles pour les finalités suivantes, conformément au principe de finalité :</p>

            <div className="ml-4 space-y-3">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.1. Fourniture et amélioration du service</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Création et gestion de votre compte,</li>
                  <li>Affichage personnalisé des profils et résultats de recherche,</li>
                  <li>Mise en relation entre Utilisateurs et Prestataires,</li>
                  <li>Gestion des fonctionnalités premium (abonnements, crédits virtuels, cadeaux),</li>
                  <li>Optimisation de l'expérience utilisateur et de la Plateforme.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.2. Vérification, sécurité et conformité</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Vérification de l'identité des Prestataires (KYC),</li>
                  <li>Prévention de la fraude, des abus, de la traite d'êtres humains et de l'exploitation sexuelle,</li>
                  <li>Respect des obligations légales et réglementaires,</li>
                  <li>Réponse aux demandes des autorités compétentes (sur réquisition légale).</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.3. Gestion des paiements et transactions</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Traitement des paiements (via des prestataires tiers),</li>
                  <li>Émission de factures et gestion comptable,</li>
                  <li>Versement des revenus aux Prestataires (après déduction des commissions).</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.4. Modération et service client</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Traitement des signalements et plaintes,</li>
                  <li>Support client et assistance technique,</li>
                  <li>Modération des contenus et comportements contraires aux CGU.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.5. Communications marketing (avec votre consentement)</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Envoi d'offres promotionnelles, de newsletters, de notifications,</li>
                  <li>Publicités personnalisées sur la Plateforme ou sur des sites tiers.</li>
                </ul>
                <p className="mt-2"><em>Vous pouvez à tout moment retirer votre consentement en vous désabonnant via le lien présent dans chaque e-mail ou en modifiant vos préférences de compte.</em></p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.6. Statistiques et analyses</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Analyse de l'utilisation de la Plateforme (statistiques anonymisées ou pseudonymisées),</li>
                  <li>Amélioration des fonctionnalités, des performances et de la sécurité,</li>
                  <li>Études de marché et rapports internes (données agrégées).</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Bases juridiques du traitement</h2>
            <p>Conformément à la LPD et à la nLPD, nous traitons vos données personnelles sur les bases juridiques suivantes :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Exécution du contrat</strong> : traitement nécessaire à la fourniture du service (création de compte, mise en relation, gestion des abonnements, etc.),</li>
              <li><strong>Consentement</strong> : lorsque vous avez donné votre accord explicite (géolocalisation précise, communications marketing, cookies non essentiels),</li>
              <li><strong>Obligations légales</strong> : respect des lois applicables (lutte contre le blanchiment d'argent, protection des mineurs, obligations fiscales et comptables),</li>
              <li><strong>Intérêts légitimes</strong> : prévention de la fraude, sécurité de la Plateforme, amélioration du service, analyses statistiques (sous réserve de vos droits et libertés).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Durée de conservation des données</h2>
            <p>Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées, sauf obligation légale contraire :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Données de compte actif</strong> : tant que votre compte est actif et utilisé,</li>
              <li><strong>Données de transaction et facturation</strong> : 10 ans (obligation comptable et fiscale suisse),</li>
              <li><strong>Données de vérification KYC</strong> : conservées pendant la durée de l'activité du Prestataire, puis supprimées ou anonymisées dans les 30 jours suivant la fermeture du compte,</li>
              <li><strong>Données de modération et signalements</strong> : conservées jusqu'à résolution du litige ou le temps nécessaire pour prévenir les abus récurrents,</li>
              <li><strong>Cookies et données de navigation</strong> : durée variable selon le type de cookie (voir notre Politique de Cookies),</li>
              <li><strong>Compte inactif</strong> : après 24 mois d'inactivité, nous pouvons supprimer ou anonymiser vos données après vous avoir notifié.</li>
            </ul>
            <p className="mt-4">À l'expiration des délais, vos données sont supprimées de manière sécurisée ou anonymisées de façon irréversible.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Partage des données avec des tiers</h2>
            <p>Felora ne vend pas vos données personnelles. Nous pouvons néanmoins les partager avec des tiers dans les cas suivants :</p>

            <div className="ml-4 space-y-3">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">7.1. Prestataires de services</h3>
                <p>Nous faisons appel à des prestataires externes pour nous aider à fournir et améliorer la Plateforme :</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Hébergement et infrastructure</strong> : serveurs cloud (ex. : AWS, Azure, Vercel),</li>
                  <li><strong>Paiements</strong> : Stripe, PayPal ou autres processeurs de paiement,</li>
                  <li><strong>Envoi d'e-mails</strong> : services de mailing (ex. : SendGrid, Mailgun),</li>
                  <li><strong>Analyses et statistiques</strong> : Google Analytics, Mixpanel (sous réserve de votre consentement),</li>
                  <li><strong>Modération et sécurité</strong> : outils de détection de fraude et de contenus inappropriés.</li>
                </ul>
                <p className="mt-2"><em>Ces prestataires agissent en qualité de sous-traitants et sont contractuellement tenus de respecter la confidentialité et la sécurité de vos données.</em></p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">7.2. Partenaires commerciaux (avec votre consentement)</h3>
                <p>Avec votre accord explicite, nous pouvons partager certaines données avec des partenaires pour des offres promotionnelles ou des services complémentaires.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">7.3. Autorités et obligations légales</h3>
                <p>Nous pouvons divulguer vos données si la loi l'exige ou en réponse à :</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Une réquisition judiciaire ou administrative,</li>
                  <li>Une enquête pénale (lutte contre la traite d'êtres humains, la pédopornographie, etc.),</li>
                  <li>La protection de nos droits, de notre sécurité ou de celle de tiers.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">7.4. Fusion, acquisition ou cession d'actifs</h3>
                <p>En cas de fusion, d'acquisition, de restructuration ou de vente de nos actifs, vos données personnelles peuvent être transférées à un tiers. Vous serez informé(e) de tout changement de contrôle et de vos droits.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Transferts internationaux de données</h2>
            <p>Nos serveurs et certains de nos prestataires peuvent être situés en dehors de la Suisse. Dans ce cas, nous nous assurons que :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Les données sont transférées vers des pays offrant un niveau de protection adéquat (reconnu par le Conseil fédéral suisse),</li>
              <li>Ou que des garanties appropriées sont mises en place (clauses contractuelles types, certifications reconnues telles que le Privacy Shield si applicable, etc.).</li>
            </ul>
            <p className="mt-4"><em>Vous avez le droit d'obtenir une copie des garanties mises en place en nous contactant.</em></p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Sécurité des données</h2>
            <p>Felora met en œuvre des mesures techniques et organisationnelles pour protéger vos données personnelles contre tout accès, modification, divulgation ou destruction non autorisés :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Chiffrement</strong> : transmission sécurisée via HTTPS/TLS et chiffrement des données sensibles en base de données,</li>
              <li><strong>Contrôle d'accès</strong> : seuls les employés et sous-traitants autorisés ont accès aux données, selon le principe du « besoin d'en connaître » (need-to-know),</li>
              <li><strong>Sauvegarde et résilience</strong> : sauvegardes régulières et plans de continuité d'activité,</li>
              <li><strong>Tests de sécurité</strong> : audits réguliers, tests d'intrusion et mises à jour de sécurité,</li>
              <li><strong>Formation du personnel</strong> : sensibilisation à la protection des données et à la cybersécurité.</li>
            </ul>
            <p className="mt-4">Toutefois, aucun système n'est infaillible. En cas de violation de données susceptible d'engendrer un risque élevé pour vos droits et libertés, nous vous en informerons dans les meilleurs délais, conformément à la loi.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Vos droits en matière de protection des données</h2>
            <p>Conformément à la LPD et à la nLPD, vous disposez des droits suivants :</p>

            <div className="ml-4 space-y-3">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">10.1. Droit d'accès</h3>
                <p>Vous avez le droit d'obtenir confirmation que nous traitons vos données et d'accéder à une copie de vos données personnelles.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">10.2. Droit de rectification</h3>
                <p>Vous pouvez demander la correction de vos données si elles sont inexactes ou incomplètes. Vous pouvez également modifier vos informations directement depuis votre profil.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">10.3. Droit d'effacement (droit à l'oubli)</h3>
                <p>Vous pouvez demander la suppression de vos données dans les cas prévus par la loi (retrait du consentement, données non nécessaires, traitement illicite, etc.). La suppression peut être limitée si nous devons conserver certaines données pour des obligations légales.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">10.4. Droit d'opposition</h3>
                <p>Vous pouvez vous opposer au traitement de vos données pour des raisons tenant à votre situation particulière, notamment pour des traitements fondés sur nos intérêts légitimes ou à des fins de marketing direct.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">10.5. Droit à la limitation du traitement</h3>
                <p>Vous pouvez demander la limitation du traitement dans certaines situations (ex. : contestation de l'exactitude des données, traitement illicite mais vous vous opposez à la suppression, etc.).</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">10.6. Droit à la portabilité</h3>
                <p>Vous avez le droit de recevoir vos données dans un format structuré, couramment utilisé et lisible par machine, et de les transmettre à un autre responsable du traitement.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">10.7. Retrait du consentement</h3>
                <p>Lorsque le traitement est fondé sur votre consentement, vous pouvez le retirer à tout moment, sans que cela n'affecte la licéité du traitement effectué avant le retrait.</p>
              </div>
            </div>

            <p className="mt-6"><strong>Pour exercer vos droits :</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Envoyez une demande à : <a href="mailto:info@felora.ch" className="text-pink-400 hover:text-pink-300">info@felora.ch</a></li>
              <li>Précisez la nature de votre demande et joignez une copie de votre pièce d'identité (pour vérification).</li>
            </ul>
            <p className="mt-4">Nous répondrons à votre demande dans un délai de <strong>30 jours</strong> (ou dans un délai raisonnable selon la complexité de la demande).</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Droit de recours auprès de l'autorité de surveillance</h2>
            <p>Si vous estimez que vos droits en matière de protection des données ne sont pas respectés, vous avez le droit de déposer une plainte auprès de l'autorité suisse compétente :</p>
            <p className="mt-4"><strong>Préposé fédéral à la protection des données et à la transparence (PFPDT)</strong></p>
            <p>Adresse : Feldeggweg 1, CH-3003 Berne</p>
            <p>Site web : <a href="https://www.edoeb.admin.ch" className="text-pink-400 hover:text-pink-300" target="_blank" rel="noopener noreferrer">www.edoeb.admin.ch</a></p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Mineurs</h2>
            <p>La Plateforme Felora est <strong>strictement réservée aux personnes majeures</strong> (18 ans ou plus). Nous ne collectons pas sciemment de données personnelles de mineurs. Si nous avons connaissance qu'un mineur a créé un compte ou fourni des données personnelles, nous supprimerons immédiatement ces données et bloquerons l'accès.</p>
            <p className="mt-4">Si vous avez connaissance de la présence d'un mineur sur la Plateforme, veuillez nous le signaler immédiatement à : <a href="mailto:info@felora.ch" className="text-pink-400 hover:text-pink-300">info@felora.ch</a></p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Cookies et technologies de suivi</h2>
            <p>Felora utilise des cookies et des technologies similaires pour améliorer votre expérience, analyser l'utilisation de la Plateforme et personnaliser le contenu et les publicités. Pour plus d'informations sur les types de cookies utilisés, leur durée de conservation et comment les gérer, veuillez consulter notre <a href="/legal/cookies" className="text-pink-400 hover:text-pink-300">Politique de Cookies</a>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">14. Données anonymisées et pseudonymisées</h2>
            <p>Dans le respect de votre vie privée, nous pouvons anonymiser ou pseudonymiser vos données pour des analyses statistiques, des études de marché ou des rapports internes. Les données anonymisées ne permettent plus de vous identifier et ne sont plus considérées comme des données personnelles au sens de la LPD.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">15. Modifications de la Déclaration de Protection des Données</h2>
            <p>Felora se réserve le droit de modifier ou de mettre à jour la présente Déclaration à tout moment, notamment en cas d'évolution de nos services, de nos pratiques ou de la législation applicable. Toute modification substantielle sera communiquée via :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Une notification sur la Plateforme (bannière, pop-up, etc.),</li>
              <li>Un e-mail à l'adresse associée à votre compte.</li>
            </ul>
            <p className="mt-4">La version mise à jour entrera en vigueur dès sa publication sur la Plateforme, sauf indication contraire. Nous vous invitons à consulter régulièrement cette page. La date de la dernière mise à jour est indiquée en haut de la Déclaration.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">16. Contact pour toute question sur la protection des données</h2>
            <p>Pour toute question, demande d'information ou exercice de vos droits relatifs à la protection de vos données personnelles, vous pouvez nous contacter :</p>
            <ul className="list-none space-y-2 mt-4">
              <li><strong>Par e-mail</strong> : <a href="mailto:info@felora.ch" className="text-pink-400 hover:text-pink-300">info@felora.ch</a></li>
              <li><strong>Par courrier postal</strong> : Felora, <em>[Adresse complète]</em></li>
            </ul>
            <p className="mt-4">Nous nous engageons à répondre à vos demandes dans les meilleurs délais et de manière transparente.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">17. Acceptation de la Déclaration</h2>
            <p>En utilisant la Plateforme Felora, vous reconnaissez avoir lu, compris et accepté la présente Déclaration de Protection des Données. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la Plateforme et supprimer votre compte.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex gap-6">
          <a href="/" className="text-pink-400 hover:text-pink-300 transition-colors">
            ← Retour à l'accueil
          </a>
          <a href="/legal/terms" className="text-pink-400 hover:text-pink-300 transition-colors">
            Conditions Générales
          </a>
          <a href="/legal/cookies" className="text-pink-400 hover:text-pink-300 transition-colors">
            Politique de Cookies
          </a>
        </div>
      </div>
    </main>
  )
}
