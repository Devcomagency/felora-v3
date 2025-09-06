export const metadata = { title: 'Politique cookies — Felora' }

export default function CookiesPage(){
  return (
    <main className="max-w-3xl mx-auto p-6 text-white/90">
      <h1 className="text-2xl font-bold mb-3">Politique cookies</h1>
      <p className="mb-3">Nous utilisons des cookies essentiels au fonctionnement du site et, avec votre accord, des cookies de mesure d'audience anonymisés.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Catégories</h2>
      <ul className="list-disc list-inside space-y-1 text-white/80">
        <li>Essentiels: authentification, sécurité, préférences.</li>
        <li>Mesure d'audience: statistiques anonymisées d'usage.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Gestion</h2>
      <p className="mb-2">Vous pouvez modifier vos préférences à tout moment depuis le bandeau cookies (ou supprimer les données du site dans votre navigateur).</p>
      <p>Contact: <a className="underline" href="mailto:info@felora.ch">info@felora.ch</a></p>
    </main>
  )
}

