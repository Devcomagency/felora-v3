// Compression vidéo côté client avec optimisation qualité/taille

export interface CompressionOptions {
  maxSizeMB: number
  maxWidthOrHeight: number
  quality: number
  maintainAspectRatio: boolean
}

export interface CompressionResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
  duration: number
}

export class VideoCompressor {
  private static instance: VideoCompressor

  static getInstance(): VideoCompressor {
    if (!VideoCompressor.instance) {
      VideoCompressor.instance = new VideoCompressor()
    }
    return VideoCompressor.instance
  }

  async compressVideo(
    file: File,
    options: Partial<CompressionOptions> = {}
  ): Promise<CompressionResult> {
    const defaultOptions: CompressionOptions = {
      maxSizeMB: 3.8, // Sous la limite Vercel de 4MB
      maxWidthOrHeight: 1080,
      quality: 0.8,
      maintainAspectRatio: true,
      ...options
    }

    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      video.addEventListener('loadedmetadata', async () => {
        try {
          const originalSize = file.size
          
          // Calculer nouvelles dimensions
          const { width, height } = this.calculateDimensions(
            video.videoWidth,
            video.videoHeight,
            defaultOptions.maxWidthOrHeight
          )
          
          canvas.width = width
          canvas.height = height
          
          // Configuration MediaRecorder avec optimisations
          const stream = canvas.captureStream(30) // 30 FPS
          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9', // VP9 pour meilleure compression
            videoBitsPerSecond: this.calculateBitrate(width, height, defaultOptions.quality)
          })
          
          const chunks: BlobPart[] = []
          let startTime = Date.now()
          
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data)
            }
          }
          
          mediaRecorder.onstop = async () => {
            const blob = new Blob(chunks, { type: 'video/webm' })
            const compressedSize = blob.size
            
            // Si toujours trop gros, réduire davantage la qualité
            if (compressedSize > defaultOptions.maxSizeMB * 1024 * 1024) {
              console.log('🔄 Fichier encore trop volumineux, compression supplémentaire...')
              const newOptions = {
                ...defaultOptions,
                quality: defaultOptions.quality * 0.7,
                maxWidthOrHeight: Math.floor(defaultOptions.maxWidthOrHeight * 0.9)
              }
              
              try {
                const result = await this.compressVideo(file, newOptions)
                resolve(result)
                return
              } catch (error) {
                reject(error)
                return
              }
            }
            
            const compressedFile = new File([blob], file.name, {
              type: 'video/webm',
              lastModified: Date.now()
            })
            
            resolve({
              file: compressedFile,
              originalSize,
              compressedSize,
              compressionRatio: Math.round((1 - compressedSize / originalSize) * 100),
              duration: Date.now() - startTime
            })
          }
          
          mediaRecorder.onerror = reject
          
          // Démarrer l'enregistrement
          mediaRecorder.start()
          
          // Dessiner chaque frame sur le canvas
          const drawFrame = () => {
            if (!video.paused && !video.ended) {
              ctx.drawImage(video, 0, 0, width, height)
              requestAnimationFrame(drawFrame)
            }
          }
          
          video.play()
          drawFrame()
          
          // Arrêter l'enregistrement quand la vidéo est finie
          video.onended = () => {
            mediaRecorder.stop()
          }
          
        } catch (error) {
          reject(error)
        }
      })
      
      video.onerror = reject
      video.src = URL.createObjectURL(file)
      video.load()
    })
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxDimension: number
  ): { width: number; height: number } {
    if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
      return { width: originalWidth, height: originalHeight }
    }
    
    const aspectRatio = originalWidth / originalHeight
    
    if (originalWidth > originalHeight) {
      return {
        width: maxDimension,
        height: Math.round(maxDimension / aspectRatio)
      }
    } else {
      return {
        width: Math.round(maxDimension * aspectRatio),
        height: maxDimension
      }
    }
  }
  
  private calculateBitrate(width: number, height: number, quality: number): number {
    // Calcul bitrate optimal selon résolution et qualité
    const pixelCount = width * height
    const baseRate = pixelCount * 0.1 // Base: 0.1 bits par pixel
    return Math.floor(baseRate * quality)
  }

  // Prévisualisation de la compression
  async previewCompression(file: File): Promise<{
    estimatedSize: number
    estimatedCompressionRatio: number
  }> {
    const video = document.createElement('video')
    
    return new Promise((resolve) => {
      video.addEventListener('loadedmetadata', () => {
        const { width, height } = this.calculateDimensions(
          video.videoWidth,
          video.videoHeight,
          1080
        )
        
        const estimatedBitrate = this.calculateBitrate(width, height, 0.8)
        const estimatedSize = (estimatedBitrate * video.duration) / 8 // Conversion en bytes
        const estimatedCompressionRatio = Math.round((1 - estimatedSize / file.size) * 100)
        
        resolve({
          estimatedSize: Math.min(estimatedSize, file.size), // Ne peut pas être plus gros
          estimatedCompressionRatio: Math.max(estimatedCompressionRatio, 0)
        })
      })
      
      video.src = URL.createObjectURL(file)
    })
  }
}

export const videoCompressor = VideoCompressor.getInstance()