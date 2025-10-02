'use client'

import { useEffect, useRef } from 'react'
import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import Dashboard from '@uppy/dashboard'

interface UppyUploaderProps {
  onComplete?: (files: any[]) => void
  maxFileSize?: number
  allowedFileTypes?: string[]
  endpoint?: string
}

export default function UppyUploader({
  onComplete,
  maxFileSize = 500 * 1024 * 1024, // 500MB par défaut
  allowedFileTypes = ['video/*', 'image/*'],
  endpoint = '/api/upload/tus'
}: UppyUploaderProps) {
  const uppyRef = useRef<Uppy | null>(null)
  const dashboardRef = useRef<Dashboard | null>(null)

  useEffect(() => {
    // Créer l'instance Uppy
    const uppy = new Uppy({
      restrictions: {
        maxFileSize,
        allowedFileTypes,
        maxNumberOfFiles: 10
      },
      autoProceed: false
    })

    // Ajouter le plugin tus pour upload robuste
    uppy.use(Tus, {
      endpoint,
      retryDelays: [0, 1000, 3000, 5000, 10000], // Retry progressif
      chunkSize: 5 * 1024 * 1024, // 5MB chunks
      removeFingerprintOnSuccess: true,
      headers: {
        'Accept': 'application/json'
      }
    })

    // Events
    uppy.on('complete', (result) => {
      console.log('✅ Upload complet:', result)
      if (onComplete && result.successful) {
        onComplete(result.successful)
      }
    })

    uppy.on('upload-progress', (file, progress) => {
      if (progress.bytesTotal) {
        const percentage = Math.round((progress.bytesUploaded / progress.bytesTotal) * 100)
        console.log(`📊 ${file?.name}: ${percentage}%`)
      }
    })

    uppy.on('upload-error', (file, error) => {
      console.error('❌ Erreur upload:', file?.name, error)
    })

    uppyRef.current = uppy

    return () => {
      if (dashboardRef.current) {
        // @ts-ignore - Dashboard cleanup
        dashboardRef.current.uninstall?.()
      }
      // @ts-ignore - Uppy close method
      uppy.close?.()
    }
  }, [maxFileSize, allowedFileTypes, endpoint, onComplete])

  useEffect(() => {
    if (uppyRef.current && !dashboardRef.current) {
      const dashboard = new Dashboard(uppyRef.current, {
        target: '#uppy-dashboard',
        inline: true,
        proudlyDisplayPoweredByUppy: false,
        theme: 'dark',
        height: 450,
        note: 'Vidéos et images uniquement, max 500MB par fichier'
      })
      dashboardRef.current = dashboard
    }
  }, [uppyRef.current])

  return (
    <div className="uppy-wrapper">
      <div id="uppy-dashboard"></div>

      <style jsx global>{`
        .uppy-Dashboard {
          background: linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          backdrop-filter: blur(20px);
        }

        .uppy-Dashboard-inner {
          background: transparent;
        }

        .uppy-Dashboard-AddFiles {
          border: 2px dashed rgba(139, 92, 246, 0.3);
          border-radius: 12px;
          background: rgba(139, 92, 246, 0.05);
        }

        .uppy-Dashboard-AddFiles:hover {
          border-color: rgba(139, 92, 246, 0.6);
          background: rgba(139, 92, 246, 0.1);
        }

        .uppy-StatusBar {
          background: rgba(139, 92, 246, 0.1);
          border-top: 1px solid rgba(139, 92, 246, 0.2);
        }

        .uppy-StatusBar-progress {
          background: linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%);
        }
      `}</style>
    </div>
  )
}
