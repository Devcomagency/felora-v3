import { useEffect, useRef } from 'react'

/**
 * Hook pour gérer la lecture HLS avec hls.js
 * @param videoRef - Référence vers l'élément video
 * @param url - URL de la vidéo (HLS .m3u8 ou MP4)
 * @param isActive - Si la vidéo est active/visible
 */
export function useHLS(
  videoRef: React.RefObject<HTMLVideoElement>,
  url: string,
  isActive: boolean
) {
  const hlsRef = useRef<any>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !url || !isActive) return

    console.log('🎬 useHLS triggered:', { url: url.substring(0, 60), isActive })

    // Détecter si c'est une vidéo HLS
    const isHLS = url.includes('.m3u8')

    if (isHLS) {
      // HLS - utiliser hls.js
      const loadHLS = async () => {
        // Import dynamique de hls.js
        const Hls = (await import('hls.js')).default

        if (Hls.isSupported()) {
          // Détruire l'instance précédente si elle existe
          if (hlsRef.current) {
            hlsRef.current.destroy()
          }

          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          })

          hlsRef.current = hls
          hls.loadSource(url)
          hls.attachMedia(video)

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('✅ HLS manifest parsed:', url.substring(0, 60))
          })

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.error('❌ HLS fatal error:', data)
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('🔄 Network error, trying to recover...')
                  hls.startLoad()
                  break
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('🔄 Media error, trying to recover...')
                  hls.recoverMediaError()
                  break
                default:
                  console.error('💥 Cannot recover')
                  hls.destroy()
                  break
              }
            }
          })
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Support natif HLS (Safari)
          console.log('🍎 Using native HLS support (Safari)')
          video.src = url
        }
      }

      loadHLS()
    } else {
      // MP4 classique
      console.log('🎥 Loading MP4 video:', url.substring(0, 60))
      video.src = url
    }

    // Cleanup
    return () => {
      if (hlsRef.current) {
        console.log('🧹 Cleaning up HLS instance')
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [url, videoRef, isActive])

  return hlsRef
}
