import React from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Navigation admin */}
      <nav className="border-b border-gray-700 bg-black/50 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Felora Admin</h1>
                  <p className="text-xs text-gray-400">Interface d'administration</p>
                </div>
              </div>

              <div className="flex gap-6">
                <a 
                  href="/admin/comments"
                  className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                  📝 Commentaires
                </a>
                <a 
                  href="/admin/users"
                  className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                  👥 Utilisateurs
                </a>
                <a 
                  href="/admin/reports"
                  className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                  ⚠️ Signalements
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-white">Admin</div>
                <div className="text-xs text-gray-400">Connecté</div>
              </div>
              
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">A</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu */}
      <main>
        {children}
      </main>
    </div>
  )
}