'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'

export default function UploadTestPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
      setError('')
    }
  }

  const testUpload = async () => {
    if (!file) return

    setUploading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE')
      formData.append('visibility', 'PUBLIC')

      console.log('🧪 TEST: Envoi vers debug API...')

      const response = await fetch('/api/debug/media-upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        console.log('✅ TEST: Succès!', data)
      } else {
        setError(data.error || 'Erreur inconnue')
        console.error('❌ TEST: Erreur', data)
      }
    } catch (error) {
      console.error('❌ TEST: Exception', error)
      setError(error instanceof Error ? error.message : 'Erreur réseau')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">🧪 Test Upload Médias</h1>

        <div className="space-y-6">
          {/* File Input */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Sélectionner un fichier</h2>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
            {file && (
              <div className="mt-2 text-sm text-gray-400">
                📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="bg-gray-800 rounded-lg p-6">
            <button
              onClick={testUpload}
              disabled={!file || uploading}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Upload size={20} />
              <span>{uploading ? 'Test en cours...' : 'Tester Upload'}</span>
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-green-400 mb-4">✅ Succès!</h2>
              <pre className="text-sm text-green-300 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-400 mb-4">❌ Erreur</h2>
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">📋 Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Sélectionnez une image ou vidéo (max 4MB)</li>
              <li>Cliquez sur "Tester Upload"</li>
              <li>Vérifiez les logs dans la console du navigateur</li>
              <li>Vérifiez les logs serveur dans le terminal</li>
            </ol>
            
            <div className="mt-4 p-4 bg-gray-700 rounded">
              <p className="text-sm text-yellow-300">
                💡 Cette page utilise l'API de debug /api/debug/media-upload
                avec des logs détaillés pour diagnostiquer les problèmes d'upload.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}