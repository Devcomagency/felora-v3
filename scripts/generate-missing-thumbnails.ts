/**
 * Script pour générer les thumbnails manquantes
 * Usage: npx tsx scripts/generate-missing-thumbnails.ts
 */

import { PrismaClient } from '@prisma/client'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { generateVideoThumbnail } from '../src/lib/video-converter'

const prisma = new PrismaClient()

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

async function downloadFromR2(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key })
  const response = await s3Client.send(command)
  const chunks: Uint8Array[] = []
  for await (const chunk of response.Body as any) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

async function main() {
  console.log('🎬 Génération des thumbnails manquantes\n')

  // Récupérer toutes les vidéos sans thumbnail
  const videosWithoutThumb = await prisma.media.findMany({
    where: {
      type: 'VIDEO',
      thumbUrl: null,
      deletedAt: null,
      url: { startsWith: 'https://media.felora.ch/' } // Seulement URLs R2
    }
  })

  console.log(`📊 ${videosWithoutThumb.length} vidéos sans thumbnail trouvées\n`)

  for (const video of videosWithoutThumb) {
    try {
      console.log(`🎬 Traitement: ${video.id}`)
      console.log(`   URL: ${video.url}`)

      const key = video.url.replace(`${BASE_URL}/`, '')

      // Télécharger la vidéo
      const buffer = await downloadFromR2(key)
      console.log(`   ✅ Téléchargé (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`)

      // Générer la thumbnail
      const thumbBuffer = await generateVideoThumbnail(buffer)

      if (thumbBuffer) {
        // Upload la thumbnail
        const thumbKey = key.replace(/\.mp4$/, '_thumb.jpg')
        await s3Client.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: thumbKey,
          Body: thumbBuffer,
          ContentType: 'image/jpeg',
        }))

        const thumbUrl = `${BASE_URL}/${thumbKey}`
        console.log(`   📸 Thumbnail générée: ${thumbUrl}`)

        // Mettre à jour la DB
        await prisma.media.update({
          where: { id: video.id },
          data: { thumbUrl }
        })

        console.log(`   ✅ DB mise à jour\n`)
      } else {
        console.log(`   ⚠️  Impossible de générer la thumbnail\n`)
      }

    } catch (error: any) {
      console.error(`   ❌ Erreur: ${error.message}\n`)
    }

    // Pause
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n✅ Terminé !')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
