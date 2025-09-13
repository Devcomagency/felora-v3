"use client"
import { useCallback, useId, useState } from 'react'

export default function UploadDrop({ label, accept, maxMb = 20, onUploaded, onUploadedMeta }:{ label:string; accept:string; maxMb?:number; onUploaded:(url:string)=>void; onUploadedMeta?: (meta:{ url:string; key?: string })=>void }){
  const [error, setError] = useState<string|null>(null)
  const [busy, setBusy] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string|null>(null)
  const [previewUrl, setPreviewUrl] = useState<string|null>(null)
  const uid = useId()
  const inputId = `file-${uid}`

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
    
    const fd = new FormData()
    fd.append('file', file)
    setBusy(true)
    try {
      const r = await fetch('/api/kyc-v2/upload', { method:'POST', body: fd })
      const d = await r.json()
      if (!r.ok || !d?.url) throw new Error(d?.error || 'upload_failed')
      setUploadedUrl(d.url)
      onUploaded(d.url)
      try { onUploadedMeta?.({ url: d.url, key: d.key }) } catch {}
    } catch (e:any) { 
      setError(e?.message || 'Erreur upload')
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
          <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-white/10" />
          <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
            {uploadedUrl ? '✓ Uploadé' : '⏳ Upload...'}
          </div>
        </div>
      )}
      
      <label htmlFor={inputId} onDragOver={e=>{e.preventDefault(); e.stopPropagation()}} onDrop={onDrop} className={`block p-4 rounded-xl border border-dashed border-white/20 bg-white/5 text-white/80 cursor-pointer hover:bg-white/10 transition-colors ${previewUrl ? 'h-16' : ''}`}>
        {busy ? 'Upload…' : previewUrl ? 'Changer le fichier' : 'Glissez-déposez ou cliquez pour sélectionner'}
      </label>
      {error && <div className="text-red-400 text-sm">{error}</div>}
    </div>
  )
}
