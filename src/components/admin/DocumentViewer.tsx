'use client'

import { useState } from 'react'
import { X, ZoomIn, ZoomOut, Download, Eye } from 'lucide-react'
import Image from 'next/image'

interface DocumentViewerProps {
  documents: Array<{
    url: string | null
    label: string
    type: 'front' | 'back' | 'selfie' | 'video'
  }>
}

export default function DocumentViewer({ documents }: DocumentViewerProps) {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [selectedDocType, setSelectedDocType] = useState<'image' | 'video'>('image')
  const [zoom, setZoom] = useState(100)

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Erreur téléchargement:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Grille des documents */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {documents.map((doc, index) => {
          if (!doc.url) return null

          return (
            <div key={index} className="relative group">
              <div className="aspect-[3/4] rounded-lg overflow-hidden border border-white/10 bg-white/5">
                {doc.type === 'video' ? (
                  <video
                    src={doc.url}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={doc.url}
                    alt={doc.label}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Overlay avec actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setSelectedDoc(doc.url)
                    setSelectedDocType(doc.type === 'video' ? 'video' : 'image')
                  }}
                  className="p-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
                  title="Voir en grand"
                >
                  <Eye size={20} className="text-white" />
                </button>
                <button
                  onClick={() => handleDownload(doc.url!, `${doc.label}.jpg`)}
                  className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                  title="Télécharger"
                >
                  <Download size={20} className="text-white" />
                </button>
              </div>

              {/* Label */}
              <div className="mt-2 text-sm text-white/70 text-center">{doc.label}</div>
            </div>
          )
        })}
      </div>

      {/* Modal d'agrandissement */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
          {/* Header avec contrôles */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm border-b border-white/10 p-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 25))}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Dézoomer"
                >
                  <ZoomOut size={20} className="text-white" />
                </button>
                <span className="text-white text-sm font-medium">{zoom}%</span>
                <button
                  onClick={() => setZoom(Math.min(300, zoom + 25))}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Zoomer"
                >
                  <ZoomIn size={20} className="text-white" />
                </button>
                <button
                  onClick={() => setZoom(100)}
                  className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors text-white"
                >
                  Réinitialiser
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedDoc(null)
                  setZoom(100)
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Fermer"
              >
                <X size={24} className="text-white" />
              </button>
            </div>
          </div>

          {/* Media zoomable (image ou vidéo) */}
          <div className="w-full h-full flex items-center justify-center overflow-auto pt-20">
            {selectedDocType === 'video' ? (
              <video
                src={selectedDoc}
                controls
                className="max-w-full max-h-full transition-transform"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'center center'
                }}
              />
            ) : (
              <img
                src={selectedDoc}
                alt="Document agrandi"
                className="max-w-none transition-transform"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'center center'
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
