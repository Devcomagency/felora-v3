'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const PublishMediaEditor = dynamic(() => import('@/components/media/PublishMediaEditor'), {
  ssr: false
})

export default function TestPublishPage() {
  const router = useRouter()
  const [demoFile, setDemoFile] = useState<File | null>(null)
  const [demoUrl, setDemoUrl] = useState<string>('')

  useEffect(() => {
    // Créer un fichier de démo pour tester
    const createDemoFile = async () => {
      // Créer une image de test
      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 600
      const ctx = canvas.getContext('2d')

      if (ctx) {
        // Fond dégradé
        const gradient = ctx.createLinearGradient(0, 0, 800, 600)
        gradient.addColorStop(0, '#FF6B9D')
        gradient.addColorStop(1, '#B794F6')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 800, 600)

        // Texte
        ctx.fillStyle = 'white'
        ctx.font = 'bold 60px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Test Image', 400, 300)
      }

      // Convertir en Blob puis File
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'test-image.jpg', { type: 'image/jpeg' })
          const url = URL.createObjectURL(file)
          setDemoFile(file)
          setDemoUrl(url)
        }
      }, 'image/jpeg')
    }

    createDemoFile()

    return () => {
      if (demoUrl) {
        URL.revokeObjectURL(demoUrl)
      }
    }
  }, [])

  const handlePublish = async (data: {
    file: File
    description: string
    location: string
    visibility: 'public' | 'private' | 'premium'
    price?: number
  }) => {
    console.log('📤 Données de publication:', {
      fileName: data.file.name,
      description: data.description,
      location: data.location,
      visibility: data.visibility,
      price: data.price
    })

    // Simuler un upload
    await new Promise(resolve => setTimeout(resolve, 2000))

    alert(`✅ Publié avec succès !\n\nVisibilité: ${data.visibility}\nDescription: ${data.description}\nLieu: ${data.location}${data.price ? '\nPrix: ' + data.price + ' CHF' : ''}`)

    router.push('/')
  }

  if (!demoFile || !demoUrl) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    )
  }

  return (
    <PublishMediaEditor
      mediaFile={demoFile}
      mediaUrl={demoUrl}
      mediaType="image"
      onClose={() => router.push('/')}
      onPublish={handlePublish}
    />
  )
}
