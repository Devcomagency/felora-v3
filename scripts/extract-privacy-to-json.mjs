import { readFileSync, writeFileSync } from 'fs'

const frPath = 'src/messages/fr.json'
const fr = JSON.parse(readFileSync(frPath, 'utf-8'))

// Contenu Privacy complet en français (17 sections)
fr.legal.privacy = {
  title: "Déclaration de Protection des Données — FELORA",
  version: "Version : novembre 2025",
  backHome: "← Retour à l'accueil",
  termsLink: "Conditions Générales",
  cookiesLink: "Politique de Cookies",

  section1: {
    title: "1. Identité du responsable du traitement",
    content: `<p><strong>Nom</strong> : Felora</p>
<p><strong>Adresse</strong> : <em>[Adresse complète à insérer]</em></p>
<p><strong>Représentant légal</strong> : [Nom du responsable]</p>
<p><strong>Courriel</strong> : <a href="mailto:info@felora.ch" class="text-pink-400 hover:text-pink-300">info@felora.ch</a></p>
<p>Felora (ci-après « <strong>Felora</strong> », « <strong>nous</strong> », « <strong>notre</strong> ») exploite la plateforme web et mobile accessible via <a href="https://felora.ch" class="text-pink-400 hover:text-pink-300">felora.ch</a> (la « <strong>Plateforme</strong> »).</p>`
  },

  section2: {
    title: "2. Objet et portée de la déclaration",
    content: `<p>La présente <strong>Déclaration de Protection des Données</strong> (ci-après la « <strong>Déclaration</strong> ») décrit comment Felora collecte, utilise, stocke, transfère et protège les données personnelles que vous nous fournissez ou que nous collectons à travers la Plateforme, en conformité avec le droit suisse sur la protection des données, en particulier :</p>
<ul class="list-disc pl-6 space-y-2">
  <li>La <strong>Loi fédérale sur la protection des données</strong> (LPD, RS 235.1),</li>
  <li>L'<strong>Ordonnance relative à la loi fédérale sur la protection des données</strong> (OLPD, RS 235.11).</li>
</ul>
<p>La nouvelle version de la LPD (nLPD), entrée en vigueur le 1er septembre 2023, renforce les exigences en matière d'information, de consentement, de transparence et de droits des personnes concernées. Felora s'engage à respecter ces dispositions.</p>`
  },

  section3: {
    title: "3. Données personnelles collectées",
    content: `<p>Nous collectons plusieurs types de données personnelles, en fonction de votre utilisation de la Plateforme :</p>
<div class="ml-4 space-y-4">
  <div>
    <h3 class="text-xl font-semibold text-white mb-2">3.1. Données d'identification et de contact</h3>
    <ul class="list-disc pl-6 space-y-1">
      <li>Prénom et nom (ou pseudonyme),</li>
      <li>Adresse e-mail,</li>
      <li>Numéro de téléphone (le cas échéant),</li>
      <li>Identifiant unique de compte (généré automatiquement).</li>
    </ul>
  </div>
  <div>
    <h3 class="text-xl font-semibold text-white mb-2">3.2. Données de profil et préférences</h3>
    <ul class="list-disc pl-6 space-y-1">
      <li>Photos et/ou vidéos de présentation,</li>
      <li>Description personnelle (biographie, centres d'intérêt),</li>
      <li>Paramètres de recherche et filtres appliqués (localisation, âge, préférences, etc.),</li>
      <li>Informations relatives à votre statut (Utilisateur simple, Prestataire vérifié, etc.).</li>
    </ul>
  </div>
</div>`
  },

  section4: {
    title: "4. Finalités du traitement des données",
    content: `<p>Felora traite vos données personnelles pour les finalités suivantes, conformément au principe de finalité :</p>
<div class="ml-4 space-y-3">
  <div>
    <h3 class="text-xl font-semibold text-white mb-2">4.1. Fourniture et amélioration du service</h3>
    <ul class="list-disc pl-6 space-y-1">
      <li>Création et gestion de votre compte,</li>
      <li>Affichage personnalisé des profils et résultats de recherche,</li>
      <li>Mise en relation entre Utilisateurs et Prestataires.</li>
    </ul>
  </div>
</div>`
  },

  section5: {
    title: "5. Bases juridiques du traitement",
    content: `<p>Conformément à la LPD et à la nLPD, nous traitons vos données personnelles sur les bases juridiques suivantes :</p>
<ul class="list-disc pl-6 space-y-2">
  <li><strong>Exécution du contrat</strong> : traitement nécessaire à la fourniture du service,</li>
  <li><strong>Consentement</strong> : lorsque vous avez donné votre accord explicite,</li>
  <li><strong>Obligations légales</strong> : respect des lois applicables.</li>
</ul>`
  },

  section6: {
    title: "6. Durée de conservation des données",
    content: `<p>Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées.</p>`
  },

  section7: {
    title: "7. Partage des données avec des tiers",
    content: `<p>Felora ne vend pas vos données personnelles. Nous pouvons néanmoins les partager avec des tiers dans les cas suivants :</p>
<ul class="list-disc pl-6 space-y-2">
  <li><strong>Prestataires de services</strong> : hébergement, paiements, analyses,</li>
  <li><strong>Autorités</strong> : sur réquisition légale.</li>
</ul>`
  },

  section8: {
    title: "8. Transferts internationaux de données",
    content: `<p>Nos serveurs et certains de nos prestataires peuvent être situés en dehors de la Suisse.</p>`
  },

  section9: {
    title: "9. Sécurité des données",
    content: `<p>Felora met en œuvre des mesures techniques et organisationnelles pour protéger vos données personnelles.</p>`
  },

  section10: {
    title: "10. Vos droits en matière de protection des données",
    content: `<p>Conformément à la LPD et à la nLPD, vous disposez des droits suivants :</p>
<ul class="list-disc pl-6 space-y-2">
  <li>Droit d'accès,</li>
  <li>Droit de rectification,</li>
  <li>Droit d'effacement (droit à l'oubli).</li>
</ul>`
  },

  section11: {
    title: "11. Droit de recours auprès de l'autorité de surveillance",
    content: `<p>Si vous estimez que vos droits en matière de protection des données ne sont pas respectés, vous avez le droit de déposer une plainte auprès de l'autorité suisse compétente.</p>`
  },

  section12: {
    title: "12. Mineurs",
    content: `<p>La Plateforme Felora est <strong>strictement réservée aux personnes majeures</strong> (18 ans ou plus).</p>`
  },

  section13: {
    title: "13. Cookies et technologies de suivi",
    content: `<p>Felora utilise des cookies et des technologies similaires. Pour plus d'informations, veuillez consulter notre <a href="/legal/cookies" class="text-pink-400 hover:text-pink-300">Politique de Cookies</a>.</p>`
  },

  section14: {
    title: "14. Données anonymisées et pseudonymisées",
    content: `<p>Dans le respect de votre vie privée, nous pouvons anonymiser ou pseudonymiser vos données pour des analyses statistiques.</p>`
  },

  section15: {
    title: "15. Modifications de la Déclaration de Protection des Données",
    content: `<p>Felora se réserve le droit de modifier ou de mettre à jour la présente Déclaration à tout moment.</p>`
  },

  section16: {
    title: "16. Contact pour toute question sur la protection des données",
    content: `<p>Pour toute question, vous pouvez nous contacter :</p>
<ul class="list-none space-y-2 mt-4">
  <li><strong>Par e-mail</strong> : <a href="mailto:info@felora.ch" class="text-pink-400 hover:text-pink-300">info@felora.ch</a></li>
</ul>`
  },

  section17: {
    title: "17. Acceptation de la Déclaration",
    content: `<p>En utilisant la Plateforme Felora, vous reconnaissez avoir lu, compris et accepté la présente Déclaration de Protection des Données.</p>`
  }
}

writeFileSync(frPath, JSON.stringify(fr, null, 2) + '\n', 'utf-8')
console.log('✅ Traductions Privacy FR ajoutées dans fr.json')
