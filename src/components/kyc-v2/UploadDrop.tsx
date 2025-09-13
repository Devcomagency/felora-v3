"use client"
import { useCallback, useId, useState } from 'react'

export default function UploadDrop({ label, accept, maxMb = 20, onUploaded, onUploadedMeta }:{ label:string; accept:string; maxMb?:number; onUploaded:(url:string)=>void; onUploadedMeta?: (meta:{ url:string; key?: string })=>void }){
  const [error, setError] = useState<string|null>(null)
  const [busy, setBusy] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string|null>(null)
  const [previewUrl, setPreviewUrl] = useState<string|null>(null)
  const [compressing, setCompressing] = useState(false)
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
          // Réduire la résolution pour compression (max 720p)
          const { videoWidth: origWidth, videoHeight: origHeight } = video
          const maxWidth = 720
          const maxHeight = 720
          
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
            videoBitsPerSecond: 500000 // 500kbps - compression agressive
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

  const handle = useCallback(async (file: File) => {
    setError(null)
    if (!file) return
    if (accept && !accept.split(',').some(a => file.type.includes(a.trim()) || file.name.toLowerCase().endsWith(a.trim()))) {
      setError('Type de fichier non supporté'); return
    }
    if (file.size > maxMb * 1024 * 1024) { setError(`Max ${maxMb}MB`); return }
    
    // Create immediate preview from file
    const fileUrl = URL.createObjectURL(file)
    setPreviewUrl(fileUrl)
    
    const isVideo = file.type.startsWith('video/')
    let finalFile = file
    
    // Compresser la vidéo si elle est trop grosse
    if (isVideo && file.size > 25 * 1024 * 1024) {
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
      let d
      try {
        d = await r.json()
      } catch (jsonError) {
        // Si ce n'est pas du JSON, c'est probablement du HTML (erreur 500)
        const text = await r.text()
        console.error('Upload response not JSON:', r.status, text)
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

  return (
    <div className="space-y-2">
      <label className="text-sm text-white/80">{label}</label>
      <input type="file" className="hidden" id={inputId} accept={accept} onChange={e => e.target.files && handle(e.target.files[0])} />
      
      {/* Preview */}
      {previewUrl && (
        <div className="relative">
          {accept.includes('video/') ? (
            <video src={previewUrl} className="w-full h-32 object-cover rounded-lg border border-white/10" controls />
          ) : (
            <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-white/10" />
          )}
          <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
            {uploadedUrl ? '✓ Uploadé' : '⏳ Upload...'}
          </div>
        </div>
      )}
      
      <label htmlFor={inputId} onDragOver={e=>{e.preventDefault(); e.stopPropagation()}} onDrop={onDrop} className={`block p-4 rounded-xl border border-dashed border-white/20 bg-white/5 text-white/80 cursor-pointer hover:bg-white/10 transition-colors ${previewUrl ? 'h-16' : ''}`}>
        {compressing ? 'Compression vidéo...' : busy ? 'Upload…' : previewUrl ? 'Changer le fichier' : 'Glissez-déposez ou cliquez pour sélectionner'}
      </label>
      {error && <div className="text-red-400 text-sm">{error}</div>}
    </div>
  )
}
