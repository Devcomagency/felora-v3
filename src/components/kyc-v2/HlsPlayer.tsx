"use client"
import { useEffect, useRef, useState } from 'react'

declare global { interface Window { Hls?: any } }

export default function HlsPlayer({ src, className = ''}:{ src: string; className?: string }){
  const ref = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      return
    }
    let hls: any
    const ensure = async () => {
      try {
        if (!window.Hls) {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement('script')
            s.src = '/vendor/hls.min.js'
            s.async = true
            s.onload = () => resolve()
            s.onerror = () => reject(new Error('hls.js introuvable'))
            document.body.appendChild(s)
          })
        }
        // @ts-ignore
        if (window.Hls?.isSupported()) {
          // @ts-ignore
          hls = new window.Hls()
          hls.loadSource(src)
          hls.attachMedia(video)
        } else {
          setError('HLS non supporté')
        }
      } catch (e:any) {
        setError(e?.message || 'Erreur HLS')
      }
    }
    ensure()
    return () => { try { hls?.destroy() } catch {} }
  }, [src])

  if (error) return <div className="text-red-400 text-sm">{error}</div>
  return <video ref={ref} controls className={`w-full rounded-lg ${className}`} />
}
