import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'

const execAsync = promisify(exec)

/**
 * Vérifie si une vidéo est en HEVC/H.265
 */
export async function isHEVCVideo(filePath: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
    )
    const codec = stdout.trim().toLowerCase()
    return codec === 'hevc' || codec === 'h265'
  } catch (error) {
    console.error('❌ Erreur vérification codec:', error)
    return false
  }
}

/**
 * Convertit une vidéo HEVC vers H.264 pour compatibilité navigateur
 */
export async function convertToH264(inputBuffer: Buffer): Promise<Buffer> {
  const tmpDir = os.tmpdir()
  const inputPath = path.join(tmpDir, `input-${Date.now()}-${Math.random().toString(36).slice(2)}.mp4`)
  const outputPath = path.join(tmpDir, `output-${Date.now()}-${Math.random().toString(36).slice(2)}.mp4`)

  try {
    // Écrire le buffer d'entrée dans un fichier temporaire
    await fs.writeFile(inputPath, inputBuffer)

    console.log('🎬 Vérification du codec vidéo...')
    const isHEVC = await isHEVCVideo(inputPath)

    if (!isHEVC) {
      console.log('✅ Vidéo déjà en H.264, pas de conversion nécessaire')
      // Retourner le buffer original si déjà en H.264
      await fs.unlink(inputPath)
      return inputBuffer
    }

    console.log('🔄 Conversion HEVC → H.264 en cours...')

    // Convertir avec ffmpeg
    // -c:v libx264 : codec H.264
    // -preset fast : équilibre vitesse/qualité
    // -crf 23 : qualité (0-51, 23 = bonne qualité)
    // -c:a aac : audio AAC compatible
    // -movflags +faststart : optimisation web (metadata au début)
    const ffmpegCommand = `ffmpeg -i "${inputPath}" \
      -c:v libx264 \
      -preset fast \
      -crf 23 \
      -pix_fmt yuv420p \
      -c:a aac \
      -b:a 128k \
      -movflags +faststart \
      -y "${outputPath}"`

    await execAsync(ffmpegCommand)

    console.log('✅ Conversion terminée')

    // Lire le fichier converti
    const convertedBuffer = await fs.readFile(outputPath)

    // Nettoyer les fichiers temporaires
    await fs.unlink(inputPath).catch(() => {})
    await fs.unlink(outputPath).catch(() => {})

    return convertedBuffer

  } catch (error) {
    console.error('❌ Erreur conversion vidéo:', error)

    // Nettoyer en cas d'erreur
    await fs.unlink(inputPath).catch(() => {})
    await fs.unlink(outputPath).catch(() => {})

    // En cas d'erreur, retourner le buffer original
    // L'utilisateur verra une erreur de lecture plutôt qu'un échec d'upload
    return inputBuffer
  }
}

/**
 * Génère une thumbnail d'une vidéo
 */
export async function generateVideoThumbnail(videoBuffer: Buffer): Promise<Buffer | null> {
  const tmpDir = os.tmpdir()
  const inputPath = path.join(tmpDir, `video-${Date.now()}-${Math.random().toString(36).slice(2)}.mp4`)
  const outputPath = path.join(tmpDir, `thumb-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`)

  try {
    // Écrire la vidéo dans un fichier temporaire
    await fs.writeFile(inputPath, videoBuffer)

    console.log('📸 Génération de la thumbnail...')

    // Extraire une frame à 1 seconde (ou au début si < 1s)
    const ffmpegCommand = `ffmpeg -i "${inputPath}" \
      -ss 00:00:01.000 \
      -vframes 1 \
      -vf "scale=360:-1" \
      -y "${outputPath}"`

    await execAsync(ffmpegCommand)

    console.log('✅ Thumbnail générée')

    // Lire l'image générée
    const thumbBuffer = await fs.readFile(outputPath)

    // Nettoyer les fichiers temporaires
    await fs.unlink(inputPath).catch(() => {})
    await fs.unlink(outputPath).catch(() => {})

    return thumbBuffer

  } catch (error) {
    console.error('❌ Erreur génération thumbnail:', error)

    // Nettoyer en cas d'erreur
    await fs.unlink(inputPath).catch(() => {})
    await fs.unlink(outputPath).catch(() => {})

    return null
  }
}
