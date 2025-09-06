export const metadata = { title: 'Accès non autorisé — Felora' }

export default function UnauthorizedPage(){
  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6 text-white">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Accès non autorisé</h1>
        <p className="text-white/80 mb-4">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <div className="flex items-center justify-center gap-2">
          <a href="/login" className="px-3 py-2 rounded bg-white/10 hover:bg-white/15">Se connecter</a>
          <a href="/" className="px-3 py-2 rounded bg-gradient-to-r from-pink-500 to-purple-600">Retour à l'accueil</a>
        </div>
      </div>
    </main>
  )
}

