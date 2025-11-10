/**
 * Compression vidéo côté client avec FFmpeg.wasm
 * Objectif : Réduire le temps d'encodage Bunny de 5 min à 1-2 min
 *
 * Optimisations :
 * - Résolution max : 1080p (au lieu de 4K)
 * - Bitrate : 2.5 Mbps (balance qualité/taille)
 * - Codec : H.264 (compatible partout)
 */

import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

let ffmpeg: FFmpeg | null = null
let ffmpegLoaded = false

/**
 * Initialiser FFmpeg (lazy loading)
 */
async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpegLoaded && ffmpeg) {
    return ffmpeg
  }

  ffmpeg = new FFmpeg()

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'

  // Charger les fichiers FFmpeg depuis CDN
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  })

  ffmpegLoaded = true
  console.log('✅ FFmpeg chargé')

  return ffmpeg
}

export interface VideoCompressionOptions {
  maxWidth?: number
  maxHeight?: number
  videoBitrate?: string
  audioBitrate?: string
  fps?: number
  preset?: 'ultrafast' | 'fast' | 'medium' | 'slow'
}

export interface VideoCompressionResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
  duration: number
}

/**
 * Compresser une vidéo pour upload plus rapide
 *
 * @param file Fichier vidéo original
 * @param options Options de compression
 * @returns Vidéo compressée
 */
export async function compressVideoIfNeeded(
  file: File,
  options: VideoCompressionOptions = {},
  onProgress?: (progress: number) => void
): Promise<VideoCompressionResult> {
  const startTime = Date.now()

  const {
    maxWidth = 1920,    // 1080p max
    maxHeight = 1080,
    videoBitrate = '2500k', // 2.5 Mbps
    audioBitrate = '128k',
    fps = 30,
    preset = 'fast' // Compromis vitesse/qualité
  } = options

  // Vérifier si compression nécessaire
  const fileSizeMB = file.size / 1024 / 1024

  // Si fichier < 20 MB et pas 4K, pas besoin de compresser
  if (fileSizeMB < 20) {
    console.log('📹 Vidéo déjà optimale, pas de compression nécessaire')
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0,
      duration: 0
    }
  }

  console.log(`🗜️ Compression vidéo (${fileSizeMB.toFixed(2)} MB)...`)

  try {
    // Charger FFmpeg
    const ffmpegInstance = await loadFFmpeg()

    // Écouter la progression
    ffmpegInstance.on('progress', ({ progress }) => {
      if (onProgress) {
        onProgress(Math.round(progress * 100))
      }
    })

    // Lire le fichier
    const inputData = await fetchFile(file)
    await ffmpegInstance.writeFile('input.mp4', inputData)

    // Commande FFmpeg optimisée pour compression rapide
    // -vf scale : Redimensionner en gardant le ratio
    // -c:v libx264 : Codec H.264
    // -preset fast : Rapide
    // -b:v : Bitrate vidéo
    // -c:a aac : Codec audio AAC
    // -b:a : Bitrate audio
    // -r : Framerate
    await ffmpegInstance.exec([
      '-i', 'input.mp4',
      '-vf', `scale='min(${maxWidth},iw)':'min(${maxHeight},ih)':force_original_aspect_ratio=decrease`,
      '-c:v', 'libx264',
      '-preset', preset,
      '-b:v', videoBitrate,
      '-maxrate', videoBitrate,
      '-bufsize', '5000k',
      '-c:a', 'aac',
      '-b:a', audioBitrate,
      '-r', fps.toString(),
      '-movflags', '+faststart', // Streaming optimisé
      'output.mp4'
    ])

    // Lire le résultat
    const outputData = await ffmpegInstance.readFile('output.mp4')
    const outputBlob = new Blob([outputData], { type: 'video/mp4' })
    const outputFile = new File([outputBlob], file.name, { type: 'video/mp4' })

    // Nettoyer
    await ffmpegInstance.deleteFile('input.mp4')
    await ffmpegInstance.deleteFile('output.mp4')

    const duration = Date.now() - startTime
    const compressionRatio = ((file.size - outputFile.size) / file.size) * 100

    console.log('✅ Vidéo compressée:', {
      original: `${fileSizeMB.toFixed(2)} MB`,
      compressed: `${(outputFile.size / 1024 / 1024).toFixed(2)} MB`,
      saved: `${compressionRatio.toFixed(1)}%`,
      duration: `${(duration / 1000).toFixed(1)}s`
    })

    return {
      file: outputFile,
      originalSize: file.size,
      compressedSize: outputFile.size,
      compressionRatio,
      duration
    }
  } catch (error: any) {
    console.error('❌ Erreur compression vidéo:', error)

    // En cas d'erreur, retourner la vidéo originale
    console.warn('⚠️ Utilisation de la vidéo originale sans compression')
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0,
      duration: 0
    }
  }
}
