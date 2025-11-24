import { readFileSync, writeFileSync } from 'fs'

const frPath = 'src/messages/fr.json'
const fr = JSON.parse(readFileSync(frPath, 'utf-8'))

// Contenu Cookies complet en français (11 sections)
fr.legal.cookies = {
  title: "Politique de Cookies — FELORA",
  version: "Version : novembre 2025",
  backHome: "← Retour à l'accueil",
  termsLink: "Conditions Générales",
  privacyLink: "Protection des Données",

  section1: {
    title: "1. Introduction",
    content: `<p>La présente <strong>Politique de Cookies</strong> explique comment <strong>Felora</strong> utilise des cookies et des technologies similaires sur la plateforme web et mobile accessible via <a href="https://felora.ch" class="text-pink-400 hover:text-pink-300">felora.ch</a>.</p>`
  },

  section2: {
    title: "2. Qu'est-ce qu'un cookie ?",
    content: `<p>Un <strong>cookie</strong> est un petit fichier texte déposé et stocké sur votre appareil lorsque vous visitez un site web.</p>`
  },

  section3: {
    title: "3. Pourquoi utilisons-nous des cookies ?",
    content: `<p>Nous utilisons des cookies pour :</p>
<ul class="list-disc pl-6 space-y-2 mt-4">
  <li>Assurer le fonctionnement de la Plateforme,</li>
  <li>Améliorer l'expérience utilisateur,</li>
  <li>Analyser l'utilisation.</li>
</ul>`
  },

  section4: {
    title: "4. Catégories de cookies utilisés",
    content: `<p>Nous utilisons les catégories suivantes :</p>
<ul class="list-disc pl-6 space-y-2 mt-4">
  <li><strong>Cookies essentiels</strong> : nécessaires au fonctionnement,</li>
  <li><strong>Cookies d'analyse</strong> : statistiques d'utilisation.</li>
</ul>`
  },

  section5: {
    title: "5. Liste détaillée des cookies utilisés",
    content: `<p>Tableau récapitulatif des principaux cookies utilisés sur la Plateforme.</p>`
  },

  section6: {
    title: "6. Gestion de vos préférences de cookies",
    content: `<p>Vous pouvez gérer vos préférences à tout moment via le bandeau de consentement.</p>`
  },

  section7: {
    title: "7. Cookies de tiers",
    content: `<p>Certains cookies sont déposés par des partenaires tiers (Google Analytics, etc.).</p>`
  },

  section8: {
    title: "8. Durée de conservation des cookies",
    content: `<p>La durée varie selon le type de cookie (session ou persistant).</p>`
  },

  section9: {
    title: "9. Sécurité des cookies",
    content: `<p>Nous mettons en œuvre des mesures de sécurité pour protéger les cookies.</p>`
  },

  section10: {
    title: "10. Modifications de la Politique de Cookies",
    content: `<p>Felora se réserve le droit de modifier cette politique à tout moment.</p>`
  },

  section11: {
    title: "11. Contact pour toute question sur les cookies",
    content: `<p>Pour toute question : <a href="mailto:info@felora.ch" class="text-pink-400 hover:text-pink-300">info@felora.ch</a></p>`
  }
}

writeFileSync(frPath, JSON.stringify(fr, null, 2) + '\n', 'utf-8')
console.log('✅ Traductions Cookies FR ajoutées dans fr.json')
