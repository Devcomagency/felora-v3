"use client"
import { useEffect, useRef, useState } from 'react'

export default function CameraCapture({ onPhoto, onVideo }:{ onPhoto?:(blob:Blob)=>void; onVideo:(blob:Blob)=>void }){
  const videoRef = useRef<HTMLVideoElement>(null)
  const [rec, setRec] = useState<MediaRecorder|null>(null)
  const [stream, setStream] = useState<MediaStream|null>(null)
  const stopTimerRef = useRef<number | null>(null)
  const [countdown, setCountdown] = useState<number|null>(null)

  useEffect(() => {
    (async () => {
      try {
        // Demande portrait (9:16) en priorité
        const s = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 720 },
            height: { ideal: 1280 },
            aspectRatio: { ideal: 9/16 } as any,
          },
          audio: false,
        })
        setStream(s)
        if (videoRef.current) videoRef.current.srcObject = s
      } catch (e) {
        console.error('getUserMedia failed', e)
      }
    })()
    return () => { stream?.getTracks().forEach(t=>t.stop()) }
  }, [])

  const capturePhoto = async () => {
    try {
      if (!onPhoto) return
      if (!videoRef.current) return
      const v = videoRef.current
      const canvas = document.createElement('canvas')
      canvas.width = v.videoWidth
      canvas.height = v.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(v, 0, 0)
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(b => res(b), 'image/jpeg', 0.85))
      if (blob) onPhoto(blob)
    } catch (e) {
      console.error('capturePhoto failed', e)
    }
  }

  const startRecord = async () => {
    if (!stream) return
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : (MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : ''))
    if (!mime) { alert('Enregistrement non supporté, utilisez une capture iOS'); return }
    const mr = new MediaRecorder(stream, { mimeType: mime })
    const chunksLocal: Blob[] = []
    mr.ondataavailable = e => { if (e.data && e.data.size) chunksLocal.push(e.data) }
    mr.onstop = () => {
      const blob = new Blob(chunksLocal, { type: mime })
      setRec(null)
      onVideo(blob)
    }
    // Timeslice to ensure periodic dataavailable events
    mr.start(1000)
    setRec(mr)
    // 5s max (demande produit)
    if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current)
    stopTimerRef.current = window.setTimeout(()=>{ if (mr.state !== 'inactive') mr.stop() }, 5_000)
  }

  const stopRecord = () => {
    if (stopTimerRef.current) {
      window.clearTimeout(stopTimerRef.current)
      stopTimerRef.current = null
    }
    if (rec && rec.state !== 'inactive') rec.stop()
  }

  const startCountdown = () => {
    setCountdown(3)
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev && prev > 1) return prev - 1
        clearInterval(id)
        capturePhoto()
        return null
      })
    }, 1000)
  }

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/50" style={{ aspectRatio: '9 / 16' }}>
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        {/* Indication portrait */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/50 text-white text-xs">Tenez l’appareil en mode portrait</div>
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-5xl font-bold bg-black/40">{countdown}</div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={startCountdown} className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20">Photo</button>
        {rec ? (
          <button onClick={stopRecord} className="px-3 py-2 rounded-lg bg-red-600 text-white">Stop</button>
        ) : (
          <button onClick={startRecord} className="px-3 py-2 rounded-lg bg-pink-600 text-white">Vidéo 5s</button>
        )}
      </div>
    </div>
  )
}
