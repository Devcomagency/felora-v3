import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md w-full">
        <h1 className="text-4xl font-bold text-white mb-6">
          Felora V3 Clean
        </h1>
        <p className="text-white/80 mb-8">
          Version propre avec logique médias corrigée
        </p>

        <div className="space-y-4">
          <Link
            href="/profile/test"
            className="block w-full py-3 px-6 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors"
          >
            Tester profil
          </Link>

          <div className="text-sm text-white/60">
            Photo profil = avatar uniquement<br/>
            Posts = grille uniquement
          </div>
        </div>
      </div>
    </div>
  )
}