export const metadata = { title: 'Conditions d’utilisation — Felora' }

export default function TermsPage(){
  return (
    <main className="max-w-3xl mx-auto p-6 text-white/90">
      <h1 className="text-2xl font-bold mb-3">Conditions d’utilisation</h1>
      <p className="mb-3">En utilisant Felora, vous acceptez ces conditions. Merci de les lire attentivement.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Compte & sécurité</h2>
      <p className="mb-2">Vous êtes responsable de la confidentialité de vos identifiants et des actions menées avec votre compte.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Contenus</h2>
      <p className="mb-2">Vous garantissez détenir les droits sur les contenus publiés et vous engagez à respecter les lois en vigueur.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Modération</h2>
      <p className="mb-2">Nous pouvons suspendre les comptes et supprimer des contenus non conformes à nos règles et à la loi.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
      <p>Support: <a className="underline" href="mailto:info@felora.ch">info@felora.ch</a></p>
    </main>
  )
}

