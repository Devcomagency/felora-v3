/**
 * Script pour convertir toutes les vidéos HEVC en H.264
 * Usage: npx tsx scripts/convert-hevc-videos.ts
 */

import { PrismaClient } from '@prisma/client'
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { convertToH264, generateVideoThumbnail } from '../src/lib/video-converter'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const prisma = new PrismaClient()

// Configuration R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY || '',
  },
})

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET || 'felora-media'
const BASE_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://media.felora.ch'

/**
 * Télécharge un fichier depuis R2
 */
async function downloadFromR2(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  const response = await s3Client.send(command)
  const chunks: Uint8Array[] = []

  if (!response.Body) {
    throw new Error('Pas de body dans la réponse')
  }

  for await (const chunk of response.Body as any) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

/**
 * Vérifie si une vidéo est en HEVC
 */
async function isHEVCVideo(buffer: Buffer): Promise<boolean> {
  const tmpDir = os.tmpdir()
  const tmpFile = path.join(tmpDir, `check-${Date.now()}.mp4`)

  try {
    await fs.writeFile(tmpFile, buffer)

    const { stdout } = await execAsync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${tmpFile}"`
    )

    const codec = stdout.trim().toLowerCase()
    await fs.unlink(tmpFile).catch(() => {})

    return codec === 'hevc' || codec === 'h265'
  } catch (error) {
    console.error('❌ Erreur vérification codec:', error)
    await fs.unlink(tmpFile).catch(() => {})
    return false
  }
}

/**
 * Convertit une vidéo et la re-upload
 */
async function convertAndReupload(media: any): Promise<void> {
  console.log(`\n🎬 Traitement de ${media.id}...`)
  console.log(`   URL: ${media.url}`)

  // Extraire la clé R2 de l'URL
  const key = media.url.replace(`${BASE_URL}/`, '')
  console.log(`   Clé R2: ${key}`)

  try {
    // Télécharger la vidéo
    console.log('   📥 Téléchargement...')
    const buffer = await downloadFromR2(key)
    console.log(`   ✅ Téléchargé (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`)

    // Vérifier si c'est du HEVC
    console.log('   🔍 Vérification du codec...')
    const isHEVC = await isHEVCVideo(buffer)

    if (!isHEVC) {
      console.log('   ✅ Déjà en H.264, skip')
      return
    }

    console.log('   ⚠️  HEVC détecté, conversion nécessaire')

    // Convertir en H.264
    console.log('   🔄 Conversion HEVC → H.264...')
    const convertedBuffer = await convertToH264(buffer)
    console.log(`   ✅ Converti (${(convertedBuffer.length / 1024 / 1024).toFixed(2)} MB)`)

    // Générer la thumbnail
    console.log('   📸 Génération thumbnail...')
    const thumbBuffer = await generateVideoThumbnail(convertedBuffer)

    // Upload la vidéo convertie (même clé = remplacement)
    console.log('   📤 Upload vidéo convertie...')
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: convertedBuffer,
      ContentType: 'video/mp4',
    }))
    console.log('   ✅ Vidéo uploadée')

    // Upload la thumbnail si générée
    let thumbUrl: string | null = null
    if (thumbBuffer) {
      const thumbKey = key.replace(/\.mp4$/, '_thumb.jpg')
      console.log('   📤 Upload thumbnail...')
      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: thumbKey,
        Body: thumbBuffer,
        ContentType: 'image/jpeg',
      }))
      thumbUrl = `${BASE_URL}/${thumbKey}`
      console.log('   ✅ Thumbnail uploadée')
    }

    // Mettre à jour la DB avec la thumbnail
    if (thumbUrl && !media.thumbUrl) {
      console.log('   💾 Mise à jour DB avec thumbnail...')
      await prisma.media.update({
        where: { id: media.id },
        data: { thumbUrl }
      })
      console.log('   ✅ DB mise à jour')
    }

    console.log(`   ✅ ✅ ✅ ${media.id} converti avec succès !`)

  } catch (error: any) {
    console.error(`   ❌ Erreur pour ${media.id}:`, error.message)
  }
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Script de conversion HEVC → H.264\n')

  // Récupérer toutes les vidéos
  const videos = await prisma.media.findMany({
    where: {
      type: 'VIDEO',
      deletedAt: null, // Ignorer les vidéos supprimées
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log(`📊 ${videos.length} vidéos trouvées\n`)

  if (videos.length === 0) {
    console.log('Aucune vidéo à traiter.')
    return
  }

  let converted = 0
  let skipped = 0
  let errors = 0

  for (const video of videos) {
    try {
      await convertAndReupload(video)
      converted++
    } catch (error: any) {
      console.error(`❌ Erreur fatale pour ${video.id}:`, error.message)
      errors++
    }

    // Petite pause pour éviter de surcharger R2
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 RÉSUMÉ')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Converties: ${converted}`)
  console.log(`⏭️  Skipped (déjà H.264): ${skipped}`)
  console.log(`❌ Erreurs: ${errors}`)
  console.log(`📹 Total: ${videos.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error('❌ Erreur fatale:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
