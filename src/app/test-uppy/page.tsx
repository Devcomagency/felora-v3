'use client'

import { useState } from 'react'
import SimpleUploader from '@/components/upload/SimpleUploader'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TestUppyPage() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

  const handleComplete = (files: any[]) => {
    console.log('✅ Fichiers uploadés:', files)
    setUploadedFiles(prev => [...prev, ...files])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link
          href="/test-media-simple"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Retour</span>
        </Link>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
          Test Uppy + tus Protocol
        </h1>
        <p className="text-gray-400">
          Upload robuste avec reprise automatique, chunks 5MB, et retry progressif
        </p>
      </div>

      {/* Simple Uploader */}
      <div className="max-w-4xl mx-auto mb-8">
        <SimpleUploader
          onComplete={handleComplete}
          maxFileSize={500 * 1024 * 1024}
          allowedFileTypes={['video/*', 'image/*']}
        />
      </div>

      {/* Fichiers uploadés */}
      {uploadedFiles.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            ✅ Fichiers uploadés ({uploadedFiles.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    📹
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{file.name}</div>
                    <div className="text-sm text-gray-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                    <div className="text-xs text-green-400 mt-1">
                      ✓ Upload réussi
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="text-2xl mb-2">⏸️</div>
          <div className="font-medium mb-1">Pause/Reprise</div>
          <div className="text-sm text-gray-400">
            Upload reprend automatiquement après déconnexion
          </div>
        </div>

        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <div className="text-2xl mb-2">📦</div>
          <div className="font-medium mb-1">Chunks 5MB</div>
          <div className="text-sm text-gray-400">
            Upload par morceaux pour fiabilité maximale
          </div>
        </div>

        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="text-2xl mb-2">🔄</div>
          <div className="font-medium mb-1">Retry Auto</div>
          <div className="text-sm text-gray-400">
            Retry progressif: 0s, 1s, 3s, 5s, 10s
          </div>
        </div>
      </div>
    </div>
  )
}
