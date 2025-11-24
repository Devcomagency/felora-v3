import { readFileSync, writeFileSync } from 'fs'

// Lire le fichier fr.json actuel
const frPath = 'src/messages/fr.json'
const fr = JSON.parse(readFileSync(frPath, 'utf-8'))

// Contenu Terms complet en français
fr.legal.terms = {
  title: "Conditions Générales d'Utilisation — FELORA",
  version: "Version : novembre 2025",
  backHome: "← Retour à l'accueil",
  privacyLink: "Protection des Données",
  cookiesLink: "Politique de Cookies",

  section1: {
    title: "1. Identité du prestataire et champ d'application",
    content: `<p><strong>Raison sociale</strong> : Felora</p>
<p><strong>Siège social</strong> : <em>[Adresse complète à insérer]</em></p>
<p><strong>Numéro d'entreprise (IDE)</strong> : <em>[Numéro IDE/UID]</em></p>
<p><strong>Courriel de contact</strong> : <a href="mailto:info@felora.ch" class="text-pink-400 hover:text-pink-300">info@felora.ch</a></p>
<p><strong>Plateforme</strong> : <a href="https://felora.ch" class="text-pink-400 hover:text-pink-300">felora.ch</a> (ci-après la « <strong>Plateforme</strong> »)</p>
<p>Felora (ci-après « <strong>Felora</strong> », « <strong>nous</strong> », « <strong>notre</strong> ») exploite une plateforme numérique (site web et application mobile) permettant aux <strong>Utilisateurs</strong> de consulter des profils d'escortes et de clubs, et de prendre contact avec des <strong>Prestataires</strong> adultes indépendants (escortes, clubs, studios, etc.) qui proposent des services pour adultes dans un cadre légal et consenti.</p>`
  },

  section2: {
    title: "2. Acceptation des CGU et accès réservé aux majeurs",
    content: `<p>En accédant à la Plateforme, en vous inscrivant ou en utilisant ses services, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la Plateforme.</p>
<p class="mt-4"><strong>⚠️ AVERTISSEMENT : Accès strictement réservé aux personnes majeures (18 ans ou plus)</strong></p>
<p>La Plateforme Felora est <strong>exclusivement destinée aux adultes</strong>. En y accédant, vous déclarez et garantissez que :</p>
<ul class="list-disc pl-6 space-y-1 mt-2">
  <li>Vous avez au moins <strong>18 ans révolus</strong> (ou l'âge légal de la majorité dans votre juridiction),</li>
  <li>Vous n'êtes pas mineur,</li>
  <li>Vous accédez à la Plateforme de votre propre initiative et en toute connaissance de cause,</li>
  <li>Vous ne serez pas choqué par des contenus pour adultes.</li>
</ul>
<p class="mt-4">Felora se réserve le droit de vérifier votre âge à tout moment (demande de pièce d'identité, vérification biométrique, etc.) et de suspendre ou supprimer votre compte en cas de fausse déclaration.</p>
<p class="mt-4"><strong>Toute utilisation frauduleuse ou mensongère concernant l'âge peut entraîner des poursuites judiciaires.</strong></p>`
  },

  section3: {
    title: "3. Définitions",
    content: `<ul class="list-disc pl-6 space-y-2">
  <li><strong>Utilisateur</strong> : Toute personne majeure qui accède à la Plateforme pour consulter des profils, effectuer des recherches, prendre contact avec des Prestataires ou utiliser les fonctionnalités offertes.</li>
  <li><strong>Prestataire</strong> : Personne physique ou morale (escorte indépendante, club, studio, salon, agence, etc.) qui crée un profil sur Felora pour proposer des services pour adultes dans le respect de la loi.</li>
  <li><strong>Compte</strong> : Espace personnel créé par un Utilisateur ou un Prestataire après inscription, permettant l'accès aux fonctionnalités de la Plateforme.</li>
  <li><strong>Contenu</strong> : Tout texte, image, vidéo, audio, donnée ou information publié, téléversé ou partagé sur la Plateforme par un Utilisateur ou un Prestataire.</li>
  <li><strong>Services</strong> : Ensemble des fonctionnalités proposées par Felora (recherche de profils, messagerie, carte interactive, stories, cadeaux virtuels, abonnements premium, etc.).</li>
</ul>`
  },

  section4: {
    title: "4. Nature du service et rôle de Felora",
    content: `<p>Felora est une <strong>plateforme d'intermédiation</strong> et un <strong>hébergeur de contenu</strong>. Nous fournissons un espace numérique permettant aux Prestataires de présenter leurs services et aux Utilisateurs de les découvrir et de les contacter.</p>
<p class="mt-4"><strong>Felora ne fournit pas directement de services d'escorte, de services sexuels ou de rencontres.</strong> Nous ne sommes pas partie prenante aux transactions, arrangements ou rencontres qui peuvent survenir entre Utilisateurs et Prestataires.</p>
<p class="mt-4">Les Prestataires agissent en <strong>toute indépendance</strong>. Ils fixent librement leurs tarifs, leurs disponibilités, leurs conditions de prestation et sont seuls responsables de la fourniture, de la qualité et de la légalité de leurs services.</p>
<p class="mt-4">Felora agit en tant qu'<strong>hébergeur au sens de la loi suisse</strong> et n'exerce aucun contrôle a priori sur les contenus publiés par les Prestataires, sous réserve des obligations légales de modération et de signalement.</p>`
  },

  section5: {
    title: "5. Création de compte et vérification",
    content: `<div class="space-y-4">
  <div>
    <h3 class="text-xl font-semibold text-white mb-2">5.1. Inscription des Utilisateurs</h3>
    <p>Pour accéder à certaines fonctionnalités (messagerie, favoris, cadeaux virtuels, etc.), vous devez créer un compte en fournissant :</p>
    <ul class="list-disc pl-6 space-y-1 mt-2">
      <li>Une adresse e-mail valide,</li>
      <li>Un mot de passe sécurisé,</li>
      <li>Votre acceptation des CGU et de la Déclaration de Protection des Données.</li>
    </ul>
    <p class="mt-2">Vous êtes responsable de la confidentialité de vos identifiants et de toute activité effectuée depuis votre compte.</p>
  </div>

  <div>
    <h3 class="text-xl font-semibold text-white mb-2">5.2. Inscription et vérification des Prestataires</h3>
    <p>Les Prestataires doivent obligatoirement :</p>
    <ul class="list-disc pl-6 space-y-1 mt-2">
      <li>Créer un compte professionnel,</li>
      <li>Fournir une copie d'une <strong>pièce d'identité officielle</strong> (carte d'identité, passeport),</li>
      <li>Réaliser une <strong>vérification d'identité (KYC – Know Your Customer)</strong> pour garantir qu'ils sont majeurs et agissent légalement,</li>
      <li>Accepter les CGU spécifiques aux Prestataires et la Charte de Conduite.</li>
    </ul>
    <p class="mt-2">Felora se réserve le droit de refuser, suspendre ou supprimer tout compte Prestataire en cas de non-conformité, de fausse déclaration ou de comportement contraire aux CGU.</p>
  </div>
</div>`
  },

  section6: {
    title: "6. Obligations des Utilisateurs et Prestataires",
    content: `<div class="space-y-4">
  <div>
    <h3 class="text-xl font-semibold text-white mb-2">6.1. Obligations communes</h3>
    <p>Vous vous engagez à :</p>
    <ul class="list-disc pl-6 space-y-1 mt-2">
      <li>Ne pas violer les lois en vigueur (notamment en matière de prostitution, de traite d'êtres humains, de protection des mineurs, de discrimination, etc.),</li>
      <li>Respecter les droits d'autrui (vie privée, propriété intellectuelle, dignité, etc.),</li>
      <li>Ne pas publier de contenus illégaux, diffamatoires, violents, haineux, pédopornographiques ou incitant à la haine,</li>
      <li>Ne pas usurper l'identité d'autrui ou créer de faux profils,</li>
      <li>Ne pas utiliser la Plateforme à des fins frauduleuses, de harcèlement, de spam ou d'escroquerie,</li>
      <li>Ne pas tenter de contourner les mesures de sécurité ou d'accéder illégalement à des données.</li>
    </ul>
  </div>

  <div>
    <h3 class="text-xl font-semibold text-white mb-2">6.2. Obligations spécifiques des Prestataires</h3>
    <ul class="list-disc pl-6 space-y-1">
      <li>Garantir que vous exercez <strong>légalement et volontairement</strong> votre activité,</li>
      <li>Respecter les lois locales en matière de prostitution, de santé publique et de fiscalité,</li>
      <li>Ne pas être victime de traite d'êtres humains, de proxénétisme ou d'exploitation sexuelle,</li>
      <li>Publier des contenus véridiques et ne pas induire les Utilisateurs en erreur (photos récentes, descriptions honnêtes, tarifs clairs),</li>
      <li>Respecter les règles de décence et de modération de Felora,</li>
      <li>Déclarer vos revenus conformément à la législation fiscale applicable.</li>
    </ul>
  </div>
</div>`
  },

  section7: {
    title: "7. Monnaie virtuelle et cadeaux virtuels",
    content: `<p>Felora propose un système de <strong>monnaie virtuelle</strong> (crédits, jetons, etc.) permettant aux Utilisateurs d'acheter des cadeaux virtuels, d'accéder à des contenus premium ou d'interagir de manière privilégiée avec les Prestataires.</p>
<ul class="list-disc pl-6 space-y-2 mt-4">
  <li><strong>Achat de crédits</strong> : Les crédits peuvent être achetés via des moyens de paiement sécurisés (cartes bancaires, PayPal, cryptomonnaies).</li>
  <li><strong>Utilisation</strong> : Les crédits ne sont pas remboursables et n'ont aucune valeur monétaire réelle. Ils ne peuvent être utilisés que sur la Plateforme.</li>
  <li><strong>Cadeaux virtuels</strong> : Les Utilisateurs peuvent envoyer des cadeaux virtuels aux Prestataires (fleurs, champagne, bijoux virtuels, etc.). Les Prestataires reçoivent une partie de la valeur sous forme de revenus (après déduction de la commission Felora).</li>
  <li><strong>Expiration</strong> : Les crédits peuvent avoir une durée de validité limitée (indiquée lors de l'achat).</li>
</ul>
<p class="mt-4"><em>Les crédits et cadeaux virtuels ne constituent en aucun cas un paiement pour des services sexuels. Ils sont uniquement destinés à l'utilisation de fonctionnalités numériques sur la Plateforme.</em></p>`
  },

  section8: {
    title: "8. Paiements, abonnements et remboursements",
    content: `<div class="space-y-4">
  <div>
    <h3 class="text-xl font-semibold text-white mb-2">8.1. Abonnements Premium</h3>
    <p>Felora propose des <strong>abonnements premium</strong> (mensuels, trimestriels, annuels) offrant des avantages supplémentaires (profil mis en avant, accès anticipé aux nouveautés, messagerie illimitée, statistiques avancées, etc.).</p>
    <p class="mt-2">Les abonnements sont payants et renouvelables automatiquement sauf résiliation anticipée.</p>
  </div>

  <div>
    <h3 class="text-xl font-semibold text-white mb-2">8.2. Commission sur les revenus des Prestataires</h3>
    <p>Felora prélève une <strong>commission</strong> sur les revenus générés par les Prestataires via la Plateforme (cadeaux virtuels, abonnements fans, contenus payants, etc.). Le taux de commission est indiqué dans les conditions spécifiques aux Prestataires.</p>
  </div>

  <div>
    <h3 class="text-xl font-semibold text-white mb-2">8.3. Remboursements</h3>
    <p>Les achats de crédits, d'abonnements et de cadeaux virtuels sont <strong>fermes et définitifs</strong>. Aucun remboursement n'est accordé sauf :</p>
    <ul class="list-disc pl-6 space-y-1 mt-2">
      <li>Erreur technique avérée imputable à Felora,</li>
      <li>Obligation légale (droit de rétractation applicable selon la loi suisse ou européenne).</li>
    </ul>
  </div>
</div>`
  },

  section9: {
    title: "9. Propriété intellectuelle",
    content: `<p>Tous les éléments de la Plateforme (logo, charte graphique, code source, textes, vidéos, designs, fonctionnalités, etc.) sont la <strong>propriété exclusive de Felora</strong> ou de ses partenaires et sont protégés par les lois sur la propriété intellectuelle (droit d'auteur, marques, brevets, etc.).</p>
<p class="mt-4"><strong>Licence d'utilisation :</strong> Felora vous accorde une licence <strong>non exclusive, non transférable et révocable</strong> pour utiliser la Plateforme à des fins personnelles et non commerciales.</p>
<p class="mt-4"><strong>Contenus publiés par les Prestataires :</strong> En publiant des contenus sur Felora, vous accordez à Felora une <strong>licence mondiale, gratuite, non exclusive</strong> d'utiliser, reproduire, modifier, afficher et distribuer vos contenus sur la Plateforme et à des fins promotionnelles (sous réserve du respect de votre vie privée et de vos droits).</p>
<p class="mt-4">Vous garantissez que vous détenez tous les droits sur les contenus que vous publiez et qu'ils ne violent aucun droit de tiers.</p>`
  },

  section10: {
    title: "10. Modération, signalement et lutte contre la traite d'êtres humains",
    content: `<div class="space-y-4">
  <div>
    <h3 class="text-xl font-semibold text-white mb-2">10.1. Modération des contenus</h3>
    <p>Felora se réserve le droit de <strong>modérer, supprimer ou refuser</strong> tout contenu qui :</p>
    <ul class="list-disc pl-6 space-y-1 mt-2">
      <li>Viole les CGU, la loi ou les bonnes mœurs,</li>
      <li>Est signalé par la communauté comme inapproprié,</li>
      <li>Présente un risque pour la sécurité, la dignité ou les droits d'autrui.</li>
    </ul>
  </div>

  <div>
    <h3 class="text-xl font-semibold text-white mb-2">10.2. Signalement</h3>
    <p>Tout Utilisateur peut signaler un contenu ou un profil suspect via le <strong>bouton de signalement</strong> présent sur chaque profil et contenu. Les signalements sont traités dans les meilleurs délais par notre équipe de modération.</p>
  </div>

  <div>
    <h3 class="text-xl font-semibold text-white mb-2">10.3. Lutte contre la traite d'êtres humains et l'exploitation sexuelle</h3>
    <p>Felora condamne fermement toute forme de <strong>traite d'êtres humains, de proxénétisme, d'exploitation sexuelle ou de travail forcé</strong>. Nous collaborons activement avec les autorités compétentes pour prévenir et signaler de tels agissements.</p>
    <p class="mt-2">Si vous avez connaissance ou suspicion de telles activités, veuillez immédiatement nous contacter à : <a href="mailto:info@felora.ch" class="text-pink-400 hover:text-pink-300">info@felora.ch</a> ou signaler le profil concerné.</p>
  </div>
</div>`
  },

  section11: {
    title: "11. Responsabilité de Felora",
    content: `<p>Felora agit en tant qu'<strong>intermédiaire technique</strong> et <strong>hébergeur</strong>. À ce titre :</p>
<ul class="list-disc pl-6 space-y-2 mt-4">
  <li>Nous ne sommes <strong>pas responsables</strong> des contenus publiés par les Prestataires (descriptions, photos, vidéos, tarifs, disponibilités),</li>
  <li>Nous ne sommes <strong>pas responsables</strong> des transactions, arrangements ou rencontres entre Utilisateurs et Prestataires,</li>
  <li>Nous ne garantissons pas la véracité, la qualité, la sécurité ou la légalité des services proposés par les Prestataires,</li>
  <li>Nous ne sommes <strong>pas responsables</strong> des dommages directs ou indirects résultant de l'utilisation de la Plateforme, sauf faute grave ou intentionnelle de notre part.</li>
</ul>
<p class="mt-4"><strong>Disponibilité de la Plateforme :</strong> Nous nous efforçons d'assurer une disponibilité maximale de la Plateforme, mais nous ne garantissons pas un accès ininterrompu. Des maintenances, pannes ou interruptions peuvent survenir.</p>
<p class="mt-4"><strong>Limitation de responsabilité :</strong> Dans les limites autorisées par la loi, la responsabilité de Felora est limitée au montant des sommes effectivement perçues de l'Utilisateur ou du Prestataire au cours des 12 derniers mois.</p>`
  },

  section12: {
    title: "12. Sécurité du compte",
    content: `<p>Vous êtes responsable de la <strong>confidentialité de vos identifiants</strong> (adresse e-mail, mot de passe). Vous devez :</p>
<ul class="list-disc pl-6 space-y-1 mt-4">
  <li>Choisir un mot de passe fort et unique,</li>
  <li>Ne jamais partager vos identifiants avec des tiers,</li>
  <li>Nous informer immédiatement en cas d'utilisation non autorisée de votre compte.</li>
</ul>
<p class="mt-4">Felora met en œuvre des mesures de sécurité pour protéger vos données (chiffrement, HTTPS, authentification à deux facteurs en option), mais aucun système n'est infaillible. Vous reconnaissez les risques inhérents à l'utilisation d'Internet.</p>`
  },

  section13: {
    title: "13. Durée, suspension et résiliation",
    content: `<div class="space-y-4">
  <div>
    <h3 class="text-xl font-semibold text-white mb-2">13.1. Durée</h3>
    <p>Les présentes CGU s'appliquent tant que vous utilisez la Plateforme. Votre compte reste actif jusqu'à sa suppression ou résiliation.</p>
  </div>

  <div>
    <h3 class="text-xl font-semibold text-white mb-2">13.2. Suspension ou résiliation par Felora</h3>
    <p>Felora se réserve le droit de suspendre ou de supprimer votre compte à tout moment, sans préavis ni indemnité, en cas de :</p>
    <ul class="list-disc pl-6 space-y-1 mt-2">
      <li>Violation des CGU,</li>
      <li>Activité frauduleuse, illégale ou nuisible,</li>
      <li>Fausse déclaration (âge, identité, etc.),</li>
      <li>Non-respect des obligations de paiement,</li>
      <li>Comportement contraire aux valeurs de Felora ou à la sécurité de la communauté.</li>
    </ul>
  </div>

  <div>
    <h3 class="text-xl font-semibold text-white mb-2">13.3. Résiliation par l'Utilisateur ou le Prestataire</h3>
    <p>Vous pouvez supprimer votre compte à tout moment depuis les paramètres de votre profil. La suppression est définitive et entraîne la perte de toutes vos données (messages, crédits non utilisés, historique, etc.).</p>
  </div>
</div>`
  },

  section14: {
    title: "14. Propriété des données et renvoi à la politique de confidentialité",
    content: `<p>La collecte, l'utilisation et la protection de vos données personnelles sont régies par notre <strong><a href="/legal/privacy" class="text-pink-400 hover:text-pink-300">Déclaration de Protection des Données</a></strong>, qui fait partie intégrante des présentes CGU.</p>
<p class="mt-4">En utilisant la Plateforme, vous acceptez les modalités de traitement de vos données telles que décrites dans cette Déclaration, conformément à la <strong>Loi fédérale suisse sur la protection des données (LPD)</strong>.</p>`
  },

  section15: {
    title: "15. Modification des CGU",
    content: `<p>Felora se réserve le droit de modifier les présentes CGU à tout moment, notamment en cas d'évolution de nos services, de nos pratiques ou de la législation applicable.</p>
<p class="mt-4">Toute modification substantielle sera communiquée via :</p>
<ul class="list-disc pl-6 space-y-1 mt-2">
  <li>Une notification sur la Plateforme (bannière, pop-up),</li>
  <li>Un e-mail à l'adresse associée à votre compte.</li>
</ul>
<p class="mt-4">La version mise à jour entrera en vigueur dès sa publication sur la Plateforme, sauf indication contraire. En continuant à utiliser la Plateforme après modification, vous acceptez les nouvelles CGU. Si vous n'acceptez pas les modifications, vous devez cesser d'utiliser la Plateforme et supprimer votre compte.</p>`
  },

  section16: {
    title: "16. Droit applicable et for",
    content: `<p>Les présentes CGU sont régies par le <strong>droit suisse</strong>.</p>
<p class="mt-4">Tout litige relatif à l'interprétation, l'exécution ou la validité des CGU sera soumis à la compétence exclusive des tribunaux du canton du <strong>siège de Felora</strong> (ou, selon les cas, aux tribunaux compétents en Suisse), sauf disposition impérative contraire.</p>
<p class="mt-4"><strong>Médiation :</strong> Avant tout recours judiciaire, les parties s'efforceront de résoudre leur litige à l'amiable via une médiation ou une conciliation.</p>
<p class="mt-4"><strong>Contact pour litiges :</strong> <a href="mailto:info@felora.ch" class="text-pink-400 hover:text-pink-300">info@felora.ch</a></p>`
  }
}

// Sauvegarder
writeFileSync(frPath, JSON.stringify(fr, null, 2) + '\n', 'utf-8')
console.log('✅ Traductions Terms FR ajoutées dans fr.json')
