export const metadata = { title: 'Politique de confidentialité — Felora' }

export default function PrivacyPage(){
  return (
    <main className="max-w-3xl mx-auto p-6 text-white/90">
      <h1 className="text-2xl font-bold mb-3">Politique de confidentialité</h1>
      <p className="mb-3">Felora respecte votre vie privée. Cette politique décrit les données que nous collectons, l'usage que nous en faisons, et vos droits.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Données collectées</h2>
      <ul className="list-disc list-inside space-y-1 text-white/80">
        <li>Données de compte (email, rôle, préférences)</li>
        <li>Contenus fournis (médias, messages, informations de profil)</li>
        <li>Logs techniques (adresses IP, événements de sécurité)</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Usage</h2>
      <p className="mb-2">Nous utilisons ces données pour fournir nos services (messagerie, profils, vérification), assurer la sécurité, et améliorer l'expérience utilisateur.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Conservation</h2>
      <p className="mb-2">Les données sont conservées pour la durée nécessaire aux finalités décrites ou jusqu'à la demande de suppression, conformément aux lois applicables.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
      <p>Pour exercer vos droits RGPD/LPD: <a className="underline" href="mailto:info@felora.ch">info@felora.ch</a></p>
    </main>
  )
}

