'use client'

// Page d'accueil legacy de V3 (sans le design V2)
export default function OldHomePage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">FELORA V3</h1>
        <p className="text-gray-400 mb-8">Version de base (sans design V2)</p>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Pour activer le nouveau design, ajoutez le cookie : canary=1
          </p>
          <button 
            onClick={() => {
              document.cookie = 'canary=1; path=/; max-age=31536000'
              window.location.reload()
            }}
            className="px-6 py-3 bg-[#FF6B9D] text-white rounded-lg hover:bg-[#FF6B9D]/80 transition-colors"
          >
            Activer le nouveau design
          </button>
        </div>
      </div>
    </div>
  )
}
