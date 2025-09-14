"use client"
import { useCallback, useId, useState } from 'react'
import { CheckCircle, AlertCircle, Image, Video, FileText, HelpCircle, X, Check, BadgeCheck } from 'lucide-react'

interface UploadDropProps {
  label: string
  accept: string
  maxMb?: number
  onUploaded: (url: string) => void
  onUploadedMeta?: (meta: { url: string; key?: string }) => void
  exampleImage?: string
  requirements?: string[]
  tips?: string[]
  isRequired?: boolean
}

export default function UploadDrop({ 
  label, 
  accept, 
  maxMb = 3, // Compatible Vercel (3MB max) 
  onUploaded, 
  onUploadedMeta,
  exampleImage,
  requirements = [],
  tips = [
    'Compressez vos fichiers avant upload (max 3MB)',
    'Utilisez des outils comme TinyPNG ou HandBrake',
    'Pour les vidéos: réduisez la résolution à 720p max'
  ],
  isRequired = false
}: UploadDropProps){
  const [error, setError] = useState<string|null>(null)
  const [busy, setBusy] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string|null>(null)
  const [previewUrl, setPreviewUrl] = useState<string|null>(null)
  const [compressing, setCompressing] = useState(false)
  const [showExample, setShowExample] = useState(false)
  const uid = useId()
  const inputId = `file-${uid}`

  // Compresseur vidéo efficace pour mobile
  const compressVideo = useCallback(async (file: File): Promise<File> => {
    if (!file.type.startsWith('video/')) return file
    
    return new Promise((resolve) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        resolve(file)
        return
      }

      video.onloadedmetadata = () => {
        try {
          // Réduire la résolution pour compression (max 480p pour 4MB)
          const { videoWidth: origWidth, videoHeight: origHeight } = video
          const maxWidth = 854  // 480p large
          const maxHeight = 480 // 480p
          
          let width = origWidth
          let height = origHeight
          
          // Calculer la nouvelle taille en gardant le ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width = Math.round(width * ratio)
            height = Math.round(height * ratio)
          }
          
          canvas.width = width
          canvas.height = height
          
          // Créer un stream depuis le canvas
          const stream = canvas.captureStream(30) // 30 FPS
          
          // Utiliser MediaRecorder pour compresser
          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp8',
            videoBitsPerSecond: 200000 // 200kbps - compression très agressive pour 4MB
          })
          
          const chunks: Blob[] = []
          
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data)
            }
          }
          
          mediaRecorder.onstop = () => {
            const compressedBlob = new Blob(chunks, { type: 'video/webm' })
            
            // Vérifier si la compression a réduit la taille
            if (compressedBlob.size < file.size) {
              const compressedFile = new File(
                [compressedBlob], 
                file.name.replace(/\.[^/.]+$/, '.webm'), 
                { type: 'video/webm', lastModified: Date.now() }
              )
              resolve(compressedFile)
            } else {
              resolve(file) // Pas de gain, garder l'original
            }
          }
          
          // Dessiner chaque frame du video sur le canvas
          const drawFrame = () => {
            if (video.ended || video.paused) {
              mediaRecorder.stop()
              return
            }
            
            ctx.drawImage(video, 0, 0, width, height)
            requestAnimationFrame(drawFrame)
          }
          
          // Démarrer l'enregistrement
          mediaRecorder.start(1000) // Chunk toutes les 1s
          video.play()
          drawFrame()
          
        } catch (error) {
          console.log('Video compression failed:', error)
          resolve(file)
        }
      }
      
      video.onerror = () => resolve(file)
      video.src = URL.createObjectURL(file)
      video.muted = true
      video.load()
    })
  }, [])

  const matchesAccept = (file: File, accept: string) => {
    if (!accept) return true
    const tokens = accept.split(',').map(t => t.trim()).filter(Boolean)
    return tokens.some(tok => {
      if (tok.endsWith('/*')) {
        const prefix = tok.slice(0, -1) // 'image/'
        return file.type.startsWith(prefix)
      }
      if (tok.includes('/')) {
        return file.type === tok || file.type.includes(tok)
      }
      if (tok.startsWith('.')) {
        return file.name.toLowerCase().endsWith(tok.toLowerCase())
      }
      // Fallback: substring match
      return file.type.includes(tok)
    })
  }

  const handle = useCallback(async (file: File) => {
    setError(null)
    if (!file) return
    if (accept && !matchesAccept(file, accept)) {
      setError('Type de fichier non supporté'); return
    }
    
    const isVideo = file.type.startsWith('video/')
    
    // Pour les vidéos, on permet jusqu'à 200MB avant compression
    // Pour les images, on garde la limite stricte
    const initialMaxMb = isVideo ? 200 : maxMb
    if (file.size > initialMaxMb * 1024 * 1024) { 
      setError(`Fichier trop volumineux. Max ${initialMaxMb}MB${isVideo ? ' (sera comprimé automatiquement)' : ''}`); 
      return 
    }
    
    // Create immediate preview from file
    const fileUrl = URL.createObjectURL(file)
    setPreviewUrl(fileUrl)
    
    let finalFile = file
    
    // Compresser la vidéo si elle est trop grosse (limite Vercel: 4MB)
    if (isVideo && file.size > 4 * 1024 * 1024) {
      setCompressing(true)
      setError('Compression de la vidéo en cours...')
      try {
        finalFile = await compressVideo(file)
        setError(null)
        console.log(`Video compressed: ${file.size} → ${finalFile.size} bytes`)
      } catch (e) {
        console.log('Compression failed, trying with original file')
        setError(null)
      }
      setCompressing(false)
    }
    
    // Vérification finale de taille
    const videoMaxMb = isVideo ? 25 : maxMb
    if (finalFile.size > videoMaxMb * 1024 * 1024) {
      setError(`Fichier encore trop volumineux après compression. Max ${videoMaxMb}MB pour ${isVideo ? 'vidéos' : 'images'}`)
      if (fileUrl) URL.revokeObjectURL(fileUrl)
      setPreviewUrl(null)
      return
    }
    
    const fd = new FormData()
    fd.append('file', finalFile)
    setBusy(true)
    try {
      const r = await fetch('/api/kyc-v2/upload', { method:'POST', body: fd })
      
      // Lire la réponse une seule fois
      const responseText = await r.text()
      let d
      
      try {
        d = JSON.parse(responseText)
      } catch (jsonError) {
        // Si ce n'est pas du JSON, c'est probablement du HTML (erreur 500)
        console.error('Upload response not JSON:', r.status, responseText)
        throw new Error(`Server error ${r.status}`)
      }
      if (!r.ok || !d?.url) throw new Error(d?.error || 'upload_failed')
      setUploadedUrl(d.url)
      onUploaded(d.url)
      try { onUploadedMeta?.({ url: d.url, key: d.key }) } catch {}
    } catch (e:any) { 
      setError(e?.message || 'Erreur upload')
      console.error('Upload error:', e)
      // Clean up preview on error
      if (fileUrl) URL.revokeObjectURL(fileUrl)
      setPreviewUrl(null)
    } finally { setBusy(false) }
  }, [accept, maxMb, onUploaded])

  const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const f = e.dataTransfer?.files?.[0]
    if (f) handle(f)
  }, [handle])

  const isVideo = accept.includes('video/')
  const isImage = accept.includes('image/')
  
  return (
    <div className="space-y-2">
      {/* Header compact avec aide */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm text-white/90 font-medium">{label}</label>
          {isRequired && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Requis</span>}
          {exampleImage && (
            <button
              onClick={(e) => {
                e.preventDefault()
                setShowExample(!showExample)
              }}
              className="text-white/60 hover:text-white/80 transition-colors"
              title="Voir l'exemple"
            >
              <HelpCircle size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {uploadedUrl && <BadgeCheck size={16} className="text-green-400" />}
          {error && <AlertCircle size={16} className="text-red-400" />}
        </div>
      </div>

      {/* Zone d'upload avec exemple intégré */}
      <input type="file" className="hidden" id={inputId} accept={accept} onChange={e => e.target.files && handle(e.target.files[0])} />
      
      <label 
        htmlFor={inputId} 
        onDragOver={e=>{e.preventDefault(); e.stopPropagation()}} 
        onDrop={onDrop} 
        className={`group block p-4 rounded-xl border-2 border-dashed transition-all duration-200 ${
          uploadedUrl 
            ? 'border-green-500/50 bg-green-500/5' 
            : error 
            ? 'border-red-500/50 bg-red-500/5' 
            : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
        } cursor-pointer relative`}
      >
        {/* Exemple intégré dans la zone d'upload */}
        {exampleImage && !previewUrl && showExample && (
          <div className="absolute inset-0 p-4">
            <div className="relative w-full h-full rounded-lg overflow-hidden">
              <img 
                src={exampleImage} 
                alt={`Exemple ${label}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-2 left-2 text-white text-xs font-medium">
                Exemple
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setShowExample(false)
                }}
                className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Preview du fichier uploadé */}
        {previewUrl && (
          <div className="relative w-full h-32 rounded-lg overflow-hidden">
            {isVideo ? (
              <video src={previewUrl} className="w-full h-full object-cover" controls />
            ) : (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            )}
            <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs flex items-center gap-1">
              {uploadedUrl ? (
                <>
                  <Check size={12} className="text-green-400" />
                  Uploadé
                </>
              ) : (
                <>
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  Upload...
                </>
              )}
            </div>
          </div>
        )}

        {/* Contenu par défaut */}
        {!previewUrl && !(showExample && exampleImage) && (
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
              {isVideo ? <Video size={24} className="text-white/80" /> : 
               isImage ? <Image size={24} className="text-white/80" /> : 
               <FileText size={24} className="text-white/80" />}
            </div>
            
            <div className="space-y-1">
              <p className="text-white/90 font-medium text-sm">
                {compressing ? 'Compression vidéo...' : 
                 busy ? 'Upload en cours...' : 
                 'Glissez-déposez ou cliquez pour sélectionner'}
              </p>
        <p className="text-white/60 text-xs">
          {isVideo ? `Vidéo (compression automatique si >4MB)` : `Image (max ${maxMb}MB)`}
        </p>
            </div>
          </div>
        )}
      </label>

      {/* Aide compacte */}
      {(requirements.length > 0 || tips.length > 0) && showExample && (
        <div className="p-3 bg-black/20 rounded-lg border border-white/5 text-xs space-y-2">
          {requirements.length > 0 && (
            <div>
              <h5 className="text-white/80 font-medium mb-1">Exigences :</h5>
              <ul className="space-y-1">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-white/60">
                    <div className="w-1 h-1 bg-white/40 rounded-full mt-2 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {tips.length > 0 && (
            <div>
              <h5 className="text-white/80 font-medium mb-1">💡 Conseils :</h5>
              <ul className="space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-white/60">
                    <div className="w-1 h-1 bg-yellow-400/60 rounded-full mt-2 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {error && <div className="text-red-400 text-sm">{error}</div>}
    </div>
  )
}
