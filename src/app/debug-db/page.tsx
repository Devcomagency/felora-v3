"use client"
import { useEffect, useState } from 'react'

export default function DebugDB() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/debug/db-stats')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Chargement stats DB...</div>
  if (!stats) return <div className="p-8 text-red-400">Erreur chargement stats</div>

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">🔍 Debug Base de Données</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">👥 Utilisateurs</h2>
          <p className="text-3xl font-bold text-blue-400">{stats.users}</p>
          <p className="text-sm text-gray-400">Total inscrits</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">💃 Escorts</h2>
          <p className="text-3xl font-bold text-pink-400">{stats.escorts}</p>
          <p className="text-sm text-gray-400">Profils escort</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">🏢 Salons</h2>
          <p className="text-3xl font-bold text-purple-400">{stats.salons}</p>
          <p className="text-sm text-gray-400">Profils salon</p>
        </div>
      </div>
      
      <div className="mt-8 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">📊 Détails</h2>
        <pre className="text-sm text-gray-300 overflow-auto">
          {JSON.stringify(stats, null, 2)}
        </pre>
      </div>
      
      <div className="mt-6 bg-blue-900 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">🔗 Variables détectées:</h3>
        <p><strong>DATABASE_URL:</strong> {stats.dbUrl ? 'Configurée' : 'Manquante'}</p>
        <p><strong>PRISMA_DATABASE_URL:</strong> {stats.prismaUrl ? 'Configurée' : 'Manquante'}</p>
      </div>
    </div>
  )
}
