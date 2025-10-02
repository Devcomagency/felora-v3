'use client'

import { useState } from 'react'
import { ArrowLeft, Video, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import SimpleUploader from '@/components/upload/SimpleUploader'
import HLSVideoPlayer from '@/components/video/HLSVideoPlayer'

interface TranscodedVideo {
  name: string
  assetId: string
  playbackId: string
  status: 'uploading' | 'transcoding' | 'ready' | 'failed'
}

export default function TestHLSPage() {
  const [videos, setVideos] = useState<TranscodedVideo[]>([])
  const [isPolling, setIsPolling] = useState(false)

  const handleUploadComplete = (files: any[]) => {
    console.log('📤 Fichiers uploadés:', files)

    // Ajouter les vidéos en attente de transcodage
    const newVideos = files
      .filter(f => f.assetId) // Seulement les vidéos
      .map(f => ({
        name: f.name,
        assetId: f.assetId,
        playbackId: f.playbackId,
        status: 'transcoding' as const
      }))

    setVideos(prev => [...prev, ...newVideos])

    // Démarrer le polling pour vérifier le statut
    newVideos.forEach(video => {
      pollTranscodeStatus(video.assetId)
    })
  }

  const pollTranscodeStatus = async (assetId: string) => {
    setIsPolling(true)
    let attempts = 0
    const maxAttempts = 60 // 5 minutes (toutes les 5 secondes)

    const poll = async () => {
      try {
        const response = await fetch(`/api/video/transcode?assetId=${assetId}`)
        if (!response.ok) throw new Error('Erreur API')

        const data = await response.json()
        console.log('📊 Statut transcodage:', data.asset.status, `(${data.asset.progress}%)`)

        // Mettre à jour le statut de la vidéo
        setVideos(prev =>
          prev.map(v =>
            v.assetId === assetId
              ? { ...v, status: data.asset.status === 'ready' ? 'ready' : 'transcoding' }
              : v
          )
        )

        // Si prêt ou échoué, arrêter le polling
        if (data.asset.status === 'ready' || data.asset.status === 'failed') {
          setIsPolling(false)
          return
        }

        // Continuer le polling
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000) // 5 secondes
        } else {
          setIsPolling(false)
        }
      } catch (error) {
        console.error('❌ Erreur polling:', error)
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000)
        } else {
          setIsPolling(false)
        }
      }
    }

    poll()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link
          href="/test-uppy"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Retour</span>
        </Link>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent mb-2">
          Test Pipeline Complet : Upload → Transcodage → HLS
        </h1>
        <p className="text-gray-400">
          Upload une vidéo → Livepeer transcoder → Lecture HLS adaptative
        </p>
      </div>

      {/* Uploader */}
      <div className="max-w-6xl mx-auto mb-12">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Video size={24} />
          1. Uploader une vidéo
        </h2>
        <SimpleUploader
          onComplete={handleUploadComplete}
          maxFileSize={500 * 1024 * 1024}
          allowedFileTypes={['video/*']}
        />
      </div>

      {/* Liste des vidéos en transcodage */}
      {videos.length > 0 && (
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-xl font-bold mb-4">
            2. Transcodage en cours {isPolling && <Loader2 className="inline animate-spin ml-2" size={20} />}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    video.status === 'transcoding'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {video.status === 'transcoding' ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <CheckCircle2 size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{video.name}</div>
                    <div className="text-sm text-gray-400">
                      {video.status === 'transcoding' ? 'Transcodage...' : 'Prêt !'}
                    </div>
                  </div>
                </div>

                {/* Preview HLS si prêt */}
                {video.status === 'ready' && video.playbackId && (
                  <div className="mt-4">
                    <HLSVideoPlayer
                      playbackId={video.playbackId}
                      title={video.name}
                      className="aspect-video"
                      controls={true}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="text-2xl mb-2">📤</div>
          <div className="font-medium mb-1">Upload tus</div>
          <div className="text-sm text-gray-400">
            Chunks 5MB + reprise auto
          </div>
        </div>

        <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
          <div className="text-2xl mb-2">🎬</div>
          <div className="font-medium mb-1">Livepeer</div>
          <div className="text-sm text-gray-400">
            Transcodage multi-qualité
          </div>
        </div>

        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <div className="text-2xl mb-2">📺</div>
          <div className="font-medium mb-1">HLS Adaptatif</div>
          <div className="text-sm text-gray-400">
            480p, 720p, 1080p auto
          </div>
        </div>

        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <div className="text-2xl mb-2">🔔</div>
          <div className="font-medium mb-1">Webhooks</div>
          <div className="text-sm text-gray-400">
            Notifications temps réel
          </div>
        </div>
      </div>
    </div>
  )
}
